<script setup lang="ts">
import { hasWhere } from '@/common/functions';
interface RuleInterface {
    title: string;
    field: string;
    component: string;
    extra?: any;
    children: any;
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
const emit=defineEmits(['action']);
const handleAction = (group: any, field: any, _e: any) => {
    emit('action',{
        group,
        field,
        _e
    })
}
</script>

<template>
    <template v-if="item">
        <el-form-item :label="item.title" :prop="prop(item.field)" v-if="hasWhere(item.extra, form)">
            <div class="w-100 overflow-hidden">
                <!-- 信息展示类 -->
                <template v-if="item.component === 'copy'">
                    <xl-copy :content="form[item.field]" v-bind="item.extra.props" />
                </template>
                <template v-else-if="item.component === 'marked-text'">
                    <xl-marked-text :content="form[item.field]" v-bind="item.extra.props" />
                </template>
                <template v-else-if="['text', 'link'].includes(item.component)">
                    <component :is="'el-' + item.component" v-bind="item.extra.props">{{ form[item.field] }}
                    </component>
                </template>
                <!-- 信息展示类 -->

                <!-- 自定义表单类 -->
                <template v-else-if="item.component === 'select'">
                    <el-select v-model="form[item.field]" v-bind="item.extra.props">
                        <el-option v-for="(sub, subIndex) in item.extra.options" :key="subIndex" :label="sub.label"
                            :value="sub.value" v-bind="item.extra.subProps" />
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
                    <component :is="'el-' + item.component + '-group'" v-model="form[item.field]"
                        v-bind="item.extra.props" class="el-group">
                        <component :is="'el-' + item.component" v-for="(sub, subIndex) in item.extra.options"
                            :key="subIndex" :value="sub.value" v-bind="item.extra.subProps">{{ sub.label }}
                        </component>
                    </component>
                </template>
                <!-- 自定义表单类 -->
                <!-- 常规表单类 -->
                <template v-else>
                    <component :is="'el-' + item.component" v-model="form[item.field]" v-bind="item.extra.props">
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
                <!-- 常规表单类 -->
                <xl-prompt v-if="item.extra.prompt" :prompt="item.extra.prompt"></xl-prompt>
            </div>
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
