<script lang="ts" setup>
import { $http, showErrorBox } from '@/common';
import { CancelTokenSource } from 'axios';
import { useI18n } from 'vue-i18n';
const {t} = useI18n();
const props = withDefaults(defineProps<{
    url: string,
    check:string,
    size?:number|string
}>(), {
    size:200
});
const emit = defineEmits(['success']);
const form=ref({
    id:''
});
const qrcode_content=ref();
onMounted(()=>{
    getQrcode();
});
let Inter:NodeJS.Timeout|undefined;
const expire=ref();
const getQrcode=()=>{
    if(Inter){
        clearInterval(Inter);
        Inter=undefined;
    }
    showError.value=undefined;
    $http.get(props.url).then((res:any)=>{
        if(res.code===200){
            form.value.id=res.data.id;
            qrcode_content.value=res.data.qrcode;
            if(res.data.expire){
                expire.value=res.data.expire;
                Inter=setInterval(()=>{
                    expire.value--;
                    if(!expire.value){
                        setQrcodeExpire(t('message.qrcodeExpireContent'));
                    }
                },1000);
            }
        }else{
            setQrcodeExpire(res.msg);
        }
    }).catch(()=>{
        setQrcodeExpire(t('message.getQrcodeFail'));
    });
}
let timer:NodeJS.Timeout|undefined;
const CancelToken = $http.axios.CancelToken;
let source:CancelTokenSource|undefined;
const checkLogin=()=>{
    if(timer){
        clearTimeout(timer);
        if(source){
            source.cancel(t('message.userCannel'));
        }
    }
    timer=undefined;
    source = CancelToken.source();
    $http.post(props.check,form.value, {
    cancelToken: source.token
    }).then((res:any)=>{
        source=undefined;
        if(res.code===$http.ResponseCode.SUCCESS){
            emit('success',res);
        }else if(res.code===$http.ResponseCode.WAIT){
            timer=setTimeout(()=>{
                checkLogin();
            },1000);
        }else{
            setQrcodeExpire(res.msg);
        }
    }).catch((error)=>{
        if(error.code!='ERR_CANCELED'){
            showErrorBox({
                code: error.code,
                msg: error.message,
                data: {
                    method: error.config?.method,
                    url: error.config?.url,
                }
            });
        }
    });
}
const showError=ref();
const setQrcodeExpire=(msg:string)=>{
    if(Inter){
        clearInterval(Inter);
        Inter=undefined;
    }
    expire.value=undefined;
    showError.value=msg;
}
onUnmounted(()=>{
    if(timer){
        clearTimeout(timer);
    }
    if(Inter){
        clearInterval(Inter);
    }
    if(source){
        source.cancel(t('message.userCannel'));
    }
});
</script>
<template>
    <div class="flex flex-column flex-y-center">
        <div class="qrcode" :style="[`width:${props.size}px;height:${props.size}px;`]">
            <xl-qrcode :text="qrcode_content" :size="Number(props.size)" @update="checkLogin"></xl-qrcode>
            <div class="error flex flex-column flex-center grid-gap-4" :class="{'show':showError}">
                <el-icon size="40" color="var(--el-color-danger)">
                    <CircleClose/>
                </el-icon>
                <div class="text-white">{{showError}}</div>
                <el-link type="primary" @click="getQrcode" underline="never">{{ t('button.retryText') }}</el-link>
            </div>
        </div>
        <div v-if="expire" class="h10 text-grey text-center mt-2">{{ t('message.qrcodeWillExpireContent',{time:expire}) }}</div>
    </div>
</template>
<style lang="scss" scoped>
.qrcode{
    position: relative;
}
.error{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.75);
    display: none;
    &.show{
        display: flex;
    }
}
</style>