<script lang="ts" setup>
import { getTableValue, hasWhere } from '@/common/functions';
const props = withDefaults(defineProps<{
    modelValue?: string,
    rule?: any
    data?: any
    data1?: any
    group?: string
}>(), {
    modelField: '',
    rule: [],
    data: {},
    group: ''
});
const emit = defineEmits(['update:modelValue'])
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
const onActive = (item: any) => {
    emit('update:modelValue', item.field);
}
const hasChange = (item: any) => {
    if(!props.data1) return false;
    if(['divider'].includes(item.component)) return false;
    return getTableValue(props.data, item.field) != getTableValue(props.data1, item.field) && !item.extra?.show;
}
</script>
<template>
    <div class="flex flex-column grid-gap-4">
        <template v-for="(item, index) in props.rule" :key="index">
            <div class="flex grid-gap-4 examine-item rounded-4"
                :class="{ 'examine-item-active': props.modelValue === item.field, 'examine-item-change': hasChange(item) }"
                v-if="hasWhere(item.extra, props.data)&&(item.extra?.show?.includes(props.group) || !item.extra?.show)" @mouseenter="onActive(item)">
                <div class="examine-label" v-if="!['divider'].includes(item.component)">{{ item.title }}</div>
                <div class="flex-1 examine-data">
                    <!-- 信息展示类 -->
                    <template v-if="item.component === 'copy'">
                        <xl-copy :content="getTableValue(props.data, item.field)" v-bind="item.extra.props" />
                    </template>
                    <template v-else-if="item.component === 'marked-text'">
                        <xl-marked-text :content="getTableValue(props.data, item.field)" v-bind="item.extra.props" />
                    </template>
                    <template v-else-if="['text', 'link'].includes(item.component)">
                        <component :is="'el-' + item.component" v-bind="item.extra.props">{{
                            getTableValue(props.data, item.field) }}
                        </component>
                    </template>
                    <template v-else-if="['avatar'].includes(item.component)">
                        <el-avatar v-bind="item.extra.props" style="--el-avatar-text-size:10px;"
                            :src="getTableValue(props.data, item.field)">
                            {{ item.title }}
                        </el-avatar>
                    </template>
                    <template v-else-if="item.component === 'table-userinfo'">
                        <xl-table-userinfo :data="props.data" v-bind="item.extra?.props" />
                    </template>
                    <template v-else-if="item.component === 'image'">
                        <template v-if="Array.isArray(getTableValue(props.data, item.field))">
                            <el-image preview-teleported v-for="(sub, index) in getTableValue(props.data, item.field)"
                                :key="index" v-bind="item.extra?.props" :src="sub"
                                :preview-src-list="getTableValue(props.data, item.field)"></el-image>
                        </template>
                        <el-image v-else-if="getTableValue(props.data, item.field)" preview-teleported
                            v-bind="item.extra?.props" :src="getTableValue(props.data, item.field)"
                            :preview-src-list="[getTableValue(props.data, item.field)]"></el-image>
                    </template>
                    <template v-else-if="item.component === 'statistic'">
                        <el-statistic v-bind="item.extra?.props" :value="getTableValue(props.data, item.field)">
                            <template v-for="(subChild, subName) in item.extra?.children" :index="subName"
                                v-slot:[subName]>
                                <component :is="subChild.component" v-if="typeof subChild === 'object'"
                                    v-bind="subChild.props">
                                    <template v-for="(subSubChild, subSubName) in subChild.children" :index="subSubName"
                                        v-slot:[subSubName]>
                                        <component :is="subSubChild.component" v-if="typeof subSubChild === 'object'"
                                            v-bind="subSubChild.props" />
                                        <template v-else>{{ subSubChild }}</template>
                                    </template>
                                </component>
                                <template v-else>{{ subChild }}</template>
                            </template>
                        </el-statistic>
                    </template>
                    <!-- 信息展示类 -->
                    <!-- 常规表单类 -->
                    <template v-else>
                        <template v-if="Array.isArray(getTableValue(props.data, item.field))">
                            <template v-for="(sub, i) in getTableValue(props.data, item.field)">
                                <component :is="`el-${item.component}`" :key="i"
                                    v-bind="getComponentProps(item.extra, sub, index)"
                                    v-if="getComponentValue(item.extra, sub)">
                                    {{ getComponentValue(item.extra, sub) }}</component>
                            </template>
                        </template>
                        <component v-else :is="`el-${item.component}`"
                            v-bind="getComponentProps(item.extra, getTableValue(props.data, item.field))"
                            v-if="getComponentValue(item.extra, getTableValue(props.data, item.field))">
                            {{ getComponentValue(item.extra, getTableValue(props.data, item.field)) }}
                        </component>
                    </template>
                    <!-- 常规表单类 -->
                    <div class="flex flex-column grid-gap-2 line-height-1 mt-4" v-if="item.extra.prompt">
                        <xl-prompt :prompt="item.extra.prompt"></xl-prompt>
                    </div>
                    <!-- </div> -->
                </div>
            </div>
        </template>
    </div>
</template>
<style lang="scss" scoped>
.examine-item {
    line-height: 34px;
    --xl-examine-label-width: 120px;

    &.examine-item-active {
        background-color: var(--el-bg-color-page);
    }

    &.examine-item-change {
        background-color: var(--el-color-success-light-9);
    }

    .examine-label {
        padding: 10px;
        text-align: right;
        width: var(--xl-examine-label-width);
    }

    .examine-data {
        padding: 10px;
    }
}
</style>