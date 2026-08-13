<template>
    <div class="xl-map">
        <div v-if="props.api.suggestion" class="flex grid-gap-4 flex-center">
            <el-select v-model="selectedCity.id" placeholder="选择城市" filterable class="flex-1"
                @change="handleCityChange">
                <el-option v-for="item in citys" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <el-autocomplete v-model="search" :fetch-suggestions="querySearchAsync" placeholder="关键词搜索" class="flex-2"
                @select="handleSelect">
                <template #default="{ item }">
                    <div class="flex grid-gap-2 line-height-1 py-1">
                        <div class="flex-1 flex flex-column grid-gap-1">
                            <div class="value">{{ item.value }}</div>
                            <span class="h9 text-info">{{ item.address }}</span>
                        </div>
                        <span>{{ item.category }}</span>
                    </div>
                </template>
            </el-autocomplete>
        </div>

        <div class="xl-map-canvas-wrap">
            <tlbs-map v-if="isTencent" ref="mapRef" :api-key="apiKey" v-bind="props.mapProps" @click="onTencentClick"
                @map_inited="onTencentMapInited">
                <tlbs-multi-marker ref="markerRef" :geometries="geometries" :styles="styles"
                    :options="{ minZoom: 5, maxZoom: 18 }" />
            </tlbs-map>
            <div v-else-if="isAmap" ref="amapContainerRef" class="xl-map-amap"></div>
            <div v-else class="xl-map-empty">请配置地图渠道与 Key</div>

            <div class="xl-map-location">
                <el-icon class="xl-map-location-icon" title="点击定位" @click="getIpLocation"
                    :class="{ 'is-loading': loading }">
                    <Location v-if="!loading" />
                    <Loading v-else class="c" />
                </el-icon>
            </div>
        </div>

        <div class="flex" v-if="props.api.geocode">
            <div class="flex-1 flex grid-gap-1">
                <span>{{ geocode.province }}</span>
                <span>{{ geocode.city }}</span>
                <span>{{ geocode.district }}</span>
                <span>{{ geocode.street }}</span>
                <span>{{ geocode.address }}</span>
            </div>
            <el-button type="primary" @click="getGeocode">解析地址</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { $http } from '@/common';
import { ElMessage } from 'element-plus';
import AMapLoader from '@amap/amap-jsapi-loader';

declare global {
    interface Window {
        _AMapSecurityConfig?: { securityJsCode?: string };
    }
}

const props = withDefaults(defineProps<{
    modelValue: any,
    channel?: string,
    mapProps?: any,
    apiKey?: string,
    securityJsCode?: string,
    api?: any
}>(), {
    channel: '',
    modelValue: () => {
        return {}
    },
    mapProps: () => {
        return {
            zoom: 12,
            control: {
                scale: {},
                zoom: {
                    position: 'topRight',
                },
            },
            options: {
                renderOptions: {
                    renderOptions: true,
                },
            },
        }
    },
    apiKey: '',
    securityJsCode: '',
    api: () => {
        return {
            location: ''
        }
    }
});
const emit = defineEmits(['update:modelValue', 'change']);

const isTencent = computed(() => props.channel === 'tencent' || (!props.channel && !!props.apiKey));
const isAmap = computed(() => props.channel === 'amap');

const mapRef = ref();
const markerRef = ref();
const mapInstance = ref<any>();
const amapContainerRef = ref<HTMLElement | null>(null);
const amapSdk = ref<any>(null);
const amapMarker = ref<any>(null);
const center = ref<{ lat: number | string; lng: number | string } | null>(null);

watch(center, (val) => {
    emit('update:modelValue', {
        ...props.modelValue,
        latitude: val?.lat,
        longitude: val?.lng
    });
});

const geometries = ref<any[]>([]);
const styles = ref({
    marker: {
        width: 25,
        height: 35,
        anchor: { x: 16, y: 32 }
    }
});

const loading = ref(false);
const search = ref('');
const selectedCity = ref({
    id: '',
    ext_name: ''
});
const citys = ref<any[]>([]);
const iplocation = ref({
    latitude: '',
    longitude: '',
    province_id: '',
    province: '',
    city_id: '',
    city: '',
    district_id: '',
    district: '',
});
const geocode = ref({
    province_id: '',
    province: '',
    city_id: '',
    city: '',
    district_id: '',
    district: '',
    street_id: '',
    street: '',
    address: '',
});

watch(geocode, (val) => {
    emit('change', {
        callback: 'append',
        data: val
    });
}, { deep: true });

const onTencentClick = (e: any) => {
    center.value = {
        lat: e.latLng.lat,
        lng: e.latLng.lng
    };
    setCenter();
};

const onTencentMapInited = (e: any) => {
    mapInstance.value = e;
    setCenter();
};

const setCenter = () => {
    if (!center.value?.lat || !center.value?.lng) {
        return;
    }
    const lat = Number(center.value.lat);
    const lng = Number(center.value.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
    }

    if (isTencent.value && mapInstance.value && window.TMap) {
        const latLng = new window.TMap.LatLng(lat, lng);
        mapInstance.value.setCenter(latLng);
        geometries.value = [{
            id: 'location',
            position: latLng
        }];
        return;
    }

    if (isAmap.value && mapInstance.value && amapSdk.value) {
        const AMap = amapSdk.value;
        mapInstance.value.setZoomAndCenter(props.mapProps?.zoom ?? 12, [lng, lat]);
        if (amapMarker.value) {
            amapMarker.value.setPosition([lng, lat]);
        } else {
            amapMarker.value = new AMap.Marker({
                position: [lng, lat],
                map: mapInstance.value,
            });
        }
    }
};

