<script setup lang="ts">
import { parseRules } from '@/common/functions';
import ruleComponent from '@/layouts/form/component/rule.vue'
import inlineRuleComponent from '@/layouts/form/component/inline-rule.vue'
import { ElMessage, type FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = withDefaults(defineProps<{
    modelValue: any[],
    rule?: any,
}>(), {
    modelValue: () => [],
    rule: () => { },
});
const form = ref<any[]>(props.modelValue)
const emit = defineEmits(['update:modelValue'])
watch(() => props.modelValue, (val) => {
    form.value = val;
    console.log(form.value)
})
const dialogVisible = ref(false)
const submitLoading = ref(false)
const rule = ref<RuleInterface[]>(props.rule.rule);
const subForm = ref<any>(props.rule.form)
const formProps = ref<any>({
    labelWidth: '200px',
    labelPosition: 'top',
    class: 'py-10',
    ...props.rule.props
})
const rules = ref<any>()
const basicFormName = ref(props.rule.name);
const selectedGroup = ref(props.rule.name);
const tabs = ref<any>([]);
const group = ref<any>(props.rule.group);
const formRef = ref<FormInstance>();
const handleAdd = () => {
    dialogVisible.value = true;
}
let editIndex: number | undefined = undefined;
const handleEdit = (index: number, row: any) => {
    editIndex = index;
    subForm.value = JSON.parse(JSON.stringify(row));
    dialogVisible.value = true;
}
const handleDelete = (row: any) => {
    form.value = form.value.filter((item: any) => item.id !== row.id);
    resetForm();
    emit("update:modelValue", form.value)
}
const onSubmit = () => {
    if (!formRef.value) return;
    formRef.value.validate((valid, fields) => {
        if (valid) {
            submitLoading.value = true;
            if (editIndex !== undefined) {
                form.value[editIndex] = JSON.parse(JSON.stringify(subForm.value));
            } else {
                form.value.push(JSON.parse(JSON.stringify(subForm.value)));
            }
            emit("update:modelValue", form.value)
            resetForm();
            dialogVisible.value = false;
            editIndex = undefined;
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
    submitLoading.value = false;
}
const tableText = (value: any) => {
    if (value === undefined || value === null) return '-';
    if (value === true) return '是';
    if (value === false) return '否';
    if (typeof value === 'object') {
        if (value.length > 0) {
            return JSON.stringify(value);
        }
        return '-';
    }
    return value;
}
onMounted(() => {
    parseRules(rules, rule.value, undefined, form);
    if (group.value.length > 0) {
        tabs.value.push({ name: props.rule.name, title: props.rule.title });
        for (let i = 0; i < props.rule.group.length; i++) {
            const element = props.rule.group[i];
            tabs.value.push({ name: element.name, title: element.title });
            parseRules(rules, element.rule, element.name, form);
        }
    }
})
</script>
<template>
    <div class="w-100">
        <el-table :data="form" width="100%">
            <template v-for="(item, _index) in props.rule.props.table" :key="_index">
                <el-table-column :label="item.label" :prop="item.field">
                    <template #default="scope">
                        {{ tableText(scope.row[item.field]) }}
                    </template>
                </el-table-column>
            </template>

            <el-table-column fixed="right" width="160">
                <template #header>
                    <el-button type="success" size="small" @click="handleAdd" bg text>
                        {{ props.rule.title }}
                    </el-button>
                </template>
                <template #default="scope">
                    <el-button type="primary" size="small" bg text @click="handleEdit(scope.$index, scope.row)">
                        编辑
                    </el-button>
                    <el-button size="small" type="danger" bg text @click="handleDelete(scope.row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog v-model="dialogVisible" :title="props.rule.title" width="375">
            <el-form ref="formRef" :model="subForm" :rules="rules" :disabled="submitLoading" class="layouts"
                v-bind="formProps">
                <template v-if="formProps.inline">
                    <template v-if="selectedGroup === basicFormName">
                        <inlineRuleComponent v-model="subForm" :rule="props.rule.rule" />
                    </template>
                    <template v-if="group.length > 0">
                        <template v-for="(item, _index) in group" :index="_index">
                            <div v-show="selectedGroup === item.name">
                                <inlineRuleComponent v-model="subForm[item.name]" :rule="item.rule"
                                    :group="item.name" />
                            </div>
                        </template>
                    </template>
                </template>
                <template v-else>
                    <template v-if="selectedGroup === basicFormName">
                        <ruleComponent v-model="subForm" :rule="rule" />
                    </template>
                    <template v-if="group.length > 0">
                        <template v-for="(item, _index) in group" :index="_index">
                            <div v-show="selectedGroup === item.name">
                                <ruleComponent v-model="subForm[item.name]" :rule="item.rule" :group="item.name" />
                            </div>
                        </template>
                    </template>
                </template>
            </el-form>
            <template #footer>
                <el-button type="primary" @click="onSubmit" :loading="submitLoading" size="large">
                    <template v-if="formProps.submitButtonText">{{ formProps.submitButtonText }}</template>
                    <template v-else>{{ t('button.confirmText') }}</template>
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>