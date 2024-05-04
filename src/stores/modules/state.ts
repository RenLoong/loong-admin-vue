import { useStorage } from '@/common/config';
interface StateInterface{
    AsideState:boolean
    NotMenusAsideState:boolean
}
type StateValueType<T extends keyof StateInterface> = StateInterface[T];
export default () => {
    const storage = useStorage();
    const STATE = ref<StateInterface>({
        AsideState:true,
        NotMenusAsideState:false
    });
    const initState = () => {
        const data = storage.get('STATE');
        if (data) {
            STATE.value = data as StateInterface;
        }
    }
    watchEffect(()=>{
        const data=STATE.value;
        storage.set('STATE', data);
    })
    const toggle = (key: keyof StateInterface) => {
        STATE.value[key] = !STATE.value[key];
    }
    const setState = <T extends keyof StateInterface>(key: T,value:StateValueType<T>) => {
        STATE.value[key]=value;
    }

    return {
        STATE,
        initState,
        setState,
        toggle
    };
}