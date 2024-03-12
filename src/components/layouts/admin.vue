<script lang="ts" setup>
import { useRefs, useWebConfigStore, useMenusStore, useStateStore, useUserStore } from "@/stores";
import type { RouteRecordRaw, RouteLocationNormalizedLoaded } from 'vue-router'
import { useClick } from '@/common/functions/action';
import useTheme from "@/common/theme";
import router from "@/routers";
const userStore = useUserStore();
const { USERINFO } = useRefs(userStore);
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const menusStore = useMenusStore();
const { ROUTERLIST } = useRefs(menusStore);
const stateStore = useStateStore();
const { STATE } = useRefs(stateStore);
const { theme } = useTheme();
const TabsSelectedIndex = ref(0);
const currentRoute = ref<RouteLocationNormalizedLoaded>({
    path: '/',
    matched: [],
    fullPath: "/",
    query: {},
    hash: "",
    redirectedFrom: undefined,
    name: undefined,
    params: {},
    meta: {}
});
const routerName = ref('');
watchEffect(() => {
    currentRoute.value = router.currentRoute.value;
    if (currentRoute.value.query.routerName) {
        routerName.value = currentRoute.value.query.routerName as string;
    }
    const i = currentRoute.value.matched.map((item) => {
        if (item.meta && item.meta.routerKey !== undefined) {
            return item.meta.routerKey as number;
        }
    }).filter(item => item !== undefined)
    if (i[0] !== undefined) {
        TabsSelectedIndex.value = i[0];
    }
})
const TabsMenusFind = computed(() => {
    if (ROUTERLIST.value && ROUTERLIST.value.length > 0) {
        return ROUTERLIST.value[TabsSelectedIndex.value];
    }
    return {};
})
const MenusData = computed(() => {
    if (ROUTERLIST.value && ROUTERLIST.value.length > 0) {
        return TabsMenusFind.value.children;
    }
    return [];
})

watchEffect(() => {
    if (MenusData.value.length > 0 && menusStore.hasSubMenu(ROUTERLIST.value[TabsSelectedIndex.value])) {
        stateStore.setState('NotMenusAsideState', false);
    } else {
        stateStore.setState('NotMenusAsideState', true);
    }
})
const getTabLastFind = (item: RouteRecordRaw): RouteRecordRaw => {
    if (item.children && item.children.length > 0 && menusStore.hasSubMenu(item)) {
        return getTabLastFind(item.children[0]);
    }
    return item;
}
const clickTab = (item: RouteRecordRaw) => {
    const find = getTabLastFind(item);
    router.push({
        path: find.path
    })
}
const handleAction = (command: any) => {
    const options = {
        model: command.model,
        props: command.props.props,
        path: command.props.path,
        query: {},
        data: {}
    };
    useClick(options).then(() => {
    }).catch(() => { })
}
</script>

