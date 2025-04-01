<script setup lang="ts">
import { $http } from '@/common';
import router from '@/routers';
import columnComponent from '@/layouts/table/component/column.vue'
import { debounce } from '@/common/functions';


const props = withDefaults(defineProps<{
    params?: any
}>(), {
});
const loading = ref(true);
const currentRoute = router.currentRoute.value;
const tabs = ref<any>([]);
let ApiUrl = currentRoute.meta.api as string;
if (props.params) {
    ApiUrl = props.params.api;
}
onBeforeMount(() => {
    getTableData();
})
const getTableData = () => {
    tabs.value = [];
    $http.get(ApiUrl, {
        params: props.params?.query
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            tabs.value = res.data;
        }
    }).finally(() => {
        loading.value = false;
    })
}
const debounceGetTableData = debounce(getTableData, 1000);
</script>

<template>
    <el-skeleton :loading="loading" animated>
        <template #template>
            <div class="flex flex-column grid-gap-10 p-6">
                <el-skeleton-item class="min-vh-15" v-for="_item in 5" />
            </div>
        </template>
        <template #default>
            <el-scrollbar>
                <div class="flex flex-column grid-gap-10 p-6">
                    <div class="flex shadow-lighter rounded-4 overflow-hidden" v-for="(item, index) in tabs"
                        :index="index">
                        <div class="tabs-info py-10 border-right border-right-hover">
                            <div class="title">{{ item.title }}</div>
                            <div class="tips mt-6" v-if="item.tips">{{ item.tips }}</div>
                        </div>
                        <div class="flex-1">
                            <el-table ref="tableRef" :data="item.data" v-bind="item.builder.props">
                                <template v-for="(column, _index) in item.builder.columns" :index="_index">
                                    <columnComponent :column="column" :tableData="item.data"
                                        @change="debounceGetTableData" />
                                </template>
                            </el-table>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </template>
    </el-skeleton>
</template>

<style lang="scss" scoped>
.tabs-info {
    width: 260px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .title {
        font-size: 20px;
        font-weight: 600;
    }

    .tips {
        font-size: 14px;
        color: var(--el-color-info);
    }
}
</style>
