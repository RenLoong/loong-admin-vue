<script setup lang="ts">
import { getTableValue, hasWhere } from '@/common/functions';
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
const data = ref<any>({})
watchEffect(() => {
    if (props.modelValue) {
        data.value = props.modelValue;
    }
});
watchEffect(() => {
    if (props.item) {
        item.value = props.item;
    }
});
const emit = defineEmits(['action']);
const getComponentProps = (component: any, value: any, index?: number) => {
    let props = {
        ...component.props
    };
    if (component.options) {
        const find = component.options.find((item: any) => item.value === value || (index !== undefined && item.index === index));
        if (find && find.props) {
            props = {
                ...props,
                ...find.props
            }
        }
    }
    return props;
}
const getComponentValue = (component: any, value: any) => {
    let result = value;
    if (component.options) {
        const find = component.options.find((item: any) => item.value === value);
        if (find && find.label) {
            result = find.label;
        }
    }
    return result;
}
onUnmounted(() => {
})
</script>

<template>
    <template v-if="item">
        <el-form-item :label="item.title" v-if="hasWhere(item.extra, data)"
            :class="{ 'none-label': item.title === 'none-label' }">
            <!-- <div class="" v-bind="item.extra.divProps"> -->
            <!-- 信息展示类 -->
            <template v-if="item.component === 'copy'">
                <xl-copy :content="getTableValue(data, item.field)" v-bind="item.extra.props" />
            </template>
            <template v-else-if="item.component === 'marked-text'">
                <xl-marked-text :content="getTableValue(data, item.field)" v-bind="item.extra.props" />
            </template>
            <template v-else-if="['text', 'link', 'tag'].includes(item.component)">
                <div>
                    <component :is="'el-' + item.component" v-bind="item.extra.props">{{ getTableValue(data, item.field) }}
                    </component>
                </div>
            </template>
            <template v-else-if="['tags'].includes(item.component)">
                <template v-for="(tag, tagIndex) in item.extra.options" :key="tagIndex">
                    <el-tag v-if="getTableValue(data, item.field) === tag.value" v-bind="{...item.extra.props, ...tag.props}">{{ tag.label }}
                    </el-tag>
                </template>
            </template>
            <template v-else-if="['image', 'avatar'].includes(item.component)">
                <div>
                    <component :is="'el-' + item.component" v-bind="item.extra.props" :src="getTableValue(data, item.field)">
                    </component>
                </div>
            </template>
            <template v-else-if="item.component === 'table-userinfo'">
                <xl-table-userinfo :data="data" v-bind="item.extra.props" />
            </template>
            <!-- 信息展示类 -->
            <!-- 常规表单类 -->

            <template v-else>
                <template v-if="Array.isArray(getTableValue(data, item.field))">
                    <template v-for="(item, index) in getTableValue(data, item.field)">
                        <component :is="`${item.component}`" :key="index"
                            v-bind="getComponentProps(item.extra, item, index)"
                            v-if="getComponentValue(item.extra, item)">
                            {{ getComponentValue(item.extra, item) }}</component>
                    </template>
                </template>
                <component v-else :is="`${item.component}`"
                    v-bind="getComponentProps(item.extra, getTableValue(data, item.field))"
                    v-if="getComponentValue(item.extra, getTableValue(data, item.field))">
                    {{ getComponentValue(item.extra, getTableValue(data, item.field)) }}
                </component>
            </template>
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
