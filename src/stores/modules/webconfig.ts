import { useStorage } from '@/common';
export default () => {
    const storage = useStorage();
    const WEBCONFIG = ref<WebConfigInterface>({});
    const initWebConfig = () => {
        const data = storage.get('WEBCONFIG');
        if (data) {
            WEBCONFIG.value = data as WebConfigInterface;
        }
    }
    const setWebConfig = (data: WebConfigInterface) => {
        WEBCONFIG.value = data;
        storage.set('WEBCONFIG', data);
    }
    return {
        WEBCONFIG,
        initWebConfig,
        setWebConfig
    };
}