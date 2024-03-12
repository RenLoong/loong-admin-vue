<script setup lang="ts">
import { $http } from '@/common';
import { ElMessage } from 'element-plus';
import { hasWhere } from '@/common/functions';


const props = withDefaults(defineProps<{
    scope: any,
    column: any
}>(), {
    column: {}
});
const emit = defineEmits(['change'])
const values=ref();
const loading=ref(false);
onMounted(()=>{
    values.value=props.scope.row[props.scope.column.property];
    nextTick(()=>{
        watch(()=>values.value,(val)=>{
            emit('change',props.scope,val);
        })
    })
})
const submitSwitch=()=>{
    loading.value = true
    return new Promise((resolve, reject) => {
        $http.post(props.column.api,{
            id:props.scope.row.id,
            field:props.scope.column.property,
            value:values.value?0:1
        }).then((res:ResponseInterface)=>{
            if(res.code===$http.ResponseCode.SUCCESS){
                resolve(true)
            }else{
                ElMessage.error(res.msg)
                reject()
            }
        }).catch(()=>{
            reject();
        }).finally(()=>{
            loading.value = false
        })
  })
}
const submit=()=>{
    loading.value = true
    $http.post(props.column.api,{
        id:props.scope.row.id,
        field:props.scope.column.property,
        value:values.value
    }).then((res:ResponseInterface)=>{
        if(res.code!==$http.ResponseCode.SUCCESS){
            ElMessage.error(res.msg)
        }
    }).catch(()=>{
    }).finally(()=>{
            loading.value = false
        })
}
</script>

<template>
    <template v-if="column.name==='switch'">
        <el-switch v-model="values" :loading="loading" v-bind="column.props" :before-change="submitSwitch" />
    </template>
    <template v-else-if="column.name==='select'">
        <el-select v-model="values" :disabled="loading" v-bind="column.props" @change="submit">
            <template v-for="(sub, _subIndex) in column.options" :key="_subIndex">
                <el-option :label="sub.label" :value="sub.value" v-bind="column.subProps" v-if="hasWhere(sub.extra,scope.row)" />
            </template>
        </el-select>
    </template>
    <template v-else>
        <component :is="`el-${column.name}`" :loading="loading" v-model="values" v-bind="column.props" @change="submit"/>
    </template>
</template>

<style scoped></style>