<script setup lang="ts">
import router from "@/routers";
import {  useRefs, useWebConfigStore } from "@/stores";
import useTheme from "@/common/theme";
const { theme } = useTheme();
const props = withDefaults(defineProps<{
    theme?: 'light' | 'dark' | 'transparent'
    placeholder?: boolean
}>(), {
    placeholder: true
});
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const active = ref<string | null>();
watchEffect(() => {
    active.value = router.currentRoute.value.path
})
const headerRef = ref();
const placeholderStyle = ref({
    height: ''
});
onMounted(() => {
    if (props.placeholder) {
        placeholderStyle.value.height = headerRef.value.clientHeight + 'px';
    }
    document.body.style.setProperty('--header-height', headerRef.value.clientHeight + 'px');
})
</script>

<template>
    <header ref="headerRef" class="bg-filter header-theme" :class="['theme--' + props.theme]">
        <div class="flex layouts">
            <a class="px-10 py-2 mr-10" href="/">
                <item-logo :theme="props.theme" width="100px" height="46px" />
            </a>
            <div class="flex nav-list flex-x-space-between">
                <el-link class="nav-item" :class="{ 'active': active==='/' }" href="/"
                    :underline="false">首页</el-link>
                <el-link class="nav-item" :class="{ 'active': active?.startsWith('/apps') }" href="/#/apps"
                    :underline="false">应用市场</el-link>
                <el-link class="nav-item" :href="item.url" :class="{ 'active': item.url.includes(active) && active!=='/' }" :underline="false" :target="item.target"
                    v-for="item in WEBCONFIG.header_nav">{{ item.title }}</el-link>
                <el-link class="nav-item" :class="{ 'active': active?.startsWith('/control') }" href="/#/control"
                    :underline="false">控制台</el-link>
            </div>
            <div class="flex-1"></div>
            <div class="px-4 flex flex-center">
                <el-switch v-model="theme" style="--el-switch-on-color:#2c2c2c;" active-action-icon="Moon"
                    inactive-action-icon="Sunny" active-value="dark" inactive-value="OS" />
            </div>
        </div>
    </header>
    <div :style="placeholderStyle"></div>
</template>

<style scoped lang="scss">
header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    transition: all .3s;
}


.nav-list {
    width: 100%;
    max-width: 550px;
}

.nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 12px;
    padding-right: 12px;
    --el-link-text-color: var(--el-text-color-primary);
    position: relative;
    font-weight: 600;
}


.active {
    color: var(--el-color-primary);
}

.header-theme {
    background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), .75);
}

.header-theme.theme--transparent {
    --el-color-primary: #FFFFFF;
    --el-text-color-primary: #656565;
    background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), 0);
    backdrop-filter: blur(0px);
}

.header-theme.theme--dark {
    --el-color-primary: #FFFFFF;
    --el-text-color-primary: #656565;
    background-color: rgba(10, 10, 10, .75);
}

.header-theme.theme--transparent .el-button.is-text.btn-bg-transparent,
.header-theme.theme--dark .el-button.is-text.btn-bg-transparent {
    --el-fill-color-light: transparent;
    --el-button-hover-bg-color: transparent;
    --el-fill-color: transparent;
    border-width: 1px;
    border-color: rgba(255, 255, 255, .5);
    --el-button-text-color: #FFFFFF;
}
</style>
