<script lang="ts" setup>
import { $http } from '@/common';
import { ElMessage, UploadProps, UploadRawFile } from 'element-plus';
import highlight from 'highlight.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = withDefaults(defineProps<{
    modelValue: string,
    placeholder?: string,
    bundle?:boolean
}>(), {
    modelValue: '',
    bundle:false
});
const textareaRef = ref();
const hRef = ref();
const content = ref('');
const emits = defineEmits(['update:modelValue']);
const isFullScreen = ref(false);
const groupPopover = ref<string | null>(null);
const markedEditorRef = ref();
const markedEditorToolbarRef = ref();
watch(() => props.modelValue, (val) => {
    content.value = val;
})
watch(content, (val) => {
    emits('update:modelValue', val);
});
onMounted(() => {
    content.value = props.modelValue;
    globalThis.addEventListener('click', autoHidePopover);
});
onBeforeUnmount(() => {
    globalThis.removeEventListener('click', autoHidePopover);
});
const appendContent = (str: string, startIndex?: number, endIndex?: number) => {
    // 判断如果是第一行，去掉str开头的所有换行符
    if (content.value === '') {
        str = str.replace(/^\n+/, '');
    }
    content.value += str;
    hidePopover();
    nextTick(() => {
        if (startIndex || endIndex) {
            textareaRef.value.textarea.setSelectionRange(content.value.length - (startIndex ?? 0), content.value.length - (endIndex ?? 0));
        }
        textareaRef.value.textarea.focus();
    })
};
const insertFontH = (size: number) => {
    let hText = '';
    for (let i = 0; i < size; i++) {
        hText += '#';
    }
    hRef.value.handleClose();
    nextTick(() => {
        appendContent(`\n\n${hText} `, 0, 0);
    })
}
const insertBold = () => {
    appendContent('\n__' + t('form.markedEditor.bold') + '__', 4, 2);
};
const insertItalic = () => {
    appendContent('\n_' + t('form.markedEditor.italic') + '_', 3, 1);
}
const insertLineThrough = () => {
    appendContent('\n~~' + t('form.markedEditor.lineThrough') + '~~', 5, 2);
}
const insertList = () => {
    appendContent('\n\n- ' + t('form.markedEditor.listItem') + '', 3, 0);
}
const insertNumList = () => {
    appendContent('\n\n1. ' + t('form.markedEditor.listItem') + '', 3, 0);
}
const textareaEnter = (e: KeyboardEvent | Event): any => {
    // 获取光标位置，判断光标所在行是否是列表
    const selectionEnd = textareaRef.value.textarea.selectionEnd;
    // 通过光标位置获取光标所在行的文本
    const text = content.value.substring(content.value.lastIndexOf("\n", selectionEnd), selectionEnd);
    switch (true) {
        // 判断text是否为"\n- "开头
        case text.startsWith("\n- ") || text.startsWith("- "):
            e.preventDefault();
            appendContent('\n- ');
            break;
        // 判断text是否为"\n数字. "开头
        case /^\d+\. /.test(text) || /^\n\d+\. /.test(text):
            const numTextArr = text.match(/^(\d+)\. /);
            const numTextArr2 = text.match(/^\n(\d+)\. /);
            if (numTextArr) {
                e.preventDefault();
                const num = parseInt(numTextArr[1]);
                appendContent(`\n${num + 1}. `);
            } else if (numTextArr2) {
                e.preventDefault();
                const num = parseInt(numTextArr2[1]);
                appendContent(`\n${num + 1}. `);
            }
            break;
    }
}
const insertTable = (item: any) => {
    const { x, y } = item;
    // |:-|:-|:-|
    let tableText = '\n\n|';
    for (let i = 0; i < x; i++) {
        tableText += ' ' + t('form.markedEditor.tableHeader') + ' |';
    }
    tableText += '\n|';
    for (let i = 0; i < x; i++) {
        tableText += ':-|';
    }
    for (let i = 0; i < y; i++) {
        tableText += '\n|';
        for (let j = 0; j < x; j++) {
            tableText += ' ' + t('form.markedEditor.tableCell') + ' |';
        }
    }
    appendContent(tableText);
}
const selectedTableColumn = ref({ x: 0, y: 0 });
const hoverTableColumn = (num?: number) => {
    if (!num) {
        selectedTableColumn.value = { x: 0, y: 0 };
        return;
    }
    selectedTableColumn.value = getTableXY(num);
}
const getTableXY = (num: number) => {
    // 十行十列，通过num获取x,y
    const x = num % 10 === 0 ? 10 : num % 10;
    const y = Math.floor(num / 10) + 1;
    return { x, y };
}
const TableData = ref<any[]>([]);
for (let i = 1; i <= 100; i++) {
    TableData.value.push({
        num: i,
        ...getTableXY(i)
    });
}
const linkForm = ref({
    url: '',
    text: '',
    style: ''
});
const linkFormRef = ref();
const insertUrl = () => {
    if (!linkForm.value.url) {
        return;
    }
    groupPopover.value = null;
    appendContent(`\n\n[${linkForm.value.text ? linkForm.value.text : linkForm.value.url}${linkForm.value.style ? `{style ${linkForm.value.style}}` : ''}](${linkForm.value.url})`);
    linkFormRef.value.resetFields();
}
const codeForm = ref({
    language: '',
    code: ''
});
const codeFormRef = ref();
const insertCode = () => {
    if (!codeForm.value.code || !codeForm.value.language) {
        return;
    }
    groupPopover.value = null;
    appendContent(`\n\n\`\`\`${codeForm.value.language}\n${codeForm.value.code}\n\`\`\``);
    codeFormRef.value.resetFields();
}
const languageList = highlight.listLanguages();
const imageForm = ref({
    url: '',
    text: '',
    width: '',
    height: '',
    style: ''
});
const imageFormRef = ref();
const insertImage = () => {
    if (!imageForm.value.url) {
        return;
    }
    groupPopover.value = null;
    if (imageForm.value.width) {
        imageForm.value.style = `${imageForm.value.style}width:${imageForm.value.width};`;
    }
    if (imageForm.value.height) {
        imageForm.value.style = `${imageForm.value.style}height:${imageForm.value.height};`;
    }
    appendContent(`\n\n![${imageForm.value.text ? imageForm.value.text : 'image'}${imageForm.value.style ? `{style ${imageForm.value.style}}` : ''}](${imageForm.value.url})`);
    imageFormRef.value.resetFields();
}

