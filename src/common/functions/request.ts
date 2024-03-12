import { $http, showErrorBox } from "@/common"
import { useWebConfigStore, useMenusStore, useUserStore } from "@/stores";

export const getWebConfig = () => {
    return new Promise((resolve, reject) => {
        $http.get('Public/config').then((res: ResponseInterface) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                const webConfigStore = useWebConfigStore();
                webConfigStore.setWebConfig(res.data as WebConfigInterface);
                resolve(true);
            } else {
                showErrorBox(res);
                reject();
            }
        }).catch(() => {
            reject();
        });
    })
}
export const getUserInfo = () => {
    const {WEBCONFIG} = useWebConfigStore();
    if(!WEBCONFIG.apis?.userinfo)return;
    return new Promise((resolve, reject) => {
        $http.get(WEBCONFIG.apis.userinfo).then((res: ResponseInterface) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                const userStore = useUserStore();
                userStore.setUserInfo(res.data as UserInfoInterface).then(()=>{
                    getMenus()
                });
                resolve(true);
            } else {
                showErrorBox(res);
                reject();
            }
        }).catch(() => {
            reject();
        });
    })
}
export const getMenus = async () => {
    const {WEBCONFIG} = useWebConfigStore();
    return new Promise((resolve, reject) => {
        $http.get(WEBCONFIG.apis.menus).then((res: ResponseInterface) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                const menusStore = useMenusStore();
                menusStore.setMenus(res.data as MenusInterface[]);
                resolve(true);
            } else {
                showErrorBox(res);
                reject();
            }
        }).catch(() => {
            reject();
        });
    })
}