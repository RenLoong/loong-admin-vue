<script setup lang="ts">
import { TransferKey } from 'element-plus';

const props = withDefaults(defineProps<{
    modelValue: string[],
    options: any,
    rightDefaultChecked:string[]
}>(), {
    options: []
});
const emit = defineEmits(['update:modelValue']);
const data = ref<any>([]);
const initData = (options: any, prefix?: string[]) => {
    options.sort((a: any, b: any) => a.sort - b.sort).forEach((item: any) => {
        let title = item.title;
        if (prefix && prefix.length > 0) {
            title = `${prefix.join(' - ')} - ${item.title}`
        }
        data.value.push({
            label: title,
            key: item.path,
            disabled: props.rightDefaultChecked.includes(item.path)
        })
        if (item.children && item.children.length > 0) {
            if (!prefix) {
                prefix = [];
            }
            prefix.push(item.title)
            initData(item.children, prefix)
            prefix = [];
        }
    });
}
initData(props.options)

const value = ref([
    ...props.modelValue,
    ...props.rightDefaultChecked
]);
const updateValue = (value: TransferKey[]) => {
    emit('update:modelValue', value);
}
const filterMethod = (query: string, item: any) => {
    if (!query) return true;
    return item.title.toLowerCase().includes(query.toLowerCase()) || item.path.toLowerCase().includes(query.toLowerCase())
}
</script>

<template>
    <el-transfer v-model="value" :titles="['未授权', '已授权']" :button-texts="['取消授权', '添加授权']" filterable :right-default-checked="props.rightDefaultChecked"
        :filter-method="filterMethod" filter-placeholder="搜索权限" :data="data" class="admin-rule" @change="updateValue" />
</template>

<style lang="scss" scoped>
.admin-rule {
    --el-transfer-panel-width: 300px;
    --el-transfer-panel-body-height: 50vh;
}
</style>