<script setup lang="ts">
import { $http } from '@/common';
import { hasWhere } from '@/common/functions';
import router from '@/routers';
import { useClick } from '@/common/functions/action';
import ruleComponent from '@/layouts/form/component/rule.vue'
import columnComponent from './component/column.vue'
import { ElForm, ElMessage, ElTable } from 'element-plus';

const props = withDefaults(defineProps<{
	params?: any
}>(), {
});
const formRef = ref<InstanceType<typeof ElForm>>()
const tableRef = ref<InstanceType<typeof ElTable>>()
const loading = ref(true);
const showTable = ref(false);
const currentRoute = router.currentRoute.value;
const columns = ref<any>([]);
const action = ref<any>();
const footer = ref<any>();
const header = ref<any>();
const tableProps = ref<any>({});
const rule = ref<RuleInterface[]>([]);
const rules = ref<any>()
const showScreen = ref(false);
const selection = ref(false);
let ApiUrl = currentRoute.meta.api;
if (props.params) {
	ApiUrl = props.params.api;
}
onBeforeMount(() => {
	$http.get(`${ApiUrl}GetTable`,{
		params:{
			...currentRoute.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			tableProps.value = res.data.props;
			selection.value = res.data.selection;
			columns.value = res.data.columns;
			action.value = res.data.action;
			header.value = res.data.header;
			footer.value = res.data.footer;
			if (res.data.screen) {
				showScreen.value = true;
				for (const key in res.data.screen.form) {
					if (Object.prototype.hasOwnProperty.call(res.data.screen.form, key)) {
						const element = res.data.screen.form[key];
						search.value[key] = element;
					}
				}
				rule.value = res.data.screen.rule;
				for (let i = 0; i < rule.value.length; i++) {
					const element = rule.value[i];
					if (element.extra?.required) {
						if (!rules.value) {
							rules.value = {};
						}
						if (!rules.value[element.field]) {
							rules.value[element.field] = [];
						}
						let trigger = 'blur';
						switch (element.component) {
							case 'input':
							case 'textarea':
							case 'select':
							case 'date-picker':
							case 'time-picker':
							case 'cascader':
							case 'rate':
							case 'color-picker':
							case 'switch':
							case 'slider':
							case 'time-select':
							case 'date-select':
							case 'upload':
								trigger = 'blur';
								break;
							case 'radio':
							case 'checkbox':
								trigger = 'change';
								break;
						}
						rules.value[element.field].push({ required: true, message: element.title + '不能为空', trigger })
					}
				}
			}
			nextTick(() => {
				showTable.value = true;
				loading.value = false;
				getList();
			})
		}
	}).finally(() => {
		loading.value = false;
	})
})
const tableData = ref<any>();
const search = ref<{
	page: number;
	total: number;
	limit: number;
	[key: string]: any;
}>({
	...currentRoute.query,
	page: 1,
	total: 0,
	limit: 10,
});
const listLoading = ref(false);
const getList = () => {
	if (listLoading.value) return;
	listLoading.value = true;
	tableData.value = [];
	$http.get(ApiUrl as string, {
		params: search.value
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			tableData.value = res.data.data;
			search.value.total = res.data.total;
		}
	}).finally(() => {
		listLoading.value = false;
	})
}
const load = (row: any, _treeNode: unknown, resolve: (date: any[]) => void) => {
	const api = tableProps.value?.api;
	if (!api) return resolve([]);
	const query = {
		[tableProps.value.rowKey]: row[tableProps.value.rowKey]
	};
	$http.get(api, {
		params: query
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			resolve(res.data.data);
		}
	})
}
watch(()=>search.value.page,()=>{
	getList()
})
watch(()=>search.value.limit,()=>{
	getList()
})
const onSubmit = () => {
	search.value.page = 1;
	getList();
}
const updateTableDataValue = (scope: any, value: any) => {
	tableData.value[scope.$index][scope.column.property] = value;
}
const handleAction = (group: any, row: any) => {
	if (!group.extra) return;
	let query = {
		...group.extra.params
	};
	if (group.extra.field) {
		for (let key in group.extra.field) {
			query[group.extra.field[key]] = row[key];
		}
	} else {
		query.id = row.id;
	}
	const options = {
		model: group.extra.model,
		props: group.extra.props,
		path: group.extra.path,
		query,
		data: row
	};
	useClick(options).then(() => {
		getList();
	}).catch(() => { })
}
const handleFooter = (group: any) => {
	if (!group.extra) return;
	if (multipleSelection.value.length <= 0) {
		return ElMessage.warning('请选择数据');
	}
	let query = {
		...group.extra.params
	};
	if (group.extra.field) {
		for (let key in group.extra.field) {
			query[group.extra.field[key]] = multipleSelection.value.map((item: any) => item[key]).join(',');
		}
	} else {
		query.id = multipleSelection.value.map((item: any) => item.id).join(',');
	}
	const options = {
		model: group.extra.model,
		props: group.extra.props,
		path: group.extra.path,
		query,
		data: multipleSelection.value
	};
	useClick(options).then(() => {
		getList();
	}).catch(() => { })
}
const handleHeader = (group: any) => {
	if (!group.extra) return;
	if (group.extra.use) {
		switch (group.extra.use) {
			case 'screen':
				return handleFooter(group);
		}
	}
	let query = {
		...group.extra.params
	};
	const options = {
		model: group.extra.model,
		props: group.extra.props,
		path: group.extra.path,
		query,
		data: multipleSelection.value
	};
	useClick(options).then(() => {
		getList();
	}).catch(() => { })
}
const resetForm = () => {
	formRef.value?.resetFields();
}
const multipleSelection = ref<any[]>([])
const toggleSelection = (rows?: any[]) => {
	if (rows) {
		rows.forEach((row) => {
			tableRef.value!.toggleRowSelection(row, true)
		})
	} else {
		tableRef.value!.clearSelection()
	}
}
const handleSelectionChange = (val: any[]) => {
	multipleSelection.value = val
}
</script>