const initAmap = async () => {
    if (!isAmap.value || !amapContainerRef.value) {
        return;
    }
    if (!props.apiKey) {
        ElMessage.error('请配置高德「Web端(JS API)」Key，不要使用 Web 服务 Key');
        return;
    }
    if (!props.securityJsCode) {
        ElMessage.error('请配置高德 JS API 安全密钥（securityJsCode）');
        return;
    }
    try {
        // 必须在 AMapLoader.load 之前设置，否则会出现 INSUFFICIENT_PRIVILEGES
        window._AMapSecurityConfig = {
            securityJsCode: props.securityJsCode,
        };
        const AMap = await AMapLoader.load({
            key: props.apiKey,
            version: '2.0',
            plugins: ['AMap.Scale', 'AMap.ToolBar'],
        });
        amapSdk.value = AMap;
        const zoom = props.mapProps?.zoom ?? 12;
        const hasCenter = !!(center.value?.lat && center.value?.lng);
        const map = new AMap.Map(amapContainerRef.value, {
            zoom,
            viewMode: '2D',
            center: hasCenter
                ? [Number(center.value!.lng), Number(center.value!.lat)]
                : undefined,
        });
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar({ position: 'RT' }));
        map.on('click', (e: any) => {
            const lng = e?.lnglat?.getLng?.() ?? e?.lnglat?.lng;
            const lat = e?.lnglat?.getLat?.() ?? e?.lnglat?.lat;
            if (lng == null || lat == null) {
                return;
            }
            center.value = { lat, lng };
            setCenter();
        });
        mapInstance.value = map;
        setCenter();
    } catch (e: any) {
        console.error(e);
        const msg = String(e?.message || e || '');
        if (/INSUFFICIENT_PRIVILEGES|USERKEY_PLAT_NOMATCH|INVALID_USER_SCODE|INVALID_USER_DOMAIN/i.test(msg)) {
            ElMessage.error('高德鉴权失败：请确认使用 Web端(JS API) Key、安全密钥正确，并已绑定当前域名');
        } else {
            ElMessage.error(msg || '高德地图初始化失败');
        }
    }
};

const getIpLocation = () => {
    if (!props.api.location || loading.value) {
        return;
    }
    loading.value = true;
    $http.get(props.api.location).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            iplocation.value = res.data;
            selectedCity.value = {
                id: res.data.city_id,
                ext_name: res.data.city
            };
            center.value = {
                lat: res.data.latitude,
                lng: res.data.longitude
            };
            setCenter();
        }
    }).finally(() => {
        loading.value = false;
    })
};

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
    if (!queryString) {
        cb([]);
        return;
    }
    $http.get(props.api.suggestion, {
        params: {
            keyword: queryString,
            region: selectedCity.value.ext_name,
            get_subpois: 0,
            policy: 1
        }
    }).then((res: any) => {
        cb(res.data);
    })
};

const handleSelect = (item: any) => {
    center.value = {
        lat: item.latitude,
        lng: item.longitude
    };
    setCenter();
    if (!props.api.matchRegion) {
        return;
    }
    $http.post(props.api.matchRegion, {
        province: item.province,
        city: item.city,
        district: item.district
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            geocode.value.province_id = res.data.province_id;
            geocode.value.province = res.data.province;
            geocode.value.city_id = res.data.city_id;
            geocode.value.city = res.data.city;
            geocode.value.district_id = res.data.district_id;
            geocode.value.district = res.data.district;
            geocode.value.street_id = res.data.street_id;
            geocode.value.street = res.data.street;
            geocode.value.address = item.address.replace(item.province + item.city + item.district, '');
        }
    })
};

const getGeocode = () => {
    if (!props.api.geocode || loading.value) {
        return;
    }
    loading.value = true;
    $http.post(props.api.geocode, {
        latitude: center.value?.lat,
        longitude: center.value?.lng
    }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            geocode.value = res.data;
        } else {
            ElMessage.error(res.msg);
        }
    }).finally(() => {
        loading.value = false;
    })
};

const handleCityChange = (val: any) => {
    selectedCity.value = citys.value.find((e) => e.id === val)
};

const getCitys = () => {
    $http.get('/uploads/citys.json?t=' + Date.now()).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            citys.value = res.data;
        }
    })
};

onMounted(async () => {
    if (props.modelValue?.latitude && props.modelValue?.longitude) {
        center.value = {
            lat: props.modelValue.latitude,
            lng: props.modelValue.longitude
        };
    } else {
        getIpLocation();
    }
    getCitys();
    if (isAmap.value) {
        await nextTick();
        await initAmap();
    }
});

onUnmounted(() => {
    if (isAmap.value) {
        amapMarker.value?.setMap?.(null);
        amapMarker.value = null;
        mapInstance.value?.destroy?.();
    } else {
        mapInstance.value?.destroy?.();
    }
    mapInstance.value = null;
    mapRef.value = null;
    amapSdk.value = null;
});
</script>
<style scoped lang="scss">
.xl-map {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.xl-map-canvas-wrap {
    position: relative;
    width: 100%;
    min-height: 420px;
    flex: 1;
}

.xl-map-amap,
.xl-map-empty {
    width: 100%;
    height: 420px;
    border-radius: 4px;
    overflow: hidden;
}

.xl-map-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
}

.xl-map-canvas-wrap :deep(.tlbs-map),
.xl-map-canvas-wrap :deep(.map-container) {
    width: 100%;
    height: 420px;
}

.xl-map-location {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1001;
    display: flex;
    align-items: center;
    padding: 20px;
}

.xl-map-location-icon {
    width: 40px;
    height: 40px;
    background-color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: #f0f0f0;
    }
}
</style>
