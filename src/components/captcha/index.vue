<script setup lang="ts">
import { $http } from '@/common';
const props = withDefaults(defineProps<{
    bg?: string,
}>(), {
    bg: '255,255,255'
});
const imgBase64Data = ref();
onMounted(() => {
    getCaptcha();
})
const emit = defineEmits(['change'])
const getCaptcha = () => {
    $http.get('captcha/captchaCode', {
        params: {
            bg: props.bg,
            t: Date.now()
        }
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            imgBase64Data.value = res.data.imag;
            emit('change', res.data.token);
        }
    })
}
</script>

<template>
    <img :src="imgBase64Data" v-if="imgBase64Data" title="点击切换验证码" @click="getCaptcha" class="pointer">
</template>

<style scoped></style>