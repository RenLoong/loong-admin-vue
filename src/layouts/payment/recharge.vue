<script setup lang="ts">
import { $eventBus, $http } from '@/common';
import ResponseEvent from '@/common/enum/ResponseEvent';
import router from '@/routers';
import { useRefs, useUserStore } from '@/stores';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Swiper as SwiperClass } from 'swiper/types';
import { Navigation, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import { debounce } from '@/common/functions';
import { ElMessage } from 'element-plus';

const props = withDefaults(defineProps<{
	params?: any
}>(), {
});
const userStore = useUserStore();
const { USERINFO } = useRefs(userStore);
const emit = defineEmits(['confirm']);
const loading = ref(true);
const currentRoute = router.currentRoute.value;
let ApiUrl = currentRoute.meta.api as string;
if (props.params) {
	ApiUrl = props.params.api;
}
let ordersStateApiUrl: string;
const prompt = ref<any>({
	qrcode: [],
	agreement: [],
	swiper: [],
	footer: []
});
const form = ref<any>({
	id: undefined,
	num: 1,
	payment: undefined
})
const payment = ref<any>([]);
const submitLoading = ref(false)
const list = ref<any>([]);
const find = ref<any>({});
onBeforeMount(() => {
	$http.get(ApiUrl, {
		params: {
			...currentRoute.query,
			...props.params?.query
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			list.value = res.data.list;
			prompt.value = res.data.prompt;
			payment.value = res.data.payment;
			const defaultPayment = payment.value.find((item: any) => item.default);
			if (defaultPayment) {
				form.value.payment = defaultPayment.id;
			}
			if (res.data.create_orders) {
				ApiUrl = res.data.create_orders;
			}
			if (res.data.get_orders_state) {
				ordersStateApiUrl = res.data.get_orders_state;
			}
			nextTick(() => {
				if (res.data.list && res.data.list.length > 0) {
					selected(res.data.list[0], 0);
				}
			})
		}
	}).finally(() => {
		loading.value = false;
	})
})
const ordersInfo = ref<any>({});
const submit = () => {
	submitLoading.value = true;
	$http.post(ApiUrl, form.value).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			ordersInfo.value = res.data;
			getOrdersState();
		}else{
			ElMessage.error(res.msg);
		}
	}).finally(() => {
		submitLoading.value = false;
	})
}
let getOrdersStateEr:NodeJS.Timeout;
const getOrdersState=()=>{
	if(!ordersInfo.value.trade)return;
	$http.get(ordersStateApiUrl,{
		params: {
			trade: ordersInfo.value.trade
		}
	}).then((res: any) => {
		if (res.code === $http.ResponseCode.SUCCESS) {
			if(ordersInfo.value.trade===res.data.trade){
				getOrdersStateEr=setTimeout(getOrdersState, 1000);
			}
		}else if(res.code=== $http.ResponseCode.PAY_SUCCESS){
			$eventBus.emit(ResponseEvent.UPDATE_USERINFO);
			close();
			ElMessage.success(res.msg);
		}else{
			ordersInfo.value={};
			ElMessage.info(res.msg);
		}
	})
}
const debounceSubmit = debounce(submit, 300);
watch(() => form.value, (value) => {
	if(getOrdersStateEr){
		clearTimeout(getOrdersStateEr);
	}
	if (value.id) {
		debounceSubmit();
	}
}, { deep: true })
const modules = [Navigation, A11y];
const swiperRef = shallowRef();
const setPluginPlatformSwiper = (e: SwiperClass) => {
	swiperRef.value = e;
}
const selected = (item: any, index: number) => {
	find.value = item;
	form.value.id = item.id;
	swiperRef.value?.slideTo(index);
}
onMounted(() => {
	$eventBus.emit(ResponseEvent.UPDATE_USERINFO);
})
onBeforeUnmount(() => {
	ordersInfo.value={};
	swiperRef.value?.destroy();
	if(getOrdersStateEr){
		clearTimeout(getOrdersStateEr);
	}
})
const close = () => {
	emit('confirm');
}
const details = ref(false);
const price = computed(() => {
	if (!find.value.id) {
		return 0;
	}
	return form.value.num * find.value.price;
})
</script>

