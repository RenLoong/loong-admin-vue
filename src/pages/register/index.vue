<script setup lang="ts">
import { $http, useLoginImageBuild } from "@/common";
import { useVcode } from "@/common/functions/vcode";
import router from "@/routers";
import { useRefs, useStateStore, useWebConfigStore } from "@/stores";
import { FormInstance, FormRules, ElMessage, ElMessageBox } from "element-plus";
import { i18n } from '@/locale';
const { t } = i18n.global;

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
        { required: true, message: t('register.rules.username'), trigger: 'blur' }
    ],
    password: [
        { required: true, message: t('register.rules.password'), trigger: 'blur' }
    ],
});
const register = () => {
    loginFormRef.value?.validate((valid: boolean) => {
        if (valid) {
            $http.post(WEBCONFIG.value.register?.url, form).then((res: any) => {
                if (res?.code === $http.ResponseCode.SUCCESS) {
                    router.push('/login');
                } else if (res.code === $http.ResponseCode.REDIRECT_CONFIRM) {
                    ElMessageBox.confirm(res.msg, t('message.tips'), {
                        confirmButtonText: res.data.confirmButtonText || t('button.redirectText'),
                        cancelButtonText: t('button.cancelText'),
                        type: 'warning'
                    }).then(() => {
                        globalThis.location.href = res.data.url;
                    })
                } else if (res.code === $http.ResponseCode.REDIRECT) {
                    globalThis.location.href = res.data.url;
                } else {
                    ElMessage.info(res.msg);
                }
            })
        } else {
            ElMessage.error(t('form.rules.warning'));
        }
    })
}
const captchaChange = (token: string) => {
    form.token = token;
    form.captcha = '';
}
const { BgImage, Image } = useLoginImageBuild();
const stateStore = useStateStore();
const setLanguare = (lang: LanguageInterface) => {
    stateStore.setState('language', lang);
    document.documentElement.setAttribute('lang', lang);
    nextTick(() => {
        globalThis.location.reload();
    })
}
onMounted(() => {
    if (WEBCONFIG.value.register?.path && WEBCONFIG.value.register?.path !== globalThis.location.href) {
        globalThis.location.href = WEBCONFIG.value.register?.path;
    }
})
</script>

<template>
    <div class="login" :style="[BgImage ? `backgroundImage:url(${BgImage})` : '']">
        <div class="login-mask">
            <div class="languare pointer px-3 flex flex-center">
                <el-popover placement="bottom-end">
                    <template #reference>
                        <el-icon size="20">
                            <Language />
                        </el-icon>
                    </template>
                    <template #default>
                        <div class="flex flex-column languare-list">
                            <span class="languare-item" @click="setLanguare(item.value)"
                                v-for="(item, index) in stateStore.LANGUARE" :key="index">{{ item.label }}</span>
                        </div>
                    </template>
                </el-popover>
            </div>
            <div class="flex flex-1 flex-center">
                <div class="login-image mr-10" v-if="Image">
                    <img :src="Image" alt="logo" class="login-image">
                </div>
                <el-form ref="loginFormRef" :model="form" :rules="rules" class="login-form bg-filter"
                    label-position="top" hide-required-asterisk :show-message="false" @submit.prevent="register"
                    autocomplete="nope">
                    <div class="text-center p-5">
                        <div class="h6 font-weight-600">{{ WEBCONFIG.register?.title }}</div>
                        <div class="h10 pt-3">{{ WEBCONFIG.web_title }}</div>
                    </div>
                    <div class="flex-1 w-60 mx-auto flex flex-center flex-column">
                        <el-form-item :label="t('register.label.username')" class="w-100" prop="username">
                            <el-input v-model="form.username" maxlength="11"
                                :placeholder="t('register.usernamePlaceholder')" size="large"></el-input>
                        </el-form-item>
                        <el-form-item :label="t('register.label.captcha')" class="w-100" prop="captcha">
                            <el-input v-model="form.captcha" :placeholder="t('register.captchaPlaceholder')"
                                size="large">
                                <template #append>
                                    <captcha @change="captchaChange" bg="52,52,52"></captcha>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item :label="t('register.label.vcode')" class="w-100" prop="vcode">
                            <el-input v-model="form.vcode" :placeholder="t('register.vcodePlaceholder')" size="large"
                                maxlength="6">
                                <template #append>
                                    <div class="px-3">
                                        <el-link
                                            @click="getVcode({ username: form.username, token: form.token, captcha: form.captcha, scene: 'register' })"
                                            :type="isDisabled ? 'info' : 'primary'" target="_blank" underline="never">{{
                                                vcodeText }}</el-link>
                                    </div>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item :label="t('register.label.password')" class="w-100" prop="password">
                            <el-input type="password" show-password v-model="form.password"
                                :placeholder="t('register.passwordPlaceholder')" size="large"></el-input>
                        </el-form-item>
                    </div>
                    <div class="p-4 flex flex-center mb-10">
                        <button class="login-button">{{ t('button.registerText') }}</button>
                    </div>
                    <div class="py-4 flex flex-center text-info" v-if="WEBCONFIG.login.link_text">
                        <el-link :href="WEBCONFIG.login.path ? WEBCONFIG.login.path : '#/login'" type="primary"
                            underline="never">{{
                                WEBCONFIG.login.link_text }}</el-link>
                    </div>
                    <div class="py-4 flex flex-center text-dark" v-if="WEBCONFIG.register?.user_agreement">
                        <template v-if="WEBCONFIG.register.user_agreement_config">
                            <span>{{ WEBCONFIG.register.user_agreement_config.label }}</span>
                            <el-link :href="WEBCONFIG.register?.user_agreement" type="primary" target="_blank"
                                underline="never">{{ WEBCONFIG.register.user_agreement_config.title }}</el-link>
                        </template>
                        <template v-else>
                            <span>点击"注册"即代表你已阅读并同意</span>
                            <el-link :href="WEBCONFIG.register?.user_agreement" type="primary" target="_blank"
                                underline="never">《用户协议》</el-link>
                        </template>
                    </div>
                </el-form>
            </div>
            <div class="bg-filter bg-mask-light">
                <layouts-copyright class="flex-y-center" />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@use "@/pages/login/login.css";

.login {
    .languare {
        position: absolute;
        right: 20px;
        top: 20px;
    }
}
</style>