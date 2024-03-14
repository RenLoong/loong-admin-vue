<script lang="ts" setup>
import { timetostr } from "@/common/functions";
const props = defineProps<{
    time: number | string
}>();
const t = ref<number>(0);
const er = ref();
onMounted(() => {
    if (!props.time) return;
    if (typeof props.time === 'string') {
        const d = new Date(props.time);
        t.value = Math.floor((d.getTime() - new Date().getTime()) / 1000);
    } else {
        t.value = props.time as number;
    }
    er.value = setInterval(() => {
        t.value--;
        if (t.value <= 0) {
            clearInterval(er.value);
        }
    }, 1000)
})
onUnmounted(() => {
    clearInterval(er.value);
})
</script>
<template>
    <slot name="prepend" />
    <span>{{ timetostr(t) }}</span>
    <slot name="append" />
</template>