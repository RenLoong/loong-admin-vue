<script setup lang="ts">

const props = withDefaults(defineProps<{
    data: any
}>(), {
    data: {}
});
const selectedIndex = ref('0');
const selected = ref<any>({});
const setSelected=(item:any)=>{
    selected.value=item;
}
const collapse = ref([]);
watchEffect(() => {
    if (selected.value.collapse) {
        collapse.value = selected.value.collapse.map((_item: any, index: number) => index)
    } else {
        collapse.value = []
    }
})
watchEffect(()=>{
    if (props.data.directory && props.data.directory.length > 0) {
        const element=props.data.directory[selectedIndex.value];
        if(element.is_dir){
            selectedIndex.value='0-0';
            setSelected(element.children[0]);
        }else{
            setSelected(element)
        }
    }
})
const emit = defineEmits(['scroll']);
const contentScrollRef = ref();
const handelScroll = (e: any) => {
    emit('scroll', e)
}
const setScrollTop = (scrollTop: number) => {
    const len = contentScrollRef.value.length;
    if (len) {
        for (let i = 0; i < len; i++) {
            const element = contentScrollRef.value[i];
            element.setScrollTop(scrollTop);
        }
    }
}
defineExpose({
    setScrollTop
})
</script>

<template>
    <div class="flex overflow-hidden">
        <el-scrollbar ref="contentScrollRef" @scroll="handelScroll">
            <div class="directory flex flex-column grid-gap-4">
                <el-menu :default-active="selectedIndex" class="apps-director-menu">
                    <template v-for="(item, index) in props.data.directory">
                        <template v-if="item.is_dir">
                            <el-sub-menu :index="index+''">
                                <template #title>
                                    <el-icon>
                                        <Folder />
                                    </el-icon>
                                    <span>{{ item.title }}</span>
                                </template>
                                <template v-for="(d, i) in item.children">
                                    <el-menu-item :index="`${index}-${i}`" @click="setSelected(d)">
                                        <el-icon>
                                            <Document />
                                        </el-icon>
                                        <span>{{ d.title }}</span>
                                    </el-menu-item>
                                </template>
                            </el-sub-menu>
                        </template>
                        <template v-else>
                            <el-menu-item :index="index+''" @click="setSelected(item)">
                                <el-icon>
                                    <Document />
                                </el-icon>
                                <span>{{ item.title }}</span>
                            </el-menu-item>
                        </template>
                    </template>
                </el-menu>
            </div>
        </el-scrollbar>
        <el-scrollbar class="flex-1 p-4" ref="contentScrollRef" @scroll="handelScroll">
            <xl-marked-text :content="selected.content" />
            <template v-if="selected.collapse">
                <el-collapse v-model="collapse">
                    <el-collapse-item v-for="(item, index) in selected.collapse" :title="item.title" :name="index">
                        <xl-marked-text :content="item.content" />
                    </el-collapse-item>
                </el-collapse>
            </template>
        </el-scrollbar>
    </div>
</template>
<style lang="scss" scoped>
.directory {
    width: 240px;

    .directory-item {
        cursor: pointer;

        &:hover {
            background: var(--el-bg-color-page);
        }

        &.active {
            background: var(--el-text-color-primary);
            color: var(--el-bg-color);
        }
    }
}

</style>
<style lang="scss">
.apps-director-menu{
    --el-menu-hover-bg-color:var(--el-bg-color-page);
    .el-menu-item,.el-sub-menu__title{
        border-radius: 6px;
    }
    .el-menu-item.is-active{
            background: var(--el-text-color-primary);
            color: var(--el-bg-color);
    }
}</style>
