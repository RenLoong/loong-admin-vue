<script lang="ts" setup>
import { useRefs, useWebConfigStore, useMenusStore, useStateStore } from "@/stores";
import type { RouteRecordRaw, RouteLocationNormalizedLoaded } from 'vue-router'
import router from "@/routers";
import { $eventBus } from "@/common";
import ResponseEvent from "@/common/enum/ResponseEvent";
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const menusStore = useMenusStore();
const { ROUTERLIST } = useRefs(menusStore);
const stateStore = useStateStore();
const { STATE } = useRefs(stateStore);
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
const layoutsMainClass=ref('');
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
    if(!["databoardComponent"].includes(currentRoute.value.meta.component as string)){
        layoutsMainClass.value='bg-white rounded-4 p-4 shadow';
    }else{
        layoutsMainClass.value='';
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
onMounted(() => {
    $eventBus.emit(ResponseEvent.UPDATE_USERINFO);
})
</script>

<template>
    <el-container class="layout-container">
        <el-aside class="layout-aside" :class="{ 'close': !STATE.AsideState || STATE.NotMenusAsideState }">
            <div class="layout-tabs">
                <item-logo theme="dark" width="60px" height="60px" />
                <permissions v-for="(item, index) in ROUTERLIST" :key="index" :name="item.meta.api">
                    <div class="layout-tab" :class="{ 'active': index == TabsSelectedIndex }" @click="clickTab(item)"
                        v-if="item.meta.show">
                        <el-icon size="20" v-if="item.meta.icon">
                            <component :is="item.meta.icon" />
                        </el-icon>
                        <div class="title">{{ item.meta.title }}</div>
                    </div>
                </permissions>
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

        <el-container class="layouts-main">
            <item-header>
                <el-breadcrumb separator="/" style="--el-text-color-regular:var(--el-color-info)">
                    <el-breadcrumb-item v-for="item in currentRoute.matched"
                        :to="item.name === routerName ? item.path : ''">
                        {{ item.meta.title }}
                    </el-breadcrumb-item>
                </el-breadcrumb>
            </item-header>
            <el-scrollbar class="layouts-main-scrollbar">
                <el-main>
                    <div :class="layoutsMainClass">
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
                    color: var(--el-text-color-primary);
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

    .layouts-main {
        flex-direction: column;
    }

    .layouts-main-scrollbar {
        background-color: var(--el-bg-color-page);
    }
}
</style>