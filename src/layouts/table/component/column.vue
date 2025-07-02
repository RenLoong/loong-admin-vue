<script setup lang="ts">
import columnSolt from "./column-solt.vue";
const props = withDefaults(defineProps<{
	column: any,
	tableData: any
}>(), {
	column: {}
});
const emit = defineEmits(['change'])
const updateTableDataValue = (scope: any, value: any) => {
	emit('change', scope, value);
}
</script>
<template>
	<el-table-column v-if="!column.extra?.component" :prop="column.prop" :label="column.label"
		v-bind="column.extra.props" />
	<el-table-column v-else :prop="column.prop" :label="column.label" v-bind="column.extra.props">
		<template #default="scope">
			<column-solt :scope="scope" :column="props.column" :tableData="props.tableData"
				@change="updateTableDataValue"></column-solt>
		</template>
	</el-table-column>
</template>
<style lang="scss" scoped>
.min-w-100px {
	min-width: 60px;
}
</style>