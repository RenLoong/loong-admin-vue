<script setup lang="ts">
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
const tableDataPreview = (prop: string) => {
	return props.tableData.map((item: any) => item[prop]);
}
const getComponentProps = (component: any, value: any, index?: number) => {
	let props = {
		...component.props
	};
	if (component.options) {
		const find = component.options.find((item: any) => item.value === value || (index !== undefined && item.index === index));
		if (find && find.props) {
			props = {
				...props,
				...find.props
			}
		}
	}
	return props;
}
const getComponentValue = (component: any, value: any) => {
	let result = value;
	if (component.options) {
		const find = component.options.find((item: any) => item.value === value);
		if (find && find.label) {
			result = find.label;
		}
	}
	return result;
}
</script>
<template>
	<el-table-column v-if="!column.extra?.component" :prop="column.prop" :label="column.label"
		v-bind="column.extra.props" />
	<el-table-column v-else :prop="column.prop" :label="column.label" v-bind="column.extra.props">
		<template #default="scope">
			<template v-if="column.extra?.component.api">
				<xl-table-column-form :column="column.extra?.component" :scope="scope" @change="updateTableDataValue" />
			</template>
			<template v-else-if="column.extra?.component.name === 'table-userinfo'">
				<xl-table-userinfo :data="scope.row" v-bind="column.extra?.component.props" />
			</template>
			<template v-else-if="column.extra?.component.name === 'table-times'">
				<xl-table-times :data="scope.row" v-bind="column.extra?.component.props" />
			</template>
			<template v-else-if="column.extra?.component.name === 'copy'">
				<xl-copy :text="scope.row[column.prop]" v-bind="column.extra?.component.props" />
			</template>
			<template v-else-if="column.extra?.component.name === 'image'">
				<template v-if="Array.isArray(scope.row[column.prop])">
					<el-image v-for="(item, index) in scope.row[column.prop]" :index="index"
						v-bind="column.extra?.component.props" :src="item"
						:preview-src-list="scope.row[column.prop]"></el-image>
				</template>
				<el-image v-else v-bind="column.extra?.component.props" :src="scope.row[column.prop]"
					:preview-src-list="tableDataPreview(column.prop)"></el-image>
			</template>

			<template v-else>
				<template v-if="Array.isArray(scope.row[column.prop])">
					<component v-for="(item, index) in scope.row[column.prop]" :is="`el-${column.extra.component.name}`"
						:index="index" v-bind="getComponentProps(column.extra?.component, item, index)">
						{{ getComponentValue(column.extra?.component, item) }}</component>
				</template>
				<component v-else :is="`el-${column.extra?.component.name}`"
					v-bind="getComponentProps(column.extra?.component, scope.row[column.prop])">
					{{ getComponentValue(column.extra?.component, scope.row[column.prop]) }}
				</component>
			</template>
		</template>
	</el-table-column>
</template>