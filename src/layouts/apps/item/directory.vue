<script setup lang="ts">
const props = withDefaults(defineProps<{
    data: any
}>(), {
    data: {}
});
const selectedIndex=ref(0);
const selected=computed(()=>{
    if(props.data.directory&&props.data.directory.length>0){
        return props.data.directory[selectedIndex.value]
    }
    return {}
})
const collapse=ref([]);
watchEffect(()=>{
    if(selected.value.collapse){
        collapse.value=selected.value.collapse.map((_item:any,index:number)=>index)
    }else{
        collapse.value=[]
    }
})
</script>

<template>
    <div class="flex">
        <div class="directory border-right p-4 flex flex-column grid-gap-4">
            <div v-for="(item,index) in props.data.directory" :index="index" class="p-4 rounded-4 directory-item" 
            :class="{'active':index===selectedIndex}"
            @click="selectedIndex=index">{{item.title}}</div>
        </div>
        <div class="flex-1 p-4">
            <xl-marked-text :content="selected.content"/>
            <template v-if="selected.collapse">
                <el-collapse v-model="collapse">
                    <el-collapse-item v-for="(item,index) in selected.collapse" :title="item.title" :name="index">
                        <xl-marked-text :content="item.content"/>
                    </el-collapse-item>
                </el-collapse>
            </template>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.directory{
    width: 200px;
    .directory-item{
        cursor: pointer;
        &:hover{
            background: var(--el-bg-color-page);
        }
        &.active{
            background: var(--el-text-color-primary);
            color: var(--el-bg-color);
        }
    }
}
</style>
