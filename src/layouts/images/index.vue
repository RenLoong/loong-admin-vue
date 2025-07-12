<script setup lang="ts">
import { $http } from '@/common';
import { getTableValue, hasWhere, parseRules } from '@/common/functions';
import router from '@/routers';
import { useClick } from '@/common/functions/action';
import ruleComponent from '@/layouts/form/component/rule.vue'
import inlineRuleComponent from '@/layouts/form/component/inline-rule.vue'
import { ElForm, ElMessage } from 'element-plus';
import type { CheckboxValueType } from 'element-plus'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = withDefaults(defineProps<{
	params?: any
}>(), {
});
const emit = defineEmits(['confirm', 'cannel', 'loading']);
const formRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(true);
const currentRoute = router.currentRoute.value;
const action = ref<any>();
const footer = ref<any>();
const header = ref<any>();
const gridProps = ref<any>({});
const rule = ref<RuleInterface[]>([]);
const rules = ref<any>()
const screen = ref<any>();
const showScreen = ref(false);
const selection = ref(false);
let ApiUrl = currentRoute.meta.api;
if (props.params) {
	ApiUrl = props.params.api;
}
const resFail = ref();
onBeforeMount(() => {
	if (!['tableComponent', 'imagesComponent'].includes(currentRoute.meta.component as string)) {
		return;
	}
	$http.get(`${ApiUrl}GetGrid`, {
		params: {
			...props.params?.query,
			...currentRoute.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			gridProps.value = res.data.props;
			selection.value = res.data.selection;
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
const imagesData = ref<any>();
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
	limit: 18,
});
const listLoading = ref(false);
const getList = () => {
	if (listLoading.value) return;
	listLoading.value = true;
	imagesData.value = [];
	$http.get(ApiUrl as string, {
		params: search.value
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			imagesData.value = res.data.data;
			search.value.total = res.data.total;
		}
	}).finally(() => {
		handleCheckAllChange(false);
		listLoading.value = false;
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
	}).catch((val: any) => {
		if (val === 'close') {
			emit('cannel');
		}
	})
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
const checkAll = ref(false)
const isIndeterminate = ref(false)
const multipleSelection = ref<any[]>([])
const handleCheckAllChange = (val: CheckboxValueType) => {
	multipleSelection.value = val ? imagesData.value : []
	isIndeterminate.value = false;
	handleCheckedCitiesChange(multipleSelection.value);
}
const handleCheckedCitiesChange = (value: CheckboxValueType[]) => {
	const checkedCount = value.length
	checkAll.value = checkedCount === imagesData.value.length
	isIndeterminate.value = checkedCount > 0 && checkedCount < imagesData.value.length
}
const srcList = computed(() => {
	return imagesData.value.map((item: any) => getTableValue(item, gridProps.value.image));
})
const download = (item: any) => {
	const url = getTableValue(item, gridProps.value.image)
	// https://picsum.photos/1920/1080/filename.png?random=123
	const pattern = new URL(url)
	const filename = pattern.pathname.split('/').pop()

	fetch(url)
		.then((response) => response.blob())
		.then((blob) => {
			const blobUrl = URL.createObjectURL(new Blob([blob]))
			const link = document.createElement('a')
			link.href = blobUrl
			link.download = filename || 'download.png'
			document.body.appendChild(link)
			link.click()
			URL.revokeObjectURL(blobUrl)
			link.remove()
		})
}
</script>

<template>
	<main class="layouts flex flex-center layouts-empty flex-1" v-if="resFail">
		<el-empty>
			<template #description>
				<div class="flex flex-column">
					<span>{{ resFail.msg }}</span>
					<xl-code lang="json" height="400px">{{ resFail.data }}</xl-code>
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
						</el-form-item>
					</el-form>
					<el-scrollbar class="flex-1">
						<el-checkbox-group class="images-list" v-model="multipleSelection"
							@change="handleCheckedCitiesChange" v-if="imagesData.length > 0">
							<div class="image-item" v-for="(item, index) in imagesData" :key="index" v-bind="gridProps"
								:class="{ 'image-selection': selection }">
								<el-image :src="getTableValue(item, gridProps.image)" alt="" fit="cover"
									class="image-item-img" :preview-src-list="srcList" :initial-index="index"
									show-progress>
									<template #toolbar="{ actions, prev, next, reset, setActiveItem }">
										<el-icon @click="prev">
											<Back />
										</el-icon>
										<el-icon @click="next">
											<Right />
										</el-icon>
										<el-icon @click="setActiveItem(srcList.length - 1)">
											<DArrowRight />
										</el-icon>
										<el-icon @click="actions('zoomOut')">
											<ZoomOut />
										</el-icon>
										<el-icon @click="actions('zoomIn', { enableTransition: false, zoomRate: 2 })">
											<ZoomIn />
										</el-icon>
										<el-icon @click="
											actions('clockwise', { rotateDeg: 180, enableTransition: false })
											">
											<RefreshRight />
										</el-icon>
										<el-icon @click="actions('anticlockwise')">
											<RefreshLeft />
										</el-icon>
										<el-icon @click="reset">
											<Refresh />
										</el-icon>
										<el-icon @click="download(item)">
											<Download />
										</el-icon>
										<template v-for="(group, _index) in action" :index="_index">
											<permissions :name="group.extra.path">
												<component :is="`el-${group.extra.component.name}`"
													v-bind="group.extra.component.props"
													v-if="hasWhere(group.extra, item)"
													@click.stop="handleAction(group, item)">
													{{ group.label }}
												</component>
											</permissions>
										</template>
									</template>
								</el-image>
								<div class="image-item-mask" @click.stop>
									<div class="flex flex-column p-4 flex-1">
										<template v-if="selection">
											<el-checkbox :key="item.id" :label="getTableValue(item, gridProps.title)"
												:value="item" style="--el-checkbox-text-color:#FFFFFF"
												size="large"></el-checkbox>
											<el-text style="--el-text-color:#FFFFFF">{{ getTableValue(item,
												gridProps.info) }}</el-text>
										</template>
										<template v-else>
											<el-text style="--el-text-color:#FFFFFF">{{ getTableValue(item,
												gridProps.title) }}</el-text>
											<el-text style="--el-text-color:#FFFFFF">{{ getTableValue(item,
												gridProps.info) }}</el-text>
										</template>
										<div class="flex-1"></div>
										<div class="btn-group flex-x-flex-end">
											<template v-for="(group, _index) in action" :index="_index">
												<permissions :name="group.extra.path">
													<component :is="`el-${group.extra.component.name}`"
														v-bind="group.extra.component.props"
														v-if="hasWhere(group.extra, item)"
														@click.stop="handleAction(group, item)">
														{{ group.label }}
													</component>
												</permissions>
											</template>
										</div>
									</div>
								</div>
							</div>
						</el-checkbox-group>
						<el-empty v-else description="暂无数据" />
					</el-scrollbar>
					<div v-if="search.total > 0" class="overflow-x-auto flex-shrink-0">
						<div class="pagination">
							<div class="flex mr-4 grid-gap-4 flex-center" v-if="selection">
								<el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" size="large"
									@change="handleCheckAllChange">
									{{ t('button.allSelectText') }}
								</el-checkbox>
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
							<el-pagination background :page-sizes="[18, 18 * 2, 18 * 3, 18 * 4]"
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

<style lang="scss" scoped>
.images-list {
	display: grid;
	-ms-grid-columns: repeat(24, 1fr);
	grid-template-columns: repeat(24, 1fr);
	gap: 20px;
	padding: 20px;
	grid-template-rows: auto;
	align-content: start;
	--image-item-height: 260px;

	.image-item {
		grid-column: span 4 / span 4;
		position: relative;
		cursor: pointer;
		overflow: hidden;
		border-radius: 10px;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
		height: var(--image-item-height);

		.image-item-img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.image-item-mask {
			cursor: auto;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 0%;
			background-color: rgba(0, 0, 0, 0.5);
			color: #fff;
			box-sizing: border-box;
			overflow: hidden;
			transition: height 0.3s ease-in-out;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			backdrop-filter: blur(10px);
			border-radius: 10px;
			:deep(.el-checkbox .el-checkbox__label){
				overflow: hidden;
			}
		}

		&.image-selection {
			.image-item-mask {
				height: 52px;
			}
		}


		&:hover {
			.image-item-mask {
				height: 50%;
			}
		}

		.btn-group {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;

			.el-button+.el-button {
				margin: 0;
			}
		}
	}
}

@media screen and (max-width: 1920px) {
	.images-list {
		.image-item {
			grid-column: span 6 / span 6;
		}
	}
}

@media screen and (max-width: 1440px) {
	.images-list {
		.image-item {
			grid-column: span 12 / span 12;
		}
	}
}

@media screen and (max-width: 1140px) {
	.images-list {
		.image-item {
			grid-column: span 12 / span 12;
		}
	}
}

@media screen and (max-width: 960px) {
	.images-list {
		.image-item {
			grid-column: span 24 / span 24;
		}
	}
}
</style>
