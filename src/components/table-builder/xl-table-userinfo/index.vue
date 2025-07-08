<script setup lang="ts">
import { getTableValue } from "@/common/functions";
const props = withDefaults(defineProps<{
    data: any
    nickname: string
    avatar?: any
    preview?: boolean
    nicknameTags?: any
    info?: string
    copy?: string
    tags?: any
}>(), {
    data: {},
    nickname: '',
    avatar: '',
});
const nicknameTags = ref<{
    value: any
    props: any
}[]>([]);
const tags = ref<{
    value: any
    props: any
}[]>([]);
onMounted(() => {
    if (props.tags) {
        for (let i in props.tags) {
            if (!props.tags[i].field) continue
            const value = getTableValue(props.data, props.tags[i].field);
            if (!value) continue
            tags.value.push({
                value: value,
                props: props.tags[i].props
            })
        }
    }
    if (props.nicknameTags) {
        for (let i in props.nicknameTags) {
            if (!props.nicknameTags[i].field) continue
            const value = getTableValue(props.data, props.nicknameTags[i].field);
            if (!value) continue
            nicknameTags.value.push({
                value: value,
                props: props.nicknameTags[i].props
            })
        }
    }
})
const avatarProps = computed(() => {
    if (!props.avatar) {
        return {};
    }
    let result: any = {
        shape: 'square',
        size: 60
    };
    if (typeof props.avatar === 'string') {
        result.src = getTableValue(props.data, props.avatar);
    } else {
        result = {
            ...result,
            ...props.avatar
        };
        result.src = getTableValue(props.data, result.field);
    }
    if (props.preview && result.src) {
        result.class = 'pointer';
    }
    return result
})
const showPreview = ref();
const preview = () => {
    if (props.preview && avatarProps.value.src) {
        showPreview.value=true;
    }
}
</script>

<template>
    <div class="flex flex-y-center grid-gap-2 flex-1">
        <el-avatar v-bind="avatarProps" v-if="props.avatar" style="--el-avatar-text-size:10px;" @click="preview">{{
            getTableValue(props.data, props.nickname) }}</el-avatar>
        <div class="flex-1">
            <div class="flex flex-y-center">
                <div class="tags mr-1" v-if="nicknameTags.length > 0">
                    <el-tag v-for="tag in nicknameTags" v-bind="tag.props">{{ tag.value }}</el-tag>
                </div>
                <div class="nickname">{{ getTableValue(props.data, props.nickname) }}</div>
            </div>
            <div class="info" v-if="props.info">{{ getTableValue(props.data, props.info) }}</div>
            <xl-copy v-if="props.copy" :content="getTableValue(props.data, props.copy)"></xl-copy>
            <div class="tags" v-if="tags.length > 0">
                <el-tag v-for="tag in tags" v-bind="tag.props">{{ tag.value }}</el-tag>
            </div>
        </div>
        <el-image-viewer v-if="showPreview" :url-list="[avatarProps.src]" show-progress @close="showPreview = false" teleported/>
    </div>
</template>

<style scoped lang="scss">
.nickname {}

.info {
    font-size: 12px;
    color: var(--el-color-info);
}

.tags {
    display: flex;
    gap: 5px;
}
</style>