import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import config, { useStorage } from "./config";
import axios, { AxiosResponse, AxiosError } from "axios";
import { useRefs, useUserStore, useWebConfigStore } from "@/stores";
import { getRoundImage } from "@/common/functions";
import { useClick } from '@/common/functions/action';
let baseURL = globalThis.location.origin + '/'
if (import.meta.env.DEV) {
    baseURL = baseURL + 'local/'
}
const getCompleteUrl = (url: string) => {
    // 判断url是否不以“/”开头
    if (url.startsWith('/')) {
        return `${baseURL}${url}`;
    } else {
        return `${baseURL}${config.URLModule}/${url}`;
    }
}
axios.interceptors.request.use((_config) => {
    const { hasLogin, getToken } = useUserStore();
    if (hasLogin()) {
        _config.headers.set('Authorization', getToken());
    }
    const storage=useStorage();
    if(storage.get('ICODE')){
        _config.headers.set('X-ICODE', storage.get('ICODE') as string);
    }
    _config.headers.set('X-Platform', 'pc');
    // 判断url是否不以“/”开头
    if (!_config.url?.startsWith('/')) {
        _config.baseURL = (baseURL + config.URLModule);
    } else {
        _config.baseURL = baseURL;
    }
    return _config;
}, (error) => {
    return Promise.reject(error);
});
axios.interceptors.response.use((response: AxiosResponse) => {
    if (response?.data !== undefined) {
        const userStore = useUserStore()
        switch (response?.data?.code) {
            case $http.ResponseCode.NEED_LOGIN:
                userStore.clearUserInfo();
                ElNotification({
                    title: '提示',
                    message: `[${response.data.code}]${response.data.msg}`,
                    type: 'error',
                })
                break;
            case $http.ResponseCode.SUCCESS_EVENT_PUSH:
                response.data.code = $http.ResponseCode.SUCCESS;
                if (response.data.data.event) {
                    if (Array.isArray(response.data.data.event)) {
                        response.data.data.event.forEach((e: string) => {
                            $eventBus.emit(e);
                        })
                    } else {
                        $eventBus.emit(response.data.data.event);
                    }
                }
                break;
            case $http.ResponseCode.NO_PERMISSION:
                showErrorBox(response.data);
                break;
            case $http.ResponseCode.LOCK:
                showUnlockBox();
                throw new AxiosError(`[${response.data.code}]${response.data.msg}`,'ERR_CANCELED');
                break;
        }
        return response.data;
    }
}, (error: AxiosError) => {
    if (import.meta.env.DEV && error.code != 'ERR_CANCELED') {
        showErrorBox({
            code: error.code,
            msg: error.message,
            data: {
                method: error.config?.method,
                url: error.config?.url,
            }
        });
    }
    return Promise.reject(error);
});
export const $http = {
    ResponseCode: {
        SUCCESS: 200,
        WAIT: 202,
        SUCCESS_EVENT_PUSH: 201,
        NEED_LOGIN: 12000,
        PAY_SUCCESS: 9000,
        REDIRECT: 302,
        REDIRECT_CONFIRM: 303,
        NO_PERMISSION: 403,
        LOCK: 423,
    },
    getCompleteUrl,
    get: axios.get,
    post: axios.post,
    axios
}
const eventOn = (event: string, callback: Function) => {
    globalThis.addEventListener(event, (e: any) => {
        callback(e.detail)
    })
}
const eventRemove = (event: string, callback: Function) => {
    globalThis.removeEventListener(event, (e: any) => {
        callback(e.detail)
    })
}
const eventEmit = (event: string, data?: any) => {
    globalThis.dispatchEvent(new CustomEvent(event, { detail: data }))
}
export const $eventBus = {
    on: eventOn,
    emit: eventEmit,
    remove: eventRemove
}
export const showErrorBox = (res: any) => {
    const content = [];
    if (res.code) {
        content.push(h('div', { class: 'flex py-2' }, [
            h('div', { class: 'text-grey text-right mr-2', style: { width: '100px' } }, '错误码'),
            h('div', {}, res.code)
        ]))
    }
    content.push(h('div', { class: 'flex py-2' }, [
        h('div', { class: 'text-grey text-right mr-2', style: { width: '100px' } }, '错误信息'),
        h('div', {}, res.msg)
    ]))
    if (res.data) {
        for (const key in res.data) {
            if (Object.prototype.hasOwnProperty.call(res.data, key)) {
                const value = res.data[key];
                content.push(h('div', { class: 'flex py-2' }, [
                    h('div', { class: 'text-grey text-right mr-2', style: { width: '100px' } }, key),
                    h('div', { class: 'text-break-all' }, value)
                ]))
            }
        }
    }
    ElMessageBox({
        title: '错误',
        message: h('div', {}, content),
    })
}
export const showUnlockBox = () => {
    const {WEBCONFIG} = useWebConfigStore();
    ElMessageBox({
        title: '输入PIN码解锁',
        confirmButtonText: '解锁',
        confirmButtonClass:'el-button--success is-text is-has-bg',
        cancelButtonText: '退出登录',
        cancelButtonClass:'el-button--danger is-text is-has-bg',
        showClose: false,
        showCancelButton: true,
        closeOnClickModal: false,
        buttonSize:'small',
        customClass: 'el-messagebox-width',
        showInput: true,
        inputType:'number',
        inputPattern:/^\d{6}$/,
        inputPlaceholder:'请输入6位数字PIN码',
        inputErrorMessage:'请输入6位数字PIN码',
        beforeClose: (action: string, instance: { confirmButtonLoading: boolean;inputValue:string }, done: () => void) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true
                $http.post(WEBCONFIG.apis.unlock, {password:instance.inputValue}).then((res: any) => {
                    if (res.code === $http.ResponseCode.SUCCESS) {
                        done()
                    } else {
                        ElMessage.error(res.msg);
                    }
                }).catch(() => {
                }).finally(() => {
                    instance.confirmButtonLoading = false
                })
            } else {
                useClick({
                    model:'OutLogin',
                    path:''
                }).then(() => {
                    done();
                }).catch(() => { })
            }
        },
    }).then(() => {
    }).catch(() => {
    })
}
export const useLoginImageBuild = () => {
    const webConfigStore = useWebConfigStore();
    const { WEBCONFIG } = useRefs(webConfigStore);
    const Image = ref<string>(WEBCONFIG.value.login?.image);
    const BgImage = ref<string>('/static/bg.jpg');
    let BgImageEr: NodeJS.Timeout | undefined;
    const getLoginBg = () => {
        getRoundImage().then((res: any) => {
            BgImage.value = res.blob;
        })
    }
    onMounted(() => {
        switch (WEBCONFIG.value.login?.bg_image) {
            case 'off':
                BgImage.value = '';
                break;
            case 'auto':
                BgImageEr = setInterval(() => {
                    getLoginBg();
                }, 30000)
                break;
            default:
                if (WEBCONFIG.value.login) {
                    if (Array.isArray(WEBCONFIG.value.login?.bg_image)) {
                        BgImageEr = setInterval(() => {
                            if (WEBCONFIG.value.login) {
                                BgImage.value = WEBCONFIG.value.login?.bg_image[Math.floor(Math.random() * WEBCONFIG.value.login?.bg_image.length)];
                            }
                        }, 30000)
                    } else {
                        BgImage.value = WEBCONFIG.value.login?.bg_image;
                    }
                }
                break;
        }
    })
    onUnmounted(() => {
        clearTimer();
    })
    const clear = () => {
        BgImage.value = '';
    }
    const clearTimer = () => {
        if (BgImageEr) {
            clearInterval(BgImageEr);
            BgImageEr = undefined;
        }
    }
    return {
        BgImage,
        Image,
        clear
    };
}