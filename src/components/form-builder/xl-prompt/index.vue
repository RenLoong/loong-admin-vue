<script setup lang="ts">
const props = withDefaults(defineProps<{
    prompt: any
}>(), {
    prompt: []
});
</script>

<template>
    <div class="flex flex-y-center flex-warp" v-for="(item, index) in props.prompt" :index="index">
        <component v-for="(c, cindex) in item" :index="cindex" :is="'el-'+c.component" v-bind="c.props">
            <template v-for="(slot, _slot) in c.children" v-slot="_slot">
                <component :is="slot.component" v-bind="slot.props" v-if="typeof slot==='object'"/>
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