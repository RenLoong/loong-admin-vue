<script lang="ts" setup>
import { $http } from '@/common';
import { useUserStore } from '@/stores';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
const {t} = useI18n();
const props = withDefaults(defineProps<{
    size?: number
}>(), {
});
const { getToken } = useUserStore();
const getHeaders = () => {
    const headers = ref<{
        Authorization?: string
    }>({
        Authorization: getToken()
    })
    return headers.value
}
const uploadRef = ref();
const clearFiles = () => {
    uploadRef.value.clearFiles();
}
const beforeUpload = (file: File) => {
    if (props.size && file.size > props.size * 1024 * 1024) {
        ElMessage.error(t('message.uploadSizeError', { size: props.size }));
        return false;
    }
    return true;
}
defineExpose({
    clearFiles
})
</script>
<template>
    <el-upload ref="uploadRef" :action="$http.getCompleteUrl('Uploads/upload')" :headers="getHeaders()" :before-upload="beforeUpload"
        :show-file-list="false">
        <template #tip>
            <slot name="tip" />
        </template>
        <template #file="{ file }">
            <slot name="file" :file="file" />
        </template>
        <permissions name="Uploads/upload">
            <slot />
        </permissions>
    </el-upload>
</template>
<style></style>