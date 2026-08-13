<script setup lang="ts">
import type { MenuButton, MenuSelection } from '../types'

const props = defineProps<{
    buttons: MenuButton[]
    selection: MenuSelection | null
}>()

const emit = defineEmits<{
    select: [selection: MenuSelection]
}>()

const expandedTopIndex = ref<number | null>(null)

watch(
    () => props.selection,
    (sel) => {
        if (sel && sel.subIndex !== undefined) {
            expandedTopIndex.value = sel.topIndex
        }
    },
    { immediate: true }
)

const truncateName = (name: string, max = 4) => {
    if (!name) return '未命名'
    return name.length > max ? `${name.slice(0, max)}...` : name
}

const isSelected = (topIndex: number, subIndex?: number) => {
    if (!props.selection) return false
    if (props.selection.topIndex !== topIndex) return false
    if (subIndex === undefined) return props.selection.subIndex === undefined
    return props.selection.subIndex === subIndex
}

const handleTopClick = (index: number, button: MenuButton) => {
    if (button.sub_button?.length) {
        expandedTopIndex.value = expandedTopIndex.value === index ? null : index
        emit('select', { topIndex: index, subIndex: 0 })
        return
    }
    expandedTopIndex.value = null
    emit('select', { topIndex: index })
}

const handleSubClick = (topIndex: number, subIndex: number) => {
    emit('select', { topIndex, subIndex })
}
</script>

<template>
    <div class="wechat-preview">
        <div class="phone-frame">
            <div class="phone-status">
                <span>9:41</span>
                <span class="phone-status-icons">
                    <span class="signal"></span>
                    <span class="wifi"></span>
                    <span class="battery"></span>
                </span>
            </div>
            <div class="phone-nav">
                <span class="nav-back">&lt;</span>
                <span class="nav-title">公众号</span>
                <span class="nav-more">···</span>
            </div>
            <div class="phone-chat">
                <div class="chat-tip">点击底部菜单预览效果</div>
            </div>
            <div class="phone-menu-bar">
                <div
                    class="menu-keyboard"
                    title="键盘"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H4V7h16v10zM6 10h2v2H6v-2zm0 3h2v2H6v-2zm3-3h2v2H9v-2zm0 3h2v2H9v-2zm3-3h2v2h-2v-2zm0 3h2v2h-2v-2zm3-3h2v2h-2v-2zm0 3h2v2h-2v-2z"/>
                    </svg>
                </div>
                <div class="menu-buttons">
                    <template v-if="buttons.length">
                        <div
                            v-for="(button, index) in buttons"
                            :key="index"
                            class="menu-btn"
                            :class="{ active: isSelected(index), expanded: expandedTopIndex === index }"
                            @click="handleTopClick(index, button)"
                        >
                            {{ truncateName(button.name) }}
                            <div
                                v-if="button.sub_button?.length && expandedTopIndex === index"
                                class="sub-menu-popup"
                                @click.stop
                            >
                                <div
                                    v-for="(sub, subIndex) in button.sub_button"
                                    :key="subIndex"
                                    class="sub-menu-item"
                                    :class="{ active: isSelected(index, subIndex) }"
                                    @click="handleSubClick(index, subIndex)"
                                >
                                    {{ truncateName(sub.name, 8) }}
                                </div>
                            </div>
                        </div>
                    </template>
                    <div v-else class="menu-empty">暂无菜单，请在右侧添加</div>
                </div>
            </div>
        </div>
        <div class="preview-tips">
            <p>一级菜单最多 3 个，名称最多 4 个汉字</p>
            <p>二级菜单最多 5 个，名称最多 8 个汉字</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wechat-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    height: 100%;
    box-sizing: border-box;
}

.phone-frame {
    width: 320px;
    height: 580px;
    border: 8px solid #1a1a1a;
    border-radius: 36px;
    background: #ededed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
}

.phone-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px 4px;
    font-size: 12px;
    font-weight: 600;
    color: #000;
    background: #ededed;
}

.phone-status-icons {
    display: flex;
    align-items: center;
    gap: 4px;
}

.signal, .wifi, .battery {
    display: inline-block;
    width: 14px;
    height: 8px;
    background: #333;
    border-radius: 1px;
}

.phone-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #ededed;
    border-bottom: 1px solid #d9d9d9;
    font-size: 16px;
    font-weight: 500;
}

.nav-back {
    width: 24px;
    color: #576b95;
}

.nav-title {
    flex: 1;
    text-align: center;
}

.nav-more {
    width: 24px;
    text-align: right;
    letter-spacing: 2px;
}

.phone-chat {
    flex: 1;
    background: #ededed;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-tip {
    font-size: 13px;
    color: #999;
}

.phone-menu-bar {
    display: flex;
    height: 50px;
    background: #f7f7f7;
    border-top: 1px solid #d9d9d9;
    position: relative;
}

.menu-keyboard {
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #d9d9d9;
    color: #666;
    flex-shrink: 0;
}

.menu-buttons {
    flex: 1;
    display: flex;
}

.menu-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #333;
    border-right: 1px solid #d9d9d9;
    cursor: pointer;
    position: relative;
    user-select: none;
    transition: background-color 0.2s;

    &:last-child {
        border-right: none;
    }

    &:hover {
        background: #ebebeb;
    }

    &.active {
        color: #07c160;
        font-weight: 600;
    }

    &.expanded {
        background: #e8e8e8;
    }
}

.menu-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #bbb;
}

.sub-menu-popup {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    background: #fafafa;
    border: 1px solid #d9d9d9;
    border-bottom: none;
    z-index: 10;
}

.sub-menu-item {
    padding: 12px 8px;
    text-align: center;
    font-size: 14px;
    border-bottom: 1px solid #e5e5e5;
    cursor: pointer;
    transition: background-color 0.2s;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f0f0f0;
    }

    &.active {
        color: #07c160;
        font-weight: 600;
    }
}

.preview-tips {
    margin-top: 20px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
    line-height: 1.8;

    p {
        margin: 0;
    }
}
</style>
