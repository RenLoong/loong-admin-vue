<script setup lang="ts">
const props = withDefaults(defineProps<{
    data: any
    type?: string
}>(), {
    data: {},
    type: 'video'
});
const srcFind = ref<string>('');
const visible = ref<boolean>(false);
onMounted(() => {
    if (!Array.isArray(props.data)) {
        srcFind.value = props.data;
    }
})
</script>

<template>
    <div class="flex grid-gap-1">
        <template v-if="Array.isArray(props.data)">
            <template v-for="(item, index) in props.data" :key="index">
                <el-icon @click="srcFind = item; visible = true" v-if="item" class="pointer" size="20">
                    <VideoPlay />
                </el-icon>
            </template>
        </template>
        <template v-else>
            <el-icon @click="srcFind = props.data; visible = true" v-if="props.data" class="pointer" size="20">
                <VideoPlay />
            </el-icon>
        </template>
        <el-dialog v-model="visible" title="预览" :width="375" :height="375" append-to-body destroy-on-close>
            <template v-if="props.type === 'video'">
                <video :src="srcFind" controls autoplay style="width: 100%; height: 100%;" />
            </template>
            <template v-else-if="props.type === 'audio'">
                <audio :src="srcFind" controls autoplay style="width: 100%;" />
            </template>
        </el-dialog>
    </div>
</template>

<style scoped lang="scss"></style>