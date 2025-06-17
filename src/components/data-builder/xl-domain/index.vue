<script setup lang="ts">
import { $http } from '@/common';
import { setClipboard } from '@/common/functions';

const props = withDefaults(defineProps<{
    label: string
    tips?: string
    domain?: string
    agreement?: any
    api?: string
    interval?: number
}>(), {
    label: ''
});
const emits = defineEmits(['reload'])
onMounted(() => {
    getData();
})
const search = ref({})
const createInterval = () => {
    if (props.interval && props.interval > 500) {
        setInterval(() => {
            getData();
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
            createInterval();
        }
    }).catch(() => { })
}
const update = (query?: any) => {
    search.value = query;
    getData();
}
const copy = () => {
    if (!props.domain) {
        return;
    }
    setClipboard(props.domain);
}
onBeforeUnmount(() => {
})
defineExpose({
    update
})
</script>

<template>
    <div class="h-100 flex flex-column flex-x-space-between">
        <div class="flex flex-x-center grid-gap-2 domain-link border-bottom pb-2 mb-2">
            <el-link icon="Paperclip" :href="props.domain" target="_blank" class="flex-1 h10 text-ellipsis-2"
                underline="never" type="danger"> {{ props.domain }} </el-link>
            <el-button type="success" @click="copy">{{props.label}}</el-button>
        </div>
        <div class="flex flex-center mb-2">
            <div style="width:150px;height:150px;">
                <xl-qrcode v-if="props.domain" :text="props.domain" />
            </div>
        </div>
        <div class="flex">
            <div class="text-grey h9 flex-1 text-ellipsis-2">{{props.tips}}</div>
            <div class="text-grey" v-if="props.agreement">
                <el-link type="primary" underline="never" :href="props.agreement.url" target="_blank">{{ props.agreement.title
                }}</el-link>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.domain-link {
    .el-link__inner {
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
}
</style>