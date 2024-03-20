<script setup lang="ts">
import { $http } from '@/common';
import router from '@/routers';
import { useClick } from '@/common/functions/action';
import { hasWhere } from '@/common/functions';

const props = withDefaults(defineProps<{
	params?: any
}>(), {
});
const loading = ref(true);
const showMore = ref(false);
const appsProps = ref<any>();
const action = ref<any>([]);
const currentRoute = router.currentRoute.value;
let ApiUrl = currentRoute.meta.api;
if (props.params) {
	ApiUrl = props.params.api;
}
onBeforeMount(() => {
	$http.get(`${ApiUrl}GetTable`, {
		params: {
			...currentRoute.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			action.value = res.data.action;
			appsProps.value = res.data.props;
			nextTick(() => {
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
watch(() => search.value.page, () => {
	getList()
})
watch(() => search.value.limit, () => {
	getList()
})
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
			<div class="apps-layouts layouts">
				<div class="flex flex-column search-form flex-center">
					<el-input v-model="search.keyword" size="large" placeholder="搜索应用名称、标识" class="search-input">
						<template #suffix>
							<el-icon color="var(--el-input-border-color)" size="20">
								<Search />
							</el-icon>
						</template>
					</el-input>
					<div class="flex flex-wrap w-50 grid-gap-4 mt-6">
						<el-tag type="success" effect="light" small round>推荐：</el-tag>
						<el-tag type="info" effect="light" small round>APps</el-tag>
					</div>
				</div>
				<div class="flex mb-6">
					<div class="flex-1 font-weight-600 h8">{{ currentRoute.meta.title }}</div>
					<div class="flex grid-gap-4 sort">
						<div class="item active">推荐</div>
						<div class="item">最热</div>
						<div class="item">最新</div>
					</div>
				</div>
				<div class="flex mb-6">
					<div class="flex-1 flex grid-gap-4 classify flex-wrap" :class="{ 'show-more': showMore }">
						<div class="item active">全部</div>
						<div class="item">分类</div>
					</div>
					<el-icon color="var(--el-color-primary)" class="more" v-if="showMore" @click="showMore = false">
						<SemiSelect />
					</el-icon>
					<el-icon color="var(--el-color-primary)" class="more" v-else @click="showMore = true">
						<MoreFilled />
					</el-icon>
				</div>
				<div class="apps-list mb-4">
					<div class="apps-item flex flex-column" v-for="(item, index) in tableData" :index="index"
						@click="handleAction(appsProps?.details, item)">
						<div class="p-2">
							<el-image :src="item.icon" class="apps-icon"></el-image>
						</div>
						<div class="p-4">
							<div class="font-weight-600 pointer apps-title text-ellipsis-2 text-break-all">
								{{ item.title }}</div>
							<div class="flex pt-4 flex-wrap">
								<el-button icon="View" link>{{ item.view }}</el-button>
								<el-button icon="Download" link>{{ item.use_num }}</el-button>
								<div class="flex-1"></div>
								<template v-for="group in action">
									<permissions :name="group.extra.path">
										<component :is="`el-${group.extra.component.name}`"
											v-bind="group.extra.component.props" v-if="hasWhere(group.extra, item)"
											@click.stop="handleAction(group, item)">
											{{ group.label }}
										</component>
									</permissions>
								</template>
							</div>
						</div>
					</div>
				</div>
				<div class="flex flex-center" v-if="search.total > 0">
					<el-pagination background center :page-sizes="[10, 20, 50, 100, 200]"
						layout="total,sizes,prev, pager, next,jumper" :total="search.total"
						v-model:page-size="search.limit" v-model:current-page="search.page">
					</el-pagination>
				</div>
			</div>
		</template>
	</el-skeleton>
</template>

<style lang="scss">
.apps-layouts {
	--layouts-width: 1300px;
	background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUwIiBoZWlnaHQ9IjI3MCIgdmlld0JveD0iMCAwIDQ1MCAyNzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF80MzUzXzk2OTYzKSI+CjxtYXNrIGlkPSJtYXNrMF80MzUzXzk2OTYzIiBzdHlsZT0ibWFzay10eXBlOmFscGhhIiBtYXNrVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDUwIiBoZWlnaHQ9IjQ5OCI+CjxyZWN0IHdpZHRoPSI0NTAiIGhlaWdodD0iNDk4IiBmaWxsPSJ3aGl0ZSIvPgo8L21hc2s+CjxnIG1hc2s9InVybCgjbWFzazBfNDM1M185Njk2MykiPgo8ZyBvcGFjaXR5PSIwLjUiIGZpbHRlcj0idXJsKCNmaWx0ZXIwX2ZfNDM1M185Njk2MykiPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1NC4yNzIgMTQuNTU1M0MxNzMuNjUgMTMuNDAwNSAxOTUuNjQ2IDEyLjUwNSAyMDguMDU3IDI4LjY1MzRDMjIwLjY0MiA0NS4wMjggMjE2LjkyNSA2OC43Mjg2IDIxMS42ODggODkuMjU5OUMyMDYuODExIDEwOC4zODIgMTk3LjAxNSAxMjUuNDc5IDE4MC45MzMgMTM0Ljk5NkMxNjMuNzA5IDE0NS4xODggMTQzLjAwNyAxNDkuMzU2IDEyNS4xODYgMTQwLjQ0N0MxMDcuMDY2IDEzMS4zODkgOTUuNDYzNyAxMTEuNzQgOTEuODk3NSA5MC40ODQ5Qzg4LjUyMTUgNzAuMzYzOSA5NC44OCA0OS45MzI3IDEwNy40MzUgMzQuNjQ5N0MxMTkuMTc1IDIwLjM1OCAxMzYuNjMgMTUuNjA2NyAxNTQuMjcyIDE0LjU1NTNaIiBmaWxsPSIjMkRDQkE1Ii8+CjwvZz4KPGcgb3BhY2l0eT0iMC41IiBmaWx0ZXI9InVybCgjZmlsdGVyMV9mXzQzNTNfOTY5NjMpIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yNTIuMTE5IDIxLjAwMDNDMjcxLjkyNyAyMC45MTI1IDI4NC41MDUgNDEuOTkwMiAyOTYuMTk0IDU5LjM1NDhDMzA3LjAyOSA3NS40NTExIDMxNi4zODcgOTMuMDgwNyAzMTMuOTQxIDExMi44NEMzMTEuMTk5IDEzNC45OCAzMDEuNjQ4IDE1Ny43MjUgMjgyLjg4MSAxNjYuODc4QzI2NC41MDEgMTc1Ljg0MSAyNDQuMDQxIDE2Ni4wOCAyMjYuMzg1IDE1NS41NDFDMjEwLjIwNCAxNDUuODgyIDE5NS40MjEgMTMyLjEyOSAxOTEuNzUxIDExMi40OEMxODguMTcgOTMuMzA3OCAxOTcuOTk5IDc1LjY0NTEgMjA4LjQ5MiA1OS43NDMzQzIyMC4wMDQgNDIuMjk4MSAyMzIuMzU0IDIxLjA4NzggMjUyLjExOSAyMS4wMDAzWiIgZmlsbD0iIzQ5QjJGRiIvPgo8L2c+CjwvZz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9mXzQzNTNfOTY5NjMiIHg9Ii0zNyIgeT0iLTExNCIgd2lkdGg9IjM4MS41NTYiIGhlaWdodD0iMzg3LjMyNSIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJzaGFwZSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI2NCIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzQzNTNfOTY5NjMiLz4KPC9maWx0ZXI+CjxmaWx0ZXIgaWQ9ImZpbHRlcjFfZl80MzUzXzk2OTYzIiB4PSI2MyIgeT0iLTEwNyIgd2lkdGg9IjM3OS4zMzMiIGhlaWdodD0iNDA1LjM5OCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJzaGFwZSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI2NCIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzQzNTNfOTY5NjMiLz4KPC9maWx0ZXI+CjxjbGlwUGF0aCBpZD0iY2xpcDBfNDM1M185Njk2MyI+CjxyZWN0IHdpZHRoPSI0NTAiIGhlaWdodD0iMjcwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=);
	background-repeat: no-repeat;
	background-position: center top;

	.search-form {
		padding: 50px 0;

		.search-input {
			width: 50%;
			min-width: 300px;
			--el-input-border: 2px solid var(--el-color-primary);
			--el-input-hover-border: var(--el-color-primary);
			--el-input-hover-border-color: var(--el-color-primary);
			--el-input-border-color: var(--el-color-primary);
			--el-input-border-radius: 6px;

			.el-input__wrapper {
				box-shadow: 0 0 0 2px var(--el-input-border-color, var(--el-border-color)) inset
			}
		}

	}

	.sort {
		padding: 4px;
		border-radius: 999px;
		font-size: 12px;
		background-color: var(--el-bg-color-page);
		color: var(--el-text-color-secondary);

		.item {
			padding: 4px 12px;
			cursor: pointer;
			border-radius: 999px;
		}

		.item.active {
			color: var(--el-text-color-primary);
			background-color: var(--el-bg-color);
		}
	}

	.classify {
		padding: 4px;
		color: var(--el-text-color-primary);
		overflow: hidden;
		max-height: 38px;

		&.show-more {
			max-height: fit-content;
		}

		.item {
			padding: 4px 18px;
			cursor: pointer;
			border-radius: 999px;

			&:hover {
				background-color: var(--el-bg-color-page);
			}
		}

		.item.active {
			color: var(--el-bg-color);
			background-color: var(--el-text-color-primary);
		}
	}

	.more {
		width: auto;
		height: 35px;
		line-height: 35px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 20px;
	}

	.apps-list {
		display: grid;
		--column: 5;
		grid-template-columns: repeat(var(--column), 1fr);
		grid-gap: 20px;

		.apps-item {
			border-radius: 8px;
			transition: all 0.3s;
			box-shadow: var(--el-box-shadow-lighter);
			cursor: pointer;

			&:hover {
				box-shadow: var(--el-box-shadow);
			}

			.apps-icon {
				width: 100%;
				height: calc(var(--layouts-width) / var(--column) - 32px);
				border-radius: 8px;
				overflow: hidden;
			}

			.apps-title {
				height: 40px;
				line-height: 20px;
			}

			.use-btn {
				--el-button-size: 20px;
				height: var(--el-button-size);
				padding: 5px 6px;
				font-size: 12px;
			}
		}
	}
}

@media screen and (max-width: 1000px) {
	.apps-layouts {
		--layouts-width: 1000px;

		.apps-list {
			--column: 3;
		}
	}
}

@media screen and (max-width: 700px) {
	.apps-layouts {
		--layouts-width: 700px;

		.apps-list {
			--column: 2;
		}
	}
}

@media screen and (max-width: 500px) {
	.apps-layouts {
		--layouts-width: 500px;

		.apps-list {
			--column: 1;
		}
	}
}
</style>
