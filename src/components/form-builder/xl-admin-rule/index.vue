<script setup lang="ts">
import { TransferKey } from 'element-plus';
import { useI18n } from 'vue-i18n';
const {t} = useI18n();

const props = withDefaults(defineProps<{
    modelValue: string[],
    options: any,
    rightDefaultChecked: string[]
}>(), {
    options: []
});
const emit = defineEmits(['update:modelValue']);
const flattenData = (items: any[], parentTitle = '') => {
    let result: any[] = [];
    items.sort((a: any, b: any) => a.sort - b.sort).forEach(item => {
        const fullTitle = parentTitle ? `${parentTitle} - ${item.title}` : item.title;
        result.push({ label: fullTitle, key: item.path, disabled: props.rightDefaultChecked.includes(item.path) });
        if (item.children && item.children.length > 0) {
            result = result.concat(flattenData(item.children, fullTitle));
        }
    });
    return result;
}
const data = flattenData(props.options);


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
    <el-transfer v-model="value" :titles="[t('form.adminRule.title.unauthorized'), t('form.adminRule.title.authorized')]" :button-texts="[t('button.cancelAuthorizationText'), t('button.addAuthorizationText')]" filterable
        :right-default-checked="props.rightDefaultChecked" :filter-method="filterMethod" :filter-placeholder="t('form.placeholder.searchAuthorized')"
        :data="data" class="admin-rule" @change="updateValue" />
</template>

<style lang="scss" scoped>
.admin-rule {
    --el-transfer-panel-width: 423px;
    --el-transfer-panel-body-height: 50vh;
}

@media only screen and (max-width: 1468px) {
    .admin-rule {
        --el-transfer-panel-width: 100%;
        --el-transfer-panel-body-height: 50vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }
}
</style>