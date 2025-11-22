<script setup lang="ts">
import { $http } from '@/common';
import { parseRules } from '@/common/functions';
import router from '@/routers';
import { useClick } from '@/common/functions/action';
import ruleComponent from '@/layouts/form/component/rule.vue'
import inlineRuleComponent from '@/layouts/form/component/inline-rule.vue'
import columnComponent from './component/column.vue'
import columnExpand from "./component/column-expand.vue";
import { ElForm, ElMessage, ElTable } from 'element-plus';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const emit = defineEmits(['confirm', 'cannel', 'loading']);
const props = withDefaults(defineProps<{
	params?: any
	title?: string
	showDialogSubmit?: boolean
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
const screen = ref<any>();
const showScreen = ref(false);
const selection = ref(false);
let ApiUrl = currentRoute.meta.api;
if (props.params) {
	ApiUrl = props.params.api;
}
const pageTitle = ref(currentRoute.meta.title);
if (props.title) {
	pageTitle.value = props.title;
}
const resFail = ref();
onBeforeMount(() => {
	if (!['tableComponent', 'imagesComponent'].includes(currentRoute.meta.component as string)) {
		return;
	}
	$http.get(`${ApiUrl}GetTable`, {
		params: {
			...props.params?.query,
			...currentRoute.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			tableProps.value = res.data.props;
			if (res.data.props.api) {
				tableProps.value.load = load;
			}
			selection.value = res.data.selection;
			columns.value = res.data.columns;
			action.value = res.data.action;
			header.value = res.data.header;
			footer.value = res.data.footer;
			screen.value = res.data.screen;
			if (res.data.screen) {
				showScreen.value = true;
				for (const key in res.data.screen.form) {
					if (Object.prototype.hasOwnProperty.call(res.data.screen.form, key)) {
						const element = res.data.screen.form[key];
						search.value[key] = element;
					}
				}
				rule.value = res.data.screen.rule;
				parseRules(rules, rule.value, undefined, search);
			}
			nextTick(() => {
				showTable.value = true;
				loading.value = false;
				getList();
			})
		} else {
			resFail.value = res;
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
	...props.params?.query,
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
watch(() => search.value.page, () => {
	getList()
})
watch(() => search.value.limit, () => {
	getList()
})
const onSubmit = () => {
	search.value.page = 1;
	getList();
}
const updateTableDataValue = (scope: any, value: any) => {
	tableData.value[scope.$index][scope.column.property] = value;
}
const handleFooter = (group: any) => {
	if (!group.extra) return;
	if (multipleSelection.value.length <= 0) {
		return ElMessage.warning(t('table.selectTips'));
	}
	let query = {
		...group.extra.params
	};
	if (group.extra.field) {
		for (let key in group.extra.field) {
			query[group.extra.field[key]] = multipleSelection.value.map((item: any) => item[key]);
		}
	} else {
		query.ids = multipleSelection.value.map((item: any) => item.id);
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
	}).catch((val: any) => {
		if (val === 'close') {
			emit('cannel');
		}
	})
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
	}).catch((val: any) => {
		if (val === 'close') {
			emit('cannel');
		}
	})
}
const resetForm = () => {
	formRef.value?.resetFields();
	onSubmit();
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
	<main class="layouts flex flex-center layouts-empty flex-1" v-if="resFail">
		<el-empty>
			<template #description>
				<div class="flex flex-column">
					<span>{{ resFail.msg }}</span>
					<xl-code lang="json" height="400px" v-if="resFail.data && resFail.data.length > 0">{{ resFail.data
					}}</xl-code>
				</div>
			</template>
			<el-button type="primary" @click="router.go(-1)">上一页</el-button>
			<el-button type="default" @click="router.push('/')">返回首页</el-button>
		</el-empty>
	</main>
	<template v-else-if="['tableComponent', 'imagesComponent'].includes(currentRoute.meta.component as string)">
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
				<div class="flex flex-center mb-6" v-if="header && !props.showDialogSubmit">
					<el-button bg text @click="router.push(currentRoute.query.back as string)" size="large"
						v-if="currentRoute.query.back">
						返回
					</el-button>
					<div class="font-weight-600">{{ pageTitle }}</div>
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
				<div class="flex submit-item flex-center" v-else-if="currentRoute.query.back">
					<el-button bg text @click="router.push(currentRoute.query.back as string)" :disabled="loading"
						size="large">
						返回
					</el-button>
					<div class="flex-1">
					</div>
				</div>
				<div class="table-layouts">
					<el-form ref="formRef" :model="search" :rules="rules" label-width="80px" v-if="showScreen"
						v-bind="screen.props" :disabled="listLoading" class="py-6">
						<template v-if="screen.props.inline">
							<inlineRuleComponent v-model="search" :rule="rule" />
						</template>
						<template v-else>
							<ruleComponent v-model="search" :rule="rule" />
						</template>
						<el-form-item class="submit-item">
							<el-button type="primary" @click="onSubmit" :loading="listLoading">{{ t('button.queryText')
							}}</el-button>
							<el-button @click="resetForm">{{ t('button.resetText') }}</el-button>
							<template v-for="(group, _index) in header.extra.group" :index="_index"
								v-if="header && props.showDialogSubmit">
								<permissions :name="group.extra.path">
									<component :is="`el-${group.extra.component.name}`"
										v-bind="group.extra.component.props" @click="handleHeader(group)">
										{{ group.label }}
									</component>
								</permissions>
							</template>
						</el-form-item>
					</el-form>
					<el-table ref="tableRef" :data="tableData" v-if="showTable" v-bind="tableProps" class="flex-1"
						@selection-change="handleSelectionChange">
						<template v-for="(column, _index) in columns" :index="_index">
							<el-table-column v-if="column.extra?.props?.type === 'expand'" v-bind="column.extra.props">
								<template #default="scope">
									<column-expand :components="column.extra?.components" :row="scope.row"
										:prop="column.prop"></column-expand>
								</template>
							</el-table-column>
							<columnComponent v-else :column="column" :tableData="tableData"
								@change="updateTableDataValue" />
						</template>
						<el-table-column v-if="action" :label="action.label" v-bind="action.extra.props">
							<template #default="scope">
								<div class="table-group">
									<xl-table-action :action="action.extra.group" :item="scope.row" @success="getList"
										@cannel="emit('cannel')" />
								</div>
							</template>
						</el-table-column>
					</el-table>
					<div v-if="search.total > 0" class="overflow-x-auto flex-shrink-0">
						<div class="pagination">
							<div class="flex mr-4" v-if="selection">
								<el-button type="success" @click="toggleSelection(tableData)">{{
									t('button.allSelectText') }}</el-button>
								<el-button type="info" @click="toggleSelection()">{{ t('button.cancelText')
								}}</el-button>
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
					</div>
				</div>
			</template>
		</el-skeleton>
	</template>
	<template v-else>
		<RouterView />
	</template>
</template>

<style lang="scss">
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

.table-group {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;

	.el-button+.el-button {
		margin: 0;
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
