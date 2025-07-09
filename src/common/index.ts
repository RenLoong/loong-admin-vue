import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import config, { useStorage } from "./config";
import axios, { AxiosResponse, AxiosError } from "axios";
import { useRefs, useStateStore, useUserStore, useWebConfigStore } from "@/stores";
import { getRoundImage } from "@/common/functions";
import { useClick } from '@/common/functions/action';
import { i18n } from '@/locale';
const {t} = i18n.global;
let baseURL = globalThis.location.origin + '/'
if (import.meta.env.DEV) {
    baseURL = baseURL + 'local/'
} else if (import.meta.env.VITE_REQUEST_BASE_URL) {
    baseURL = import.meta.env.VITE_REQUEST_BASE_URL
}
const getCompleteUrl = (path: string) => {
    // 判断url是否不以“/”开头
    if (path?.startsWith('/')) {
        return `${baseURL}${path}`;
    } else {
        return `${baseURL}${config.URLModule}/${path}`;
    }
}
axios.interceptors.request.use((_config) => {
    const { hasLogin, getToken } = useUserStore();
    if (hasLogin()) {
        _config.headers.set('Authorization', getToken());
    }
    const storage = useStorage();
    if (storage.get('ICODE')) {
        _config.headers.set('X-ICODE', storage.get('ICODE') as string);
    }
    _config.headers.set('X-Platform', 'pc');
    const stateStore = useStateStore();
    const { STATE } = useRefs(stateStore);
    const lang=STATE.value.language;
    _config.headers.set('Accept-Language', lang);
    _config.headers.set('lang', lang);
    if(import.meta.env.DEV){
        _config.headers.set('xhadmin-developer', 'true');
    }
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
                    title: t('message.tips'),
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
                throw new AxiosError(`[${response.data.code}]${response.data.msg}`, 'ERR_CANCELED');
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
    if (import.meta.env.PROD) return;
    const content = [];
    if (res.code) {
        content.push(h('div', { class: 'flex py-2' }, [
            h('div', { class: 'text-grey text-right mr-2', style: { width: '100px' } }, t('message.error_code')),
            h('div', {}, res.code)
        ]))
    }
    content.push(h('div', { class: 'flex py-2' }, [
        h('div', { class: 'text-grey text-right mr-2', style: { width: '100px' } }, t('message.error_text')),
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
        title: t('message.error'),
        message: h('div', {}, content),
    })
}
export const showUnlockBox = () => {
    const { WEBCONFIG } = useWebConfigStore();
    ElMessageBox({
        title: t('unlock.title'),
        confirmButtonText: t('unlock.confirmText'),
        confirmButtonClass: 'el-button--success is-text is-has-bg',
        cancelButtonText: t('unlock.cancelText'),
        cancelButtonClass: 'el-button--danger is-text is-has-bg',
        showClose: false,
        showCancelButton: true,
        closeOnClickModal: false,
        buttonSize: 'small',
        customClass: 'el-messagebox-width',
        showInput: true,
        inputType: 'number',
        inputPattern: /^\d{6}$/,
        inputPlaceholder: t('unlock.inputPlaceholder'),
        inputErrorMessage: t('unlock.inputErrorMessage'),
        beforeClose: (action: string, instance: { confirmButtonLoading: boolean; inputValue: string }, done: () => void) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true
                $http.post(WEBCONFIG.apis.unlock, { password: instance.inputValue }).then((res: any) => {
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
                    model: 'OutLogin',
                    path: ''
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