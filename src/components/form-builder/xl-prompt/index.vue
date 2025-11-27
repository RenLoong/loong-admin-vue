<script setup lang="ts">
import xlCode from '@/components/form-builder/xl-code/index.vue';
import xlMarkedText from '@/components/form-builder/xl-marked-text/index.vue';
import xlCopy from '@/components/form-builder/xl-copy/index.vue';
import xlCountdown from '@/components/form-builder/xl-countdown/index.vue';
import xlQrcode from '@/components/form-builder/xl-qrcode/index.vue';
const props = withDefaults(defineProps<{
    prompt: any
}>(), {
    prompt: []
});
console.log(props.prompt);
const getComponentName = (component: string) => {
    const customComponents = ['code','marked-text','copy','countdown','qrcode'];
    if (customComponents.includes(component)) {
        switch(component){
            case 'code':
                return xlCode;
            case 'marked-text':
                return xlMarkedText;
            case 'copy':
                return xlCopy;
            case 'countdown':
                return xlCountdown;
            case 'qrcode':
                return xlQrcode;
        }
    }
    return 'el-' + component;
}
</script>

<template>
    <div class="flex flex-y-center flex-wrap" v-for="(item, index) in props.prompt" :index="index">
        <component v-for="(c, cindex) in item" :index="cindex" :is="getComponentName(c.component)" v-bind="c.props">
            <template v-for="(slot, _slot) in c.children" v-slot="_slot">
                <component :is="getComponentName(slot.component)" v-bind="slot.props" v-if="typeof slot==='object'"/>
                <span v-else>{{slot}}</span>
            </template>
        </component>
    </div>
</template>

<style lang="scss">
.el-link[size="small"] {
    --el-link-font-size: 12px;
}
</style>