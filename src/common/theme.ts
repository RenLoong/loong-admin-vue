import { useStorage } from "@/common/config";
import { onStoreageChange } from "./functions";

type Theme = 'dark' | 'OS';
const THEME_KEY = 'THEME';
const storage = useStorage();
const theme = ref<Theme>(storage.get(THEME_KEY) as Theme || 'OS');
export type { Theme };
export default function useTheme() {
    const match = matchMedia('(prefers-color-scheme: dark)');
    const followOS = () => {
        if (match.matches) {
            document.documentElement.dataset.theme = 'dark';
        } else {
            document.documentElement.dataset.theme = 'light';
        }
    }
    watchEffect(() => {
        storage.set(THEME_KEY, theme.value);
        if (theme.value === 'OS') {
            match.addEventListener('change', followOS);
            followOS();
        } else {
            document.documentElement.dataset.theme = theme.value;
            match.removeEventListener('change', followOS);
        }
    })
    
    onStoreageChange(storage.getKey(THEME_KEY), (e?: StorageEvent) => {
        if (!e) {
            theme.value = 'OS';
        } else if (e.newValue !== null) {
            const val = JSON.parse(e.newValue).data as Theme;
            theme.value = val
        }
    })
    return {
        theme
    }
}