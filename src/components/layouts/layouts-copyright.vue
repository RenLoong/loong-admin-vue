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
const clientVersion = ref<string>();
onMounted(() => {
    const metaElement = globalThis.document.head.querySelector('meta[name="version"]');
    if (metaElement instanceof HTMLMetaElement) {
        clientVersion.value = metaElement.content;
    }
});
</script>

<template>
    <div class="flex copyright p-4" :class="['theme--' + props.theme,props.center?'flex-center':'']">
        <slot name="prepend"></slot>
        <div>{{ WEBCONFIG.copyright }} {{ WEBCONFIG.version_name }}</div>
        <a href="https://github.com/RenLoong/loong-admin" target="_blank" v-if="clientVersion">Client Version:{{clientVersion}}</a>
        <slot name="center"></slot>
        <a href="https://beian.miit.gov.cn/" target="_blank" v-if="WEBCONFIG.web_icp">
            {{ WEBCONFIG.web_icp }}
        </a>
        <div class="flex flex-center" v-if="WEBCONFIG.web_mps">
            <img src="/static/beian.gov.png" width="20" height="20" />
            <a class="pl-2"
                :href="'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=' + WEBCONFIG.web_mps"
                target="_blank">{{ WEBCONFIG.web_mps_text }}</a>
        </div>
        <slot name="append"></slot>
    </div>
</template>

<style lang="scss" scoped>
.theme--transparent {
    --el-text-color-primary: #FFFFFF;
    background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), 0);
}

.theme--dark {
    background-color: rgba(0, 0, 0, 1);
    --el-text-color-primary: #FFFFFF;
}
.copyright{
    font-size: 11px;
    gap:10px;
    a{
        color:var(--el-text-color-primary);
    }
}
</style>
