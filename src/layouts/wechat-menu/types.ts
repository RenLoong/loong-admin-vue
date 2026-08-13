/** 微信自定义菜单按钮类型 */
export type MenuButtonType =
    | 'click'
    | 'view'
    | 'miniprogram'

export interface SubMenuButton {
    type: MenuButtonType
    name: string
    key?: string
    url?: string
    media_id?: string
    appid?: string
    pagepath?: string
    article_id?: string
}

export interface MenuButton {
    name: string
    type?: MenuButtonType
    key?: string
    url?: string
    media_id?: string
    appid?: string
    pagepath?: string
    article_id?: string
    sub_button?: SubMenuButton[]
}

export interface MenuForm {
    button: MenuButton[]
}

export interface MenuSelection {
    topIndex: number
    subIndex?: number
}

export const MAX_TOP_BUTTONS = 3
export const MAX_SUB_BUTTONS = 5

export const MENU_TYPE_OPTIONS: { label: string; value: MenuButtonType }[] = [
    { label: '点击推事件 (click)', value: 'click' },
    { label: '跳转网页 (view)', value: 'view' },
    { label: '跳转小程序 (miniprogram)', value: 'miniprogram' }
]

export const KEY_REQUIRED_TYPES: MenuButtonType[] = [
    'click',
]

export function createSubButton(): SubMenuButton {
    return { type: 'click', name: '子菜单', key: '' }
}

export function createTopButton(): MenuButton {
    return { name: '菜单', type: 'click', key: '' }
}

export function createEmptyForm(): MenuForm {
    return { button: [] }
}
