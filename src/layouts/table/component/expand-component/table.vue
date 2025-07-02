<script setup lang="ts">
import { hasWhere } from "@/common/functions";
import { useClick } from "@/common/functions/action";
import columnComponent from '../column.vue'
const props = withDefaults(defineProps<{
    component: any,
    row:any,
    prop:any
}>(), {
    component: {}
});
const tableData = ref<any[]>(props.row[props.prop]);
const updateTableDataValue = (scope: any, value: any) => {
    tableData.value[scope.$index][scope.column.property] = value;
}
const handleAction = (group: any, row: any) => {
    if (!group.extra) return;
    let query = {
        ...group.extra.params
    };
    if (group.extra.field) {
        for (let key in group.extra.field) {
            query[group.extra.field[key]] = row[key];
        }
    } else {
        query.id = row.id;
    }
    const options = {
        model: group.extra.model,
        props: group.extra.props,
        path: group.extra.path,
        query,
        data: row
    };
    useClick(options).then(() => {
    }).catch(() => { })
}
</script>
<template>
    <el-table :data="tableData" v-bind="props.component.builder.props">
        <template v-for="(column, _index) in props.component.builder.columns" :index="_index">
            <columnComponent :column="column" :tableData="tableData" @change="updateTableDataValue" />
        </template>
        <el-table-column v-if="props.component.builder.action" :label="props.component.builder.action.label"
            v-bind="props.component.builder.action.extra.props">
            <template #default="scope">
                <div class="table-group">
                    <template v-for="(group, _index) in props.component.builder.action.extra.group" :index="_index">
                        <permissions :name="group.extra.path">
                            <component :is="`el-${group.extra.component.name}`" v-bind="group.extra.component.props"
                                v-if="hasWhere(group.extra, scope.row)" @click="handleAction(group, scope.row)">
                                {{ group.label }}
                            </component>
                        </permissions>
                    </template>
                </div>
            </template>
        </el-table-column>
    </el-table>
</template>