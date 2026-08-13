<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
    type MenuForm,
    type MenuSelection,
    type SubMenuButton,
    MENU_TYPE_OPTIONS,
    KEY_REQUIRED_TYPES,
    MAX_TOP_BUTTONS,
    MAX_SUB_BUTTONS,
    createTopButton,
    createSubButton,
} from '../types'

const form = defineModel<MenuForm>({ required: true })
const selection = defineModel<MenuSelection | null>('selection', { default: null })

const formRef = ref<FormInstance>()

const currentButton = computed(() => {
    if (!selection.value) return null
    const top = form.value.button[selection.value.topIndex]
    if (!top) return null
    if (selection.value.subIndex !== undefined) {
        return top.sub_button?.[selection.value.subIndex] ?? null
    }
    return top
})

const isSubMenu = computed(() => selection.value?.subIndex !== undefined)

const hasSubButtons = computed(() => {
    if (!selection.value || selection.value.subIndex !== undefined) return false
    const top = form.value.button[selection.value.topIndex]
    return (top?.sub_button?.length ?? 0) > 0
})

const showTypeField = computed(() => {
    if (!selection.value) return false
    if (selection.value.subIndex !== undefined) return true
    return !hasSubButtons.value
})

const currentType = computed(() => {
    const btn = currentButton.value
    if (!btn || !('type' in btn)) return 'click'
    return btn.type ?? 'click'
})

const addTopButton = () => {
    if (form.value.button.length >= MAX_TOP_BUTTONS) {
        ElMessage.warning(`一级菜单最多 ${MAX_TOP_BUTTONS} 个`)
        return
    }
    form.value.button.push(createTopButton())
    selection.value = { topIndex: form.value.button.length - 1 }
}

const removeTopButton = (index: number) => {
    form.value.button.splice(index, 1)
    if (selection.value?.topIndex === index) {
        selection.value = form.value.button.length ? { topIndex: 0 } : null
    } else if (selection.value && selection.value.topIndex > index) {
        selection.value = { ...selection.value, topIndex: selection.value.topIndex - 1 }
    }
}

const selectButton = (topIndex: number, subIndex?: number) => {
    selection.value = subIndex !== undefined ? { topIndex, subIndex } : { topIndex }
}

const convertToSubMenu = () => {
    if (!selection.value || selection.value.subIndex !== undefined) return
    const top = form.value.button[selection.value.topIndex]
    if (!top) return
    if (top.sub_button?.length) return
    const { name } = top
    top.sub_button = [createSubButton()]
    delete top.type
    delete top.key
    delete top.url
    delete top.media_id
    delete top.appid
    delete top.pagepath
    delete top.article_id
    top.name = name
    selection.value = { topIndex: selection.value.topIndex, subIndex: 0 }
}

const convertToSingle = () => {
    if (!selection.value || selection.value.subIndex !== undefined) return
    const top = form.value.button[selection.value.topIndex]
    if (!top?.sub_button?.length) return
    delete top.sub_button
    top.type = 'click'
    top.key = ''
    selection.value = { topIndex: selection.value.topIndex }
}

const addSubButton = () => {
    if (!selection.value) return
    const top = form.value.button[selection.value.topIndex]
    if (!top.sub_button) top.sub_button = []
    if (top.sub_button.length >= MAX_SUB_BUTTONS) {
        ElMessage.warning(`二级菜单最多 ${MAX_SUB_BUTTONS} 个`)
        return
    }
    top.sub_button.push(createSubButton())
    selection.value = { topIndex: selection.value.topIndex, subIndex: top.sub_button.length - 1 }
}

const removeSubButton = (subIndex: number) => {
    if (!selection.value) return
    const top = form.value.button[selection.value.topIndex]
    if (!top.sub_button) return
    top.sub_button.splice(subIndex, 1)
    if (top.sub_button.length === 0) {
        delete top.sub_button
        top.type = 'click'
        top.key = ''
        selection.value = { topIndex: selection.value.topIndex }
    } else if (selection.value.subIndex !== undefined) {
        const newSubIndex = Math.min(selection.value.subIndex, top.sub_button.length - 1)
        selection.value = { topIndex: selection.value.topIndex, subIndex: newSubIndex }
    }
}

