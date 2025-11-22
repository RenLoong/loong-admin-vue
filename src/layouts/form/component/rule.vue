<script setup lang="ts">
import { hasWhere } from '@/common/functions';
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
const emit = defineEmits(['cannel','update:modelValue']);
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
watch(form, (newVal) => {
    emit('update:modelValue', newVal)
})
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
    }).catch((val: any) => {
        if (val === 'close') {
            emit('cannel');
        }
    })
}
</script>

<template>
    <el-row :gutter="20">
        <template v-for="(item, index) in rule">
            <el-col v-bind="item.extra?.col" v-if="hasWhere(item.extra, form)">
                <form-item :item="item" v-model="form" :group="props.group" :key="index" @action="handleAction"/>
            </el-col>
        </template>
    </el-row>
</template>

<style lang="scss" scoped>
</style>
