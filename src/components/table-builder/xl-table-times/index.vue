<script setup lang="ts">
import { getTableValue } from '@/common/functions';

const props = withDefaults(defineProps<{
    data: any
    group: any
}>(), {
    data: {}
});
const group = ref<{
    component: string
    label: string
    value: any
    props: any
}[]>([]);
onMounted(() => {
    if (props.group) {
        for (let i = 0; i < props.group.length; i++) {
            const element = props.group[i];
            if (!element.field) continue
            group.value.push({
                component: element.component,
                value: getTableValue(props.data,element.field),
                label: element.label,
                props: element.props
            })
            
        }
    }
})
</script>

<template>
    <div class="flex flex-column xl-table-times">
        <div  v-for="(item, index) in group" :index="index">
            <component v-if="item.component" :is="`el-${item.component}`" v-bind="item.props">
                {{ item.label }}：{{ item.value }}
            </component>
            <div v-else class="text" v-bind="item.props">{{ item.label }}：{{ item.value }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.xl-table-times{
    font-size: 12px;
    color: var(--el-color-info);
}
.text{
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    word-break: break-all;
}
</style>