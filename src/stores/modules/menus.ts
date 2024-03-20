import { useStorage } from '@/common';
import type { RouteRecordRaw, RouteRecordName } from 'vue-router'
import router from "@/routers";
import components, {componentsType} from '@/layouts'
export default () => {
    const storage = useStorage()
    const MenusStorageKey = 'MENUS'
    const MENUS = ref<MenusInterface[]>();
    const ROUTERLIST = ref<RouteRecordRaw[]>();
    const setMenus = (Menus: MenusInterface[]): Promise<boolean | string> => {
        return new Promise((resolve, reject) => {
            clearMenus();
            MENUS.value = Menus;
            registerRouter();
            storage.set(MenusStorageKey, Menus).then(() => {
                resolve(true);
            }).catch(() => {
                reject('设置本地储存失败')
            })
        })
    }
    const initMenus = (): void => {
        const user = storage.get(MenusStorageKey)
        if (user !== null) {
            setMenus(user as MenusInterface[]);
        }
    }
    const clearMenus = async (): Promise<boolean> => {
        MENUS.value = undefined;
        // 清除已注册的路由
        router.getRoutes().forEach((item) => {
            if (item.name && !item.meta.clearLock && router.hasRoute(item.name)) {
                router.removeRoute(item.name);
            }
        })
        return await storage.remove(MenusStorageKey)
    }
    const hasSubMenu = (item: RouteRecordRaw) => {
        let state = false;
        const children = item.children;
        if (children && children.length) {
            for (let i = 0; i < children.length; i++) {
                const element = children[i];
                if (element.meta?.show) {
                    state = true;
                    break;
                }
            }
        }
        return state;
    }
    const getRouterList = (data: MenusInterface[]): RouteRecordRaw[] => {
        const list: RouteRecordRaw[] = [];
        data.sort((a: any, b: any) => a.sort - b.sort).forEach((item: MenusInterface, key: number) => {
            let component = `${item.component}Component`;
            // 破折号、下划线转驼峰
            component = component.replace(/-(\w)/g, (_all, letter) => letter.toUpperCase());
            let path=item.path;
            if(!item.path?.startsWith('/')){
                path=`/${item.path}`;
            }
            const find: RouteRecordRaw = {
                path: path,
                name: item.path,
                component: components[component as componentsType],
                meta: {
                    component,
                    routerKey: key,
                    title: item.title,
                    sort: item.sort,
                    icon: item.icon,
                    query: item.query,
                    params: item.params,
                    show: item.show,
                    api: item.path,
                    ...item.meta
                },
                children: []
            };
            if (item.children) {
                find.children = getRouterList(item.children);
                if (hasSubMenu(find)) {
                    find.component = undefined;
                }
            }
            list.push(find)
        });
        return list;
    }
    const getFirstRouter = (list: RouteRecordRaw[]): RouteRecordRaw | undefined => {
        let firstRouter: RouteRecordRaw | undefined;
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.meta?.show) {
                if (element.component) {
                    firstRouter = element;
                    break;
                } else if (element.children && element.children.length > 0) {
                    firstRouter = getFirstRouter(element.children);
                    if (firstRouter) {
                        break;
                    }
                }
            }
        }
        return firstRouter;
    }
    const registerRouter = () => {
        if (!MENUS.value) {
            return;
        }
        const list = getRouterList(MENUS.value);
        ROUTERLIST.value = list;
        const firstRouter = getFirstRouter(list);
        // 将"/"路由重定向至第一个有component的路由
        if (firstRouter) {
            router.addRoute({
                path: '/',
                name: 'index',
                component: () => import("@/pages/index/index.vue"),
                meta: {
                    title: '首页',
                    login: true,
                    show: true,
                    clearLock: true
                },
                redirect: firstRouter.path,
                children: []
            })
        }
        // 动态注册路由
        list.forEach((item: RouteRecordRaw) => {
            if (!router.hasRoute(item.name as RouteRecordName)) {
                router.addRoute('index', item);
            }
        })
    }
    return {
        MENUS,
        ROUTERLIST,
        hasSubMenu,
        setMenus,
        initMenus,
        clearMenus
    };
}