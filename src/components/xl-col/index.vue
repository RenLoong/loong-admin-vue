<script lang="ts" setup>
const props = withDefaults(defineProps<{
    span?: number
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    row?:any
}>(), {
    span: 24
});
const classList = ref<string[]>([]);
const responsive = (s: keyof typeof props,column='column') => {
    classList.value.push(`grid-${column}-${s}-${props[s]}`);
}
watchEffect(() => {
    const keys = Object.keys(props) as (keyof typeof props)[];
    keys.forEach((s) => {
        switch (s) {
            case 'span':
                classList.value.push(`grid-column-${props[s]}`);
                break;
            case 'row':
                if(typeof props[s] === 'number'){
                    classList.value.push(`grid-row-${props[s]}`);
                }else{
                    for (const key in props[s]) {
                        if(props[s][key]){
                            responsive(key as keyof typeof props,'row');
                        }
                    }
                }
                break;
            default:
                if (props[s]) {
                    responsive(s);
                }
                break;
        }
    })
})
</script>
<template>
    <div :class="classList">
        <slot />
    </div>
</template>
<style></style>
