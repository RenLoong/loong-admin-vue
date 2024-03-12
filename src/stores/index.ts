import { StoreGeneric, defineStore, storeToRefs } from 'pinia'
import UserStore from "./modules/user";
export const useUserStore = defineStore('user', UserStore)

import MenusStore from "./modules/menus";
export const useMenusStore = defineStore('menus', MenusStore)

import WebConfigStore from "./modules/webconfig";
export const useWebConfigStore = defineStore('webconfig', WebConfigStore)

import StateStore from "./modules/state";
export const useStateStore = defineStore('state', StateStore)

export const useRefs = (store: StoreGeneric) => {
    return storeToRefs(store);
}