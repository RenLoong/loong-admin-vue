import { ElEmpty, ElInput, ElMessage, ElMessageBox } from 'element-plus';
import components, { componentsType } from '@/layouts'
import { $http } from '..';
import router from '@/routers';
import { useUserStore, useWebConfigStore } from '@/stores';
import { RouteRecordNormalized } from 'vue-router';
import { i18n } from '@/locale';
import { getTableValue } from '.';
const { t } = i18n.global;
interface UseClickOptionsInterface {
    model: '' | 'redirect' | 'link' | 'comfirm' | 'dialog' | 'dialogTable' | 'Lock' | 'Search' | 'Notification' | 'FullScreen' | 'OutLogin';
    path: string;
    props?: any;
    data?: any;
    query?: any;
    [key: string]: any;
}
export const useClick = (options: UseClickOptionsInterface) => {
    const currentRoute = router.currentRoute.value;
    let messageProps = {
        ...options.props
    };
    const { WEBCONFIG } = useWebConfigStore();
    let path = options.path;
    if (!options.path?.startsWith('/')) {
        path = `/${options.path}`;
    }
    return new Promise((resolve, reject) => {
        switch (options.model) {
            case 'Lock':
                ElMessageBox({
                    title: t('lock.title'),
                    cancelButtonText: t('lock.cancelText'),
                    confirmButtonText: t('lock.confirmText'),
                    showClose: false,
                    showCancelButton: true,
                    closeOnClickModal: false,
                    buttonSize: 'small',
                    customClass: 'el-messagebox-width',
                    ...messageProps,
                    showInput: true,
                    inputType: 'number',
                    inputPattern: /^\d{6}$/,
                    inputPlaceholder: t('lock.inputPlaceholder'),
                    inputErrorMessage: t('lock.inputErrorMessage'),
                    beforeClose: (action: string, instance: { confirmButtonLoading: boolean; inputValue: string }, done: () => void) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true
                            $http.post(WEBCONFIG.apis.lock, { password: instance.inputValue }).then((res: any) => {
                                if (res.code === $http.ResponseCode.SUCCESS) {
                                    done()
                                    resolve(true);
                                } else {
                                    ElMessage.error(res.msg);
                                }
                            }).catch(() => {
                            }).finally(() => {
                                instance.confirmButtonLoading = false
                            })
                        } else {
                            reject();
                            done()
                        }
                    },
                }).then(() => {
                }).catch(() => {
                })
                break;
            case 'Search':
                const list = router.getRoutes();
                const result = ref<RouteRecordNormalized[]>([]);
                const keyword = ref('');
                const { hasPermission } = useUserStore()
                ElMessageBox({
                    showConfirmButton: false,
                    showCancelButton: false,
                    customStyle: {
                        '--el-messagebox-width': '560px',
                        position: 'absolute',
                        top: '10vh',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    },
                    customClass: 'el-messagebox-width rounded-6',
                    ...messageProps,
                    message: () => h('div', {
                        class: 'flex flex-column'
                    }, [
                        h(ElInput, {
                            modelValue: keyword.value,
                            size: 'large',
                            prefixIcon: 'Search',
                            clearable: true,
                            placeholder: t('form.placeholder.searchMenu'),
                            onInput: (val: string) => {
                                keyword.value = val;
                                if (val) {
                                    val = val.toLocaleLowerCase();
                                    result.value = list.filter((item: any) => {
                                        return item.meta.title.toLocaleLowerCase().includes(val) && hasPermission(item.path)
                                    });
                                } else {
                                    result.value = [];
                                }
                            }
                        }),
                        h('div', {}, [
                            result.value.length > 0 ?
                                h('div', {
                                    class: 'p-4 flex flex-column'
                                }, result.value.map((item: any) => {
                                    return h('div', {
                                        class: 'shadow-lighter rounded-6 pointer p-4 mt-4 hover-bg-primary-light-9',
                                        onClick: () => {
                                            ElMessageBox.close();
                                            router.push(item);
                                        }
                                    }, [
                                        h('div', {
                                            class: 'font-weight-600 mb-2'
                                        }, item.meta.title),
                                        h('div', {
                                            class: 'text-info h9'
                                        }, item.path),
                                    ])
                                })) :
                                h(ElEmpty, {
                                    description: t('message.searchMenuNotContent')
                                })
                        ])
                    ]),
                }).then(() => {
                }).catch(() => { });
                break;
            case 'Notification':
                break;
            case 'FullScreen':
                // 浏览器全屏
                if (document.fullscreenElement) {
                    document.exitFullscreen().then(() => { }).catch(() => {
                        ElMessage.error(t('message.exitFullscreenError'));
                    });
                } else {
                    document.documentElement.requestFullscreen().then(() => { }).catch(() => {
                        ElMessage.error(t('message.requestFullscreenError'));
                    });
                }
                break;
            case 'OutLogin':
                ElMessageBox({
                    title: t('message.title'),
                    cancelButtonText: t('button.cancelText'),
                    confirmButtonText: t('button.logoutText'),
                    showClose: false,
                    showCancelButton: true,
                    closeOnClickModal: false,
                    customClass: 'el-messagebox-width',
                    message: () => h('div', {}, t('message.confirmLogoutContent')),
                    ...messageProps,
                    beforeClose: (action: string, instance: { confirmButtonLoading: boolean; }, done: () => void) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true
                            if (WEBCONFIG.apis.outLogin) {
                                $http.post(WEBCONFIG.apis.outLogin, options.query).then((res: any) => {
                                    if (res.code === $http.ResponseCode.SUCCESS) {
                                        done()
                                        ElMessage.success(res.msg);
                                        useUserStore().clearUserInfo();
                                        resolve(true);
                                    } else {
                                        reject();
                                        ElMessage.error(res.msg);
                                    }
                                }).catch(() => {
                                    reject();
                                }).finally(() => {
                                    instance.confirmButtonLoading = false
                                })
                            } else {
                                useUserStore().clearUserInfo();
                                resolve(true);
                                done()
                            }
                        } else {
                            reject();
                            done()
                        }
                    },
                }).then(() => {
                }).catch(() => { })
                break;
            case 'comfirm':
                if (messageProps.title) {
                    const matches = [...messageProps.title.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
                    if (matches.length) {
                        let d: any = {};
                        for (let i = 0; i < matches.length; i++) {
                            const key = matches[i];
                            d[key] = getTableValue(options.data, key) ?? key;
                        }
                        for (let key in d) {
                            messageProps.title = messageProps.title.replace(new RegExp(`{${key}}`, 'g'), d[key]);
                        }
                    }
                }
                if (messageProps.message) {
                    const matches = [...messageProps.message.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
                    if (matches.length) {
                        let d: any = {};
                        for (let i = 0; i < matches.length; i++) {
                            const key = matches[i];
                            d[key] = getTableValue(options.data, key) ?? key;
                        }
                        for (let key in d) {
                            messageProps.message = messageProps.message.replace(new RegExp(`{${key}}`, 'g'), d[key]);
                        }
                    }
                }
                ElMessageBox({
                    title: t('message.title'),
                    cancelButtonText: t('button.cancelText'),
                    showClose: false,
                    showCancelButton: true,
                    closeOnClickModal: false,
                    customClass: 'el-messagebox-width',
                    message: () => h('div', {}, t('message.confirmActionContent')),
                    ...messageProps,
                    beforeClose: (action: string, instance: { confirmButtonLoading: boolean; }, done: () => void) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true
                            $http.post(options.path, options.query).then((res: any) => {
                                if (res.code === $http.ResponseCode.SUCCESS) {
                                    done()
                                    ElMessage.success(res.msg);
                                    resolve(res.data);
                                } else {
                                    reject();
                                    ElMessage.error(res.msg);
                                }
                            }).catch(() => {
                                reject();
                            }).finally(() => {
                                instance.confirmButtonLoading = false
                            })
                        } else {
                            reject();
                            done()
                        }
                    },
                }).then(() => {
                }).catch(() => { })
                break;
            case 'dialog':
                if (messageProps.title) {
                    const matches = [...messageProps.title.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
                    if (matches.length) {
                        let d: any = {};
                        for (let i = 0; i < matches.length; i++) {
                            const key = matches[i];
                            d[key] = getTableValue(options.data, key) ?? key;
                        }
                        for (let key in d) {
                            messageProps.title = messageProps.title.replace(new RegExp(`{${key}}`, 'g'), d[key]);
                        }
                    }
                }
                const findRouter = router.getRoutes().find((item) => item.path === path);
                const loading=ref();
                const ElMessageBoxOptions = {
                    title: t('message.title'),
                    cancelButtonText: t('button.cancelText'),
                    draggable: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                    closeOnClickModal: false,
                    showClose: !['formComponent'].includes(findRouter?.meta.component as string),
                    customStyle: {
                        '--el-messagebox-width': '60%',
                        '--el-dialog-border-radius': '10px'
                    },
                    customClass: 'el-messagebox-width action-dialog',
                    ...messageProps,
                    message: () => h(findRouter ? components[findRouter.meta.component as componentsType] : components.defaultComponent, {
                        params: {
                            api: options.path,
                            query: options.query,
                            params: options.props.params,
                        },
                        showSubmitItem: false,
                        showDialogSubmit: true,
                        onConfirm: () => {
                            resolve(true);
                            // ElMessageBox.close();
                            ElMessageBoxOptions.onVanish?.()
                        },
                        onCannel: () => {
                            reject();
                            // ElMessageBox.close();
                            ElMessageBoxOptions.onVanish?.()
                        },
                        onLoading:(val:boolean)=>{
                            loading.value=val;
                        }
                    }),
                    beforeClose: (_action: any, _instance: any, done: any) => {
                        if(loading.value)return;
                        done();
                        reject();
                    }
                };
                ElMessageBox(ElMessageBoxOptions).then(() => { }).catch(() => { })
                break;
            case 'redirect':
                if (!options.path) {
                    return;
                }
                router.push({
                    path,
                    query: options.query
                });
                break;
            case 'link':
                console.log(options);
                if (options.props?.url) {
                    window.open(options.props?.url, options.props?.target || '_self', options.props?.features);
                }
                break;
            default:
                options.query.back = currentRoute.fullPath;
                options.query.routerName = currentRoute.name;
                if (!options.path) {
                    return;
                }
                router.push({
                    path,
                    query: options.query
                });
                break;
        }
    });
}