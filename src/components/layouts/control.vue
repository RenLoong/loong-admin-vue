<script lang="ts" setup>
import { useRefs, useWebConfigStore, useMenusStore, useStateStore, useUserStore } from "@/stores";
import type { RouteLocationNormalizedLoaded } from 'vue-router'
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
            <div class="flex flex-center px-6">
                <item-logo width="60px" height="60px" />
            </div>
            <div class="flex-1"></div>
            <template v-for="(item, _index) in WEBCONFIG.toolbar" :index="_index">
                <template v-if="item.tips">
                    <el-tooltip effect="dark" :content="item.tips" placement="bottom">
                        <div class="pointer header-item flex flex-center" @click="handleAction(item)">
                            <el-icon v-if="item.props.icon">
                                <component :is="item.props.icon" />
                            </el-icon>
                            <span v-if="item.props.label">{{ item.props.label }}</span>
                        </div>
                    </el-tooltip>
                </template>
                <div class="pointer header-item flex flex-center" v-else @click="handleAction(item)">
                    <el-icon v-if="item.props.icon">
                        <component :is="item.props.icon" />
                    </el-icon>
                    <span v-if="item.props.label">{{ item.props.label }}</span>
                    <template v-if="item.props.field && USERINFO">
                        <component :is="item.props.field.component.name" v-bind="item.props.field.component.props">
                            {{ USERINFO[item.props.field.name] }}
                        </component>
                    </template>
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
                    </div>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <permissions v-for="item in WEBCONFIG.user_dropdown_menu" :name="item.props.path">
                            <el-dropdown-item v-bind="item.props" :command="item">
                                <div class="flex-1 p-4 flex flex-y-center font-weight-600">
                                    {{ item.props.label }}
                                </div>
                            </el-dropdown-item>
                        </permissions>
                        <el-dropdown-item divided
                            :command="{ model: 'OutLogin', props: { confirmButtonClass: 'el-button--danger' } }">
                            <div class="flex-1 text-center text-danger font-weight-600 p-4">
                                退出登录</div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </el-header>

        <el-container class="overflow-hidden">
            <el-aside class="layout-aside" :class="{ 'close': !STATE.AsideState || STATE.NotMenusAsideState }">
                <el-scrollbar class="flex-1">
                    <el-menu :default-active="currentRoute.path" router class="layouts-menus">
                        <item-menu-item :menus="ROUTERLIST" :level="1" />
                    </el-menu>
                </el-scrollbar>
                <copyright />
            </el-aside>
            <el-scrollbar class="layouts-main-scrollbar">
                <el-main>
                    <router-view :key="currentRoute.path" />
                </el-main>
            </el-scrollbar>
        </el-container>
    </el-container>
</template>


<style scoped lang="scss">
.layout-container {
    height: 100vh;
    --aside-close-width: 0px;

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
        width: 220px;
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

.nickname {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
}
</style>