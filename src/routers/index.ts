import { createRouter, createWebHashHistory } from "vue-router";
import { getWebConfig, getMenus } from "@/common/functions/request";
import { useUserStore, useWebConfigStore } from "@/stores";
/**
 * meta.title 页面标题
 * meta.login false：未登录可访问
 * meta.login_access true：登录后不可访问
 * meta.showHeader false：不在页面tab栏显示
 * meta.componentName 自定义组件名称
 */
const routes = [
    {
        path: '/',
        name: 'index',
        component: () => import("@/pages/index/index.vue"),
        meta: {
            title: '首页',
            login: true,
            show:true,
            clearLock:true
        }
    },
    {
        path: '/login',
        name: 'login',
        component: () => import("@/pages/login/index.vue"),
        meta: {
            title: '登录',
            login: false,
            login_access: true,
            clearLock:true
        }
    },
    {
        path: '/register',
        name: 'register',
        component: () => import("@/pages/register/index.vue"),
        meta: {
            title: '注册',
            login: false,
            login_access: true,
            clearLock:true
        }
    },
    {
        path: '/error',
        name: 'error',
        component: () => import('@/fail.vue'),
        meta: {
            title: '页面错误~',
            login: false,
            showHeader: false,
            clearLock:true
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: () => import('@/fail.vue'),
        meta: {
            title: '404',
            login: false,
            showHeader: false,
            clearLock:true
        }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
router.beforeEach(async (to, from, next) => {
    const { hasLogin, initUserInfo } = useUserStore()
    const {WEBCONFIG,initWebConfig} = useWebConfigStore();
    if(!WEBCONFIG.web_name){
        initWebConfig();
        await getWebConfig();
        initUserInfo();
        await getMenus();
    }
    /**
     * 判断是否登录
     */
    if (hasLogin()) {
        if (from.name === 'login' && from.query.redirect_url) {
            return next(from.query.redirect_url as string);
        }
        // 判断当前跳转是否为已登录不可访问地址
        if (to.meta.login_access) {
            return next('/');
        }
    } else {
        if (to.meta?.login !== false) {
            return next({
                path: '/login',
                query: {
                    redirect_url: to.fullPath
                }
            });
        }
    }
    if(!WEBCONFIG.web_name){
        return next({
            path:to.path,
            query:{
                ...to.query
            },
            replace: true,
        });
    }
    // 执行跳转
    next();
})
router.afterEach((to, _from) => {
    const { WEBCONFIG } = useWebConfigStore();
    let subTitle = '';
    if (WEBCONFIG.web_title) {
        subTitle = ` - ${WEBCONFIG.web_title}`;
    } else if (WEBCONFIG.web_name) {
        subTitle = ` - ${WEBCONFIG.web_name}`;
    }
    globalThis.document.title = `${to.meta?.title}${subTitle}`
})
export default router