const handleUploadSuccess: UploadProps['onSuccess'] = (
    res: any
) => {
    if (res.code === $http.ResponseCode.SUCCESS) {
        switch (res.data.dir_name) {
            case 'uploads/marked':
                imageForm.value.url = res.data.url;
                break;
        }
    } else {
        ElMessage.info(res.msg);
    }
}
const beforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
    if (rawFile.type.indexOf('image') === -1) {
        ElMessage.error(t('form.markedEditor.uploadImageError'))
        return false
    }
    if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error(t('form.markedEditor.uploadImageSizeError', { size: '2M' }))
        return false
    }
    return true
}
const autoHidePopover = (e: MouseEvent) => {
    if (!groupPopover.value || !markedEditorToolbarRef.value || lockHidePopover.value) {
        return;
    }
    if (markedEditorToolbarRef.value && markedEditorToolbarRef.value.contains(e.target as HTMLElement)) {
        return;
    }
    hidePopover();
}
const hidePopover = () => {
    groupPopover.value = null;
}
const imagesRef = ref();
const lockHidePopover=ref(false);
const imageSelected = (file: any) => {
    imageForm.value.url=file.url;
    nextTick(()=>{
        groupPopover.value='image'
    })
}
const imageClosed = () => {
    lockHidePopover.value=false;
}
const openBundle=()=>{
    imagesRef.value?.open();
    lockHidePopover.value=true;
}
</script>
<template>
    <div class="marked-editor" ref="markedEditorRef" :class="{ 'marked-editor-full-screen': isFullScreen }">
        <div class="marked-editor-toolbar" ref="markedEditorToolbarRef">
            <el-dropdown placement="bottom-start" ref="hRef">
                <el-icon class="marked-editor-toolbar-icon">
                    <svg t="1695806375877" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="2489" width="48" height="48">
                        <path
                            d="M704 896H602.496l-72.512-210.24H233.856L165.376 896H64L334.848 128h98.24L704 896zM501.44 598.976L394.048 279.68c-3.392-10.176-7.04-28.096-11.008-53.504h-2.304c-3.392 23.168-7.232 40.96-11.456 53.504L262.72 598.976h238.72zM735.04 604.48C766.72 585.472 803.328 576 844.736 576c76.8 0 115.2 38.656 115.2 116.032v196.736h-55.872v-47.232h-1.408c-22.08 36.352-54.592 54.464-97.6 54.464-30.976 0-55.488-8-73.728-24.064-18.24-16-27.392-37.696-27.392-64.896 0-57.216 35.264-90.368 105.664-99.84l94.464-12.672c0-49.92-21.504-74.88-64.512-74.88-38.208 0-73.024 12.288-104.512 36.992v-52.16z m94.464 140.672c-26.112 3.328-44.096 9.536-54.016 18.816-9.92 9.216-14.784 22.08-14.784 38.656 0 14.528 5.376 26.368 16.128 35.648 10.752 9.216 24.96 13.824 42.56 13.824 24.64 0 44.864-8.32 60.8-24.896 15.872-16.576 23.872-37.376 23.872-62.464v-29.312l-74.56 9.728z"
                            p-id="2490"></path>
                    </svg>
                </el-icon>
                <template #dropdown>
                    <div class="marked-editor-toolbar-h-list">
                        <div v-for="n in 6" :class="'h' + n" class="marked-editor-toolbar-h" @click="insertFontH(n)">H{{
                            n
                            }} {{ t('form.markedEditor.fontSize') }}</div>
                    </div>
                </template>
            </el-dropdown>
            <el-tooltip effect="dark" :content="t('form.markedEditor.bold')" placement="bottom-start">
                <el-icon class="marked-editor-toolbar-icon" @click="insertBold">
                    <svg t="1695807555131" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="2628" width="48" height="48">
                        <path
                            d="M270.528 894.464V129.536h224.704c67.136 0 120.768 16.064 160.896 48.128 40.256 32.064 60.224 74.624 60.224 127.616 0 42.176-11.904 79.36-35.776 111.616-23.872 32.256-56.768 55.168-98.496 68.672v1.984c52.032 5.888 93.504 25.6 124.608 59.008s46.72 75.84 46.72 127.104c0 65.856-23.616 119.104-70.848 159.744-47.232 40.704-107.776 60.992-181.504 60.992H270.528zM369.28 216v239.488h89.856c47.744 0 85.184-11.648 112.32-34.816 27.2-23.232 40.768-55.424 40.768-96.576 0-72.064-48.064-108.16-144.192-108.16H369.28z m0 325.376v266.624h118.528c51.648 0 91.584-11.968 119.68-35.776 28.096-23.872 42.24-57.088 42.24-99.52 0-87.552-59.392-131.392-178.24-131.392H369.28z"
                            p-id="2629"></path>
                    </svg>
                </el-icon>
            </el-tooltip>
            <el-tooltip effect="dark" :content="t('form.markedEditor.italic')" placement="bottom-start">
                <el-icon class="marked-editor-toolbar-icon" @click="insertItalic">
                    <svg t="1695807605947" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="2767" width="48" height="48">
                        <path d="M508.288 896h-128L515.712 128h128z" p-id="2768"></path>
                    </svg>
                </el-icon>
            </el-tooltip>
            <el-tooltip effect="dark" :content="t('form.markedEditor.lineThrough')" placement="bottom-start">
                <el-icon class="marked-editor-toolbar-icon" @click="insertLineThrough">
                    <svg t="1695808049082" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="3326" width="48" height="48">
                        <path
                            d="M842.88 599.68h-96.192c-3.968-5.952-8-9.792-11.84-15.68-33.28-41.28-94.208-80.576-178.752-121.792-76.48-37.248-127.552-68.736-151.104-90.304-23.552-21.632-35.392-51.072-35.392-86.4 0-39.232 15.744-70.656 49.152-92.288 33.344-21.568 76.544-33.344 129.536-33.344 80.512 0 145.344 17.664 198.4 54.976V93.12c-39.296-21.632-104.128-31.424-188.544-31.424-88.384 0-161.024 21.568-217.984 62.848-56.96 41.28-86.4 98.112-86.4 170.816 0 47.168 13.696 90.304 41.216 127.68 27.584 37.184 84.48 76.48 170.88 119.68 47.104 23.616 82.496 41.28 107.968 56.96H181.12v66.624h469.312c11.904 19.776 17.6 39.296 17.6 62.912 0 86.464-60.864 129.472-182.592 129.472-39.232 0-82.432-7.744-125.696-21.504-45.12-15.68-80.448-33.408-105.984-57.088v127.808c21.568 13.696 54.912 25.344 100.096 35.328a575.104 575.104 0 0 0 119.808 13.696c98.176 0 174.784-19.584 229.632-60.8 55.04-41.28 82.56-98.176 82.56-174.656 0-19.776-3.968-37.44-7.872-55.168h64.832V599.68z"
                            p-id="3327"></path>
                    </svg>
                </el-icon>
            </el-tooltip>
            <span class="marked-editor-toolbar-hr" />
            <el-popover placement="bottom" :visible="groupPopover === 'code'" :width="400" trigger="click" popper-style="z-index:900;"
                :teleported="false">
                <template #reference>
                    <el-icon class="marked-editor-toolbar-icon" @click="hidePopover(), groupPopover = 'code';">
                        <svg t="1695808555526" class="icon" viewBox="0 0 1027 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="24653" width="48" height="48">
                            <path
                                d="M321.828571 226.742857c-14.628571-14.628571-36.571429-14.628571-51.2 0L7.314286 482.742857c-14.628571 14.628571-14.628571 36.571429 0 51.2l256 256c14.628571 14.628571 36.571429 14.628571 51.2 0 14.628571-14.628571 14.628571-36.571429 0-51.2L87.771429 512l234.057142-234.057143c7.314286-14.628571 7.314286-36.571429 0-51.2z m263.314286 0c-14.628571 0-36.571429 7.314286-43.885714 29.257143l-131.657143 497.371429c-7.314286 21.942857 7.314286 36.571429 29.257143 43.885714s36.571429-7.314286 43.885714-29.257143l131.657143-497.371429c7.314286-14.628571-7.314286-36.571429-29.257143-43.885714z m431.542857 256l-256-256c-14.628571-14.628571-36.571429-14.628571-51.2 0-14.628571 14.628571-14.628571 36.571429 0 51.2L936.228571 512l-234.057142 234.057143c-14.628571 14.628571-14.628571 36.571429 0 51.2 14.628571 14.628571 36.571429 14.628571 51.2 0l256-256c14.628571-14.628571 14.628571-43.885714 7.314285-58.514286z"
                                p-id="24654"></path>
                        </svg>
                    </el-icon>
                </template>
                <el-form :model="codeForm" ref="codeFormRef" label-position="top" @submit.prevent="insertCode">
                    <el-form-item :label="t('form.markedEditor.language')" prop="language">
                        <el-select v-model="codeForm.language" :placeholder="t('form.markedEditor.selectLanguage')"
                            filterable class="w-100" :teleported="false">
                            <el-option v-for="item in languageList" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="t('form.markedEditor.code')" prop="code">
                        <el-input type="textarea" v-model="codeForm.code"
                            :placeholder="t('form.markedEditor.inputCode')" :autosize="{ minRows: 5, maxRows: 10 }" />
                    </el-form-item>
                    <div class="flex flex-x-space-between pt-6">
                        <el-button text bg type="info" @click="groupPopover = null, codeFormRef.resetFields()">{{
                            t('button.cancelText') }}</el-button>
                        <el-button native-type="submit" type="primary">{{ t('button.insertText') }}</el-button>
                    </div>
                </el-form>
            </el-popover>
            <span class="marked-editor-toolbar-hr" />
            <el-tooltip effect="dark" :content="t('form.markedEditor.list')" placement="bottom-start">
                <el-icon class="marked-editor-toolbar-icon" @click="insertList">
                    <svg t="1695809711912" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="26497" width="48" height="48">
                        <path
                            d="M921.698544 549.048801l-566.082756 0c-20.748556 0-37.539988-16.790408-37.539988-37.539988 0-20.733207 16.791431-37.542035 37.539988-37.542035l566.082756 0c20.756743 0 37.546128 16.807804 37.546128 37.542035C959.244672 532.258393 942.455287 549.048801 921.698544 549.048801L921.698544 549.048801zM921.698544 248.724805l-566.082756 0c-20.748556 0-37.539988-16.808828-37.539988-37.541011 0-20.73116 16.791431-37.539988 37.539988-37.539988l566.082756 0c20.756743 0 37.546128 16.808828 37.546128 37.539988C959.244672 231.915977 942.455287 248.724805 921.698544 248.724805L921.698544 248.724805zM136.509559 886.907669c-41.464367 0-75.086116-33.616632-75.086116-75.075883 0-41.46539 33.621748-75.079976 75.086116-75.079976 41.460274 0 75.080999 33.615609 75.080999 75.079976C211.590558 853.29206 177.969832 886.907669 136.509559 886.907669L136.509559 886.907669zM136.509559 586.588789c-41.464367 0-75.086116-33.621748-75.086116-75.078952 0-41.467437 33.621748-75.083046 75.086116-75.083046 41.460274 0 75.080999 33.615609 75.080999 75.083046C211.590558 552.966017 177.969832 586.588789 136.509559 586.588789L136.509559 586.588789zM136.509559 286.263769c-41.464367 0-75.086116-33.615609-75.086116-75.079976 0-41.46539 33.621748-75.082022 75.086116-75.082022 41.460274 0 75.080999 33.615609 75.080999 75.082022C211.590558 252.649184 177.969832 286.263769 136.509559 286.263769L136.509559 286.263769zM355.615788 774.286682l566.082756 0c20.756743 0 37.546128 16.791431 37.546128 37.541011s-16.789385 37.541011-37.546128 37.541011l-566.082756 0c-20.748556 0-37.539988-16.791431-37.539988-37.541011S334.866209 774.286682 355.615788 774.286682L355.615788 774.286682zM355.615788 774.286682"
                            p-id="26498"></path>
                    </svg>
                </el-icon>
            </el-tooltip>
            <el-tooltip effect="dark" :content="t('form.markedEditor.numList')" placement="bottom-start">
                <el-icon class="marked-editor-toolbar-icon" @click="insertNumList">
                    <svg t="1695809760748" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="29693" width="48" height="48">
                        <path
                            d="M341 128h614v81H341zM341 470h614v80H341zM341 812h614v79H341zM153 121v175h44V42h-34.2l-0.8 2c-8.2 25.5-31.7 46.5-69.9 62.6l-2.1 0.7v45l5-1.9c23.7-9.6 42-19.6 58-29.4zM242 598H129.2c11.8-15 29.9-31.3 54-49.2 44.9-28.9 65.6-60.2 61.6-92.7-3.3-45.8-30.6-70.2-81.2-72.6-43.8 0-73.8 20.9-89.2 62.3l-1.1 3.1 44.3 19.3 1-3.9c6.7-24.5 19.9-36.8 40.4-37.5 26.6 0 39 10.1 39 32.2 1.4 17.5-14.7 38.3-48.1 61.8-34.9 25.3-61.8 54.7-80 87.8l-0.4 28.4H242v-39zM205 845c22.4-11 33.7-28 33.7-50.8-1.7-46.6-28.9-70.8-81.2-71.6-44 0.9-72 23.5-83.4 67.4l-0.9 3.4 47 11.1 0.7-3.5c4.5-22.9 16.9-34.7 37.8-36.1 21.1 0.7 31.3 9.6 32.1 28C189.3 816 174.9 827 147 827h-23v42h32.3c27.3 1 41.6 11.4 43.8 32.9 0.3 13.4-2.9 22.9-9.4 29.5-6.7 6.7-17.5 9.6-31.9 9.6h-2.4c-24.1-1-37.4-13.2-40.3-39l-0.5-3.6-47 11.1 0.7 3.3c8.9 44.8 39 68 89.5 68.8 56-2.4 86-28.5 89.3-77.8-0.7-25.8-15.2-45.6-43.1-58.8z"
                            p-id="29694"></path>
                    </svg>
                </el-icon>
            </el-tooltip>
            <el-dropdown placement="bottom-start">
                <el-icon class="marked-editor-toolbar-icon">
                    <svg t="1695809802372" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="31629" width="48" height="48">
                        <path
                            d="M959.825022 384.002258V191.939717C959.825022 121.2479 902.517291 63.940169 831.825474 63.940169H191.939717C121.2479 63.940169 63.940169 121.2479 63.940169 191.939717v639.885757C63.940169 902.517291 121.2479 959.825022 191.939717 959.825022h639.885757c70.691817 0 127.999548-57.307731 127.999548-127.999548V384.002258zM146.66502 146.66502a63.737872 63.737872 0 0 1 45.336109-18.784682h639.997742A63.961844 63.961844 0 0 1 895.884854 192.001129V320.062089H127.880338V192.001129A63.737872 63.737872 0 0 1 146.66502 146.66502z m269.1267 461.308451v-223.971213h192.181751v223.971213h-192.181751z m192.181751 63.940169v223.971214h-192.181751v-223.971214h192.181751z m-256.12192-63.940169H127.880338v-223.971213h223.971213v223.971213z m-205.186531 269.235073a63.466939 63.466939 0 0 1-18.784682-45.209673V671.91364h223.971213v223.971214H192.001129a63.625887 63.625887 0 0 1-45.336109-18.67631z m749.219834-45.209673A63.763159 63.763159 0 0 1 831.998871 895.884854H671.91364v-223.971214h223.971214v160.085231z m0-224.0254h-223.971214v-223.971213h223.971214v223.971213z"
                            p-id="31630"></path>
                    </svg>
                </el-icon>
                <template #dropdown>
                    <div class="marked-editor-toolbar-table" @mouseout="hoverTableColumn()">
                        <div class="marked-editor-toolbar-table-column" v-for="item in TableData"
                            :class="{ 'marked-editor-toolbar-table-column-active': selectedTableColumn.x >= item.x && selectedTableColumn.y >= item.y }"
                            @mouseenter="hoverTableColumn(item.num)" @click="insertTable({ x: item.x, y: item.y })">
                        </div>
                    </div>
                </template>
            </el-dropdown>
            <span class="marked-editor-toolbar-hr" />
            <el-popover placement="bottom" :visible="groupPopover === 'link'" :width="400" trigger="click" popper-style="z-index:900;"
                :teleported="false">
                <template #reference>
                    <el-icon class="marked-editor-toolbar-icon" @click="hidePopover(), groupPopover = 'link'">
                        <svg t="1695808337506" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="20619" width="48" height="48">
                            <path
                                d="M607.934444 417.856853c-6.179746-6.1777-12.766768-11.746532-19.554358-16.910135l-0.01228 0.011256c-6.986111-6.719028-16.47216-10.857279-26.930349-10.857279-21.464871 0-38.864146 17.400299-38.864146 38.864146 0 9.497305 3.411703 18.196431 9.071609 24.947182l-0.001023 0c0.001023 0.001023 0.00307 0.00307 0.005117 0.004093 2.718925 3.242857 5.953595 6.03853 9.585309 8.251941 3.664459 3.021823 7.261381 5.997598 10.624988 9.361205l3.203972 3.204995c40.279379 40.229237 28.254507 109.539812-12.024871 149.820214L371.157763 796.383956c-40.278355 40.229237-105.761766 40.229237-146.042167 0l-3.229554-3.231601c-40.281425-40.278355-40.281425-105.809861 0-145.991002l75.93546-75.909877c9.742898-7.733125 15.997346-19.668968 15.997346-33.072233 0-23.312962-18.898419-42.211381-42.211381-42.211381-8.797363 0-16.963347 2.693342-23.725354 7.297197-0.021489-0.045025-0.044002-0.088004-0.066515-0.134053l-0.809435 0.757247c-2.989077 2.148943-5.691629 4.669346-8.025791 7.510044l-78.913281 73.841775c-74.178443 74.229608-74.178443 195.632609 0 269.758863l3.203972 3.202948c74.178443 74.127278 195.529255 74.127278 269.707698 0l171.829484-171.880649c74.076112-74.17435 80.357166-191.184297 6.282077-265.311575L607.934444 417.856853z"
                                p-id="20620"></path>
                            <path
                                d="M855.61957 165.804257l-3.203972-3.203972c-74.17742-74.178443-195.528232-74.178443-269.706675 0L410.87944 334.479911c-74.178443 74.178443-78.263481 181.296089-4.085038 255.522628l3.152806 3.104711c3.368724 3.367701 6.865361 6.54302 10.434653 9.588379 2.583848 2.885723 5.618974 5.355985 8.992815 7.309476 0.025583 0.020466 0.052189 0.041956 0.077771 0.062422l0.011256-0.010233c5.377474 3.092431 11.608386 4.870938 18.257829 4.870938 20.263509 0 36.68962-16.428158 36.68962-36.68962 0-5.719258-1.309832-11.132548-3.645017-15.95846l0 0c-4.850471-10.891048-13.930267-17.521049-20.210297-23.802102l-3.15383-3.102664c-40.278355-40.278355-24.982998-98.79612 15.295358-139.074476l171.930791-171.830507c40.179095-40.280402 105.685018-40.280402 145.965419 0l3.206018 3.152806c40.279379 40.281425 40.279379 105.838513 0 146.06775l-75.686796 75.737962c-10.296507 7.628748-16.97358 19.865443-16.97358 33.662681 0 23.12365 18.745946 41.87062 41.87062 41.87062 8.048303 0 15.563464-2.275833 21.944801-6.211469 0.048095 0.081864 0.093121 0.157589 0.141216 0.240477l1.173732-1.083681c3.616364-2.421142 6.828522-5.393847 9.529027-8.792247l79.766718-73.603345C929.798013 361.334535 929.798013 239.981676 855.61957 165.804257z"
                                p-id="20621"></path>
                        </svg>
                    </el-icon>
                </template>
                <el-form :model="linkForm" ref="linkFormRef" label-position="top" @submit.prevent="insertUrl">
                    <el-form-item :label="t('form.markedEditor.link')" prop="url">
                        <el-input v-model="linkForm.url" :placeholder="t('form.markedEditor.linkPlaceholder')" />
                    </el-form-item>
                    <el-form-item :label="t('form.markedEditor.title')" prop="text">
                        <el-input v-model="linkForm.text" :placeholder="t('form.markedEditor.titlePlaceholder')" />
                    </el-form-item>
                    <el-form-item :label="t('form.markedEditor.cssStyle')" prop="style">
                        <el-input v-model="linkForm.style" :placeholder="t('form.markedEditor.cssStylePlaceholder')" />
                        <div class="line-height-2 pt-2 text-grey h10 w-100">
                            <div>{{ t('form.markedEditor.cssStyleFormat') }}</div>
                        </div>
                    </el-form-item>
                    <div class="flex flex-x-space-between pt-6">
                        <el-button text bg type="info" @click="groupPopover = null, linkFormRef.resetFields()">{{
                            t('button.cancelText') }}</el-button>
                        <el-button native-type="submit" type="primary">{{ t('button.insertText') }}</el-button>
                    </div>
                </el-form>
            </el-popover>
            <el-popover placement="bottom" :visible="groupPopover === 'image'" :width="400" popper-style="z-index:900;"
                :teleported="false">
                <template #reference>
                    <el-icon class="marked-editor-toolbar-icon" @click="hidePopover(), groupPopover = 'image'">
                        <svg t="1695808464274" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="22692" width="48" height="48">
                            <path
                                d="M576 928H192c-52.992 0-96-43.093333-96-96V192c0-52.992 43.093333-96 96-96h640c52.992 0 96 43.093333 96 96v384.064c0 17.706667-14.293333 32-32 32s-32-14.293333-32-32V192.021333c0-17.706667-14.4-32-32-32H192c-17.706667 0-32 14.378667-32 32v639.957334c0 17.706667 14.4 32 32 32h384c17.706667 0 32 14.314667 32 32 0 17.706667-14.293333 32.021333-32 32.021333zM128 693.312a32.064 32.064 0 0 1-22.613333-54.698667l159.402666-159.338666a95.786667 95.786667 0 0 1 110.72-17.984l173.589334 86.805333c12.309333 6.186667 27.093333 3.797333 36.8-5.994667l287.402666-287.445333a32.042667 32.042667 0 0 1 45.290667 45.312L631.210667 587.392a95.786667 95.786667 0 0 1-110.72 18.005333l-173.589334-86.826666a31.616 31.616 0 0 0-36.8 6.016l-159.509333 159.317333c-6.186667 6.314667-14.4 9.386667-22.592 9.386667z m320-277.376c-52.906667 0-96-43.093333-96-96s43.093333-96.021333 96-96.021333 96 43.093333 96 96-43.093333 96.021333-96 96.021333z m0-128c-17.6 0-32 14.378667-32 32 0 17.6 14.4 32 32 32s32-14.4 32-32c0-17.621333-14.4-32-32-32zM768 928c-17.706667 0-32-14.293333-32-32v-192.021333c0-17.706667 14.293333-32 32-32s32 14.293333 32 32v192c0 17.706667-14.293333 32.021333-32 32.021333z m128-128c-7.893333 0-15.701333-2.922667-21.909333-8.725333L768 691.669333l-106.090667 99.712a31.936 31.936 0 0 1-45.226666-1.408 31.957333 31.957333 0 0 1 1.408-45.205333l112.213333-105.386667A48.554667 48.554667 0 0 1 768 621.44c14.72 0 28.501333 6.613333 37.696 17.92l112.213333 105.386667A31.957333 31.957333 0 0 1 896 800z"
                                p-id="22693"></path>
                        </svg>
                    </el-icon>
                </template>
                <el-form :model="imageForm" ref="imageFormRef" label-position="top" @submit.prevent="insertImage">
                    <el-form-item :label="t('form.markedEditor.imageTitle')" prop="text">
                        <el-input v-model="imageForm.text" :placeholder="t('form.markedEditor.imageTitle')" />
                    </el-form-item>
                    <el-form-item :label="t('form.markedEditor.imageLink')" prop="url">
                        <el-input v-model="imageForm.url" :placeholder="t('form.markedEditor.imageLinkPlaceholder')" />
                        <uploads :data="{ dir_name: 'uploads/marked', dir_title: t('form.markedEditor.imageDirTitle') }"
                            :show-file-list="false" accept="image/*" :on-success="handleUploadSuccess"
                            :before-upload="beforeUpload">
                            <el-button type="primary" size="small">{{ t('button.uploadText') }}</el-button>
                            <el-button type="success" size="small" @click.stop="openBundle" v-if="props.bundle">{{
                                t('button.byBundleSelectText') }}</el-button>
                        </uploads>
                    </el-form-item>
                    <el-form-item :label="t('form.markedEditor.widthHeight')">
                        <div class="flex flex-center">
                            <el-form-item prop="width">
                                <el-input v-model="imageForm.width"
                                    :placeholder="t('form.markedEditor.widthPlaceholder')" />
                            </el-form-item>
                            <div class="mx-2">-</div>
                            <el-form-item prop="height">
                                <el-input v-model="imageForm.height"
                                    :placeholder="t('form.markedEditor.heightPlaceholder')" />
                            </el-form-item>
                        </div>
                        <div class="line-height-2 pt-2 text-grey h10 w-100">
                            <div>{{ t('form.markedEditor.widthHeightFormat') }}</div>
                        </div>
                    </el-form-item>
                    <el-form-item :label="t('form.markedEditor.cssStyle')" prop="style">
                        <el-input v-model="imageForm.style" :placeholder="t('form.markedEditor.cssStylePlaceholder')" />
                        <div class="line-height-2 pt-2 text-grey h10 w-100">
                            <div>{{ t('form.markedEditor.cssStyleFormat') }}</div>
                        </div>
                    </el-form-item>
                    <div class="flex flex-x-space-between pt-6">
                        <el-button text bg type="info" @click="groupPopover = null, imageFormRef.resetFields()">{{
                            t('button.cancelText') }}</el-button>
                        <el-button native-type="submit" type="primary">{{ t('button.insertText') }}</el-button>
                    </div>
                </el-form>
            </el-popover>
            <span class="marked-editor-toolbar-hr" />
            <el-tooltip effect="dark" :content="t('form.markedEditor.exitFullScreen')" placement="bottom-start"
                v-if="isFullScreen">
                <el-icon class="marked-editor-toolbar-icon" @click="hidePopover(), isFullScreen = !isFullScreen">
                    <svg t="1695874407576" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="32743" width="48" height="48">
                        <path
                            d="M448 614.4v249.6c0 19.2-12.8 32-32 32s-32-12.8-32-32v-179.2l-198.4 198.4c-6.4 12.8-19.2 12.8-25.6 12.8s-19.2 0-25.6-6.4c-12.8-12.8-12.8-32 0-44.8L339.2 640H160c-19.2 0-32-12.8-32-32s12.8-32 32-32H448V614.4zM864 448c19.2 0 32-12.8 32-32s-12.8-32-32-32h-179.2l198.4-198.4c12.8-12.8 12.8-32 0-44.8s-32-12.8-44.8 0L640 339.2V160c0-19.2-12.8-32-32-32s-32 12.8-32 32V448h288z m32 160c0-19.2-12.8-32-32-32H576v288c0 19.2 12.8 32 32 32s32-12.8 32-32v-179.2l198.4 198.4c6.4 6.4 12.8 6.4 25.6 6.4s19.2 0 25.6-6.4c12.8-12.8 12.8-32 0-44.8L684.8 640h179.2c19.2 0 32-12.8 32-32zM416 128c-19.2 0-32 12.8-32 32v179.2L185.6 134.4c-12.8-6.4-38.4-6.4-51.2 0s-6.4 38.4 0 51.2L339.2 384H160c-19.2 0-32 12.8-32 32s12.8 32 32 32H448V160c0-19.2-12.8-32-32-32z"
                            p-id="32744"></path>
                    </svg>
                </el-icon>
            </el-tooltip>
            <el-tooltip effect="dark" :content="t('form.markedEditor.fullScreen')" placement="bottom-start" v-else>
                <el-icon class="marked-editor-toolbar-icon" @click="hidePopover(), isFullScreen = !isFullScreen">
                    <svg t="1695808522219" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="23661" width="48" height="48">
                        <path
                            d="M145.066667 85.333333h153.6c25.6 0 42.666667-17.066667 42.666666-42.666666S324.266667 0 298.666667 0H34.133333C25.6 0 17.066667 8.533333 8.533333 17.066667 0 25.6 0 34.133333 0 42.666667v256c0 25.6 17.066667 42.666667 42.666667 42.666666s42.666667-17.066667 42.666666-42.666666V145.066667l230.4 230.4c17.066667 17.066667 42.666667 17.066667 59.733334 0 17.066667-17.066667 17.066667-42.666667 0-59.733334L145.066667 85.333333z m170.666666 563.2L162.133333 802.133333l-76.8 76.8V725.333333C85.333333 699.733333 68.266667 682.666667 42.666667 682.666667s-42.666667 17.066667-42.666667 42.666666v256c0 25.6 17.066667 42.666667 42.666667 42.666667h256c25.6 0 42.666667-17.066667 42.666666-42.666667s-17.066667-42.666667-42.666666-42.666666H145.066667l76.8-76.8 153.6-153.6c17.066667-17.066667 17.066667-42.666667 0-59.733334-17.066667-17.066667-42.666667-17.066667-59.733334 0z m665.6 34.133334c-25.6 0-42.666667 17.066667-42.666666 42.666666v153.6l-76.8-76.8-153.6-153.6c-17.066667-17.066667-42.666667-17.066667-59.733334 0-17.066667 17.066667-17.066667 42.666667 0 59.733334l153.6 153.6 76.8 76.8H725.333333c-25.6 0-42.666667 17.066667-42.666666 42.666666s17.066667 42.666667 42.666666 42.666667h256c25.6 0 42.666667-17.066667 42.666667-42.666667v-256c0-25.6-17.066667-42.666667-42.666667-42.666666z m0-682.666667h-256c-25.6 0-42.666667 17.066667-42.666666 42.666667s17.066667 42.666667 42.666666 42.666666h153.6l-76.8 76.8-153.6 153.6c-17.066667 17.066667-17.066667 42.666667 0 59.733334 17.066667 17.066667 42.666667 17.066667 59.733334 0l153.6-153.6 76.8-76.8v153.6c0 25.6 17.066667 42.666667 42.666666 42.666666s42.666667-17.066667 42.666667-42.666666v-256c0-25.6-17.066667-42.666667-42.666667-42.666667z"
                            p-id="23662"></path>
                    </svg>
                </el-icon>
            </el-tooltip>
        </div>
        <div class="marked-editor-body">
            <el-input type="textarea" ref="textareaRef" v-model="content" :autosize="{ minRows: 10, maxRows: 20 }"
                :placeholder="placeholder" @keydown.enter="textareaEnter" />
            <xl-marked-text class="marked-editor-preview" :content="content" v-if="isFullScreen" />
        </div>
        <xl-bundle ref="imagesRef" accept="image/*" :multiple="1" @change="imageSelected" @closed="imageClosed">
            <template></template>
        </xl-bundle>
    </div>
