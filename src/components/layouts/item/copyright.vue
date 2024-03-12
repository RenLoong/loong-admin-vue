<script setup lang="ts">
import { useRefs, useWebConfigStore } from '@/stores';

const props = withDefaults(defineProps<{
    theme?: 'light' | 'dark' | 'transparent'
    center?:boolean
    placeholder?: boolean
}>(), {
    theme:'light',
    center:false,
    placeholder: true,
});
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
</script>

<template>
    <div class="flex h10" :class="['theme--' + props.theme,props.center?'flex-center':'']">
        <slot name="prepend"></slot>
        <div class="p-4">{{ WEBCONFIG.copyright }} {{ WEBCONFIG.version_name }}</div>
        <slot name="center"></slot>
        <a class="p-4" href="https://beian.miit.gov.cn/" target="_blank" v-if="WEBCONFIG.icp">{{
            WEBCONFIG.icp }}</a>
        <img src="/static/beian.gov.png" width="20" height="20" class="ml-4" v-if="WEBCONFIG.web_mps" />
        <a class="py-4 pl-2 pr-4"
            :href="'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=' + WEBCONFIG.web_mps"
            target="_blank" v-if="WEBCONFIG.web_mps">{{ WEBCONFIG.web_mps_text }}</a>
        <slot name="append"></slot>
    </div>
</template>

<style scoped>
.theme--transparent {
    --el-text-color-primary: #FFFFFF;
    background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), 0);
}

.theme--dark {
    background-color: rgba(0, 0, 0, 1);
    --el-text-color-primary: #FFFFFF;
}
</style>
