<script setup lang="ts">
import components from '@/layouts'
</script>

<template>
    <div class="flex flex-column">
        <span class="h10 text-danger">请检查菜单配置中的component是否正确</span>
        <span class="h10 text-success">当前支持：<el-tag type="success" v-for="(_name, index) in components"
                :key="index">{{ index.toString().replace(new RegExp('Component', "g"), '') }}</el-tag></span>
		<xl-code lang="json">
{{ `
#使用示例 admin.json
{
	"title": "控制台",
	"icon": "ElementPlus",
	"path": "Index/index",
	"component": "table"
}` }}
		</xl-code>
		<xl-code lang="php">
{{ `
#使用示例 IndexController.php
public function indexGetTable(Request $request)
{
	$builder = new TableBuilder();
	$builder = $builder->builder();
	return $this->resData($builder);
}
` }}
		</xl-code>
	</div>
</template>

<style lang="scss" scoped>
.el-tag+.el-tag{
	margin-left: 4px;
}
</style>
