import { ElEmpty, ElInput, ElMessage, ElMessageBox } from 'element-plus';
import components, { componentsType } from '@/layouts'
import { $http } from '..';
import router from '@/routers';
import { useUserStore, useWebConfigStore } from '@/stores';
import { RouteRecordNormalized } from 'vue-router';
interface UseClickOptionsInterface {
    model: '' | 'redirect' | 'comfirm' | 'dialog' | 'dialogTable' | 'Lock' | 'Search' | 'Notification' | 'FullScreen' | 'OutLogin';
    path: string;
    props?: any;
    data?: any;
    query?: any;
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
                    title: '设置PIN码锁定',
                    cancelButtonText: '取消',
                    confirmButtonText: '锁定',
                    showClose: false,
                    showCancelButton: true,
                    closeOnClickModal: false,
                    buttonSize:'small',
                    customClass: 'el-messagebox-width',
                    ...messageProps,
                    showInput: true,
                    inputType:'number',
                    inputPattern:/^\d{6}$/,
                    inputPlaceholder:'请输入6位数字PIN码',
                    inputErrorMessage:'请输入6位数字PIN码',
                    beforeClose: (action: string, instance: { confirmButtonLoading: boolean;inputValue:string }, done: () => void) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true
                            $http.post(WEBCONFIG.apis.lock, {password:instance.inputValue}).then((res: any) => {
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
                const result=ref<RouteRecordNormalized[]>([]);
                const keyword=ref('');
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
                    customClass: 'el-messagebox-width',
                    ...messageProps,
                    message: () => h('div', {
                        class:'flex flex-column'
                    }, [
                        h(ElInput,{
                            modelValue:keyword.value,
                            size:'large',
                            prefixIcon:'Search',
                            clearable:true,
                            placeholder:'输入关键字搜索，按下ESC键关闭',
                            onInput:(val:string)=>{
                                keyword.value=val;
                                if(val){
                                    val=val.toLocaleLowerCase();
                                    result.value=list.filter((item:any)=>{
                                        return item.meta.title.toLocaleLowerCase().includes(val)&&hasPermission(item.path)
                                    });
                                }else{
                                    result.value=[];
                                }
                            }
                        }),
                        h('div',{},[
                            result.value.length>0?
                            h('div',{
                                class:'p-4 flex flex-column'
                            },result.value.map((item:any)=>{
                                return h('div',{
                                    class:'shadow-lighter rounded-lg pointer p-4 mt-4 hover-bg-primary-light-9',
                                    onClick:()=>{
                                        ElMessageBox.close();
                                        router.push(item);
                                    }
                                },[
                                    h('div',{
                                        class:'font-weight-600 mb-2'
                                    },item.meta.title),
                                    h('div',{
                                        class:'text-info h9'
                                    },item.path),
                                ])
                            })):
                            h(ElEmpty,{
                                description:'没有找到相关内容'
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
                    document.exitFullscreen().then(() => {}).catch(() => {
                        ElMessage.error('退出全屏失败，按F11退出全屏');
                    });
                } else {
                    document.documentElement.requestFullscreen().then(() => {}).catch(() => {
                        ElMessage.error('全屏失败，按F11全屏');
                    });
                }
                break;
            case 'OutLogin':
                ElMessageBox({
                    title: '温馨提示',
                    cancelButtonText: '取消',
                    confirmButtonText: '退出登录',
                    showClose: false,
                    showCancelButton: true,
                    closeOnClickModal: false,
                    customClass: 'el-messagebox-width',
                    message: () => h('div', {}, '确定退出登录吗？'),
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
                    if (!Array.isArray(options.data)) {
                        for (let key in options.data) {
                            messageProps.title = messageProps.title.replace(new RegExp(`{${key}}`, 'g'), options.data[key]);
                        }
                    }
                }
                if (messageProps.message) {
                    if (!Array.isArray(options.data)) {
                        for (let key in options.data) {
                            messageProps.message = messageProps.message.replace(new RegExp(`{${key}}`, 'g'), options.data[key]);
                        }
                    }
                }
                ElMessageBox({
                    title: '温馨提示',
                    cancelButtonText: '取消',
                    showClose: false,
                    showCancelButton: true,
                    closeOnClickModal: false,
                    customClass: 'el-messagebox-width',
                    message: () => h('div', {}, '您确定要执行此操作吗？'),
                    ...messageProps,
                    beforeClose: (action: string, instance: { confirmButtonLoading: boolean; }, done: () => void) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true
                            $http.post(options.path, options.query).then((res: any) => {
                                if (res.code === $http.ResponseCode.SUCCESS) {
                                    done()
                                    ElMessage.success(res.msg);
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
                            reject();
                            done()
                        }
                    },
                }).then(() => {
                }).catch(() => { })
                break;
            case 'dialog':
                if (messageProps.title) {
                    if (!Array.isArray(options.data)) {
                        for (let key in options.data) {
                            messageProps.title = messageProps.title.replace(new RegExp(`{${key}}`, 'g'), options.data[key]);
                        }
                    }
                }
                const findRouter = router.getRoutes().find((item) => item.path === path);

                ElMessageBox({
                    title: '温馨提示',
                    cancelButtonText: '取消',
                    showClose: true,
                    draggable: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                    closeOnClickModal: false,
                    customStyle: {
                        '--el-messagebox-width': '60%'
                    },
                    customClass: 'el-messagebox-width',
                    ...messageProps,
                    message: () => h(findRouter ? components[findRouter.meta.component as componentsType] : components.defaultComponent, {
                        params: {
                            api: options.path,
                            query: options.query,
                            params: options.props.params,
                        },
                        onConfirm: () => {
                            resolve(true);
                            ElMessageBox.close();
                        }
                    }),
                    beforeClose: (_action, _instance, done) => {
                        done();
                        reject();
                    }
                }).then(() => { }).catch(() => { })
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