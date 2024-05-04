<script setup lang="ts">
import { $http } from '@/common';
import * as echarts from 'echarts';
import useTheme, { Theme } from '@/common/theme'
import { dark, light } from "@/common/echarts.theme";
import { onWindowResize } from '@/common/functions';

const props = withDefaults(defineProps<{
    data?: echarts.EChartsOption
    api?: string
    interval?: number
}>(), {
});
type EChartsOption = echarts.EChartsOption;
let EChartInstance: echarts.ECharts;
const setChartOptions = (options: EChartsOption) => {
    EChartInstance && EChartInstance.setOption(options);
}
const { theme } = useTheme();
watch(theme, (val) => {
    switchEchartsTheme(val);
})
const switchEchartsTheme = (val: Theme) => {
    if (val === 'dark') {
        EChartInstance.setOption(dark);
    } else {
        EChartInstance.setOption(light);
    }
}
const datav=Date.now().toString(16);
onMounted(() => {
    const dom = document.getElementById(`echarts-${datav}`);
    if (dom) {
        EChartInstance = echarts.init(dom);
        props.data && EChartInstance.setOption(props.data);
        switchEchartsTheme(theme.value);
    }
    getData();
})
onUnmounted(() => {
    EChartInstance && EChartInstance.dispose();
})
onWindowResize(() => {
    EChartInstance && EChartInstance.resize();
    intervalEr && clearTimeout(intervalEr);
}, 300)
const search = ref({})
let intervalEr: NodeJS.Timeout|undefined;
const createInterval = () => {
    if (!intervalEr && props.interval && props.interval > 500) {
        intervalEr=setTimeout(() => {
            getData();
            intervalEr=undefined;
        }, props.interval)
    }
}
const getData = () => {
    if (!props.api) {
        return;
    }
    $http.get(`${props.api}`, {
        params: search.value
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            setChartOptions(res.data);
            createInterval();
        }
    }).catch(() => { })
}
const update = (query?: any) => {
    search.value = query;
    getData();
}
defineExpose({
    update
})
</script>

<template>
    <div :id="`echarts-${datav}`"></div>
</template>

<style lang="scss" scoped></style>