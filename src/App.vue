<script setup lang="ts">
import { $eventBus } from "@/common";
import { getWebConfig, getUserInfo } from "@/common/functions/request";
import { useUserStore, useWebConfigStore, useStateStore, useRefs } from "@/stores";
import ResponseEvent from "./common/enum/ResponseEvent";
import { i18nChangeLanguage } from '@wangeditor/editor'

import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { useI18n } from 'vue-i18n';
const {locale } = useI18n();

const { userListener } = useUserStore()
const webConfigStore = useWebConfigStore();
const stateStore = useStateStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const { STATE } = useRefs(stateStore);
onBeforeMount(() => {
	$eventBus.on(ResponseEvent.UPDATE_WEBCONFIG, () => {
		getWebConfig().then((data:any)=>{
			console.log(data);
		}).catch(() => {
		});
	})
	$eventBus.on(ResponseEvent.UPDATE_USERINFO, () => {
		getUserInfo()?.catch(() => { });
	})
	userListener();
	stateStore.initState();
})
const showService = ref(true);
const close = () => {
	showService.value = false;
}
const language= ref(zhCn);
watch(() => STATE.value.language, (newLanguage:LanguageInterface) => {
	locale.value=newLanguage;
	document.documentElement.setAttribute('lang',newLanguage);
	switch (newLanguage) {
		case 'zh-CN':
			language.value = zhCn;
			i18nChangeLanguage(newLanguage)
			break;
		case 'en':
			language.value = en;
			i18nChangeLanguage(newLanguage)
			break;
	}
});
</script>

<template>
	<el-config-provider :locale="language">
		<router-view />
		<div class="position-right rounded-4 text-center bg-white" :class="{ 'show': showService }"
			v-if="WEBCONFIG.wechat_url || WEBCONFIG.wechat_qrcode_url">
			<el-icon class="close" @click="close">
				<CloseBold />
			</el-icon>
			<div class="bg-primary text-white p-4 rounded-top-left-4 rounded-top-right-4">在线客服</div>
			<div v-if="WEBCONFIG.wechat_qrcode_url" class="p-4">
				<img class="qrcode" :src="WEBCONFIG.wechat_qrcode_url" alt="客服二维码">
				<div class="flex h10 flex-center pt-2 text-info border-bottom">
					<el-icon>
						<FullScreen />
					</el-icon>
					<div class="ml-2 mb-1">微信扫码</div>
				</div>
			</div>
			<div class="pb-4">
				<el-link :href="WEBCONFIG.wechat_url" type="primary" target="_blank" underline="never">点击联系客服</el-link>
			</div>
		</div>
	</el-config-provider>
</template>

<style lang="scss">
.position-right {
	position: fixed;
	right: -100%;
	top: 50%;
	z-index: 999;
	box-shadow: var(--el-box-shadow);
	transition: all .5s;

	&.show {
		right: 20px;
	}

	.qrcode {
		width: 100px;
		height: 100px;
	}

	.close {
		width: 20px;
		height: 20px;
		position: absolute;
		right: -10px;
		top: -10px;
		cursor: pointer;
		background-color: var(--el-bg-color);
		border-radius: 9999px;
		box-shadow: var(--el-box-shadow);
	}
}
</style>