<script setup lang="ts">
import { $http,useLoginImageBuild } from "@/common";
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
const url = ref( WEBCONFIG.value.login?.url);
const login = () => {
	loginFormRef.value?.validate((valid: boolean) => {
		if (valid) {
			$http.post(url.value, form).then((res: any) => {
				if (res.code === $http.ResponseCode.SUCCESS) {
					ElMessage.success(res.msg);
					setUserInfo(res.data).then(() => {
						router.push('/');
					}).catch((err: any) => {
						ElMessage.info(err);
					})
				} else if(res.code === $http.ResponseCode.REDIRECT_CONFIRM){
					ElMessageBox.confirm(res.msg, '提示', {
						confirmButtonText: res.data.confirmButtonText || '跳转',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						globalThis.location.href = res.data.url;
					})
				} else if(res.code === $http.ResponseCode.REDIRECT){
					globalThis.location.href = res.data.url;
				}else {
					ElMessage.info(res.msg);
				}
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
const {BgImage, Image}=useLoginImageBuild();
</script>

<template>
	<div class="login" :style="[BgImage?`backgroundImage:url(${BgImage})`:'']">
        <div class="login-bg"></div>
		<div class="login-mask">
			<div class="flex flex-1 flex-center">
				<div class="login-image mr-10" v-if="Image">
					<img :src="Image" alt="logo" class="login-image">
				</div>
				<el-form ref="loginFormRef" :model="form" :rules="rules" class="login-form bg-filter" label-position="top"
					hide-required-asterisk :show-message="false" @submit.prevent="login">
					<div class="text-center p-5">
						<div class="flex flex-center pb-4">
							<div class="h8 font-weight-600 mr-4 pointer nav-item"
								:class="{ 'active': url === WEBCONFIG.login?.url }" @click="url = WEBCONFIG.login?.url"
							v-if="WEBCONFIG.login?.enable">{{WEBCONFIG.login?.title}}</div>
							<div class="h8 font-weight-600 ml-4 pointer nav-item"
								:class="{ 'active': url === WEBCONFIG.vcode?.url }" @click="url = WEBCONFIG.vcode?.url"
							v-if="WEBCONFIG.vcode?.enable">{{WEBCONFIG.vcode?.title}}</div>
						</div>
						<div class="h10 pt-3">{{ WEBCONFIG.title }}</div>
					</div>
					<div class="flex-1 py-5 w-60 mx-auto flex flex-center flex-column">
						<el-form-item label="用户名" class="w-100" prop="username">
							<el-input v-model="form.username" placeholder="手机号/用户名/邮箱" size="large"></el-input>
						</el-form-item>
						<el-form-item label="密码" class="w-100" prop="password" v-if="url === WEBCONFIG.login?.url">
							<el-input v-model="form.password" type="password" placeholder="密码" size="large"></el-input>
						</el-form-item>
						<el-form-item label="图形验证码" class="w-100" prop="captcha" v-if="url===WEBCONFIG.vcode?.url||(url === WEBCONFIG.login?.url && WEBCONFIG.login?.captcha)">
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
											@click="getVcode({ mobile: form.username, token: form.token, scode: form.captcha })"
											:type="isDisabled ? 'info' : 'primary'" target="_blank" :underline="false"
											class="line-height-5">{{
												vcodeText }}</el-link>
									</div>
								</template>
							</el-input>
						</el-form-item>
					</div>
					<div class="p-4 flex flex-center mb-10">
						<button class="login-button">登录</button>
					</div>
					<div class="py-4 flex flex-center text-info" v-if="WEBCONFIG.register?.enable">
						<el-link href="#/register" type="primary" :underline="false">还没有账号？点击免费注册</el-link>
					</div>
					<div class="py-4 flex flex-center text-dark" v-if="WEBCONFIG.login?.user_agreement">
						<span>点击“登录”即代表你已阅读并同意</span>
                        <el-link :href="WEBCONFIG.login?.user_agreement" type="primary" target="_blank" :underline="false">《用户协议》</el-link>
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
	}
}
</style>
