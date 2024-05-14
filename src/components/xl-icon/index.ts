import Scan from './Scan.vue';
import Qrcode from './Qrcode.vue';
const components = {
    Scan,
    Qrcode
}
export type componentsType = keyof typeof components;
export default components;