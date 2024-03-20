<script setup lang="ts">
const props = withDefaults(defineProps<{
    data: any
}>(), {
    data: {}
});
</script>

<template>
    <xl-marked-text :content="props.data.content"/>
</template>
