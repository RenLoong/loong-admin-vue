<script lang="ts" setup>
import { $http } from '@/common';
import { useUserStore } from '@/stores';
const { getToken } = useUserStore();
const getHeaders = () => {
    const headers = ref<{
        Authorization?: string
    }>({
        Authorization: getToken()
    })
    return headers.value
}
const uploadRef=ref();
const clearFiles=()=>{
    uploadRef.value.clearFiles();
}
defineExpose({
    clearFiles
})
</script>
<template>
    <el-upload ref="uploadRef" :action="$http.baseURL + '/Uploads/upload'" :headers="getHeaders()" :show-file-list="false">
        <template #tip>
            <slot name="tip" />
        </template>
        <template #file="{ file }">
            <slot name="file" :file="file" />
        </template>
        <slot />
    </el-upload>
</template>
<style></style>