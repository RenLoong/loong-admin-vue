<script setup lang="ts">
import useTheme from '@/common/theme';
import { useRefs, useWebConfigStore } from '@/stores';

const props = withDefaults(defineProps<{
    theme?: 'light' | 'dark' | 'transparent',
    width?: string,
    height?: string
}>(), {
});
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const { theme } = useTheme();
const showLogoWhite = computed(() => props.theme === 'transparent' || theme.value === 'dark');
</script>

<template>
    <el-link :href="WEBCONFIG.web_url" target="_blank" underline="never">
        <img v-if="WEBCONFIG.logo_use === 'image' && showLogoWhite" :src="WEBCONFIG.web_logo_light" class="logo-svg" :style="{ width: props.width, height: props.height }">
        <img v-else-if="WEBCONFIG.logo_use === 'image'" :src="WEBCONFIG.web_logo_dark" class="logo-svg" :style="{ width: props.width, height: props.height }">
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 191.33 77.38" class="logo-svg" :style="{ width: props.width, height: props.height }">
            <g>
                <g id="svg26">
                    <g id="g24">
                        <path id="path14" class="logo-svg-cls-1"
                            d="M30.8,32.9q22.35-17.38,42.46-4c10,6.64,14.29,8.63,17.26,6.64,6-4,.66-12-10.62-15.92Q54,10.47,30.8,32.9Z" />
                        <path id="path16" class="logo-svg-cls-1"
                            d="M24.16,38.2q7.45-23.75,30.65-24.64C66.29,13.11,70.73,12.23,72,9c2.4-6.46-6.22-9.66-17.24-6.42Q29.43,10.07,24.16,38.2Z" />
                        <path id="path18" class="logo-svg-cls-1"
                            d="M20,51.8q-3-23,11.75-36.39c7.31-6.64,9.75-9.7,8.77-12.47-2-5.57-9.45-2.91-14.89,5.31Q13.2,27.12,20,51.8Z" />
                        <path id="path20" class="logo-svg-cls-1"
                            d="M26.41,65Q13.5,49,14.19,32.24c.35-8.28,0-11.66-2-13.09-4-2.86-5.7,4.85-5.68,11.37Q6.6,51.93,26.41,65Z" />
                        <path id="path22" class="logo-svg-cls-1"
                            d="M35.44,69.4c1.5-.67-17.24.66-25.8-14.8-3.39-6.12-5.18-8.39-7.3-8.36-4.22.06-2,6.45.92,11.14C12.88,72.71,34,70.05,35.44,69.4Z" />
                    </g>
                    <text class="logo-svg-cls-2 logo-svg-text" :class="['theme--' + props.theme]"
                        transform="translate(48.28 67.81)">{{ WEBCONFIG.web_name }}</text>
                </g>
            </g>
        </svg>
    </el-link>
</template>

<style lang="scss" scoped>
.logo-svg {
    overflow: visible;
    box-sizing: border-box;
    border-radius: 6px;

    &-text {
        fill: var(--el-text-color-primary);
    }

    &-cls-1 {
        fill: #1677ff;
        fill-rule: evenodd;
        // transform-origin: left bottom;
        // animation: expand .75s forwards;
    }

    &-cls-2 {
        font-size: 33px;
        font-family: STHeitiSC-Light, Heiti SC;
        font-weight: 300;
    }
}


@keyframes expand {
    0% {
        transform: scale(0) rotate(-45deg);
    }

    100% {
        transform: scale(1) rotate(0deg);
    }
}

.theme--transparent {
    --el-text-color-primary: #FFFFFF;
}

.theme--dark {
    --el-text-color-primary: #FFFFFF;
}
</style>
