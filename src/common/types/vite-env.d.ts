/// <reference types="vite/client" />
interface ImportMateEnv {
    readonly VITE_APP_TITLE: string,
    readonly VITE_REQUEST_BASE_URL: string | undefined
}
interface ImportMate {
    readonly env: ImportMateEnv
}
declare module '*.vue' {
    import { DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>
    export default component
}