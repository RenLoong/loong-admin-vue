<script setup lang="ts">
import { getTableValue, hasWhere } from '@/common/functions';

const props = withDefaults(defineProps<{
    column: any,
    tableData: any,
    scope: any
}>(), {
    column: {}
});
const emit = defineEmits(['change'])
const updateTableDataValue = (scope: any, value: any) => {
    emit('change', scope, value);
}
const tableDataPreview = (prop: string) => {
    return props.tableData.map((item: any) => getTableValue(item, prop));
}
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
</script>
<template>
    <template v-if="hasWhere(column.extra, scope.row)">
        <template v-if="column.extra?.component.api">
            <xl-table-column-form :column="column.extra?.component" :scope="scope" :field="column.extra?.field"
                @change="updateTableDataValue" />
        </template>
        <template v-else-if="column.extra?.component.name === 'table-userinfo'">
            <xl-table-userinfo :data="scope.row" v-bind="column.extra?.component.props" />
        </template>
        <template v-else-if="column.extra?.component.name === 'table-times'">
            <xl-table-times :data="scope.row" v-bind="column.extra?.component.props" />
        </template>
        <template v-else-if="column.extra?.component.name === 'copy'">
            <xl-copy :content="getTableValue(scope.row, column.prop)" v-bind="column.extra?.component.props" />
        </template>
        <template v-else-if="column.extra?.component.name === 'statistic'">
            <div class="flex grid-gap-4 text-center flex-1">
                <el-statistic class="flex-1 min-w-100px" v-for="(item, index) in column.extra?.component.options"
                    :key="index" :title="item.label" :value="getTableValue(scope.row, item.value)"
                    v-bind="{ ...column.extra?.component, ...item.props }">
                    <template v-for="(subChild, subName) in item.children" :index="subName" v-slot:[subName]>
                        <component :is="subChild.component" v-if="typeof subChild === 'object'" v-bind="subChild.props">
                            <template v-for="(subSubChild, subSubName) in subChild.children" :index="subSubName" v-slot:[subSubName]>
                                <component :is="subSubChild.component" v-if="typeof subSubChild === 'object'"
                                    v-bind="subSubChild.props"/>
                                <template v-else>{{ subSubChild }}</template>
                            </template>
                        </component>
                        <template v-else>{{ subChild }}</template>
                    </template>
                </el-statistic>
            </div>
        </template>
        <template v-else-if="column.extra?.component.name === 'image'">
            <template v-if="Array.isArray(getTableValue(scope.row, column.prop))">
                <el-image preview-teleported v-for="(item, index) in getTableValue(scope.row, column.prop)" :key="index"
                    v-bind="column.extra?.component.props" :src="item"
                    :preview-src-list="getTableValue(scope.row, column.prop)"></el-image>
            </template>
            <el-image v-else preview-teleported v-bind="column.extra?.component.props"
                v-if="getTableValue(scope.row, column.prop)" :src="getTableValue(scope.row, column.prop)"
                :preview-src-list="tableDataPreview(column.prop)"></el-image>
        </template>

        <template v-else>
            <template v-if="Array.isArray(getTableValue(scope.row, column.prop))">
                <template v-for="(item, index) in getTableValue(scope.row, column.prop)">
                    <component :is="`el-${column.extra.component.name}`" :key="index"
                        v-bind="getComponentProps(column.extra?.component, item, index)"
                        v-if="getComponentValue(column.extra?.component, item)">
                        {{ getComponentValue(column.extra?.component, item) }}</component>
                </template>
            </template>
            <component v-else :is="`el-${column.extra?.component.name}`"
                v-bind="getComponentProps(column.extra?.component, getTableValue(scope.row, column.prop))"
                v-if="getComponentValue(column.extra?.component, getTableValue(scope.row, column.prop))">
                {{ getComponentValue(column.extra?.component, getTableValue(scope.row, column.prop)) }}
            </component>
        </template>
    </template>
</template>
<style lang="scss" scoped>
.min-w-100px {
    min-width: 60px;
}
</style>