<template>
    <el-container class="layout-container">
        <el-aside class="layout-aside" :class="{ 'close': !STATE.AsideState || STATE.NotMenusAsideState }">
            <div class="layout-tabs">
                <item-logo theme="dark" width="60px" height="60px" />
                <div class="layout-tab" v-for="(item, index) in ROUTERLIST" :key="index"
                    :class="{ 'active': index == TabsSelectedIndex }" @click="clickTab(item)">
                    <el-icon size="20" v-if="item.meta.icon">
                        <component :is="item.meta.icon" />
                    </el-icon>
                    <div class="title">{{ item.meta.title }}</div>
                </div>
            </div>
            <div class="layout-menus">
                <div class="layout-menus-header">
                    <div class="title">{{ WEBCONFIG.web_name }}</div>
                </div>
                <el-scrollbar>
                    <el-divider>{{ TabsMenusFind.meta.title }}</el-divider>
                    <el-menu :default-active="currentRoute.path" router class="layouts-menus">
                        <item-menu-item :menus="MenusData" :level="1" />
                    </el-menu>
                </el-scrollbar>
            </div>
        </el-aside>

        <el-container>
            <el-header>
                <el-tooltip effect="dark" content="展开/收起侧边栏" placement="bottom">
                    <div @click="stateStore.toggle('AsideState')"
                        class="pointer header-item flex flex-center text-primary-light-3">
                        <el-icon v-if="STATE.AsideState">
                            <Fold />
                        </el-icon>
                        <el-icon v-else>
                            <Expand />
                        </el-icon>
                    </div>
                </el-tooltip>
                <el-breadcrumb separator="/" style="--el-text-color-regular:var(--el-color-info)">
                    <el-breadcrumb-item v-for="item in currentRoute.matched"
                        :to="item.name === routerName ? item.path : ''">{{ item.meta.title }}</el-breadcrumb-item>
                </el-breadcrumb>
                <div class="flex-1"></div>
                <template v-for="(item,_index) in WEBCONFIG.toolbar" :index="_index">
                    <template v-if="item.tips">
                        <el-tooltip effect="dark" :content="item.tips" placement="bottom">
                            <div class="pointer header-item flex flex-center"
                                @click="handleAction(item)">
                                <el-icon v-if="item.props.icon">
                                    <component :is="item.props.icon" />
                                </el-icon>
                                <span v-if="item.props.label">{{ item.props.label }}</span>
                            </div>
                        </el-tooltip>
                    </template>
                    <div class="pointer header-item flex flex-center" v-else
                        @click="handleAction(item)">
                        <el-icon v-if="item.props.icon">
                            <component :is="item.props.icon" />
                        </el-icon>
                        <span v-if="item.props.label">{{ item.props.label }}</span>
                    </div>
                </template>
                <div class="pointer px-3 flex flex-center">
                    <el-switch v-model="theme" style="--el-switch-on-color:#2c2c2c;" active-action-icon="Moon"
                        inactive-action-icon="Sunny" active-value="dark" inactive-value="OS" />
                </div>
                <el-dropdown popper-class="userinfo-menu" @command="handleAction">
                    <div class="pointer px-3 flex flex-center">
                        <el-avatar :size="30" :src="USERINFO?.headimg">{{ USERINFO?.nickname }}</el-avatar>
                        <div class="ml-1">
                            <div class="nickname mb-1">{{ USERINFO?.nickname }}</div>
                            <el-tag size="small" type="danger">{{ USERINFO?.role_name }}</el-tag>
                        </div>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="item in WEBCONFIG.user_dropdown_menu" v-bind="item.props"
                                :command="item">
                                <div class="flex-1 p-4 flex flex-y-center font-weight-600">
                                    {{ item.props.label }}
                                </div>
                            </el-dropdown-item>
                            <el-dropdown-item divided
                                :command="{ model: 'OutLogin', props: { confirmButtonClass: 'el-button--danger' } }">
                                <div class="flex-1 text-center text-danger font-weight-600 p-4">
                                    退出登录</div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <el-scrollbar class="layouts-main-scrollbar">
                <el-main>
                    <div class="bg-white rounded-4 p-4 shadow">
                        <router-view :key="currentRoute.path" />
                    </div>
                    <copyright center />
                </el-main>
            </el-scrollbar>
        </el-container>
    </el-container>
</template>


<style scoped lang="scss">
.layout-container {
    height: 100vh;
    --aside-close-width: 64px;

    .el-header {
        --el-header-padding: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--el-text-color-regular);
        border-bottom: 1px solid var(--el-bg-color-page);

        .header-item {
            padding: var(--el-header-padding);
            border-radius: 6px;

            span {
                margin-left: 6px;
            }
        }

        .header-item:hover {
            background-color: var(--el-bg-color-page);
        }
    }

    .layout-aside.close {
        width: var(--aside-close-width);
    }

    .layout-aside {
        width: 264px;
        background-color: var(--el-menu-bg-color);
        display: flex;
        transition: width 0.3s;
        overflow: hidden;

        .layout-tabs {
            width: var(--aside-close-width);
            color: var(--el-color-white);
            background-color: var(--el-overlay-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 2px;

            .layout-tab {
                width: calc(var(--aside-close-width) - 10px);
                height: calc(var(--aside-close-width) - 10px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                border-radius: 6px;
                gap: 2px;

                .title {
                    width: calc(var(--aside-close-width) - 10px);
                    overflow: hidden;
                    font-size: 12px;
                    white-space: nowrap;
                    vertical-align: middle;
                    text-align: center;
                }

                &.active {
                    background-color: var(--el-color-primary);
                }
            }
        }

        .layout-menus {
            display: flex;
            flex-direction: column;

            .layout-menus-header {
                .title {
                    color: var(--el-color-black);
                    overflow: hidden;
                    font-size: 20px;
                    line-height: 60px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    vertical-align: middle;
                    text-align: center;
                    margin: 0 auto;
                    width: 160px;
                }
            }
        }
    }

    .el-menu {
        border-right: none;
        width: 180px;
        margin: 0 10px;
    }

    .layouts-main-scrollbar {
        background-color: var(--el-bg-color-page);
    }
}

.nickname {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
}
</style>