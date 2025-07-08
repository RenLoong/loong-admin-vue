import Scan from './Scan.vue';
import Qrcode from './Qrcode.vue';
import Language from './Language.vue';
import Coupon from './Coupon.vue';
import BarCode from './BarCode.vue';
import Channels from './Channels.vue';
import Apps from './Apps.vue';
import Developer from './Developer.vue';
import Team from './Team.vue';
const components = {
    Scan,
    Qrcode,
    Language,
    Coupon,
    BarCode,
    Channels,
    Apps,
    Developer,
    Team
}
export type componentsType = keyof typeof components;
export default components;