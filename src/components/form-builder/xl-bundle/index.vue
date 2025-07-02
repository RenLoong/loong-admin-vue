<script lang="ts" setup>
import { $http } from '@/common';
import { ElMessage, ElMessageBox, ElInput, ElSelect, ElInputNumber } from 'element-plus'
import { useWebConfigStore } from "@/stores";
import { useI18n } from 'vue-i18n';
const {t} = useI18n();
const { WEBCONFIG } = useWebConfigStore();
const props = withDefaults(defineProps<{
    modelValue?: string | string[],
    accept?: string,
    multiple?: number,
    view?: string,
    size?: number
}>(), {
    modelValue: '',
    accept: '',
    multiple: 1,
    view: 'image'
});
const emit = defineEmits(['update:modelValue','change','closed'])
const uploadRef = ref();
const dialogVisible = ref(false);
const open = () => {
    dialogVisible.value = true;
    nextTick(() => {
        getUploadClassify();
        getList();
    })
}
const bundleBodyRef = ref();
const values = ref<string[]>([]);
watchEffect(() => {
    if (!props.modelValue) {
        return values.value = []
    }
    if (typeof props.modelValue === 'string') {
        values.value = [props.modelValue]
    } else if (Array.isArray(props.modelValue)) {
        values.value = props.modelValue
    }
})
const selected = ref<any[]>([]);
const selectedEdit = ref<any[]>([]);
const fileList = ref<any[]>([]);
const loadingState = ref(false);
const search = ref({
    dir_name: 'all',
    accept: props.accept,
    page: 1,
    limit: 24,
    total: 0,
});
const getList = () => {
    if (loadingState.value) return;
    loadingState.value = true;
    selectedEdit.value = [];
    $http.get('Uploads/getList', {
        params: search.value
    }).then((res: ResponseInterface) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            fileList.value = res.data.data;
            search.value.total = res.data.total;
        }
    }).finally(() => {
        loadingState.value = false;
    });
}

