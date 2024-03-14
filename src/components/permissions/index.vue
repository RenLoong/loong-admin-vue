<script lang="ts" setup>
import { useUserStore } from '@/stores';
const { hasPermission } = useUserStore()
const props = withDefaults(defineProps<{
    name?: string
}>(), {
});
</script>
<template>
    <slot v-if="hasPermission(props.name)" />
</template>