<script setup lang="ts">
import formItem from './form-item.vue'
import { useClick } from '@/common/functions/action';
const props = withDefaults(defineProps<{
    modelValue: any
    rule: any
    group?: string
}>(), {
    modelValue: {},
    rule: [],
    group: ''
});
interface RuleInterface {
    title: string;
    field: string;
    component: string;
    extra?: any;
    children: any;
}
const rule = ref<RuleInterface[]>([]);
const form = ref<any>({})
watchEffect(() => {
    if (props.modelValue) {
        form.value = props.modelValue;
    }
});
watchEffect(() => {
    if (props.rule) {
        rule.value = props.rule;
    }
});
const handleAction = ({group, field}:{group: any, field: any}) => {
    if (!group.extra) return;
    let query = {
        ...group.extra.params,
        field
    };
    if (group.extra.field) {
        for (let key in group.extra.field) {
            query[group.extra.field[key]] = form.value[key];
        }
    } else {
        query.id = form.value.id;
    }
    const options = {
        model: group.extra.model,
        props: group.extra.props,
        path: group.extra.path,
        query,
        data: form.value
    };
    useClick(options).then((data: any) => {
        if (data[field]) {
            form.value[field] = data[field]
        }
    }).catch(() => { })
}
</script>

<template>
    <template v-for="(item) in rule">
        <form-item :item="item" v-model="form" :group="props.group" @action="handleAction"/>
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
<style lang="scss">
.el-form.el-form--inline .el-select{
    --el-select-width: 200px;
}

</style>
