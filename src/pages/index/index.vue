<script setup lang="ts">
import control from '@/components/layouts/control.vue';
import admin from '@/components/layouts/admin.vue';
import { useRefs, useWebConfigStore } from "@/stores";
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const layout = shallowRef(control);
const layouts=new Map();
layouts.set('control',control);
layouts.set('admin',admin);
watchEffect(()=>{
	if(WEBCONFIG.value.layout&&layouts.has(WEBCONFIG.value.layout)){
		layout.value=layouts.get(WEBCONFIG.value.layout);
	}
})
</script>

<template>
	<component :is="layout" />
</template>

<style lang="scss">
</style>
