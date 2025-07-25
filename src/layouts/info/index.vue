<script setup lang="ts">
import { $http } from '@/common';
import router from '@/routers';
import ruleComponent from './component/rule.vue'
import inlineRuleComponent from './component/inline-rule.vue'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = withDefaults(defineProps<{
	params?: any
	showDialogSubmit?: boolean
}>(), {
});
const emit = defineEmits(['confirm', 'cannel', 'loading']);
const loading = ref(true);
const currentRoute = router.currentRoute.value;
const infoData = ref<any>({})
const formProps = ref<any>({
	labelWidth: '200px',
	labelPosition: 'top',
	class: 'py-10'
})
const rule = ref<any>()
const showForm = ref(false);
const basicFormName = ref('');
const selectedGroup = ref('');
const tabs = ref<any>([]);
const group = ref<any>([]);
let ApiUrl = currentRoute.meta.api as string;
if (props.params) {
	ApiUrl = props.params.api;
}
const resFail = ref();
onBeforeMount(() => {
	$http.get(ApiUrl, {
		params: {
			...currentRoute.query,
			...props.params?.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			rule.value = res.data.rule;
			infoData.value = res.data.data;
			formProps.value = {
				...formProps.value,
				...res.data.props
			}
			basicFormName.value = res.data.name;
			selectedGroup.value = res.data.name;
			group.value = res.data.group;
			if (res.data.group.length > 0) {
				tabs.value.push({ name: res.data.name, title: res.data.title });
				for (let i = 0; i < res.data.group.length; i++) {
					const element = res.data.group[i];
					tabs.value.push({ name: element.name, title: element.title });
				}
			}
			nextTick(() => {
				showForm.value = true;
			})
		} else {
			resFail.value = res;
		}
	}).finally(() => {
		loading.value = false;
	})
})
const emitConfirm = () => {
	emit('confirm');
}
const emitCannel = () => {
	emit('cannel');
}
defineExpose({
	emitConfirm,
	emitCannel
})
</script>

<template>
	<main class="layouts flex flex-center layouts-empty flex-1" v-if="resFail">
		<el-empty>
			<template #description>
				<div class="flex flex-column">
					<span>{{ resFail.msg }}</span>
					<xl-code lang="json" height="400px" v-if="resFail.data&&resFail.data.length>0">{{ resFail.data }}</xl-code>
				</div>
			</template>
			<el-button type="primary" @click="router.go(-1)">上一页</el-button>
			<el-button type="default" @click="router.push('/')">返回首页</el-button>
		</el-empty>
	</main>
	<el-skeleton :loading="loading" animated v-else>
		<template #template>
			<div class="layouts">
				<div class="grid grid-gap-4 mb-4" v-for="item in 10" :index="item">
					<el-skeleton-item style="height: 30px;" class="grid-column-4" />
					<el-skeleton-item style="height: 30px;" class="grid-column-20" />
				</div>
				<div class="flex flex-center">
					<el-skeleton-item variant="button" class="mr-4" />
					<el-skeleton-item variant="button" class="ml-4" />
				</div>
			</div>
		</template>
		<template #default>
			<div class="flex submit-item flex-center mb-6" v-if="currentRoute.query.back">
				<el-button bg text @click="router.push(currentRoute.query.back as string)"
					:disabled="loading" size="large">
					返回
				</el-button>
				<div class="flex-1">
					<div class="flex flex-wrap bg-white rounded-top-4 flex-center" v-if="tabs.length > 0">
						<div class="font-weight-600 p-4 pointer rounded-4 text-nowrap"
							:class="{ 'text-success bg': selectedGroup === tab.name }" @click="selectedGroup = tab.name"
							v-for="tab in tabs">{{ tab.title }}</div>
					</div>
				</div>
			</div>
			<div class="flex flex-wrap bg-white rounded-top-4 p-6 flex-center" v-else-if="tabs.length > 0">
				<div class="font-weight-600 p-4 pointer rounded-4 text-nowrap"
					:class="{ 'text-success bg': selectedGroup === tab.name }" @click="selectedGroup = tab.name"
					v-for="tab in tabs">{{ tab.title }}</div>
			</div>
			<el-scrollbar>
				<el-form ref="formRef" v-if="showForm" class="layouts" v-bind="formProps">
					<template v-if="formProps.inline">
						<template v-if="selectedGroup === basicFormName">
							<inlineRuleComponent v-model="infoData" :rule="rule" />
						</template>
						<template v-if="group.length > 0">
							<template v-for="(item, _index) in group" :index="_index">
								<div v-show="selectedGroup === item.name">
									<inlineRuleComponent v-model="infoData[item.name]" :rule="item.rule"
										:group="item.name" />
								</div>
							</template>
						</template>
					</template>
					<template v-else>
						<template v-if="selectedGroup === basicFormName">
							<ruleComponent v-model="infoData" :rule="rule" />
						</template>
						<template v-if="group.length > 0">
							<template v-for="(item, _index) in group" :index="_index">
								<div v-show="selectedGroup === item.name">
									<ruleComponent v-model="infoData[item.name]" :rule="item.rule" :group="item.name" />
								</div>
							</template>
						</template>
					</template>
				</el-form>
			</el-scrollbar>
			<div class="flex submit-item pt-10" v-if="showDialogSubmit">
				<el-button bg text @click="emitCannel" size="large" :disabled="loading">
					{{ t('button.cancelText') }}
				</el-button>
				<div class="flex-1"></div>
			</div>
		</template>
	</el-skeleton>
</template>
<style lang="scss" scoped>
.submit-item {
	position: sticky;
	bottom: 0;
	background-color: var(--el-bg-color);
	z-index: 1000;

	:deep(.el-button.el-button--large) {
		padding: 12px 60px;
	}
}

.el-form.layouts {
	padding-top: 30px;
}
</style>