<template>
	<el-skeleton :loading="loading" animated>
		<template #template>
			<div class="table-screen">
				<el-skeleton-item />
				<el-skeleton-item />
				<el-skeleton-item />
				<el-skeleton-item style="width:80px;" />
			</div>
			<div class="border grid grid-gap-4 p-4 my-4">
				<el-skeleton-item style="height: 30px;" class="grid-column-6" v-for="item in 40" :index="item" />
			</div>
			<el-skeleton-item style="height: 30px;" />
		</template>
		<template #default>
			<div class="flex flex-center p-4 shadow-light rounded-4 mb-6" v-if="header">
				<div class="font-weight-600">{{ currentRoute.meta.title }}</div>
				<div class="flex-1"></div>
				<template v-for="(group, _index) in header.extra.group" :index="_index">
					<permissions :name="group.extra.path">
						<component :is="`el-${group.extra.component.name}`" v-bind="group.extra.component.props"
							@click="handleHeader(group)">
							{{ group.label }}
						</component>
					</permissions>
				</template>
			</div>
			<div class="table-layouts">
				<el-form ref="formRef" :model="search" :rules="rules" label-width="80px" v-if="showScreen"
					:disabled="listLoading" class="py-6">
					<div class="table-screen">
						<ruleComponent v-model="search" :rule="rule" />
						<el-form-item>
							<el-button type="primary" @click="onSubmit" :loading="listLoading">查询</el-button>
							<el-button @click="resetForm">重置</el-button>
						</el-form-item>
					</div>
				</el-form>
				<el-table ref="tableRef" :data="tableData" v-if="showTable" v-bind="tableProps"
					@selection-change="handleSelectionChange" :load="load">
					<template v-for="(column, _index) in columns" :index="_index">
						<columnComponent :column="column" :tableData="tableData" @change="updateTableDataValue" />
					</template>
					<el-table-column v-if="action" :label="action.label" v-bind="action.extra.props">
						<template #default="scope">
							<template v-for="(group, _index) in action.extra.group" :index="_index">
								<permissions :name="group.extra.path">
									<component :is="`el-${group.extra.component.name}`"
										v-bind="group.extra.component.props" v-if="hasWhere(group.extra, scope.row)"
										@click="handleAction(group, scope.row)">
										{{ group.label }}
									</component>
								</permissions>
							</template>
						</template>
					</el-table-column>
				</el-table>
				<el-scrollbar v-if="search.total>0">
					<div class="pagination">
						<div class="flex mr-4" v-if="selection">
							<el-button type="success" @click="toggleSelection(tableData)">全选</el-button>
							<el-button type="info" @click="toggleSelection()">取消</el-button>
							<template v-if="footer">
								<template v-for="(group, _index) in footer.extra.group" :index="_index">
									<permissions :name="group.extra.path">
										<component :is="`el-${group.extra.component.name}`"
											v-bind="group.extra.component.props" @click="handleFooter(group)">
											{{ group.label }}
										</component>
									</permissions>
								</template>
							</template>
						</div>
						<el-pagination background :page-sizes="[10, 20, 50, 100, 200]"
							layout="total,sizes,prev, pager, next,jumper" :total="search.total"
							v-model:page-size="search.limit" v-model:current-page="search.page">
						</el-pagination>
					</div>
				</el-scrollbar>
			</div>
		</template>
	</el-skeleton>
</template>

<style lang="scss">
.table-layouts {
	min-height: 200px;
}

.pagination {
	padding: 10px 0;
	display: flex;
	align-items: center;

	.el-pagination {
		flex: 1;
	}

	.el-pagination__total {
		flex: 1;
	}
}

.table-screen {
	display: grid;
	grid-template-columns: repeat(24, 1fr);
	grid-template-rows: auto;
	align-content: start;
	grid-gap: 10px;

	.el-form-item,
	.el-skeleton__item {
		grid-column: span 2 / span 2;
	}

	.el-skeleton__item {
		height: 40px;
	}
}

@media screen and (max-width: 2560px) {
	.table-screen {

		.el-form-item,
		.el-skeleton__item {
			grid-column: span 4 / span 4;
		}
	}
}

@media screen and (max-width: 1920px) {
	.table-screen {

		.el-form-item,
		.el-skeleton__item {
			grid-column: span 6 / span 6;
		}
	}
}

@media screen and (max-width: 1400px) {
	.table-screen {

		.el-form-item,
		.el-skeleton__item {
			grid-column: span 8 / span 8;
		}
	}
}

@media screen and (max-width: 1100px) {
	.table-screen {

		.el-form-item,
		.el-skeleton__item {
			grid-column: span 12 / span 12;
		}
	}
}

@media screen and (max-width: 850px) {
	.table-screen {

		.el-form-item,
		.el-skeleton__item {
			grid-column: span 24 / span 24;
		}
	}
}
</style>
