<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css' // 引入 css
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { useI18n } from 'vue-i18n';
const {t} = useI18n();
type InsertFnType = (url: string, poster?: string, text?: string) => void
const props = withDefaults(defineProps<{
    modelValue: string,
    placeholder?: string,
}>(), {
    modelValue: ''
});

const emit = defineEmits(['update:modelValue'])
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref(props.modelValue)
watch(() => valueHtml.value, (val) => {
    emit('update:modelValue', val);
})
const imagesRef = ref();
const videosRef = ref();
let insertFunc: InsertFnType = () => { }
const selected = (files:any) => {
    files.forEach((file:any) => {
        insertFunc(file.url)
    })
}
const toolbarConfig = {}
const editorConfig = {
    placeholder: t('form.wangeditor.placeholder'),
    MENU_CONF: {
        uploadImage: {
            // 自定义选择图片
            customBrowseAndUpload(insertFn: InsertFnType) {
                imagesRef.value.open()
                insertFunc = insertFn
            },
        },
        uploadVideo: {
            customBrowseAndUpload(insertFn: InsertFnType) {
                videosRef.value.open()
                insertFunc = insertFn
            },
        },
    }
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor: any) => {
    editorRef.value = editor // 记录 editor 实例，重要！
}
</script>

<template>
    <div class="border wangeditor-body">
        <Toolbar class="border-bottom" :editor="editorRef" :defaultConfig="toolbarConfig" />
        <Editor class="wangeditor" v-model="valueHtml" :defaultConfig="editorConfig" @onCreated="handleCreated"/>
        <xl-bundle ref="imagesRef" accept="image/*" :multiple="99" @change="selected">
            <template></template>
        </xl-bundle>
        <xl-bundle ref="videosRef" accept="video/*" :multiple="99" @change="selected">
            <template></template>
        </xl-bundle>
    </div>
</template>

<style lang="scss" scoped>
.wangeditor-body {
    z-index: 1000;
    display: flex;
    flex-direction: column;

    .wangeditor {
        flex: 1;
        overflow-y: hidden;
    }
}
</style>