</template>
<style lang="scss">
.marked-editor {
    display: flex;
    flex-direction: column;
    width: 100%;

    .marked-editor-body {
        flex: 1;
        display: flex;
        gap: 10px;
        overflow: hidden;
        line-height: normal;
    }

    .marked-editor-preview {
        display: none;
        background-color: var(--el-bg-color);
        padding: 12px;
    }

    &-full-screen {
        background-color: var(--el-bg-color-page);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2000;

        .marked-editor-body {
            padding: 10px;
        }

        .el-textarea {
            flex: 1;

            .el-textarea__inner {
                height: 100% !important;
                // 去掉缩放
                resize: none !important;
            }
        }

        .marked-editor-preview {
            display: block;
            flex: 1;
            height: 100%;
            overflow: auto;
        }

        .marked-editor-toolbar {
            &-icon {
                &:hover {
                    background-color: var(--el-bg-color);
                }
            }
        }
    }

    &-toolbar {
        display: flex;
        align-items: center;
        padding: 4px 0;

        &-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            border-radius: 6px;
            color: var(--el-text-color-primary);

            &:hover {
                background-color: var(--el-bg-color-page);
            }
        }

        &-h-list {
            padding: 12px;
        }

        &-h {
            padding: 8px;
            cursor: pointer;
            border-radius: 6px;

            &:hover {
                background-color: var(--el-bg-color-page);
            }
        }

        &-table {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            padding: 2px;
            width: calc(30px * 10 + 24px);
            height: calc(30px * 10 + 24px);
            gap: 2px;

            &-column {
                width: 30px;
                height: 30px;
                cursor: pointer;
                background-color: var(--el-bg-color-page);
                border-radius: 4px;

                &-active {
                    background-color: var(--el-color-primary-light-5);
                }
            }
        }

        &-hr {
            margin: 0 8px;
            border-left: solid 1px var(--el-border-color);
            height: 15px;
        }
    }
}
</style>