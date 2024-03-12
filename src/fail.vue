<script setup lang="ts">
import router from '@/routers';
const description=ref<string>('404，小伙伴你迷路了哦');
const query=router.currentRoute.value.query;
if(query.code){
    description.value=`[${query.code}]${query.msg}`;
}
</script>

<template>
    <main class="layouts flex flex-center layouts-empty">
        <el-empty :description="description">
            <el-button type="primary" @click="router.go(-1)">上一页</el-button>
            <el-button type="default" @click="router.push('/')">返回首页</el-button>
        </el-empty>
    </main>
</template>

<style scoped>
.layouts-empty {
    height: 100vh;
    background-color: var(--el-bg-color);
}
</style>
