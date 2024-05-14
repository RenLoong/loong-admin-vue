<script setup lang="ts">
import { $http } from '@/common';
import { ElMessage } from 'element-plus';

const props = withDefaults(defineProps<{
    label: string
    icon?: string
    tips?: string
    apply?: boolean
    price?: number
    agreement?: any
    payment?: any
    state?: string
    message?: string
    api?: string
    submit_api?: string
    get_orders_state_api?: string
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
const qrcodeDialog = ref(false);
const ordersInfo = ref<any>({});
const submit = (payment?: number) => {
    if (!props.submit_api) {
        return;
    }
    $http.post(`${props.submit_api}`, {
        payment
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            emits('reload');
        } else if (res.code === $http.ResponseCode.WAIT) {
            qrcodeDialog.value = true;
            ordersInfo.value = res.data;
            getOrdersState();
        } else {
            ElMessage.info(res.msg)
        }
    }).catch(() => { })
}
let getOrdersStateEr: NodeJS.Timeout;
const getOrdersState = () => {
    if (!ordersInfo.value.trade || !props.get_orders_state_api) return;
    $http.get(props.get_orders_state_api, {
        params: {
            trade: ordersInfo.value.trade
        }
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            if (ordersInfo.value.trade === res.data.trade) {
                getOrdersStateEr = setTimeout(getOrdersState, 1000);
            }
        } else if (res.code === $http.ResponseCode.PAY_SUCCESS) {
            close();
            ElMessage.success(res.msg);
        } else {
            ordersInfo.value = {};
            ElMessage.info(res.msg);
        }
    })
}
const close = () => {
    qrcodeDialog.value = false;
    ordersInfo.value = {};
    emits('reload');
}
onBeforeUnmount(() => {
    ordersInfo.value = {};
    if (getOrdersStateEr) {
        clearTimeout(getOrdersStateEr);
    }
})
defineExpose({
    update
})
</script>

<template>
    <div>
        <el-icon size="10vw" color="var(--el-color-danger)">
            <component v-if="props.icon" :is="`${props.icon}`" />
            <Collection v-else />
        </el-icon>
        <div class="h1 font-weight-600">{{ props.label }}</div>
        <div class="bg p-4 rounded-4" v-if="props.message">驳回理由：{{props.message}}</div>
        <div class="h8 font-weight-600 text-grey">{{ props.tips }}</div>
        <div v-if="props.apply">
            <div v-if="props.price && props.price > 0">
                <el-button type="danger" size="large" @click="submit(item.id)" v-for="(item, index) in props.payment"
                    :key="index">{{ item.label }}￥{{ props.price }}申请开通</el-button>
            </div>
            <el-button type="danger" v-else size="large" @click="submit()">立即申请开通</el-button>
        </div>
        <div v-else-if="props.state"></div>
        <div v-else class="text-grey">暂未开通申请通道</div>
        <div class="text-grey" v-if="props.agreement">
            <el-link type="primary" :underline="false" :href="props.agreement.url" target="_blank">{{ props.agreement.title
            }}</el-link>
        </div>
        <el-dialog v-model="qrcodeDialog" width="500" :show-close="false" class="p-0"
            style="--el-dialog-border-radius:12px;">
            <template #header="{ titleId, titleClass }">
                <div class="p-4 dialog-header" :id="titleId" :class="titleClass">扫码支付</div>
            </template>
            <div class="p-10 flex flex-center">
                <div style="width: 200px;height: 200px;">
                    <xl-qrcode v-if="ordersInfo.qrcode" :text="ordersInfo.qrcode" />
                </div>
            </div>
            <template #footer>
                <div class="p-4 flex flex-center">
                    <el-button type="danger" @click="close" bg text>我已支付</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.dialog-header {
    background: radial-gradient(circle at 30% 50%, #ffe9bc 0%, transparent 70%),
        radial-gradient(circle at 70% 70%, #fee7e0 0%, transparent 120%);
    border-top-left-radius: var(--el-messagebox-border-radius, 12px);
    border-top-right-radius: var(--el-messagebox-border-radius, 12px);
    color: #6b2d00;
}
</style>