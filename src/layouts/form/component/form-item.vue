<script setup lang="ts">
import { $http } from '@/common';
interface RuleInterface {
    title: string;
    field: string;
    component: string;
    extra?: any;
    children: any;
    action?: any;
}
const props = withDefaults(defineProps<{
    modelValue: any
    item?: RuleInterface
    group?: string
}>(), {
    modelValue: {},
    group: ''
});
const item = ref<RuleInterface>();
const form = ref<any>({})
watchEffect(() => {
    if (props.modelValue) {
        form.value = props.modelValue;
    }
});
watchEffect(() => {
    if (props.item) {
        item.value = props.item;
    }
});
const prop = (field: string) => {
    if (props.group) {
        return props.group + '.' + field;
    }
    return field;
}
const emit = defineEmits(['action','update:modelValue']);
const handleAction = (group: any, field: any, _e: any) => {
    emit('action', {
        group,
        field,
        _e
    })
}
const loading = ref(false)
const options = ref(item.value?.extra.options);
let timer: NodeJS.Timeout;
const remoteMethod = (query: string) => {
    if (timer) clearTimeout(timer)
    if (query) {
        timer = setTimeout(() => {
            loading.value = true;
            options.value = [];
            $http.post(item.value?.extra.remote.url, {
                query: query,
                form: form.value
            }).then((res: any) => {
                if (res.code === $http.ResponseCode.SUCCESS) {
                    options.value = res.data;
                } else {
                    options.value = [];
                }
            }).catch(() => {
                options.value = [];
            }).finally(() => {
                loading.value = false
            })
        }, 300);
    } else {
        loading.value = false
        options.value = item.value?.extra.options;
    }
}
const autocompleteRemoteMethod = (query: string, cb: (arg: any) => void) => {
    if (timer) clearTimeout(timer)
    if (query) {
        timer = setTimeout(() => {
            loading.value = true;
            options.value = [];
            $http.post(item.value?.extra.remote.url, {
                query: query,
                form: form.value
            }).then((res: any) => {
                if (res.code === $http.ResponseCode.SUCCESS) {
                    cb(res.data);
                } else {
                    cb([]);
                }
            }).catch(() => {
                cb([]);
            }).finally(() => {
                loading.value = false
            })
        }, 300);
    } else {
        loading.value = false
        cb([]);
    }
}
const elProps = computed(() => {
    if (!item.value) {
        return {};
    }
    if (item.value.extra.remote) {
        switch (item.value.component) {
            case 'select':
                return {
                    ...item.value.extra.props,
                    remote: true,
                    filterable: true,
                    remoteMethod: remoteMethod,
                    loading: loading.value
                };
            case 'mention':
                return {
                    ...item.value.extra.props,
                    options: options.value,
                    onSearch: remoteMethod,
                    loading: loading.value
                };
            case 'autocomplete':
                return {
                    ...item.value.extra.props,
                    options: options.value,
                    fetchSuggestions: autocompleteRemoteMethod,
                    loading: loading.value
                };
        }
    }
    return item.value.extra.props;
})
const handleResultAction = (res: any) => {
    if (res.callback) {
        switch (res.callback) {
            case 'append':
                form.value = {
                    ...form.value,
                    ...res.data
                }
                emit('update:modelValue', form.value)
                break;
        }
    }
}
onUnmounted(() => {
    if (timer) clearTimeout(timer)
})
</script>

