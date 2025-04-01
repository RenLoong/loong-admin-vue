<script lang="ts" setup>
import { useRefs, useMenusStore, useStateStore } from "@/stores";
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { $eventBus } from "@/common";
import ResponseEvent from "@/common/enum/ResponseEvent";
import router from "@/routers";
const menusStore = useMenusStore();
const { ROUTERLIST } = useRefs(menusStore);
const stateStore = useStateStore();
const { STATE } = useRefs(stateStore);
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
})
onMounted(() => {
    $eventBus.emit(ResponseEvent.UPDATE_USERINFO);
})
</script>

<template>
    <el-container class="layout-container">
        <item-header />
        <el-container class="overflow-hidden">
            <el-aside class="layout-aside" :class="{ 'close': !STATE.AsideState || STATE.NotMenusAsideState }">
                <el-scrollbar class="flex-1">
                    <el-menu :default-active="currentRoute.path" router class="layouts-menus">
                        <item-menu-item :menus="ROUTERLIST" :level="1" />
                    </el-menu>
                </el-scrollbar>
                <copyright class="flex-column-reverse layout-aside-width" />
            </el-aside>
            <el-main class="layouts-main-scrollbar">
                <router-view :key="currentRoute.path" />
            </el-main>
        </el-container>
    </el-container>
</template>


<style scoped lang="scss">
.layout-container {
    height: 100vh;
    flex-direction: column;
    --aside-width: 220px;
    --aside-close-width: 0px;

    .layout-aside.close {
        width: var(--aside-close-width);
    }

    .layout-aside-width {
        width: var(--aside-width);
    }

    .layout-aside {
        width: var(--aside-width);
        background-color: var(--el-menu-bg-color);
        transition: width 0.3s;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--el-bg-color-page);


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
            }
        }
    }

    .el-menu {
        border-right: none;
        margin: 0 10px;
    }

    .layouts-main-scrollbar {
        flex: 1;
    }
}
</style>