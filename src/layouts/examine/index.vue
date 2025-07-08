<script setup lang="ts">
import { $http } from '@/common';
import router from '@/routers';
import { ElMessage } from 'element-plus'
import examineData from '@/layouts/examine/component/examine-data.vue'
import ruleComponent from '@/layouts/form/component/rule.vue'
import inlineRuleComponent from '@/layouts/form/component/inline-rule.vue'
import type { FormInstance } from 'element-plus'
import { parseRules } from '@/common/functions';
import SubmitEvent from '@/common/enum/SubmitEvent';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = withDefaults(defineProps<{
	params?: any
	showSubmitItem?: boolean
	showDialogSubmit?: boolean
}>(), {
	showSubmitItem: true,
	showDialogSubmit: false
});
const emit = defineEmits(['confirm', 'cannel', 'loading']);
const formRef = ref<FormInstance>();
const loading = ref(true);
const currentRoute = router.currentRoute.value;
const rule = ref<RuleInterface[]>([]);
const examineRule = ref<RuleInterface[]>([]);
const examineProps = ref<any>({});
const examineOldData = ref<any>({});
const examineNewData = ref<any>({});
const examineValue=ref('');
const form = ref<any>({})
const formProps = ref<any>({
	labelWidth: '200px',
	labelPosition: 'top',
	class: 'p-6'
})
const rules = ref<any>()
const showForm = ref(false);
let ApiUrl = currentRoute.meta.api as string;
if (props.params) {
	ApiUrl = props.params.api;
}
const submitEvent = ref<string>();
const resFail = ref();
const showSubmitItem = ref(props.showSubmitItem);
if (currentRoute.query.back) {
	showSubmitItem.value = false;
}
onBeforeMount(() => {
	$http.get(ApiUrl, {
		params: {
			...currentRoute.query,
			...props.params?.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			examineProps.value = res.data.props;
			examineRule.value = res.data.rule;
			examineOldData.value = res.data.old;
			examineNewData.value = res.data.new;
			rule.value = res.data.form.rule;
			form.value = res.data.form.form;
			formProps.value = {
				...formProps.value,
				...res.data.form.props
			}
			parseRules(rules, rule.value, undefined, form);
			if (res.data.form.url) {
				ApiUrl = res.data.form.url;
			}
			if (res.data.form.props.submitEvent) {
				submitEvent.value = res.data.form.props.submitEvent;
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
const submitLoading = ref(false)
watchEffect(() => {
	emit('loading', loading.value || submitLoading.value)
})
const onSubmit = () => {
	if (!formRef.value) return;
	formRef.value.validate((valid, fields) => {
		if (valid) {
			submitLoading.value = true;
			$http.post(ApiUrl, {
				...props.params?.query,
				...props.params?.params,
				...form.value,
			}).then((res: any) => {
				if (res.code === $http.ResponseCode.SUCCESS) {
					ElMessage.success(res.msg);
					emit('confirm');
					if (currentRoute.query.back) {
						router.push(currentRoute.query.back as string);
					} else {
						switch (submitEvent.value) {
							case SubmitEvent.SILENT:
								break;
							default:
								resetForm();
								break;
						}
					}
				} else {
					ElMessage.info(res.msg);
				}
			}).finally(() => {
				submitLoading.value = false;
			})
		} else {
			for (const key in fields) {
				if (Object.prototype.hasOwnProperty.call(fields, key)) {
					const element = fields[key];
					element.forEach((item: any) => {
						ElMessage.warning(item.message);
					});
				}
			}
		}
	})
}
const resetForm = () => {
	formRef.value?.resetFields();
}
const emitConfirm = () => {
	emit('confirm');
}
const emitCannel = () => {
	emit('cannel');
}
const examineOldRef=ref();
const examineNewRef=ref();
const scroll = (e:any) => {
	console.log(e);
	examineOldRef.value?.setScrollTop(e.scrollTop);
	examineNewRef.value?.setScrollTop(e.scrollTop);
}
defineExpose({
	onSubmit,
	resetForm,
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
					<xl-code lang="json" height="400px">{{ resFail.data }}</xl-code>
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
					:disabled="loading || submitLoading" size="large">
					返回
				</el-button>
				<div class="flex-1"></div>
				<el-button @click="resetForm" v-if="rules" :disabled="loading || submitLoading" size="large">
					<template v-if="formProps.resetButtonText">{{ formProps.resetButtonText }}</template>
					<template v-else>{{ t('button.resetText') }}</template>
				</el-button>
				<el-button type="primary" @click="onSubmit" :loading="loading || submitLoading" size="large">
					<template v-if="formProps.submitButtonText">{{ formProps.submitButtonText }}</template>
					<template v-else>{{ t('button.confirmText') }}</template>
				</el-button>
			</div>
			<el-splitter class="flex h-auto overflow-hidden">
				<el-splitter-panel class="flex flex-column grid-gap-4 overflow-hidden">
					<div class="flex flex-center">
						<el-text v-bind="examineProps.old">{{ examineProps.old?.label??'原始数据' }}</el-text>
					</div>
					<el-scrollbar ref="examineOldRef" @scroll="scroll" class="flex-1">
						<examine-data :rule="examineRule" v-model="examineValue" :data="examineOldData"></examine-data>
					</el-scrollbar>
				</el-splitter-panel>
				<el-splitter-panel class="flex flex-column grid-gap-4 overflow-hidden">
					<div class="flex flex-center">
						<el-text v-bind="examineProps.new">{{ examineProps.new?.label??'新数据' }}</el-text>
					</div>
					<el-scrollbar ref="examineNewRef" @scroll="scroll" class="flex-1">
						<examine-data :rule="examineRule" v-model="examineValue" :data="examineNewData" :data1="examineOldData"></examine-data>
					</el-scrollbar>
				</el-splitter-panel>
				<el-splitter-panel :resizable="false" :size="400">
					<el-scrollbar>
						<el-form ref="formRef" :model="form" :rules="rules" v-if="showForm" :disabled="submitLoading"
							class="layouts" v-bind="formProps">
							<template v-if="formProps.inline">
								<inlineRuleComponent v-model="form" :rule="rule" />
							</template>
							<template v-else>
								<ruleComponent v-model="form" :rule="rule" />
							</template>
						</el-form>
					</el-scrollbar>
				</el-splitter-panel>
			</el-splitter>
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