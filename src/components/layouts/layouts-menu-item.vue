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
            <el-sub-menu :index="item.path">
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
            <el-menu-item :index="item.path">
                <el-icon v-if="item.meta.icon">
                    <component :is="item.meta.icon"></component>
                </el-icon>

                <template #title>
                    <span>{{ item.meta.title }}</span>
                </template>
            </el-menu-item>
        </permissions>
    </template>
</template>

<style lang="scss">
.layouts-menus{
.el-menu-item,
.el-sub-menu__title {
    border-radius: 6px;
    margin-bottom: 10px;
}

.el-menu-item.is-active {
    color: var(--el-color-primary-light-3);
    background-color: var(--el-color-primary-light-9);
}
}
</style>
