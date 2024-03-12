import { ElMessage, ElMessageBox } from 'element-plus';
import formComponent from '@/layouts/form/index.vue';
import { $http } from '..';
import router from '@/routers';
import { useUserStore, useWebConfigStore } from '@/stores';
interface UseClickOptionsInterface {
    model: '' | 'comfirm' | 'dialog' | 'Lock' | 'Search' | 'Notification' | 'FullScreen'|'OutLogin';
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
    const {WEBCONFIG} = useWebConfigStore();
    return new Promise((resolve, reject) => {
        switch (options.model) {
            case 'Lock':
                break;
            case 'Search':
                break;
            case 'Notification':
                break;
            case 'FullScreen':
                // 浏览器全屏
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
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
                            if(WEBCONFIG.apis.outLogin){
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
                            }else{
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
                if (messageProps.message) {
                    if(!Array.isArray(options.data)){
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
                    if(!Array.isArray(options.data)){
                        for (let key in options.data) {
                            messageProps.message = messageProps.message.replace(new RegExp(`{${key}}`, 'g'), options.data[key]);
                        }
                    }                      
                }
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
                    message: () => h(formComponent, {
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
            default:
                options.query.back = currentRoute.fullPath;
                options.query.routerName = currentRoute.name;
                router.push({
                    path: options.path,
                    query: options.query
                });
                break;
        }
    });
}