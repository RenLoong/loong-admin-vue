import { ElMessageBox } from "element-plus";
import config from "./config";
import axios, { AxiosResponse, AxiosError } from "axios";
import { useUserStore, useWebConfigStore } from "@/stores";
import { getRoundImage } from "@/common/functions";
export const useStorage = () => {
    /**
     * 设置储存数据
     * @param key 键
     * @param data 值
     * @param expire 过期时间（秒）
     * @returns Promise
     */
    const set = (key: string, data: StorageInterface, expire?: number): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const obj = {
                expire: 0,
                data: data,
            }
            if (expire !== undefined) {
                obj.expire = Date.now() + expire * 1000
            }
            config.storage.setItem(getKey(key), JSON.stringify(obj));
            if (get(key) === null) {
                reject();
            } else {
                resolve(true);
            }
        })
    }
    /**
     * 获取储存数据
     * @param key 键
     * @returns StorageInterface
     */
    const get = (key: string): StorageInterface => {
        const data = config.storage.getItem(getKey(key));

        if (data === null) {
            return null;
        }
        const ret = JSON.parse(data);

        if (ret?.expire > 0 && ret?.expire < Date.now()) {
            return null;
        }
        return ret?.data;
    }
    /**
     * 删除储存数据
     * @param key 键
     * @returns Promise
     */
    const remove = (key: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            config.storage.removeItem(getKey(key));
            if (get(key) === null) {
                resolve(true);
            } else {
                reject();
            }
        })
    }
    /**
     * 获取数据并删除
     * @param key 键
     * @returns StorageInterface
     */
    const getOnce = (key: string): StorageInterface => {
        const data = get(key);
        remove(key);
        return data;
    }
    /**
     * 获取真实存储键名
     * @param key 键
     * @returns string
     */
    const getKey = (key: string): string => {
        return `${config.storagePrefix}.${key}`;
    }
    return { set, get, remove, getOnce, getKey };
}
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
        switch(response?.data?.code)
        {
            case $http.ResponseCode.NEED_LOGIN:
                userStore.clearUserInfo();
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
        }
        return response.data;
    }
}, (error: AxiosError) => {
    if (import.meta.env.DEV) {
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
        SUCCESS_EVENT_PUSH: 201,
        NEED_LOGIN: 12000,
        PAY_SUCCESS: 9000,
        REDIRECT: 302,
        REDIRECT_CONFIRM: 303,
        NO_PERMISSION: 403
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
                    h('div', {class:'text-break-all'}, value)
                ]))
            }
        }
    }
    ElMessageBox({
        title: '错误',
        message: h('div', {}, content),
    })
}
export const useLoginImageBuild = () => {
    const { WEBCONFIG } = useWebConfigStore();
    const Image = ref<string>('');
    const BgImage = ref<string>('./static/bg.jpg');
    let BgImageEr: NodeJS.Timeout | undefined;
    const getLoginBg = () => {
        getRoundImage().then((res: any) => {
            BgImage.value = res.blob;
        })
    }
    onMounted(() => {
        switch (WEBCONFIG.login?.bg_image) {
            case 'off':
                BgImage.value = '';
                break;
            case 'auto':
                BgImageEr = setInterval(() => {
                    getLoginBg();
                }, 30000)
                break;
            default:
                if (WEBCONFIG.login) {
                    if (Array.isArray(WEBCONFIG.login?.bg_image)) {
                        BgImageEr = setInterval(() => {
                            if (WEBCONFIG.login) {
                                BgImage.value = WEBCONFIG.login?.bg_image[Math.floor(Math.random() * WEBCONFIG.login?.bg_image.length)];
                            }
                        }, 30000)
                    } else {
                        BgImage.value = WEBCONFIG.login?.bg_image;
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