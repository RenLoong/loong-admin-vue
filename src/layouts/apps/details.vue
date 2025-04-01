<script setup lang="ts">
import { $http } from '@/common';
import router from '@/routers';
import { useClick } from '@/common/functions/action';
import { ElMessage } from 'element-plus';
import { hasWhere } from '@/common/functions';
import marked from './item/marked.vue';
import directory from './item/directory.vue';
const components = {
    marked,
    directory
}
type componentsType = keyof typeof components;

const props = withDefaults(defineProps<{
    params?: any
}>(), {
});
const loading = ref(true);
const action = ref<any>([]);
const tabs = ref<any>([]);
const selecedTabs = ref<string>('');
const currentRoute = router.currentRoute.value;
let ApiUrl = currentRoute.meta.api;
if (props.params) {
    ApiUrl = props.params.api;
}
onBeforeMount(() => {
    $http.get(`${ApiUrl}GetTable`, {
        params: {
            ...currentRoute.query
        }
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            action.value = res.data.action;
            tabs.value = res.data.tabs;
            selecedTabs.value = tabs.value[0].name;
            nextTick(() => {
                getDetails();
            })
        }
    }).finally(() => {
        loading.value = false;
    })
})
const search = ref<{
    [key: string]: any;
}>({
    ...currentRoute.query
});
const Find = ref<any>({});
const getDetails = () => {
    $http.get(ApiUrl as string, {
        params: search.value
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            Find.value = res.data;
        } else {
            ElMessage.error(res.message);
        }
    })
}
const handleAction = (group: any, row: any) => {
    if (!group.extra) return;
    let query = {
        ...group.extra.params
    };
    if (group.extra.field) {
        for (let key in group.extra.field) {
            query[group.extra.field[key]] = row[key];
        }
    } else {
        query.id = row.id;
    }
    const options = {
        model: group.extra.model,
        props: group.extra.props,
        path: group.extra.path,
        query,
        data: row
    };
    useClick(options).then(() => {
        getDetails();
    }).catch(() => { })
}
</script>

<template>
    <el-scrollbar class="layouts-main-scrollbar">
        <el-skeleton :loading="loading" animated>
            <template #template>
                <div class="table-screen">
                    <el-skeleton-item />
                    <el-skeleton-item />
                    <el-skeleton-item />
                    <el-skeleton-item style="width:80px;" />
                </div>
                <div class="border grid grid-gap-4 p-4 my-4">
                    <el-skeleton-item style="height: 30px;" class="grid-column-6" v-for="item in 40" :index="item" />
                </div>
                <el-skeleton-item style="height: 30px;" />
            </template>
            <template #default>
                <el-scrollbar>
                    <div class="layouts pb-10">
                        <div class="py-10 flex">
                            <el-avatar :src="Find.icon" :size="200" shape="square">{{ Find.title }}</el-avatar>
                            <div class="flex-1 pl-10">
                                <div class="h3">{{ Find.title }}</div>
                                <div class="bg rounded-4 p-4 mt-4" v-if="Find.description">{{ Find.description }}</div>
                            </div>
                        </div>
                        <div class="flex mb-4 tabs grid-gap-4">
                            <div v-for="item in tabs" class="item" :class="{ 'active': selecedTabs === item.name }"
                                @click="selecedTabs = item.name">
                                {{ item.label }}
                            </div>
                        </div>
                        <div class="flex grid-gap-10">
                            <div class="flex-1 border-top">
                                <template v-for="item in tabs">
                                    <div v-show="selecedTabs === item.name">
                                        <component :is="components[item.extra.view as componentsType]" :data="Find" />
                                    </div>
                                </template>
                            </div>
                            <div class="flex action flex-wrap grid-gap-4">
                                <div class="w-100 bg rounded-4 p-4 flex" v-if="Find.author">
                                    <el-avatar :src="Find.author.headimg" :size="60">{{ Find.author.nickname
                                        }}</el-avatar>
                                    <div class="flex-1 pl-4 flex flex-column flex-x-space-between flex-y-flex-start">
                                        <div class="font-weight-600">{{ Find.author.nickname }}</div>
                                        <div class="flex" v-if="Find.author.tags">
                                            <el-button :icon="tag.icon" link v-for="tag in Find.author.tags" disabled>
                                                {{ tag.label }}
                                            </el-button>
                                        </div>
                                    </div>
                                </div>
                                <template v-for="group in action">
                                    <permissions :name="group.extra.path">
                                        <component :is="`el-${group.extra.component.name}`"
                                            v-bind="group.extra.component.props" v-if="hasWhere(group.extra, Find)"
                                            @click.stop="handleAction(group, Find)">
                                            {{ group.label }}
                                        </component>
                                    </permissions>
                                </template>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </template>
        </el-skeleton>
    </el-scrollbar>
</template>

<style lang="scss" scoped>
.layouts {
    --layouts-width: 1300px;
}

.action {
    width: 300px;
    align-content: flex-start;

    .el-button+.el-button {
        margin-left: 0;
    }
}

.tabs {
    padding: 4px;
    color: var(--el-text-color-primary);

    .item {
        padding: 4px 18px;
        cursor: pointer;
        border-radius: 999px;

        &:hover {
            background-color: var(--el-bg-color-page);
        }
    }

    .item.active {
        color: var(--el-bg-color);
        background-color: var(--el-text-color-primary);
    }
}
</style>
