<script lang="ts" setup>
// 接收 items
const props = defineProps<{
    items: any[]
}>();

// v-model 双向绑定 (等价于 modelValue + update:modelValue)
const modelValue = defineModel<any[]>({
    default: []
});

const dragIndex = ref<number>();
const localItems = ref<any[]>([]);

// 初始化 & 同步排序
const syncItems = () => {
    if (!props.items) return;
    if (!modelValue.value?.length) {
        localItems.value = [...props.items];
    } else {
        const valueSet = new Set(modelValue.value);
        localItems.value = [
            ...modelValue.value
                .map(v => props.items.find(it => it.value === v))
                .filter(Boolean),
            ...props.items.filter(it => !valueSet.has(it.value))
        ];
    }
};

watch(() => props.items, syncItems, { immediate: true, deep: true });
watch(modelValue, syncItems, { immediate: true, deep: true });

const dragStart = (e: DragEvent, index: number) => {
    e.stopPropagation();
    dragIndex.value = index;
    e.dataTransfer!.effectAllowed = 'move';
};

const dragEnter = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.value === undefined || dragIndex.value === index) return;

    const draggedItem = localItems.value[dragIndex.value];
    localItems.value.splice(dragIndex.value, 1);
    localItems.value.splice(index, 0, draggedItem);
    dragIndex.value = index;

    // 拖动后更新 v-model
    modelValue.value = localItems.value.map(it => it.value);
};

const dragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
};

const dragEnd = () => {
    dragIndex.value = undefined;
};
</script>

<template>
    <div v-for="(item, index) in localItems" :key="item.value" draggable="true" @dragstart="dragStart($event, index)"
        @dragenter="dragEnter($event, index)" @dragover="dragOver" @dragend="dragEnd">
        <slot :item="item" :index="index" :drag-index="dragIndex">
            <div class="flex flex-y-center">
                <el-icon class="nav-drag" :class="{ moveing: dragIndex !== undefined }">
                    <Rank />
                </el-icon>
                <div class="flex flex-1" :class="{ moveing: dragIndex === index }">
                    <span>{{ item.label }}</span>
                </div>
            </div>
        </slot>
    </div>
</template>
<style lang="scss" scoped>
.nav-drag {
    height: 40px;
    width: 40px;
    cursor: move;
    color: var(--el-color-primary);
}

.nav-drag.moveing {
    border: dashed 1px var(--el-color-primary);
}

.nav-item.moveing {
    opacity: 0.5;
}
</style>