<template>
    <template v-if="item">
        <el-form-item :label="item.title" :prop="prop(item.field)"
            :class="{ 'none-label': item.title === 'none-label' }">
            <!-- <div class="" v-bind="item.extra.divProps"> -->
            <!-- 信息展示类 -->
            <template v-if="item.component === 'copy'">
                <xl-copy :content="form[item.field]" v-bind="item.extra.props" />
            </template>
            <template v-else-if="item.component === 'marked-text'">
                <xl-marked-text :content="form[item.field]" v-bind="item.extra.props" />
            </template>
            <template v-else-if="['text', 'link', 'tag'].includes(item.component)">
                <div>
                    <component :is="'el-' + item.component" v-bind="item.extra.props">{{ form[item.field] }}
                    </component>
                </div>
            </template>
            <template v-else-if="['tags'].includes(item.component)">
                <template v-for="(tag, tagIndex) in item.extra.options" :key="tagIndex">
                    <el-tag v-if="form[item.field] === tag.value" v-bind="{ ...item.extra.props, ...tag.props }">{{
                        tag.label }}
                    </el-tag>
                </template>
            </template>
            <template v-else-if="['image', 'avatar'].includes(item.component)">
                <div>
                    <component :is="'el-' + item.component" v-bind="item.extra.props" :src="form[item.field]">
                    </component>
                </div>
            </template>
            <template v-else-if="item.component === 'compute'">
                <div>
                    <xl-compute :data="form" v-bind="item.extra.props" />
                </div>
            </template>
            <!-- 信息展示类 -->

            <!-- 自定义表单类 -->
            <template v-else-if="item.component === 'drag-sort'">
                <xl-drag-sort v-model="form[item.field]" :items="item.extra.options" v-bind="item.extra.props" />
            </template>
            <template v-else-if="item.component === 'cascader'">
                <el-cascader v-model="form[item.field]" :options="item.extra.options" v-bind="item.extra.props" />
            </template>
            <template v-else-if="item.component === 'select'">
                <el-select v-model="form[item.field]" v-bind="elProps" class="select-item">
                    <template v-if="item.extra.group">
                        <el-option-group v-for="(groupItem, index) in options" :key="index" :label="groupItem.label"
                            v-bind="groupItem.props">
                            <el-option v-for="(sub, subIndex) in groupItem.options" :key="subIndex" :label="sub.label"
                                :value="sub.value" v-bind="{ ...item.extra.subProps, ...sub.props }">
                                <div class="flex grid-gap-6">
                                    <div class="flex-1 flex flex-column gir-dgap-1">
                                        <span>{{ sub.label }}</span>
                                    </div>
                                    <span class="h10 text-grey" v-if="sub.tips">{{ sub.tips }}</span>
                                </div>
                            </el-option>
                        </el-option-group>
                    </template>
                    <template v-else>
                        <el-option v-for="(sub, subIndex) in options" :key="subIndex" :label="sub.label"
                            :value="sub.value" v-bind="{ ...item.extra.subProps, ...sub.props }">
                            <div class="flex grid-gap-6">
                                <div class="flex-1 flex flex-column gir-dgap-1">
                                    <span>{{ sub.label }}</span>
                                </div>
                                <span class="h10 text-grey" v-if="sub.tips">{{ sub.tips }}</span>
                            </div>
                        </el-option>
                    </template>
                </el-select>
            </template>
            <template v-else-if="item.component === 'bundle'">
                <xl-bundle v-model="form[item.field]" v-bind="item.extra.props" />
            </template>
            <template v-else-if="item.component === 'marked-editor'">
                <xl-marked-editor v-model="form[item.field]" v-bind="item.extra.props" />
            </template>
            <template v-else-if="item.component === 'admin-rule'">
                <xl-admin-rule v-model="form[item.field]" v-bind="item.extra.props" :options="item.extra.options" />
            </template>
            <template v-else-if="item.component === 'wangeditor'">
                <xl-wangeditor v-model="form[item.field]" v-bind="item.extra.props" />
            </template>
            <template v-else-if="['radio', 'checkbox'].includes(item.component)">
                <component :is="'el-' + item.component + '-group'" v-model="form[item.field]" v-bind="item.extra.props"
                    class="el-group">
                    <component :is="'el-' + item.component" v-for="(sub, subIndex) in item.extra.options"
                        :key="subIndex" :value="sub.value" v-bind="item.extra.subProps">{{ sub.label }}
                    </component>
                </component>
            </template>
            <!-- 自定义表单类 -->
            <!-- 常规表单类 -->
            <template v-else>
                <component :is="'el-' + item.component" v-model="form[item.field]" v-bind="elProps">
                    <template v-for="(child, name) in item.extra.children" :index="name" v-slot:[name]>
                        <permissions :name="child.extra?.path">
                            <component :is="child.component" v-if="typeof child === 'object'" v-bind="child.props"
                                @click="handleAction(child, item.field, $event)"
                                @change="handleAction(child, item.field, $event)">
                                <template v-for="(subChild, subName) in child.children" :index="subName"
                                    v-slot:[subName]>
                                    <component :is="subChild.component" v-if="typeof subChild === 'object'"
                                        v-bind="subChild.props" />
                                    <template v-else>{{ subChild }}</template>
                                </template>
                            </component>
                            <template v-else>{{ child }}</template>
                        </permissions>
                    </template>
                </component>
            </template>
            <!-- 操作组 -->
            <div v-if="item.action" v-bin>
                <xl-table-action :action="item.action.extra.group" :item="form" @success="handleResultAction" />
            </div>
            <!-- 常规表单类 -->
            <div class="flex flex-column grid-gap-2 line-height-1 mt-4" v-if="item.extra.prompt">
                <xl-prompt :prompt="item.extra.prompt"></xl-prompt>
            </div>
            <!-- </div> -->
        </el-form-item>
    </template>
</template>

<style lang="scss" scoped>
.el-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .el-radio {
        margin-right: 0 !important;
    }

    .el-checkbox {
        margin-right: 0 !important;
    }
}
</style>
