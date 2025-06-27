<script setup lang="ts">
import { $http } from '@/common';
import router from '@/routers';
import { ElMessage } from 'element-plus'
import ruleComponent from './component/rule.vue'
import inlineRuleComponent from './component/inline-rule.vue'
import type { FormInstance } from 'element-plus'
import { parseRules } from '@/common/functions';
import SubmitEvent from '@/common/enum/SubmitEvent';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = withDefaults(defineProps<{
	params?: any
}>(), {
});
const emit = defineEmits(['confirm']);
const formRef = ref<FormInstance>();
const loading = ref(true);
const currentRoute = router.currentRoute.value;
const rule = ref<RuleInterface[]>([]);
const form = ref<any>({})
const formProps = ref<any>({
	labelWidth: '200px',
	labelPosition: 'top',
	class: 'pt-10'
})
const rules = ref<any>()
const showForm = ref(false);
const basicFormName = ref('');
const selectedGroup = ref('');
const tabs = ref<any>([]);
const group = ref<any>([]);
let ApiUrl = currentRoute.meta.api as string;
if (props.params) {
	ApiUrl = props.params.api;
}
const submitEvent = ref<string>();
onBeforeMount(() => {
	$http.get(ApiUrl, {
		params: {
			...currentRoute.query,
			...props.params?.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			rule.value = res.data.rule;
			formProps.value = {
				...formProps.value,
				...res.data.props
			}
			parseRules(rules, rule.value);
			if (res.data.url) {
				ApiUrl = res.data.url;
			}
			basicFormName.value = res.data.name;
			selectedGroup.value = res.data.name;
			group.value = res.data.group;
			if (res.data.group.length > 0) {
				tabs.value.push({ name: res.data.name, title: res.data.title });
				for (let i = 0; i < res.data.group.length; i++) {
					const element = res.data.group[i];
					tabs.value.push({ name: element.name, title: element.title });
					parseRules(rules, element.rule, element.name);
				}
			}
			form.value = res.data.form;
			if (res.data.props.submitEvent) {
				submitEvent.value = res.data.props.submitEvent;
			}
			nextTick(() => {
				showForm.value = true;
			})
		}
	}).finally(() => {
		loading.value = false;
	})
})
const submitLoading = ref(false)
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
</script>

<template>
	<el-skeleton :loading="loading" animated>
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
			<div class="flex flex-wrap bg-white rounded-top-4 p-6 flex-center" v-if="tabs.length > 0">
				<div class="font-weight-600 p-4 pointer rounded-4 text-nowrap"
					:class="{ 'text-success bg': selectedGroup === tab.name }" @click="selectedGroup = tab.name"
					v-for="tab in tabs">{{ tab.title }}</div>
			</div>
			<el-scrollbar>
				<div class="layouts">
					<el-form ref="formRef" :model="form" :rules="rules" v-if="showForm" :disabled="submitLoading"
						v-bind="formProps">
						<template v-if="formProps.inline">
							<template v-if="selectedGroup === basicFormName">
								<inlineRuleComponent v-model="form" :rule="rule" />
							</template>
							<template v-if="group.length > 0">
								<template v-for="(item, _index) in group" :index="_index">
									<div v-show="selectedGroup === item.name">
										<inlineRuleComponent v-model="form[item.name]" :rule="item.rule" :group="item.name" />
									</div>
								</template>
							</template>
						</template>
						<template v-else>
							<template v-if="selectedGroup === basicFormName">
								<ruleComponent v-model="form" :rule="rule" />
							</template>
							<template v-if="group.length > 0">
								<template v-for="(item, _index) in group" :index="_index">
									<div v-show="selectedGroup === item.name">
										<ruleComponent v-model="form[item.name]" :rule="item.rule" :group="item.name" />
									</div>
								</template>
							</template>
						</template>
						<el-form-item class="submit-item py-4">
							<el-button type="primary" @click="onSubmit" :loading="loading" size="large">{{ t('button.confirmText')
								}}</el-button>
							<el-button @click="resetForm" v-if="rules" :disabled="loading" size="large">{{ t('button.resetText')
								}}</el-button>
						</el-form-item>
					</el-form>
				</div>
			</el-scrollbar>
		</template>
	</el-skeleton>
</template>
<style lang="scss" scoped>
.submit-item {
	position: sticky;
	bottom: 0;
	background-color: var(--el-bg-color);
	z-index: 1000;
	:deep(.el-button.el-button--large){
		padding: 12px 60px;
	}
}
</style>