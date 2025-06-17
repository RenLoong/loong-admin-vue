import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "@/assets/css/theme.min.css";
import "@/assets/css/common.min.css";
import "@/assets/css/style.min.css";
import App from './App.vue'
import { createPinia } from 'pinia'
const pinia = createPinia()
import router from "@/routers";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import NumberScrollDirective from "@/common/functions/numberScroll";
import zhCn from 'element-plus/es/locale/lang/zh-cn';
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
import XlIconsVue from "@/components/xl-icon";
import { i18n } from './locale';
for (const [key, component] of Object.entries(XlIconsVue)) {
    app.component(key, component)
}
// 全局数字滚动效果指令
app.use(NumberScrollDirective);
app.use(ElementPlus, { locale: zhCn });
app.use(i18n);
app.use(pinia);
app.use(router);
app.mount('#app')