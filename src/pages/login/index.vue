<script setup lang="ts">
import { $http, useLoginImageBuild } from "@/common";
import { useVcode } from "@/common/functions/vcode";
import router from "@/routers";
import { useRefs, useUserStore, useWebConfigStore } from "@/stores";
import { FormInstance, FormRules, ElMessage, ElMessageBox } from "element-plus";
const { setUserInfo } = useUserStore()
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const { isDisabled, vcodeText, getVcode } = useVcode();
const loginFormRef = ref<FormInstance>();
const form = reactive({
	username: '',
	password: '',
	vcode: '',
	token: '',
	captcha: ''
})
const rules = reactive<FormRules>({
	username: [
		{ required: true, message: '请输入账号', trigger: 'blur' }
	],
	password: [
		{ required: true, message: '请输入密码', trigger: 'blur' }
	],
	captcha: [
		{ required: true, message: '请输入图形验证码', trigger: 'blur' }
	],
});
const url = ref(WEBCONFIG.value.login?.url);
watchEffect(() => {
	if (WEBCONFIG.value.login?.url) {
		url.value = WEBCONFIG.value.login?.url;
	} else if (WEBCONFIG.value.vcode?.url) {
		url.value = WEBCONFIG.value.vcode?.url;
	} else if (WEBCONFIG.value.qrcode_login?.url) {
		url.value = WEBCONFIG.value.qrcode_login?.url;
	}
})
const login = () => {
	loginFormRef.value?.validate((valid: boolean) => {
		if (valid) {
			$http.post(url.value, form).then((res: any) => {
				LoginRes(res);
			})
		} else {
			ElMessage.error('请将表单填写完整');
		}
	})
}
const captchaChange = (token: string) => {
	form.token = token;
	form.captcha = '';
}
const { BgImage, Image } = useLoginImageBuild();
const usernamePlaceholder = computed(() => {
	let placeholder = '手机号/用户名';
	if (url.value === WEBCONFIG.value.vcode?.url) {
		placeholder = '手机号';
	}
	return placeholder;
});
const toggleQrcode = () => {
	if (url.value === WEBCONFIG.value.qrcode_login?.url) {
		if (WEBCONFIG.value.login?.url) {
			url.value = WEBCONFIG.value.login?.url;
		} else if (WEBCONFIG.value.vcode?.url) {
			url.value = WEBCONFIG.value.vcode?.url;
		}
	} else {
		url.value = WEBCONFIG.value.qrcode_login?.url;
	}
}
const LoginRes = (res: any) => {
	if (res.code === $http.ResponseCode.SUCCESS) {
		ElMessage.success(res.msg);
		setUserInfo(res.data).then(() => {
			router.push(router.currentRoute.value.query.redirect as string ?? '/');
		}).catch((err: any) => {
			ElMessage.info(err);
		})
	} else if (res.code === $http.ResponseCode.REDIRECT_CONFIRM) {
		ElMessageBox.confirm(res.msg, '提示', {
			confirmButtonText: res.data.confirmButtonText || '跳转',
			cancelButtonText: '取消',
			type: 'warning'
		}).then(() => {
			globalThis.location.href = res.data.url;
		})
	} else if (res.code === $http.ResponseCode.REDIRECT) {
		globalThis.location.href = res.data.url;
	} else {
		ElMessage.info(res.msg);
	}
}
</script>

