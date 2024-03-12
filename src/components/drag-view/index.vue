<script lang="ts" setup>
const props = withDefaults(defineProps<{
    modelValue:any[]
}>(), {
});
const emit = defineEmits(['update:modelValue'])
const dragIndex = ref<number>()
const dragStart = (e: any, index: number) => {
    e.stopPropagation();
    dragIndex.value = index;
    e.dataTransfer.effectAllowed = 'move';
}
const dragEnter = (e: any, index: number) => {
    e.preventDefault();
    if (dragIndex.value === undefined || dragIndex.value === index) return;

    const draggedItem = props.modelValue[dragIndex.value];
    const form = props.modelValue;
    form.splice(dragIndex.value, 1);
    form.splice(index, 0, draggedItem);
    dragIndex.value = index;
    emit('update:modelValue', form);
}
const dragOver = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}
const dragEnd = () => {
    dragIndex.value = undefined;
}
</script>
<template>
    <div v-for="(item,index) in props.modelValue" :key="index" :draggable="true" @dragstart="dragStart($event, index)" @dragenter="dragEnter($event, index)" @dragover="dragOver" @dragend="dragEnd">
    <slot :item="item" :index="index" :drag-index="dragIndex"/>
    </div>
</template>
<style></style>