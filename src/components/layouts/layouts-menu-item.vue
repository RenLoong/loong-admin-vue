<script setup lang="ts">
import { useMenusStore } from "@/stores";
const props = withDefaults(defineProps<{
    menus: any,
    level: number
}>(), {
});
const menusData = computed(() => {
    if (!props.menus) {
        return [];
    }
    return props.menus.sort((a: any, b: any) => a.meta.sort - b.meta.sort)
})
const { hasSubMenu } = useMenusStore();
</script>

<template>
    <template v-for="(item, _index) in menusData" :key="_index">
        <permissions :name="item.meta.api" v-if="hasSubMenu(item)">
            <el-sub-menu :index="item.path" v-bind="item.meta?.props">
                <template #title>
                    <el-icon v-if="item.meta.icon">
                        <component :is="item.meta.icon"></component>
                    </el-icon>
                    <span>{{ item.meta.title }}</span>
                </template>
                <layouts-menu-item :menus="item.children" :level="level + 1"></layouts-menu-item>
            </el-sub-menu>
        </permissions>
        <permissions :name="item.meta.api" v-else-if="item.meta.show">
            <el-menu-item :index="item.path" :route="{ path: item.path, query: item.meta.query, params: item.meta.params }"
                v-bind="item.meta?.props">
                <el-icon v-if="item.meta.icon" v-bind="item.meta?.iconProps">
                    <component :is="item.meta.icon"></component>
                </el-icon>

                <template #title>
                    <el-text v-bind="item.meta?.titleProps">{{ item.meta.title }}</el-text>
                </template>
            </el-menu-item>
        </permissions>
    </template>
</template>

<style lang="scss">
.layouts-menus {
    --el-menu-active-color: var(--el-color-primary-light-3);
    --el-menu-active-bg-color: var(--el-color-primary-light-9);

    .el-menu-item,
    .el-sub-menu__title {
        border-radius: 6px;
        margin-bottom: 10px;
        .el-text{
            --el-text-color:var(--el-menu-text-color);
        }
    }

    .el-menu-item.is-active {
        background-color: var(--el-menu-active-bg-color);
        .el-text{
            --el-text-color:var(--el-menu-active-color);
        }
    }
}
</style>
