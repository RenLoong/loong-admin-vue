<script setup lang="ts">
import { $http } from '@/common';
import { useClick } from '@/common/functions/action';

type dataType = {
    today: number
    growth_rate?: number
    yesterday?: number
    footer?: number
};
const props = withDefaults(defineProps<{
    data?: dataType
    label: string
    yesterday_label?: string
    footer_text?: string
    tips?: string
    unit?: string
    action?: any
    api?: string
    interval?: number
}>(), {
    label: '',
    yesterday_label: '',
});
console.log(props);
const value = ref<dataType>({
    today: 0
});
const growthRateClass = ref('');
const setValue = (data: dataType) => {
    value.value = data;
    if (data.growth_rate) {
        if (data.growth_rate > 0) {
            growthRateClass.value = 'data-up';
        } else if (data.growth_rate < 0) {
            growthRateClass.value = 'data-down';
        }
    }
}
watchEffect(() => {
    if (props.data) {
        setValue(props.data);
    }
})
onMounted(()=>{
    getData();
})
const search=ref({})
const createInterval=()=>{
    if(props.interval&&props.interval>500){
        setInterval(()=>{
            getData();
        },props.interval)
    }
}
const getData=()=>{
    if(!props.api){
        return;
    }
    $http.get(`${props.api}`,{
        params:search.value
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            setValue(res.data);
            createInterval();
        }
    }).catch(() => {})
}
const update=(query?:any)=>{
    search.value=query;
    getData();
}
const handleAction = () => {
	if (!props.action) return;
	let query = {
		...props.action.params
	};
	const options = {
		model: props.action.model,
		props: props.action.props,
		path: props.action.path,
		query,
		data: {}
	};
	useClick(options).then(() => {
	}).catch(() => { })
}
defineExpose({
    update
})
</script>

<template>
    <div>
        <el-statistic :value="value.today">
            <template #title>
                <div style="display: inline-flex; align-items: center">
                    {{ props.label }}
                    <el-tooltip effect="dark" :content="props.tips" placement="top" v-if="props.tips">
                        <el-icon style="margin-left: 4px" :size="12" class="pointer">
                            <Warning />
                        </el-icon>
                    </el-tooltip>
                </div>
            </template>
            <template #suffix v-if="props.unit">{{ props.unit }}</template>
        </el-statistic>
        <div class="statistic-footer" v-if="value.yesterday">
            <div class="footer-item">
                <span v-if="props.yesterday_label">{{ props.yesterday_label }}</span>
                <span class="yesterday" :class="growthRateClass">
                    <span>{{ value.yesterday }}</span>
                    <el-divider direction="vertical" border-style="dashed" />
                    <span>{{ value.growth_rate }}%</span>
                    <el-icon class="up-icon" :size="14">
                        <CaretTop/>
                    </el-icon>
                    <el-icon class="down-icon" :size="14">
                        <CaretBottom/>
                    </el-icon>
                </span>
            </div>
        </div>
        <div class="statistic-footer" v-if="props.footer_text">
            <div class="footer-item">
                <span>{{props.footer_text}}</span>
                <span class="yesterday">
                    <span>{{ value.footer }}</span>
                </span>
            </div>
            <div v-if="props.action">
                <permissions :name="props.action.path">
                    <component :is="`el-${props.action.component.name}`"
                        v-bind="props.action.component.props"
                        @click="handleAction()">
                        {{ props.action.component.label }}
                    </component>
                </permissions>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.statistic-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-top: 16px;
}

.statistic-footer .footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.statistic-footer .footer-item .yesterday {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
}


.data-down {
    color: var(--el-color-success);
}

.data-up {
    color: var(--el-color-error);
}

.up-icon,
.down-icon {
    display: none;
}

.data-up .up-icon {
    display: inline;
}

.data-down .down-icon {
    display: inline;
}
</style>
<style>
.el-statistic__suffix {
    font-size: 14px;
    color: var(--el-color-info);
}
</style>