import { ElMessage, ElMessageBox } from 'element-plus';
import components, {componentsType} from '@/layouts'
import { $http } from '..';
import router from '@/routers';
import { useUserStore, useWebConfigStore } from '@/stores';
interface UseClickOptionsInterface {
    model: '' | 'comfirm' | 'dialog'|'dialogTable' | 'Lock' | 'Search' | 'Notification' | 'FullScreen'|'OutLogin';
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
    let path=options.path;
    if(!options.path?.startsWith('/')){
        path=`/${options.path}`;
    }
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
                if (messageProps.title) {
                    if(!Array.isArray(options.data)){
                        for (let key in options.data) {
                            messageProps.title = messageProps.title.replace(new RegExp(`{${key}}`, 'g'), options.data[key]);
                        }
                    }
                }
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
                            messageProps.title = messageProps.title.replace(new RegExp(`{${key}}`, 'g'), options.data[key]);
                        }
                    }                      
                }
                const findRouter=router.getRoutes().find((item) => item.path===path);
                
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
                    message: () => h(findRouter?components[findRouter.meta.component as componentsType]:components.defaultComponent, {
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
                if(!options.path){
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