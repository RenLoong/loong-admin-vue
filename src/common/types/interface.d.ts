
export { };
declare global {

    interface ObjectInterface {
        [propName: string]: any
    }
    type StorageInterface = string | string[] | object | object[] | number | number[] | null | ObjectInterface | ObjectInterface[]
    type LanguageInterface = 'zh-CN' | 'en';

    interface StateInterface {
        AsideState: boolean
        NotMenusAsideState: boolean
        language: LanguageInterface
    }
    interface LanguageListInterface {
        label: string,
        value: LanguageInterface
    }
    interface OptionsInterface {
        label: string,
        value: any,
        [propName: string]: any
    }
    interface ConfigInterface {
        storagePrefix: string,
        URLModule: string,
        storage: Storage,
        version: number
        version_name: string
    }
    interface MenusInterface {
        title: string,
        icon: string,
        path: string,
        component: string,
        show: number,
        sort: number,
        query: any,
        params: any,
        meta?: any,
        children: MenusInterface[]
    }
    interface ResponseInterface {
        code?: number | string,
        data?: any,
        msg?: string,
        [propName: string]: any
    }
    interface UserInfoInterface {
        nickname: string,
        token: string,
        [propName: string]: any
    }
    interface VcodeInterface {
        url?: string,
        time?: number,
        method?: string,
        message?: boolean
    }
    interface LoginConfigInterface {
        enable: boolean,
        url: string,
        title: string,
        bg_image: string | string[],
        image: string,
        captcha: boolean,
        user_agreement: string
    }
    interface WebConfigInterface {
        web_name?: string,
        web_logo?: string,
        web_icp?: string,
        web_mps?: string,
        web_mps_text?: string,
        web_title?: string,
        version_name?: string,
        version?: number,
        copyright?: string,
        login?: LoginConfigInterface,
        [propName: string]: any
    }
    interface RuleInterface {
        title: string;
        field: string;
        component: string;
        extra?: any;
    }
}
import { SlateDescendant, SlateElement, SlateText } from '@wangeditor/editor'

declare module '@wangeditor/editor' {
    // 扩展 Text
    interface SlateText {
        text: string
    }

    // 扩展 Element
    interface SlateElement {
        type: string
        children: SlateDescendant[]
    }
}
declare module '@wangeditor/editor-for-vue' {
    import { Editor } from '@wangeditor/editor'
    export * from '@wangeditor/editor'
    export default Editor
}