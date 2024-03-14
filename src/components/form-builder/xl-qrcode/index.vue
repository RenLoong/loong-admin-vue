<script lang="ts" setup>
import QRCode from "qrcode";
const props = withDefaults(defineProps<{
    text?: string
}>(), {
});
const emit = defineEmits(['update'])
const qrcode = ref('');
watchEffect(() => {
    qrcode.value = '';
    if (props.text) {
        QRCode.toDataURL(props.text, (_error: Error | null | undefined, url: string) => {
            qrcode.value = url
            emit('update');
        });
    }
})
</script>
<template>
    <div>
        <img v-if="qrcode" :src="qrcode" style="width: 100%;height: 100%;">
    </div>
</template>