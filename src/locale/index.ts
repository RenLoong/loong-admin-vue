import { useStorage } from '@/common/config';
import { createI18n } from 'vue-i18n';
import {default as en} from './en'
import {default as zhCn} from './zh-cn';
import { App } from 'vue';
const storage = useStorage();
const STATE = storage.get('STATE') as StateInterface;
export const i18n = createI18n({
    legacy: false,
    locale: STATE?.language || 'zh-CN',
    globalInjection: true,
    messages: {
        en,
        zh:zhCn,
        'zh-CN':zhCn
    }
});
export const setupI18n = {
    install(app: App) {
      app.use(i18n);
    },
  };