<template>
	<div class="recharge grid-gap-4">
		<div class="flex flex-y-center grid-gap-4">
			<el-avatar :src="USERINFO?.headimg" :size="30">{{ USERINFO?.nickname }}</el-avatar>
			<div>Hi {{ USERINFO?.nickname }}</div>
			<div class="flex-1"></div>
			<el-link href="#/app/apistore/control/UserIntegralLog/index?scene=recharge" type="info" :underline="false">充值记录</el-link>
			<el-icon class="pointer close" @click="close" :size="20">
				<Close />
			</el-icon>
		</div>
		<div class="flex flex-1 grid-gap-4">
			<div class="flex-1 recgarge-body flex flex-column grid-gap-10">
				<xl-prompt :prompt="prompt.swiper"></xl-prompt>
				<swiper class="recharge-swiper" :modules="modules" navigation free-mode @swiper="setPluginPlatformSwiper"
					slides-per-view="auto" :space-between="30">
					<swiper-slide v-for="(item, index) in list" class="recharge-swiper-slide flex-center"
						:class="{ 'active': form.id === item.id }" @click="selected(item, index)">
						<div class="h8 h-30 flex flex-center">{{ item.title }}</div>
						<div class="h-30 flex flex-center">
							<div class="flex flex-y-baseline">
								<div class="text-price ml-1">￥</div>
								<div class="text-price h1 font-weight-bold">{{ item.price }}</div>
							</div>
						</div>
						<div class="h-20 flex flex-center">
							<div class="text-grey text-s" v-if="item.discount">￥ {{ item.origin_price }}</div>
						</div>
						<div class="w-100 h-20 flex flex-center">
							<div class="month shine flex-1" v-if="item.discount">立省 ￥{{ item.discount_price }}</div>
						</div>
					</swiper-slide>
				</swiper>
				<xl-prompt :prompt="prompt.footer"></xl-prompt>
				<div class="flex flex-y-center">
					<div class="font-weight-bold w-80px">数量</div>
					<el-input-number v-model="form.num" :min="1" :max="100" size="large" />
				</div>
				<div class="flex flex-y-center">
					<div class="font-weight-bold w-80px">支付方式</div>
					<el-radio-group v-model="form.payment" size="large">
						<el-radio v-for="item in payment" :value="item.id" :key="item.id" border>{{ item.label }}</el-radio>
					</el-radio-group>
				</div>
			</div>
			<div class="qrcode-body flex flex-center flex-column grid-gap-4 p-4" v-loading="submitLoading">
				<div class="flex-1"></div>
				<div class="flex flex-y-baseline">
					<div class="text-grey w-80px text-right">实付：</div>
					<div class="flex-1 flex flex-y-baseline w-100px">
						<div class="text-price">￥</div>
						<div class="text-price h1 font-weight-bold">{{ price }}</div>
					</div>
				</div>
				<div class="flex flex-y-baseline">
					<div class="text-grey w-80px text-right">数量：</div>
					<div class="text-price w-100px"> * {{ form.num }}</div>
				</div>
				<div class="flex flex-center" v-if="find.discount">
					<div class="text-grey w-80px text-right">优惠：</div>
					<div class="flex-1 flex flex-y-center w-100px">
						<div class="text-price">￥</div>
						<div class="text-price">{{ find.discount_price * form.num }}</div>
						<div class="ml-2 pointer" @click="details = true">明细</div>
						<el-icon>
							<ArrowRight />
						</el-icon>
					</div>
				</div>
				<div class="qrcode">
					<xl-qrcode v-if="ordersInfo.qrcode" :text="ordersInfo.qrcode" />
					<el-empty description="订单未创建" v-else style="--el-empty-padding:0px;" />
				</div>
				<xl-prompt :prompt="prompt.qrcode"></xl-prompt>
				<div class="flex-1"></div>
				<xl-prompt :prompt="prompt.agreement"></xl-prompt>
			</div>
		</div>
		<el-dialog v-model="details" width="500" :show-close="false" class="p-0"
			style="--el-dialog-border-radius:var(--el-messagebox-border-radius, 12px);">
			<template #header="{ titleId, titleClass }">
				<div class="p-4 dialog-header" :id="titleId" :class="titleClass">支付明细</div>
			</template>
			<div class="p-10">
				<div class="flex flex-y-flex-end mb-10">
					<div class="flex-1">
						<div class="text-grey h10">套餐</div>
						<div class="h8 font-weight-600 mt-1">{{ find.title }}</div>
					</div>
					<div class="text-price h8 font-weight-600">￥{{ find.origin_price * form.num }}</div>
				</div>
				<div class="flex flex-y-flex-end mb-10">
					<div class="flex-1">
						<div class="text-grey h10">优惠</div>
						<div class="h8 font-weight-600 mt-1">{{ find.discount_text }}</div>
					</div>
					<div class="text-price h8 font-weight-600">￥{{ find.discount_price * form.num }}</div>
				</div>
				<div class="border-top pt-10 flex flex-y-center grid-gap-4">
					<div>实付：</div>
					<div class="text-price">{{ price }}元</div>
					<div class="text-grey">原价<span class="mx-1">{{ find.origin_price * form.num }}</span>元</div>
					<div class="text-grey">优惠金额<span class="mx-1">{{ find.discount_price * form.num }}</span>元</div>
				</div>
			</div>
			<template #footer>
				<div class="p-4 flex flex-center">
					<el-button type="danger" @click="details = false" bg text>我知道了</el-button>
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

