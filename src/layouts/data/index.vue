<script setup lang="ts">
import { $http } from '@/common';
import router from '@/routers';

const props = withDefaults(defineProps<{
	params?: any
}>(), {
});
const loading = ref(true);
const refs=ref([]);
const currentRoute = router.currentRoute.value;
let ApiUrl = currentRoute.meta.api;
if (props.params) {
	ApiUrl = props.params.api;
}
const rowProps = ref({
    gutter:20
});
const rows = ref<any[]>([]);
onBeforeMount(() => {
	$http.get(`${ApiUrl}`,{
		params:{
			...currentRoute.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
            rowProps.value=res.data.props;
            rows.value=res.data.rows;
			nextTick(() => {
				loading.value = false;
				console.log(refs);
			})
		}
	}).finally(() => {
		loading.value = false;
	})
})
</script>

<template>
	<el-skeleton :loading="loading" animated>
		<template #template>
			<div class="grid grid-gap-6">
				<el-skeleton-item class="grid-column-6" style="height:180px;"/>
				<el-skeleton-item class="grid-column-6" style="height:180px;"/>
				<el-skeleton-item class="grid-column-6" style="height:180px;"/>
				<el-skeleton-item class="grid-column-6" style="height:180px;"/>
			</div>
			<div class="grid grid-gap-6 my-6">
				<el-skeleton-item style="height: 80px;" class="grid-column-3"/>
				<el-skeleton-item style="height: 80px;" class="grid-column-3"/>
				<el-skeleton-item style="height: 80px;" class="grid-column-3"/>
				<el-skeleton-item style="height: 80px;" class="grid-column-3"/>
				<el-skeleton-item style="height: 80px;" class="grid-column-3"/>
				<el-skeleton-item style="height: 80px;" class="grid-column-3"/>
				<el-skeleton-item style="height: 80px;" class="grid-column-3"/>
				<el-skeleton-item style="height: 80px;" class="grid-column-3"/>
			</div>
			<el-skeleton-item style="height: 500px;" />
		</template>
		<template #default>
            <xl-row v-bind="rowProps">
                <xl-col v-for="(item,index) in rows" :index="index" v-bind="item.props" :row="item.row">
					<template v-if="item.component.name==='statistic'">
						<xl-statistic ref="refs" v-bind="item.component.props"/>
					</template>
					<template v-else-if="item.component.name==='echarts'">
						<xl-echarts ref="refs" v-bind="item.component.props"/>
					</template>
					<template v-else>
						<component :is="`${item.component.name}`" v-bind="item.component.props"/>
					</template>
                </xl-col>
            </xl-row>
		</template>
	</el-skeleton>
</template>

<style lang="scss">
</style>
