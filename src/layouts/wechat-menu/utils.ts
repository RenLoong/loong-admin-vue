import type { MenuButton, MenuForm, SubMenuButton } from './types'

const cleanSubButton = (btn: SubMenuButton): SubMenuButton => {
    const result: SubMenuButton = {
        type: btn.type,
        name: btn.name.trim(),
    }
    if (btn.key?.trim()) result.key = btn.key.trim()
    if (btn.url?.trim()) result.url = btn.url.trim()
    if (btn.media_id?.trim()) result.media_id = btn.media_id.trim()
    if (btn.appid?.trim()) result.appid = btn.appid.trim()
    if (btn.pagepath?.trim()) result.pagepath = btn.pagepath.trim()
    if (btn.article_id?.trim()) result.article_id = btn.article_id.trim()
    return result
}

const cleanTopButton = (btn: MenuButton): MenuButton => {
    const result: MenuButton = { name: btn.name.trim() }
    if (btn.sub_button?.length) {
        result.sub_button = btn.sub_button.map(cleanSubButton)
        return result
    }
    if (btn.type) result.type = btn.type
    if (btn.key?.trim()) result.key = btn.key.trim()
    if (btn.url?.trim()) result.url = btn.url.trim()
    if (btn.media_id?.trim()) result.media_id = btn.media_id.trim()
    if (btn.appid?.trim()) result.appid = btn.appid.trim()
    if (btn.pagepath?.trim()) result.pagepath = btn.pagepath.trim()
    if (btn.article_id?.trim()) result.article_id = btn.article_id.trim()
    return result
}

export const cleanMenuForm = (form: MenuForm): MenuForm => ({
    button: form.button.map(cleanTopButton),
})

export const normalizeMenuForm = (data: any): MenuForm => {
    if (!data) return { button: [] }
    if (Array.isArray(data.button)) {
        return { button: data.button }
    }
    if (Array.isArray(data)) {
        return { button: data }
    }
    return { button: [] }
}
