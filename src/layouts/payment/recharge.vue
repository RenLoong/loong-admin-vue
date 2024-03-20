<script setup lang="ts">
import { $eventBus, $http } from '@/common';
import ResponseEvent from '@/common/enum/ResponseEvent';
import router from '@/routers';
const props = withDefaults(defineProps<{
	params?: any
}>(), {
});
const emit = defineEmits(['confirm']);
const loading = ref(true);
const currentRoute = router.currentRoute.value;
let ApiUrl = currentRoute.meta.api as string;
if (props.params) {
	ApiUrl = props.params.api;
}
onBeforeMount(() => {
	$http.get(ApiUrl, {
		params: {
			...currentRoute.query,
			...props.params?.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			nextTick(() => {
			})
		}
	}).finally(() => {
		loading.value = false;
	})
})
onMounted(() => {
    $eventBus.emit(ResponseEvent.UPDATE_USERINFO);
})
</script>

<template>
	<div>开发中</div>
</template>

<style lang="scss"></style>
