<script setup lang="ts">
import ruleComponent from '@/layouts/info/component/rule.vue'
import inlineRuleComponent from '@/layouts/info/component/inline-rule.vue'
const props = withDefaults(defineProps<{
    component: any,
    row: any,
}>(), {
    component: {}
});
const infoData = ref<any[]>(props.row);
if (props.component.prop) {
    infoData.value = props.row[props.component.prop];
}
const formProps = ref<any>({
    labelWidth: '200px',
    labelPosition: 'top',
    class: 'py-10'
})
const rule = ref<any>()
const basicFormName = ref('');
const selectedGroup = ref('');
const tabs = ref<any>([]);
const group = ref<any>([]);
onMounted(() => {
    rule.value = props.component.builder.rule;
    formProps.value = {
        ...formProps.value,
        ...props.component.builder.props
    }
    basicFormName.value = props.component.builder.name;
    selectedGroup.value = props.component.builder.name;
    group.value = props.component.builder.group;
    if (props.component.builder.group.length > 0) {
        tabs.value.push({ name: props.component.builder.name, title: props.component.builder.title });
        for (let i = 0; i < props.component.builder.group.length; i++) {
            const element = props.component.builder.group[i];
            tabs.value.push({ name: element.name, title: element.title });
        }
    }
})
</script>
<template>
    <div>
        <div class="flex flex-wrap bg-white rounded-top-4 p-6 flex-center" v-if="tabs.length > 0">
            <div class="font-weight-600 p-4 pointer rounded-4 text-nowrap"
                :class="{ 'text-success bg': selectedGroup === tab.name }" @click="selectedGroup = tab.name"
                v-for="tab in tabs">{{ tab.title }}</div>
        </div>
        <el-form ref="formRef" v-bind="formProps">
            <template v-if="formProps.inline">
                <template v-if="selectedGroup === basicFormName">
                    <inlineRuleComponent v-model="infoData" :rule="rule" />
                </template>
                <template v-if="group.length > 0">
                    <template v-for="(item, _index) in group" :index="_index">
                        <div v-show="selectedGroup === item.name">
                            <inlineRuleComponent v-model="infoData[item.name]" :rule="item.rule" :group="item.name" />
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
    </div>
</template>