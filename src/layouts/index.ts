import defaultComponent from './default/index.vue';
import formComponent from './form/index.vue';
import paymentFormComponent from './payment-form/index.vue';
import imagesComponent from './images/index.vue';
import tableComponent from './table/index.vue';
import appsComponent from './apps/index.vue';
import appsDetailsComponent from './apps/details.vue';
import paymentComponent from './payment/index.vue';
import rechargeComponent from './payment/recharge.vue';
const components = {
    defaultComponent,
    formComponent,
    paymentFormComponent,
    imagesComponent,
    tableComponent,
    appsComponent,
    appsDetailsComponent,
    paymentComponent,
    rechargeComponent
}
export type componentsType = keyof typeof components;
export default components;