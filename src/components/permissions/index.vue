<script lang="ts" setup>
import { useUserStore } from '@/stores';
const { hasPermission } = useUserStore()
const props = defineProps({
    name: {
        type: String,
        required: true
    }
})
</script>
<template>
    <slot v-if="hasPermission(props.name)" />
</template>