const pageChange = (val: number) => {
    search.value.page = val
    getList()
}
const sizeChange = (val: number) => {
    search.value.limit = val
    getList()
}
const isEdit = ref(false);
const handelSelected = (item: any) => {
    if (isEdit.value) {
        if (selectedEdit.value.includes(item)) {
            selectedEdit.value.splice(selectedEdit.value.indexOf(item), 1)
        } else {
            selectedEdit.value.push(item)
        }
    } else {
        if (props.multiple === 1) {
            selected.value[0] = item;
        } else {
            if (selected.value.includes(item)) {
                selected.value.splice(selected.value.indexOf(item), 1)
            } else if (props.multiple === 0 || selected.value.length < props.multiple) {
                selected.value.push(item)
            }
        }
    }
}
const dialogPreview = ref(false);
const dialogImageIndex = ref(0);
const handleRemove = (index: number) => {
    selected.value.splice(index, 1)
    if (props.multiple === 1) {
        emit('update:modelValue', '')
    } else {
        emit('update:modelValue', selected.value.map((item: any) => item.url))
    }
}
const deleteUploads = () => {
    ElMessageBox.confirm(t('form.bundle.confirmDeleteSelectedContent'), t('message.tips'), {
        confirmButtonText: t('button.confirmText'),
        cancelButtonText: t('button.cancelText'),
        type: 'warning'
    }).then(() => {
        $http.post('Uploads/deleteUploads', { ids: selectedEdit.value.map((item: any) => item.id) }).then((res: ResponseInterface) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(res.msg);
                getList();
            } else {
                ElMessage.error(res.msg);
            }
        })
    }).catch(() => {
    });
}
const updateUploads = () => {
    const dir_name = ref();
    ElMessageBox({
        title: t('form.bundle.moveBundleTitle'),
        cancelButtonText: t('button.cancelText'),
        showClose: false,
        showCancelButton: true,
        closeOnClickModal: false,
        customClass: 'el-messagebox-width',
        message: () =>
            h('div', {}, [
                h('div', { class: 'mb-2 h10' }, [
                    h('span', { class: 'text-gray' }, t('form.bundle.bundleClassify')),
                ]),
                h(ElSelect, {
                    class: 'mb-4',
                    placeholder: t('form.bundle.selectClassifyPlaceholder'),
                    modelValue: dir_name.value,
                    onChange: (val: string) => {
                        dir_name.value = val
                    },
                }, {
                    default: () => classify.value.map((item: any) => {
                        if (!item.id) {
                            return;
                        }
                        return h(ElSelect.Option, { label: item.title, value: item.dir_name })
                    })
                }),
            ]),

        beforeClose: (action: string, instance: { confirmButtonLoading: boolean; }, done: () => void) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true
                $http.post('Uploads/updateUploads', {
                    ids: selectedEdit.value.map((item: any) => item.id),
                    dir_name: dir_name.value
                }).then((res: any) => {
                    if (res.code === $http.ResponseCode.SUCCESS) {
                        done()
                        ElMessage.success(res.msg);
                        isEdit.value = false;
                        getList();
                    } else {
                        ElMessage.error(res.msg);
                    }
                }).finally(() => {
                    instance.confirmButtonLoading = false
                })
            } else {
                done()
            }
        },
    }).then(() => {
    }).catch(() => { })

}
const submitSelected = () => {
    if (props.multiple === 1) {
        emit('update:modelValue', selected.value[0].url)
        emit('change', selected.value[0])
    } else {
        emit('update:modelValue', selected.value.map((item: any) => item.url))
        emit('change', selected.value)
    }
    dialogVisible.value = false;
}
const handlePictureCardPreview = (index:number) => {
    dialogImageIndex.value = index
    dialogPreview.value = true
}
interface ClassifyInterface {
    id?: number
    title: string
    dir_name: string
    channels: string
    sort?: number
    is_system?: number
}
const classify = ref<ClassifyInterface[]>([]);
const getUploadClassify = () => {
    $http.get('Uploads/getUploadClassify').then((res: ResponseInterface) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            classify.value = res.data
        }
    })
}
const uploadForm = ref({
    dir_name: 'all'
});
const selectedClassify = (item: ClassifyInterface) => {
    uploadForm.value.dir_name = item.dir_name;
    search.value.dir_name = item.dir_name;
    isEdit.value = false;
    getList();
}
const handleUploadSuccess = (res: ResponseInterface) => {
    uploadRef.value.clearFiles();
    if (res.code === $http.ResponseCode.SUCCESS) {
        getList();
    } else {
        ElMessage.error(res.msg);
    }
}
const deleteClassify = (item: ClassifyInterface) => {
    ElMessageBox.confirm(t('form.bundle.confirmDeleteClassifyContent',{title:item.title}), t('message.tips'), {
        confirmButtonText: t('button.confirmText'),
        cancelButtonText: t('button.cancelText'),
        type: 'warning'
    }).then(() => {
        $http.post('Uploads/deleteClassify', { dir_name: item.dir_name }).then((res: ResponseInterface) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(res.msg);
                getUploadClassify();
            } else {
                ElMessage.error(res.msg);
            }
        })
    }).catch(() => {
    });
}
const saveClassify = (item?: ClassifyInterface) => {
    const classifyForm = ref<ClassifyInterface>({
        title: '',
        dir_name: '',
        channels: '',
        sort: 99
    });
    if (item) {
        classifyForm.value.title = item.title;
        classifyForm.value.dir_name = item.dir_name;
        classifyForm.value.channels = item.channels;
        classifyForm.value.sort = item.sort;
    }
    ElMessageBox({
        title: t('form.bundle.createClassify'),
        confirmButtonText:t('button.confirmText'),
        cancelButtonText: t('button.cancelText'),
        showClose: false,
        showCancelButton: true,
        closeOnClickModal: false,
        customClass: 'el-messagebox-width',
        message: () =>
            h('div', {}, [
                h('div', { class: 'mb-2 h10' }, [
                    h('span', { class: 'text-gray' }, t('form.bundle.createClassifyLabel')),
                ]),
                h(ElInput, {
                    class: 'mb-4',
                    placeholder: t('form.bundle.createClassifyPlaceholder'),
                    modelValue: classifyForm.value.title,
                    maxlength:50,
                    showWordLimit:true,
                    onInput: (val: string) => {
                        classifyForm.value.title = val
                    },
                }),
                h('div', { class: 'mb-2 h10' }, [
                    h('span', { class: 'text-gray' }, t('form.bundle.createClassifyUseChannelLabel')),
                ]),
                h(ElSelect, {
                    class: 'mb-4',
                    modelValue: classifyForm.value.channels,
                    placeholder:t('form.bundle.createClassifyUseChannelPlaceholder'),
                    onChange: (val: string) => {
                        classifyForm.value.channels = val
                    },
                }, {
                    default: () => WEBCONFIG.storage.map((item: any) => {
                        return h(ElSelect.Option, { label: item.label, value: item.value })
                    })
                }),
                h('div', { class: 'mb-2 h10' }, [
                    h('span', { class: 'text-gray' }, t('form.bundle.createClassifyDirNameLabel')),
                ]),
                h(ElInput, {
                    class: 'mb-4',
                    placeholder: t('form.bundle.createClassifyDirNamePlaceholder'),
                    modelValue: classifyForm.value.dir_name,
                    onInput: (val: string) => {
                        classifyForm.value.dir_name = val
                    },
                }),
                h('div', { class: 'mb-2 h10' }, [
                    h('span', { class: 'text-gray' }, t('form.bundle.createClassifySortLabel')),
                ]),
                h(ElInputNumber, {
                    class: 'mb-4',
                    placeholder: t('form.bundle.createClassifySortPlaceholder'),
                    modelValue: classifyForm.value.sort,
                    controls: false,
                    min: 0,
                    max: 99,
                    onChange: (val?: number) => {
                        classifyForm.value.sort = val
                    },
                }),
            ]),

        beforeClose: (action: string, instance: { confirmButtonLoading: boolean; }, done: () => void) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true
                $http.post('Uploads/saveClassify', classifyForm.value).then((res: any) => {
                    if (res.code === $http.ResponseCode.SUCCESS) {
                        done()
                        ElMessage.success(res.msg);
                        getUploadClassify();
                    } else {
                        ElMessage.error(res.msg);
                    }
                }).finally(() => {
                    instance.confirmButtonLoading = false
                })
            } else {
                done()
            }
        },
    }).then(() => {
    }).catch(() => { })
}
const clear=()=>{
    selected.value = [];
    selectedEdit.value = [];
    values.value = [];
}
const closed=()=>{
    emit('closed')
}
defineExpose({
    open,
    clear
})
</script>

