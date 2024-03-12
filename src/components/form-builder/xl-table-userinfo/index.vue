<script setup lang="ts">
const props = withDefaults(defineProps<{
    data: any
    nickname: string
    avatar: any
    nicknameTags?:any
    info?: string
    tags?: any
}>(), {
    data: {},
    nickname: '',
    avatar: '',
});
const nicknameTags= ref<{
    value: string
    props: any
}[]>([]);
const tags = ref<{
    value: string
    props: any
}[]>([]);
onMounted(() => {
    if (props.tags) {
        for (let i in props.tags) {
            if (!props.tags[i].field) continue
            if (!props.data[props.tags[i].field]) continue
            tags.value.push({
                value: props.data[props.tags[i].field],
                props: props.tags[i].props
            })
        }
    }
    if (props.nicknameTags) {
        for (let i in props.nicknameTags) {
            if (!props.nicknameTags[i].field) continue
            if (!props.data[props.nicknameTags[i].field]) continue
            nicknameTags.value.push({
                value: props.data[props.nicknameTags[i].field],
                props: props.nicknameTags[i].props
            })
        }
    }
})
const avatarProps=computed(()=>{
    let result:any={
        shape: 'square',
        size: 60
    };
    if(typeof props.avatar==='string'){
        result.src=props.data[props.avatar];
    }else{
        result={
            ...result,
            ...props.avatar
        };
        result.src=props.data[result.field];
    }
    return result
})
</script>

<template>
    <div class="flex flex-y-center">
        <el-avatar v-bind="avatarProps">{{ props.data[nickname] }}</el-avatar>
        <div class="flex-1 pl-2">
            <div class="flex flex-y-center">
                <div class="tags mr-1" v-if="nicknameTags.length>0">
                    <el-tag v-for="tag in nicknameTags" v-bind="tag.props">{{ tag.value }}</el-tag>
                </div>
                <div class="nickname">{{ props.data[nickname] }}</div>
            </div>
            <div class="info" v-if="props.info">{{ props.data[props.info] }}</div>
            <div class="tags" v-if="tags.length>0">
                <el-tag v-for="tag in tags" v-bind="tag.props">{{ tag.value }}</el-tag>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.nickname {
    font-weight: 600;
}

.info {
    font-size: 12px;
    color: var(--el-color-info);
}

.tags {
    display: flex;
    gap: 5px;
}
</style>