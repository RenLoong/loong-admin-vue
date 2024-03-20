<script setup lang="ts">
import { $http,useLoginImageBuild } from "@/common";
import { useVcode } from "@/common/functions/vcode";
import router from "@/routers";
import { useRefs, useWebConfigStore } from "@/stores";
import { FormInstance, FormRules, ElMessage,ElMessageBox } from "element-plus";

const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const { isDisabled, vcodeText, getVcode } = useVcode();
const loginFormRef = ref<FormInstance>();
const form = reactive({
    username: '',
    captcha: '',
    vcode: '',
    password: '',
    token: ''
})
const rules = reactive<FormRules>({
    username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ],
});
const register = () => {
    loginFormRef.value?.validate((valid: boolean) => {
        if (valid) {
            $http.post(WEBCONFIG.value.register?.url, form).then((res: any) => {
                if (res?.code === $http.ResponseCode.SUCCESS) {
                    router.push('/login');
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
        <div class="login-mask">
            <div class="flex flex-1 flex-center">
				<div class="login-image mr-10" v-if="Image">
					<img :src="Image" alt="logo" class="login-image">
				</div>
                <el-form ref="loginFormRef" :model="form" :rules="rules" class="login-form bg-filter" label-position="top"
                    hide-required-asterisk :show-message="false" @submit.prevent="register" autocomplete="nope">
                    <div class="text-center p-5">
                        <div class="h6 font-weight-600">{{WEBCONFIG.register?.title}}</div>
                        <div class="h10 pt-3">{{ WEBCONFIG.title }}</div>
                    </div>
                    <div class="flex-1 w-60 mx-auto flex flex-center flex-column">
                        <el-form-item label="手机号" class="w-100" prop="username">
                            <el-input v-model="form.username" maxlength="11" placeholder="手机号" size="large"></el-input>
                        </el-form-item>
                        <el-form-item label="图形验证码" class="w-100" prop="captcha">
                            <el-input v-model="form.captcha" placeholder="图形验证码" size="large">
                                <template #append>
									<captcha @change="captchaChange" bg="52,52,52"></captcha>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="短信验证码" class="w-100" prop="vcode">
                            <el-input v-model="form.vcode" placeholder="短信验证码" size="large" maxlength="6">
                                <template #append>
                                    <div class="px-3">
                                        <el-link
                                            @click="getVcode({ username: form.username, token: form.token, captcha: form.captcha,scene:'register' })"
                                            :type="isDisabled ? 'info' : 'primary'" target="_blank" :underline="false">{{
                                                vcodeText }}</el-link>
                                    </div>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="密码" class="w-100" prop="password">
                            <el-input type="password" show-password v-model="form.password" placeholder="密码"
                                size="large"></el-input>
                        </el-form-item>
                    </div>
                    <div class="p-4 flex flex-center mb-10">
                        <button class="login-button">注册</button>
                    </div>
                    <div class="py-4 flex flex-center text-info">
                        <el-link href="#/login" type="primary" :underline="false">已有账号？立即登录</el-link>
                    </div>
                    <div class="py-4 flex flex-center text-dark" v-if="WEBCONFIG.register?.user_agreement">
                        <span>点击“注册”即代表你已阅读并同意</span>
                        <el-link :href="WEBCONFIG.register?.user_agreement" type="primary" target="_blank" :underline="false">《用户协议》</el-link>
                    </div>
                </el-form>
            </div>
            <div class="bg-filter bg-mask-light">
                <copyright class="flex-y-center"></copyright>
            </div>
        </div>
    </div>
</template>

<style>
@import "@/pages/login/login.css";
</style>