.recharge {
	width: 100%;
	max-width: var(--el-messagebox-width);
	height: max(70vh, 800px);
	background: radial-gradient(circle at 30% 50%, #ffe9bc 0%, transparent 70%),
		radial-gradient(circle at 70% 70%, #fee7e0 0%, transparent 120%);
	padding: var(--el-messagebox-border-radius, 12px);
	border-radius: var(--el-messagebox-border-radius, 12px);
	display: flex;
	flex-direction: column;

	.close {
		display: none;
	}

	.recgarge-body {
		background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), .75);
		backdrop-filter: blur(10px);
		border-radius: var(--el-messagebox-border-radius, 12px);
		padding: calc(var(--el-messagebox-border-radius, 12px) * 2);
		overflow: hidden;

		.recharge-swiper {
			--swiper-navigation-sides-offset: -100%;
			--swiper-navigation-color: #ffb66d;
			--swiper-navigation-size: 25px;
			width: 100%;

			.recharge-swiper-slide {
				cursor: pointer;
				background-color: var(--el-bg-color);
				display: flex;
				flex-direction: column;
				width: 220px;
				height: 180px;
				border-radius: var(--el-messagebox-border-radius, 12px);

				.month {
					background: rgba(162, 171, 189, .06);
					border-radius: 10px;
					color: #818999;
					display: block;
					overflow: hidden;
					position: relative;
					text-align: center;
					font-size: 12px;
					padding: 2px 0;
					margin: 0 10px;
				}
			}

			.recharge-swiper-slide.active {
				background: linear-gradient(101.37deg, #fff9c6 1.05%, #ffe1c2 97.37%);
				box-shadow: inset 0 0 0 3px #ffb66d;
				color: #6b2d00;

				.h8 {
					font-weight: 600;
				}

				.month {
					background: hsla(0, 0%, 100%, .7);
					color: #ffb66d;

					&.shine::after {
						animation: shine 2.5s ease-in-out infinite;
						background-image: linear-gradient(90deg, transparent, hsla(0, 0%, 100%, .8), transparent);
						background-repeat: no-repeat;
						content: "";
						height: 100%;
						left: -100%;
						position: absolute;
						top: 0;
						-webkit-transform: skewX(-20deg);
						transform: skewX(-20deg);
						width: 26px;
					}
				}
			}

			&:hover {
				--swiper-navigation-sides-offset: 10px;
			}
		}
	}

	.qrcode-body {
		width: 30%;
		background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), .45);
		backdrop-filter: blur(10px);
		border-radius: var(--el-messagebox-border-radius, 12px);

		.qrcode {
			border: 1px solid #ffe9bc;
			border-radius: var(--el-messagebox-border-radius, 12px);
			overflow: hidden;
		}
	}
}

@keyframes shine {
	to {
		left: 100%
	}
}

.w-80px {
	width: 80px;
}

.w-100px {
	width: 100px;
}
</style>