const updateType = (type: SubMenuButton['type']) => {
    const btn = currentButton.value
    if (!btn) return
    btn.type = type
    if (!KEY_REQUIRED_TYPES.includes(type)) {
        delete btn.key
    }
    if (type !== 'view' && type !== 'miniprogram') {
        delete btn.url
    }
    if (type !== 'miniprogram') {
        delete btn.appid
        delete btn.pagepath
    }
    if (type !== 'media_id') {
        delete btn.media_id
    }
    if (type !== 'article_id' && type !== 'article_view_limited') {
        delete btn.article_id
    }
}

const validateMenu = (): boolean => {
    if (!form.value.button.length) {
        ElMessage.warning('请至少添加一个一级菜单')
        return false
    }
    for (let i = 0; i < form.value.button.length; i++) {
        const top = form.value.button[i]
        if (!top.name?.trim()) {
            ElMessage.warning(`第 ${i + 1} 个一级菜单名称不能为空`)
            selectButton(i)
            return false
        }
        if (top.sub_button?.length) {
            for (let j = 0; j < top.sub_button.length; j++) {
                const sub = top.sub_button[j]
                if (!validateButton(sub, i, j)) return false
            }
        } else {
            if (!validateButton(top as SubMenuButton, i)) return false
        }
    }
    return true
}

const validateButton = (btn: SubMenuButton, topIndex: number, subIndex?: number): boolean => {
    if (!btn.name?.trim()) {
        ElMessage.warning('菜单名称不能为空')
        selectButton(topIndex, subIndex)
        return false
    }
    if (!btn.type) {
        ElMessage.warning('请选择菜单类型')
        selectButton(topIndex, subIndex)
        return false
    }
    if (KEY_REQUIRED_TYPES.includes(btn.type) && !btn.key?.trim()) {
        ElMessage.warning('请填写菜单 KEY 值')
        selectButton(topIndex, subIndex)
        return false
    }
    if ((btn.type === 'view' || btn.type === 'miniprogram') && !btn.url?.trim()) {
        ElMessage.warning('请填写网页链接')
        selectButton(topIndex, subIndex)
        return false
    }
    if (btn.type === 'miniprogram') {
        if (!btn.appid?.trim()) {
            ElMessage.warning('请填写小程序 AppID')
            selectButton(topIndex, subIndex)
            return false
        }
        if (!btn.pagepath?.trim()) {
            ElMessage.warning('请填写小程序页面路径')
            selectButton(topIndex, subIndex)
            return false
        }
    }
    if (btn.type === 'media_id' && !btn.media_id?.trim()) {
        ElMessage.warning('请填写素材 media_id')
        selectButton(topIndex, subIndex)
        return false
    }
    if ((btn.type === 'article_id' || btn.type === 'article_view_limited') && !btn.article_id?.trim()) {
        ElMessage.warning('请填写 article_id')
        selectButton(topIndex, subIndex)
        return false
    }
    return true
}

defineExpose({ validateMenu, formRef })
</script>

