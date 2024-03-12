<script setup lang="ts">
const props = withDefaults(defineProps<{
    theme?: 'light' | 'dark' | 'transparent'
    placeholder?: boolean
    direction?: string
}>(), {
    placeholder: true,
    direction: 'center'
});
const footerRef = ref();
onMounted(() => {
    document.body.style.setProperty('--footer-height', footerRef.value.clientHeight + 'px');
})
</script>

<template>
    <footer class="pt-10 bg" ref="footerRef" :class="['theme--' + props.theme]">
        <div class="layouts py-6">
            <copyright :theme="props.theme" :class="['flex-' + props.direction]">
                <template #center>
                    <slot name="center"></slot>
                </template>
            </copyright>
        </div>
    </footer>
</template>

<style lang="scss" scoped>
footer {
    color: var(--el-text-color-primary);
}

.bg.theme--transparent {
    --el-text-color-primary: #FFFFFF;
    background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), 0);
}

.bg.theme--dark {
    background-color: rgba(0, 0, 0, 1);
    --el-text-color-primary: #FFFFFF;
}
</style>
