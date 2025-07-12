<script setup lang="ts">
import tableComponent from './expand-component/table.vue'
import infoComponent from './expand-component/info.vue'
import defaultComponent from './expand-component/default.vue'
const props = withDefaults(defineProps<{
    components: any,
    row: any,
    prop: any
}>(), {
    components: []
});
const layouts = new Map();
layouts.set('table', tableComponent);
layouts.set('info', infoComponent);
</script>
<template>
    <el-row :gutter="20" class="mx-0">
        <template v-for="(component) in props.components">
            <el-col v-bind="component.col">
                <template v-if="layouts.has(component.name)">
                    <component :is="layouts.get(component.name)" :component="component" :row="props.row" />
                </template>
                <template v-else>
                    <default-component :name="component.name" :layouts="layouts" />
                </template>
            </el-col>
        </template>
    </el-row>
</template>