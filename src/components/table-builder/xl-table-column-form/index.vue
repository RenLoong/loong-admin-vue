<script setup lang="ts">
import { $http } from '@/common';
import { ElMessage } from 'element-plus';
import { hasWhere } from '@/common/functions';


const props = withDefaults(defineProps<{
    field?: string,
    scope: any,
    column: any
}>(), {
    column: {},
    field: 'id'
});
const emit = defineEmits(['change'])
const values = ref();
const loading = ref(false);
onMounted(() => {
    values.value = props.scope.row[props.scope.column.property];
    nextTick(() => {
        watch(() => values.value, (val) => {
            emit('change', props.scope, val);
        })
    })
})
const submitSwitch = () => {
    loading.value = true
    return new Promise((resolve, reject) => {
        $http.post(props.column.api, {
            id: props.scope.row[props.field],
            field: props.scope.column.property,
            value: values.value ? 0 : 1
        }).then((res: ResponseInterface) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                resolve(true)
            } else {
                ElMessage.error(res.msg)
                reject()
            }
        }).catch(() => {
            reject();
        }).finally(() => {
            loading.value = false
        })
    })
}
const tagsPopoverRefs=ref();
const submit = () => {
    loading.value = true
    $http.post(props.column.api, {
        id: props.scope.row[props.field],
        field: props.scope.column.property,
        value: values.value
    }).then((res: ResponseInterface) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            tagsPopoverRefs.value?.hide()
        }else{
            ElMessage.error(res.msg);
        }
    }).catch(() => {
    }).finally(() => {
        loading.value = false
    })
}
const options = ref(props.column.options);
let timer: NodeJS.Timeout;
const remoteMethod = (query: string) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
        loading.value = true;
        options.value = [];
        $http.post(props.column.remote.url, {
            query: query,
            form: props.scope.row
        }).then((res: any) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                options.value = res.data;
            } else {
                options.value = [];
            }
        }).catch(() => {
            options.value = [];
        }).finally(() => {
            loading.value = false
        })
    }, 300);
}
const elProps = computed(() => {
    if (props.column.remote) {
        switch (props.column.component) {
            case 'select':
                return {
                    ...props.column.props,
                    remote: true,
                    filterable: true,
                    remoteMethod: remoteMethod,
                    loading: loading.value
                };
        }
    }
    return props.column.props;
})
</script>

<template>
    <template v-if="column.name === 'switch'">
        <el-switch v-model="values" :loading="loading" v-bind="column.props" :before-change="submitSwitch" />
    </template>
    <template v-else-if="['tags', 'tag'].includes(column.name)">
        <el-popover ref="tagsPopoverRefs" width="140" trigger="click" placement="bottom" popper-style="--el-popover-padding:0;" v-bind="column.props">
            <template #reference>
                <div class="pointer">
                    <template v-for="(item, index) in column.options">
                        <el-tag :key="index" v-bind="item.props" v-if="item.value === values" disable-transitions>
                            {{ item.label }}</el-tag>
                    </template>
                </div>
            </template>
            <div class="flex flex-column" v-loading="loading">
                <span class="p-4 bg">变更为</span>
                <div v-for="(item, index) in column.options" :key="index" class="py-4 pr-4 pl-10 hover-bg-primary-light-9 pointer"
                @click="values=item.value;submit()">
                    <el-text v-bind="item.props">{{ item.label }}</el-text>
                </div>
            </div>
        </el-popover>
    </template>
    <template v-else-if="column.name === 'select'">
        <el-select v-model="values" :disabled="loading" v-bind="elProps" @change="submit" class="select-item">
            <template v-if="column.group">
                <template v-for="(groupItem, index) in options">
                    <el-option-group :key="index" :label="groupItem.label" v-bind="groupItem.props"
                        v-if="hasWhere(groupItem, scope.row)">
                        <template v-for="(sub, subIndex) in groupItem.options">
                            <el-option :key="subIndex" :label="sub.label" :value="sub.value" v-bind="column.subProps"
                                v-if="hasWhere(sub.extra, scope.row)">
                                <div class="flex grid-gap-6">
                                    <div class="flex-1 flex flex-column gir-dgap-1">
                                        <span>{{ sub.label }}</span>
                                    </div>
                                    <span class="h10 text-grey" v-if="sub.tips">{{ sub.tips }}</span>
                                </div>
                            </el-option>
                        </template>
                    </el-option-group>
                </template>
            </template>
            <template v-else>
                <template v-for="(sub, subIndex) in options">
                    <el-option :key="subIndex" :label="sub.label" :value="sub.value" v-bind="column.subProps"
                        v-if="hasWhere(sub.extra, scope.row)">
                        <div class="flex grid-gap-6">
                            <div class="flex-1 flex flex-column gir-dgap-1">
                                <span>{{ sub.label }}</span>
                            </div>
                            <span class="h10 text-grey" v-if="sub.tips">{{ sub.tips }}</span>
                        </div>
                    </el-option>
                </template>
            </template>
        </el-select>
    </template>
    <template v-else>
        <component :is="`el-${column.name}`" :loading="loading" v-model="values" v-bind="column.props"
            @change="submit" />
    </template>
</template>

<style scoped></style>