<template>
	<div class="login" :style="[BgImage ? `backgroundImage:url(${BgImage})` : '']">
		<div class="login-bg"></div>
		<div class="login-mask">
			<div class="flex flex-1 flex-center">
				<div class="login-image mr-10" v-if="Image">
					<img :src="Image" alt="logo" class="login-image">
				</div>
				<el-form ref="loginFormRef" :model="form" :rules="rules" class="login-form bg-filter"
					label-position="top" hide-required-asterisk :show-message="false" @submit.prevent="login">
					<div v-if="WEBCONFIG.qrcode_login?.enable" class="qrcode-icon" @click="toggleQrcode">
						<el-icon size="20"
							v-if="url === WEBCONFIG.qrcode_login?.url && (WEBCONFIG.login?.enable || WEBCONFIG.vcode?.enable)">
							<Monitor />
						</el-icon>
						<el-icon size="20" v-else color="var(--el-color-primary)">
							<Qrcode/>
						</el-icon>
					</div>
					<div class="text-center p-5">
						<div class="flex flex-center pb-4">
							<div class="h8 font-weight-600 mr-4 pointer nav-item"
								:class="{ 'active': url === WEBCONFIG.login?.url }" @click="url = WEBCONFIG.login?.url"
								v-if="WEBCONFIG.login?.enable">{{ WEBCONFIG.login?.title }}</div>
							<div class="h8 font-weight-600 ml-4 pointer nav-item"
								:class="{ 'active': url === WEBCONFIG.vcode?.url }" @click="url = WEBCONFIG.vcode?.url"
								v-if="WEBCONFIG.vcode?.enable">{{ WEBCONFIG.vcode?.title }}</div>
						</div>
						<div class="h10 pt-3">{{ WEBCONFIG.web_title }}</div>
					</div>
					<div class="flex-1 flex flex-column" v-if="url != WEBCONFIG.qrcode_login?.url">
						<div class="flex-1 py-5 w-60 mx-auto flex flex-center flex-column">
							<el-form-item label="账号" class="w-100" prop="username">
								<el-input v-model="form.username" :placeholder="usernamePlaceholder"
									size="large"></el-input>
							</el-form-item>
							<el-form-item label="密码" class="w-100" prop="password" v-if="url === WEBCONFIG.login?.url">
								<el-input v-model="form.password" type="password" placeholder="密码"
									size="large"></el-input>
							</el-form-item>
							<el-form-item label="图形验证码" class="w-100" prop="captcha"
								v-if="url === WEBCONFIG.vcode?.url || (url === WEBCONFIG.login?.url && WEBCONFIG.login?.captcha)">
								<el-input v-model="form.captcha" placeholder="图形验证码" size="large">
									<template #append>
										<captcha @change="captchaChange" bg="52,52,52"></captcha>
									</template>
								</el-input>
							</el-form-item>
							<el-form-item label="短信验证码" class="w-100" prop="vcode" v-if="url === WEBCONFIG.vcode?.url">
								<el-input v-model="form.vcode" placeholder="短信验证码" size="large" maxlength="6">
									<template #append>
										<div class="px-3">
											<el-link
												@click="getVcode({ username: form.username, token: form.token, captcha: form.captcha, scene: 'login' })"
												:type="isDisabled ? 'info' : 'primary'" target="_blank"
												:underline="false" class="line-height-5">
												{{ vcodeText }}
											</el-link>
										</div>
									</template>
								</el-input>
							</el-form-item>
						</div>
						<div class="p-4 flex flex-center mb-10">
							<button class="login-button">登录</button>
						</div>
					</div>
					<div class="flex-1" v-else>
						<qrcode-view :url="WEBCONFIG.qrcode_login?.url" :check="WEBCONFIG.qrcode_login?.check"
							@success="LoginRes" />
						<div class="h10 text-center mt-4 mb-10" v-if="WEBCONFIG.qrcode_login?.title">
							{{ WEBCONFIG.qrcode_login?.title }}</div>
					</div>
					<div class="py-4 flex flex-center text-info" v-if="WEBCONFIG.register?.enable">
						<el-link href="#/register" type="primary" :underline="false">还没有账号？点击免费注册</el-link>
					</div>
					<div class="py-4 flex flex-center text-dark" v-if="WEBCONFIG.login?.user_agreement">
						<span>点击“登录”即代表你已阅读并同意</span>
						<el-link :href="WEBCONFIG.login?.user_agreement" type="primary" target="_blank"
							:underline="false">《用户协议》</el-link>
					</div>
				</el-form>
			</div>
			<div class="bg-filter bg-mask-light">
				<copyright class="flex-y-center"></copyright>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
@import "@/pages/login/login.css";

.login {
	.login-form {
		position: relative;
		overflow: hidden;

		.nav-item::after {
			content: '';
			margin-top: 10px;
			display: block;
			width: 100%;
			height: 4px;
			border-radius: 2px;
			background-color: var(--el-text-color-primary);
			transform: scaleX(0);
			transition: transform 0.3s;
		}

		.nav-item.active::after {
			transform: scaleX(1);
		}

		.qrcode-icon {
			position: absolute;
			width: 60px;
			height: 100px;
			right: -16px;
			top: -34px;
			background-color: rgba(255, 255, 255, .15);
			backdrop-filter: blur(10px);
			cursor: pointer;
			transform: rotate(-45deg);

			.el-icon {
				transform: rotate(45deg) translate(36px, 100%);
			}

			&:hover .el-icon svg {
				animation: qrcode-icon-scale 1s;
			}
		}
	}
}

@keyframes qrcode-icon-scale {
	0% {
		transform: scale(1);
	}

	25% {
		transform: scale(1.5);
	}

	50% {
		transform: scale(1);
	}

	75% {
		transform: scale(1.25);
	}

	100% {
		transform: scale(1.05);
	}
}
</style>
