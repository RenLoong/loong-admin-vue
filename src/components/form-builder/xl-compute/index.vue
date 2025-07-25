<script setup lang="ts">
import { computed } from 'vue';
import { evaluate } from 'mathjs'
const props = withDefaults(defineProps<{
    data?: any,
    formula: string,
}>(), {
    data: () => ({})
});
const result = computed(() => {
    return evaluate(props.formula, props.data)
})
</script>

<template>
    <el-text v-bind="props">{{ result }}</el-text>
</template>

<style lang="scss" scoped></style>