<template>
    <div class="bundle-images-list el-upload-list el-upload-list--picture-card">
        <slot :open="open">
            <div class="el-upload-list__item is-success" @click.stop v-for="(url, index) in values">
                <img class="el-upload-list__item-thumbnail" :src="url" alt="" v-if="view === 'image'" />
                <el-icon class="el-upload-list__item-thumbnail" v-else-if="view === 'file'" size="64">
                    <Document />
                </el-icon>
                <span class="el-upload-list__item-actions">
                    <span class="el-upload-list__item-preview" @click.stop="handlePictureCardPreview(index)"
                        v-if="view === 'image'">
                        <el-icon><zoom-in /></el-icon>
                    </span>
                    <span class="el-upload-list__item-delete" @click.stop="open()" v-if="props.multiple === 1">
                        <el-icon>
                            <Edit />
                        </el-icon>
                    </span>
                    <span class="el-upload-list__item-delete" @click.stop="handleRemove(index)">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </span>
                </span>
            </div>
            <div class="el-upload el-upload--picture-card" v-if="values.length < props.multiple" @click="open">
                <el-icon>
                    <Plus />
                </el-icon>
            </div>
        </slot>
    </div>
      <el-image-viewer
        v-if="dialogPreview"
        :url-list="values"
        show-progress
        :initial-index="dialogImageIndex"
        @close="dialogPreview = false"
      />
    <el-dialog v-model="dialogVisible" title="Tips" width="70%" class="bundle-dialog" draggable append-to-body @closed="closed">
        <template #header>
            <div class="bundle-name">
                <div class="flex-1">{{ t('form.bundle.bundleClassify') }}</div>
                <permissions name="Uploads/saveClassify">
                    <el-icon :size="20" class="pointer" @click="saveClassify">
                        <FolderAdd />
                    </el-icon>
                </permissions>
            </div>
            <div class="bundle-title">
                {{t('form.bundle.title')}}
            </div>
        </template>
        <div class="categrory">
            <div v-for="(item, index) in classify" :index="index" class="categrory-item"
                :class="{ 'active': item.dir_name === uploadForm.dir_name }" @click="selectedClassify(item)">
                <el-icon color="#FBAC15">
                    <FolderOpened />
                </el-icon>
                <div class="categrory-item-title">{{ item.title }}</div>
                <permissions name="Uploads/deleteClassify">
                    <el-icon class="delete-icon" v-if="!item.is_system" @click.stop="deleteClassify(item)"
                        color="var(--el-color-danger)">
                        <Delete />
                    </el-icon>
                </permissions>
            </div>
        </div>
        <div class="bundle-body" ref="bundleBodyRef">
            <div class="bundle-file-list" v-loading="loadingState">
                <div class="file-item" v-for="(item, index) in fileList" :index="index"
                    :class="{ 'active': !isEdit && selected.includes(item), 'active-warning': isEdit && selectedEdit.includes(item) }"
                    @click="handelSelected(item)">
                    <el-image :src="item.url" class="file-thumb" v-if="item.mime.includes('image')" />
                    <el-icon class="file-thumb" v-else>
                        <Document />
                    </el-icon>
                    <div class="file-name">{{ item.filename }}</div>
                </div>
            </div>
            <div class="pagination">
                <el-pagination size="small" background :page-sizes="[24, 24 * 2, 24 * 3, 24 * 4]"
                    layout="total,sizes,prev, pager, next,jumper" :total="search.total" :page-size="search.limit"
                    :current-page="search.page" @current-change="pageChange" @size-change="sizeChange" />
            </div>
        </div>

        <template #footer>
            <template v-if="uploadForm.dir_name != 'all'">
                <uploads ref="uploadRef" :on-success="handleUploadSuccess" :data="uploadForm" class="mr-4" 
                    :multiple="props.multiple > 1" :accept="props.accept" :limit="props.multiple" :size="props.size">
                    <el-button type="success">{{ t('button.uploadText') }}</el-button>
                </uploads>
                <permissions name="Uploads/updateUploads">
                    <el-button type="primary" v-if="isEdit" @click="isEdit = false">{{t('button.completeText')}}</el-button>
                    <el-button v-else @click="isEdit = true">{{ t('button.manageText') }}</el-button>
                    <el-button v-if="isEdit">{{ t('button.allSelectText') }}</el-button>
                </permissions>
            </template>
            <div class="flex-1"></div>
            <div class="btn-group" v-if="isEdit">
                <permissions name="Uploads/updateUploads">
                    <el-button type="warning" :disabled="selectedEdit.length <= 0" @click="updateUploads">{{ t('button.moveText') }}</el-button>
                </permissions>
                <permissions name="Uploads/deleteUploads">
                    <el-button type="danger" :disabled="selectedEdit.length <= 0" @click="deleteUploads">
                        {{t('button.deleteText')}}({{ selectedEdit.length }})
                    </el-button>
                </permissions>
            </div>
            <div class="btn-group" v-else>
                <el-button @click="dialogVisible = false">{{ t('button.cancelText') }}</el-button>
                <el-button type="primary" @click="submitSelected" :disabled="selected.length <= 0">
                    {{ t('form.bundle.confirmButtonText',{count:selected.length}) }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>
<style lang="scss">
@use '@/assets/css/index.min.css';
</style>