<script setup lang="ts">
const props = withDefaults(defineProps<{
    name: any,
    layouts: any
}>(), {
});
</script>
<template>
    <div class="flex flex-column">
        <span class="h10 text-danger">请检查name字段是否正确，当前name：<el-tag type="danger">{{ props.name }}</el-tag></span>
        <span class="h10 text-success">当前支持：<el-tag type="success" v-for="(name, index) in props.layouts.keys()"
                :key="index">{{ name }}</el-tag></span>
        <xl-code lang="php">
        {{ `
#使用示例
$builder = new TableBuilder();
$expandBuilder = new TableBuilder([
    'size' => 'default',
]);
$expandBuilder->add('example', '示例', [
    'component' => [
        'name' => 'copy'
    ]
]);
$builder->add('example', '', [
    'components' => [
        [
            'name' => 'table',
            'prop' => 'example',
            'col'=>[
                'xs' => 24,
                'sm' => 12,
                'md' => 6,
                'lg' => 4,
            ],
            'builder' => $expandBuilder->builder()
        ]
    ],
    'props' => [
        'type' => 'expand'
    ]
]);` }}
        </xl-code>
    </div>
</template>
<style lang="scss" scoped>
.el-tag+.el-tag{
	margin-left: 4px;
}
</style>