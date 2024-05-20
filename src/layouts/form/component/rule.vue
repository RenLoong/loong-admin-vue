<script setup lang="ts">
import { hasWhere } from '@/common/functions';
import { useClick } from '@/common/functions/action';
const props = withDefaults(defineProps<{
    modelValue: any
    rule: any
    group?: string
}>(), {
    modelValue: {},
    rule: [],
    group: ''
});
interface RuleInterface {
    title: string;
    field: string;
    component: string;
    extra?: any;
    children: any;
}
const rule = ref<RuleInterface[]>([]);
const form = ref<any>({})
watchEffect(() => {
    if (props.modelValue) {
        form.value = props.modelValue;
    }
});
watchEffect(() => {
    if (props.rule) {
        rule.value = props.rule;
    }
});
const prop = (field: string) => {
    if (props.group) {
        return props.group + '.' + field;
    }
    return field;
}
const handleAction = (group: any, field: any,_e:any) => {
    console.log(group, field)
	if (!group.extra) return;
	let query = {
		...group.extra.params,
        field
	};
	if (group.extra.field) {
		for (let key in group.extra.field) {
			query[group.extra.field[key]] = form.value[key];
		}
	} else {
		query.id = form.value.id;
	}
	const options = {
		model: group.extra.model,
		props: group.extra.props,
		path: group.extra.path,
		query,
		data: form.value
	};
	useClick(options).then((data:any) => {
        if(data[field]){
            form.value[field] = data[field]
        }
	}).catch(() => { })
}
</script>

<template>
    <el-row :gutter="20">
        <template v-for="(item, index) in rule">
            <el-col v-bind="item.extra?.col">
                <el-form-item :index="index" :label="item.title" :prop="prop(item.field)"
                    v-if="hasWhere(item.extra, form)">
                    <div class="w-100">
                        <template v-if="item.component === 'select'">
                            <el-select v-model="form[item.field]" v-bind="item.extra.props">
                                <el-option v-for="(sub, subIndex) in item.extra.options" :key="subIndex"
                                    :label="sub.label" :value="sub.value" v-bind="item.extra.subProps" />
                            </el-select>
                        </template>

                        <template v-else-if="item.component === 'bundle'">
                            <xl-bundle v-model="form[item.field]" v-bind="item.extra.props" />
                        </template>
                        <template v-else-if="item.component === 'marked-editor'">
                            <xl-marked-editor v-model="form[item.field]" v-bind="item.extra.props" />
                        </template>
                        <template v-else-if="item.component === 'admin-rule'">
                            <xl-admin-rule v-model="form[item.field]" v-bind="item.extra.props"
                                :options="item.extra.options" />
                        </template>
                        <template v-else-if="item.component === 'wangeditor'">
                            <xl-wangeditor v-model="form[item.field]" v-bind="item.extra.props" />
                        </template>

                        <template v-else-if="['radio', 'checkbox'].includes(item.component)">
                            <component :is="'el-'+item.component+'-group'" v-model="form[item.field]"
                                v-bind="item.extra.props" class="el-group">
                                <component :is="'el-'+item.component" v-for="(sub, subIndex) in item.extra.options"
                                    :key="subIndex" :value="sub.value" v-bind="item.extra.subProps">{{ sub.label }}
                                </component>
                            </component>
                        </template>

                        <template v-else>
                            <component :is="'el-'+item.component" v-model="form[item.field]" v-bind="item.extra.props">
                                <template v-for="(child, name) in item.extra.children" :index="name" v-slot:[name]>
                                    <permissions :name="child.extra?.path">
                                        <component :is="child.component" v-if="typeof child === 'object'"
                                            v-bind="child.props" @click="handleAction(child,item.field,$event)" @change="handleAction(child,item.field,$event)">
                                            <template v-for="(subChild, subName) in child.children" :index="subName"
                                                v-slot:[subName]>
                                                <component :is="subChild.component" v-if="typeof subChild === 'object'"
                                                    v-bind="subChild.props" />
                                                <template v-else>{{ subChild }}</template>
                                            </template>
                                        </component>
                                        <template v-else>{{ child }}</template>
                                    </permissions>
                                </template>
                            </component>
                        </template>
                        <xl-prompt v-if="item.extra.prompt" :prompt="item.extra.prompt"></xl-prompt>
                    </div>
                </el-form-item>
            </el-col>
        </template>
    </el-row>
</template>

<style lang="scss" scoped>
.el-group {
    display: flex;
    gap: 10px;

    .el-radio {
        margin-right: 0 !important;
    }

    .el-checkbox {
        margin-right: 0 !important;
    }
}
</style>
