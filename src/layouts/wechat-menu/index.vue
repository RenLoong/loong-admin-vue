<script setup lang="ts">
import { $http } from '@/common'
import router from '@/routers'
import { ElMessage } from 'element-plus'
import SubmitEvent from '@/common/enum/SubmitEvent'
import { useI18n } from 'vue-i18n'
import previewComponent from './component/preview.vue'
import menuEditorComponent from './component/menu-editor.vue'
import type { MenuForm, MenuSelection } from './types'
import { createEmptyForm } from './types'
import { normalizeMenuForm, cleanMenuForm } from './utils'

const { t } = useI18n()

const props = withDefaults(defineProps<{
    params?: any
    showSubmitItem?: boolean
    showDialogSubmit?: boolean
}>(), {
    showSubmitItem: true,
    showDialogSubmit: false,
})

const emit = defineEmits(['confirm', 'cannel', 'loading'])

const loading = ref(true)
const submitLoading = ref(false)
const currentRoute = router.currentRoute.value
const resFail = ref<any>()
const showForm = ref(false)
const form = ref<MenuForm>(createEmptyForm())
const formProps = ref<any>({
    submitButtonText: '保存并发布',
    resetButtonText: '重置',
})
const selection = ref<MenuSelection | null>(null)
const submitEvent = ref<string>()
const menuEditorRef = ref<InstanceType<typeof menuEditorComponent>>()

let ApiUrl = currentRoute.meta.api as string
if (props.params) {
    ApiUrl = props.params.api
}

const showSubmitItem = ref(props.showSubmitItem)
if (currentRoute.query.back) {
    showSubmitItem.value = false
}

onBeforeMount(() => {
    $http.get(ApiUrl, {
        params: {
            ...currentRoute.query,
            ...props.params?.query,
        },
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            form.value = normalizeMenuForm(res.data.form ?? res.data)
            if (res.data.props) {
                formProps.value = { ...formProps.value, ...res.data.props }
            }
            if (res.data.url) {
                ApiUrl = res.data.url
            }
            if (res.data.props?.submitEvent) {
                submitEvent.value = res.data.props.submitEvent
            }
            if (form.value.button.length > 0) {
                selection.value = { topIndex: 0 }
            }
            nextTick(() => {
                showForm.value = true
            })
        } else {
            resFail.value = res
        }
    }).finally(() => {
        loading.value = false
    })
})

watchEffect(() => {
    emit('loading', loading.value || submitLoading.value)
})

const onSubmit = () => {
    if (!menuEditorRef.value?.validateMenu()) return
    submitLoading.value = true
    const payload = cleanMenuForm(form.value)
    $http.post(ApiUrl, {
        ...props.params?.query,
        ...props.params?.params,
        ...payload,
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            ElMessage.success(res.msg)
            emit('confirm')
            if (currentRoute.query.back) {
                router.push(currentRoute.query.back as string)
            } else {
                switch (submitEvent.value) {
                    case SubmitEvent.SILENT:
                        break
                    default:
                        form.value = normalizeMenuForm(payload)
                        break
                }
            }
        } else {
            ElMessage.info(res.msg)
        }
    }).finally(() => {
        submitLoading.value = false
    })
}

const resetForm = () => {
    loading.value = true
    $http.get(ApiUrl, {
        params: {
            ...currentRoute.query,
            ...props.params?.query,
        },
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            form.value = normalizeMenuForm(res.data.form ?? res.data)
            selection.value = form.value.button.length ? { topIndex: 0 } : null
            ElMessage.success('已重置')
        }
    }).finally(() => {
        loading.value = false
    })
}

const emitConfirm = () => emit('confirm')
const emitCannel = () => emit('cannel')

defineExpose({
    onSubmit,
    resetForm,
    emitConfirm,
    emitCannel,
})
</script>

<template>
    <main class="layouts flex flex-center layouts-empty flex-1" v-if="resFail">
        <el-empty>
            <template #description>
                <div class="flex flex-column">
                    <span>{{ resFail.msg }}</span>
                    <xl-code lang="json" height="400px" v-if="resFail.data && resFail.data.length > 0">{{ resFail.data }}</xl-code>
                </div>
            </template>
            <template v-if="showDialogSubmit">
                <el-button type="primary" @click="emitCannel">取消</el-button>
            </template>
            <template v-else>
                <el-button type="primary" @click="router.go(-1)">上一页</el-button>
                <el-button type="default" @click="router.push('/')">返回首页</el-button>
            </template>
        </el-empty>
    </main>
    <el-skeleton :loading="loading" animated v-else>
        <template #template>
            <div class="flex grid-gap-4 p-6">
                <el-skeleton-item style="width: 360px; height: 620px;" />
                <el-skeleton-item style="flex: 1; height: 620px;" />
            </div>
        </template>
        <template #default>
            <div class="flex submit-item flex-center mb-4" v-if="!showDialogSubmit && currentRoute.query.back">
                <el-button bg text @click="router.push(currentRoute.query.back as string)" :disabled="loading || submitLoading" size="large">
                    返回
                </el-button>
                <div class="flex-1"></div>
                <el-button @click="resetForm" :disabled="loading || submitLoading" size="large">
                    {{ formProps.resetButtonText || t('button.resetText') }}
                </el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading || submitLoading" size="large">
                    {{ formProps.submitButtonText || t('button.confirmText') }}
                </el-button>
            </div>
            <el-splitter v-if="showForm" class="wechat-menu-splitter">
                <el-splitter-panel :size="400" :min="320">
                    <previewComponent
                        :buttons="form.button"
                        :selection="selection"
                        @select="selection = $event"
                    />
                </el-splitter-panel>
                <el-splitter-panel :min="400">
                    <el-scrollbar>
                        <menuEditorComponent
                            ref="menuEditorRef"
                            v-model="form"
                            v-model:selection="selection"
                        />
                    </el-scrollbar>
                </el-splitter-panel>
            </el-splitter>
            <div class="submit-item flex flex-center py-4" v-if="showSubmitItem && !currentRoute.query.back">
                <el-button @click="resetForm" :disabled="loading || submitLoading" size="large">
                    {{ formProps.resetButtonText || t('button.resetText') }}
                </el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading || submitLoading" size="large">
                    {{ formProps.submitButtonText || t('button.confirmText') }}
                </el-button>
            </div>
            <div class="flex submit-item pt-10" v-if="showDialogSubmit">
                <el-button bg text @click="emitCannel" size="large" :disabled="loading || submitLoading">
                    {{ t('button.cancelText') }}
                </el-button>
                <div class="flex-1"></div>
                <el-button @click="resetForm" :disabled="loading || submitLoading" size="large">
                    {{ formProps.resetButtonText || t('button.resetText') }}
                </el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading || submitLoading" size="large">
                    {{ formProps.submitButtonText || t('button.confirmText') }}
                </el-button>
            </div>
        </template>
    </el-skeleton>
</template>

<style lang="scss" scoped>
.wechat-menu-splitter {
    min-height: calc(100vh - 180px);
    border-radius: 8px;
    overflow: hidden;
    background: var(--el-bg-color);
}

.submit-item {
    position: sticky;
    bottom: 0;
    background-color: var(--el-bg-color);
    z-index: 1000;

    :deep(.el-button.el-button--large) {
        padding: 12px 60px;
    }
}
</style>
