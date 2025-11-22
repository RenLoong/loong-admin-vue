<script setup lang="ts">
import { hasWhere } from '@/common/functions';
import { useClick } from '@/common/functions/action';


const props = withDefaults(defineProps<{
    action: any,
    item: any
}>(), {
    action: {},
    item: {}
});
const emit = defineEmits(['cannel', 'success']);
const handleAction = (group: any, row: any) => {
    if (!group.extra) return;
    let query = {
        ...group.extra.params
    };
    if (group.extra.field) {
        if (group.extra.field === '*') {
            query = {
                ...query,
                ...row
            }
        } else {
            for (let key in group.extra.field) {
                query[group.extra.field[key]] = row[key];
            }
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
    useClick(options).then((res) => {
        emit('success', res);
    }).catch((val: any) => {
        if (val === 'close') {
            emit('cannel');
        }
    })
}
</script>
<template>
    <template v-for="(group, _index) in props.action" :index="_index">
        <permissions :name="group.extra.path">
            <component :is="`el-${group.extra.component.name}`" v-bind="group.extra.component.props"
                v-if="hasWhere(group.extra, props.item)" @click.stop="handleAction(group, props.item)">
                {{ group.label }}
            </component>
        </permissions>
    </template>
</template>