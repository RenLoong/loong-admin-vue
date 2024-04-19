<script setup lang="ts">
import { useClick } from '@/common/functions/action';
import useTheme from "@/common/theme";
import { useRefs, useStateStore, useUserStore, useWebConfigStore } from '@/stores';
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const userStore = useUserStore();
const { USERINFO } = useRefs(userStore);
const stateStore = useStateStore();
const { STATE } = useRefs(stateStore);
const { theme } = useTheme();
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
    <el-header class="overflow-hidden">
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
        <slot>
            <div class="flex flex-center px-6">
                <item-logo width="60px" height="60px" />
            </div>
        </slot>
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
                    <el-tag size="small" type="danger" v-if="USERINFO?.role_name">{{ USERINFO?.role_name }}</el-tag>
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
</template>

<style scoped lang="scss">
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
.nickname {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
}
</style>
