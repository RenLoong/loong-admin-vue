import Scan from './Scan.vue';
import Qrcode from './Qrcode.vue';
import Language from './Language.vue';
import Coupon from './Coupon.vue';
import BarCode from './BarCode.vue';
const components = {
    Scan,
    Qrcode,
    Language,
    Coupon,
    BarCode
}
export type componentsType = keyof typeof components;
export default components;