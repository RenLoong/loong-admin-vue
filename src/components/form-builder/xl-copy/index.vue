<script setup lang="ts">
import { setClipboard } from '@/common/functions';

const props = withDefaults(defineProps<{
    text: string,
}>(), {
    text:''
});
const copy=()=>{
    setClipboard(props.text);
}
</script>

<template>
    <div class="flex grid-gap-4 flex-wrap">
        <div class="text-wrap text-keep-all max-w-100">{{props.text}}</div>
        <el-link type="success" :underline="false" @click="copy">复制</el-link>
    </div>
</template>

<style lang="scss" scoped>
</style>