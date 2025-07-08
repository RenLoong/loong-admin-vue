<script lang="ts" setup>
import { ref, watch, computed, useSlots } from 'vue';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/atom-one-dark.css';

interface Props {
    /** 代码内容（可选，当未提供时使用默认插槽） */
    content?: string;
    /** 指定高亮语言，优先级高于自动检测 */
    lang?: string;
    /** 是否启用自动语言检测（当 lang 未注册或失败时） */
    autoDetect?: boolean;
    height?:string|number
}

const props = withDefaults(defineProps<Props>(), {
    content: undefined,
    lang: 'plaintext',
    autoDetect: false,
});

const slots = useSlots();
const html = ref('');
const codeTextStyle=computed(()=>{
    let style:any={};
    if(props.height){
        if(typeof props.height==='string'){
            style.height=props.height;
        }else if(typeof props.height==='number'){
            style.header=props.height+'px';
        }
    }
    return style;
})
/**
 * 按需异步加载 highlight.js 语言模块，减小打包体积
 */
async function ensureLanguage(language?: string) {
    if (language && !hljs.getLanguage(language)) {
        try {
            const mod = await import(
        /* @vite-ignore */ `highlight.js/lib/languages/${language}`
            );
            hljs.registerLanguage(language, mod.default);
        } catch {
            // ignore, will fall back to highlightAuto
        }
    }
}

/**
 * 统一获取代码内容：优先 props.content，其次默认插槽文本
 */
const codeSource = computed(() => {
    if (props.content != null) return props.content;
    const vnodes = slots.default?.() ?? [];
    return vnodes
        .map(v => (typeof v.children === 'string' ? v.children : ''))
        .join('');
});

/**
 * 根据传入内容及 lang 渲染高亮 HTML
 */
async function render(code: string) {
    if (!code) {
        html.value = '';
        return;
    }

    await ensureLanguage(props.lang);

    try {
        html.value = props.autoDetect
            ? hljs.highlightAuto(code).value
            : hljs.highlight(code, { language: props.lang }).value;
    } catch {
        html.value = hljs.highlightAuto(code).value;
    }
}

// 响应式渲染
watch([codeSource, () => props.lang], ([code]) => {
    render(code);
}, { immediate: true });

</script>

<template>
    <pre class="code-text" :style="codeTextStyle">
      <code :class="`language-${props.lang}`" v-html="html" />
    </pre>
</template>

<style scoped lang="scss">
.code-text {
    padding: 12px;
    border-radius: 6px;
    background: var(--el-bg-color-page);
    word-break: break-all;
    text-align: left;
    overflow: auto;

    code {
        background: unset;
        padding: 0;
        word-break: break-all;
    }
}
</style>