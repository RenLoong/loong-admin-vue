<script lang="ts" setup>
const props = withDefaults(defineProps<{
    gutter?: number|string
}>(), {
});
</script>
<template>
    <div class="grid" :class="['grid-gap-'+props.gutter]">
        <slot/>
    </div>
</template>
<style></style>