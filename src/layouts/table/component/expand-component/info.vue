<script setup lang="ts">
const props = withDefaults(defineProps<{
    component: any,
    row:any,
    prop:any
}>(), {
    component: {}
});
// const infoData = ref<any[]>(props.row[props.prop]);
console.log(props);
</script>
<template>
    <div>
    </div>
</template>