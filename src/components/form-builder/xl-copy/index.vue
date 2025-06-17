<script setup lang="ts">
import { setClipboard } from '@/common/functions';
import { useI18n } from 'vue-i18n';
const {t} = useI18n();
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
        <el-link type="success" underline="never" @click="copy">{{ t('button.copyText') }}</el-link>
    </div>
</template>

<style lang="scss" scoped>
</style>