import Scan from './Scan.vue';
import Qrcode from './Qrcode.vue';
import Language from './Language.vue';
const components = {
    Scan,
    Qrcode,
    Language
}
export type componentsType = keyof typeof components;
export default components;