<template>
    <div class="menu-editor">
        <div class="editor-section">
            <div class="section-header">
                <span class="section-title">菜单结构</span>
                <el-button
                    type="primary"
                    link
                    :disabled="form.button.length >= MAX_TOP_BUTTONS"
                    @click="addTopButton"
                >
                    + 添加一级菜单
                </el-button>
            </div>
            <div class="menu-tree">
                <div
                    v-for="(button, topIndex) in form.button"
                    :key="topIndex"
                    class="tree-group"
                >
                    <div
                        class="tree-item top-item"
                        :class="{ active: selection?.topIndex === topIndex && selection?.subIndex === undefined }"
                        @click="selectButton(topIndex)"
                    >
                        <span>{{ button.name || '未命名' }}</span>
                        <el-button
                            type="danger"
                            link
                            size="small"
                            @click.stop="removeTopButton(topIndex)"
                        >
                            删除
                        </el-button>
                    </div>
                    <div
                        v-for="(sub, subIndex) in button.sub_button"
                        :key="subIndex"
                        class="tree-item sub-item"
                        :class="{ active: selection?.topIndex === topIndex && selection?.subIndex === subIndex }"
                        @click="selectButton(topIndex, subIndex)"
                    >
                        <span>{{ sub.name || '未命名' }}</span>
                        <el-button
                            type="danger"
                            link
                            size="small"
                            @click.stop="removeSubButton(subIndex)"
                        >
                            删除
                        </el-button>
                    </div>
                </div>
                <el-empty v-if="!form.button.length" description="暂无菜单" :image-size="60" />
            </div>
        </div>

        <el-divider />

        <div v-if="currentButton" class="editor-section">
            <div class="section-header">
                <span class="section-title">菜单配置</span>
            </div>
            <el-form ref="formRef" label-position="top" class="menu-form">
                <el-form-item label="菜单名称" required>
                    <el-input
                        v-model="currentButton.name"
                        :maxlength="isSubMenu ? 8 : 4"
                        show-word-limit
                        placeholder="请输入菜单名称"
                    />
                </el-form-item>

                <template v-if="!isSubMenu">
                    <el-form-item label="菜单模式">
                        <el-radio-group
                            :model-value="hasSubButtons ? 'sub' : 'single'"
                            @change="(val) => { if (val === 'sub') convertToSubMenu(); else convertToSingle() }"
                        >
                            <el-radio value="single">无子菜单（直接响应）</el-radio>
                            <el-radio value="sub">含子菜单</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="hasSubButtons">
                        <el-button type="primary" link @click="addSubButton">+ 添加二级菜单</el-button>
                    </el-form-item>
                </template>

                <template v-if="showTypeField">
                    <el-form-item label="菜单类型" required>
                        <el-select
                            :model-value="currentType"
                            placeholder="请选择菜单类型"
                            @change="updateType"
                        >
                            <el-option
                                v-for="opt in MENU_TYPE_OPTIONS"
                                :key="opt.value"
                                :label="opt.label"
                                :value="opt.value"
                            />
                        </el-select>
                    </el-form-item>

                    <el-form-item
                        v-if="KEY_REQUIRED_TYPES.includes(currentType)"
                        label="菜单 KEY"
                        required
                    >
                        <el-input
                            v-model="currentButton.key"
                            maxlength="128"
                            placeholder="用于消息接口推送，不超过128字节"
                        />
                    </el-form-item>

                    <el-form-item
                        v-if="currentType === 'view' || currentType === 'miniprogram'"
                        label="网页链接"
                        required
                    >
                        <el-input
                            v-model="currentButton.url"
                            placeholder="用户点击后打开的网页链接"
                        />
                    </el-form-item>

                    <template v-if="currentType === 'miniprogram'">
                        <el-form-item label="小程序 AppID" required>
                            <el-input
                                v-model="currentButton.appid"
                                placeholder="小程序的 appid（小写）"
                            />
                        </el-form-item>
                        <el-form-item label="小程序页面路径" required>
                            <el-input
                                v-model="currentButton.pagepath"
                                placeholder="如 pages/index/index"
                            />
                        </el-form-item>
                    </template>

                    <el-form-item v-if="currentType === 'media_id'" label="素材 media_id" required>
                        <el-input
                            v-model="currentButton.media_id"
                            placeholder="永久素材 media_id"
                        />
                    </el-form-item>

                    <el-form-item
                        v-if="currentType === 'article_id' || currentType === 'article_view_limited'"
                        label="article_id"
                        required
                    >
                        <el-input
                            v-model="currentButton.article_id"
                            placeholder="发布后获得的 article_id"
                        />
                    </el-form-item>
                </template>
            </el-form>
        </div>
        <el-empty v-else description="请选择或添加菜单项进行配置" :image-size="80" />
    </div>
</template>

<style lang="scss" scoped>
.menu-editor {
    padding: 16px 20px;
}

.editor-section {
    margin-bottom: 8px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.section-title {
    font-size: 15px;
    font-weight: 600;
}

.menu-tree {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    overflow: hidden;
}

.tree-group {
    &:not(:last-child) {
        border-bottom: 1px solid var(--el-border-color-lighter);
    }
}

.tree-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background: var(--el-fill-color-light);
    }

    &.active {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
    }
}

.sub-item {
    padding-left: 32px;
    font-size: 13px;
    background: var(--el-fill-color-blank);

    &.active {
        background: var(--el-color-primary-light-9);
    }
}

.menu-form {
    :deep(.el-select) {
        width: 100%;
    }
}
</style>
