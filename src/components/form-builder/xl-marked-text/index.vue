<script lang="ts" setup>
import { Marked,Renderer } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { markedHighlight } from "marked-highlight";
import highlight from 'highlight.js';
import "highlight.js/styles/atom-one-dark.css";
import { onObserve } from '@/common/functions';
const props = withDefaults(defineProps<{
    content?: string
}>(), {
});
const renderer = new Renderer(
);
renderer.link = function (href: string, title: string, text: string) {
    if (!href) return '';
    let style = '';
    // 正则匹配style
    const styleReg = /{style\s(.*?)}/;
    const styleArr = text.match(styleReg);
    let newText=text;
    if (styleArr) {
        style = styleArr[1];
        newText=text.replace(styleReg,'');
    }
    return `<a href="${href}" title="${title || newText}" target="_blank" style="${style}">${newText}</a>`
}
renderer.image = function (src: string, title: string, text: string) {
    if (!src) return '';
    let style = '';
    // 正则匹配style
    const styleReg = /{style\s(.*?)}/;
    const styleArr = text.match(styleReg);
    let newText=text;
    if (styleArr) {
        style = styleArr[1];
        newText=text.replace(styleReg,'');
    }
    return `<img src="${src}" alt="${newText}" title="${title || newText}" style="${style}">`
}
const marked = new Marked(
    {
        renderer
    },
    markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
            const language = highlight.getLanguage(lang) ? lang : 'accesslog';
            return highlight.highlight(code, { language }).value;
        }
    })
);
const html = ref('');
const markedTextRef = ref<HTMLElement>();
watch(() => props.content, (val) => {
    html.value = val ? DOMPurify.sanitize(marked.parse(val as string) as string) : '';
})
onObserve(markedTextRef, (e: IntersectionObserverEntry[], done: Function) => {
    if (e[0].isIntersecting) {
        html.value = props.content ? DOMPurify.sanitize(marked.parse(props.content) as string) : '';
        done(e[0].target);
    }
})
</script>
<template>
    <div v-html="html" ref="markedTextRef" class="marked-text p-4"></div>
</template>
<style lang="scss">
.marked-text {
    img {
        width: 100%;
        max-width: 100%;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        margin: 1em 0;
        font-size: 14px;
        line-height: 1.6;
        border: 1px solid #ddd;
        th {
            padding: 10px 15px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
        }
        td {
            padding: 10px 15px;
            border: 1px solid #ddd;
        }
    }
}
</style>