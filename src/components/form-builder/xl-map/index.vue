<template>
    <div class="xl-map">
        <tlbs-map ref="mapRef" :api-key="apiKey" v-bind="props.mapProps" @click="onClick" @map_inited="onMapInited">
            <tlbs-multi-marker ref="markerRef" :geometries="geometries" :styles="styles"
                :options="{ minZoom: 5, maxZoom: 18 }" />
            <div class="xl-map-location">
                <el-icon class="xl-map-location-icon" title="点击定位" @click="getIpLocation"
                    :class="{ 'is-loading': loading }">
                    <Location v-if="!loading" />
                    <Loading v-else class="c" />
                </el-icon>
            </div>
        </tlbs-map>
    </div>
</template>
<script setup lang="ts">
import { $http } from '@/common';

const props = withDefaults(defineProps<{
    modelValue: any,
    mapProps?: any,
    apiKey?: string,
    api?: any
}>(), {
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
    api: () => {
        return {
            location: ''
        }
    }
});
const emit = defineEmits(['update:modelValue']);
const mapRef = ref();
const mapInstance = ref();
const center = ref();
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
const onClick = (e: any) => {
    center.value = {
        lat: e.latLng.lat,
        lng: e.latLng.lng
    };
    setCenter();
}
const onMapInited = (e: any) => {
    mapInstance.value = e;
    setCenter();
}
const loading = ref(false);
const setCenter = () => {
    if (mapInstance.value && center.value && center.value.lat && center.value.lng) {
        const latLng = new TMap.LatLng(center.value.lat, center.value.lng);
        mapInstance.value.setCenter(latLng);
        geometries.value = [{
            id: 'location',
            position: latLng
        }];
    }
}
const getIpLocation = () => {
    if (!props.api.location || loading.value) {
        return;
    }
    loading.value = true;
    $http.get(props.api.location).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            center.value = {
                lat: res.data.latitude,
                lng: res.data.longitude
            };
            setCenter();
        }
    }).finally(() => {
        loading.value = false;
    })
}
// elementPlus
onMounted(() => {
    if (props.modelValue?.latitude && props.modelValue?.longitude) {
        center.value = {
            lat: props.modelValue.latitude,
            lng: props.modelValue.longitude
        };
    } else {
        getIpLocation();
    }
})
onUnmounted(() => {
    mapInstance.value?.destroy?.();
    mapInstance.value = null;
    mapRef.value = null;
})
</script>
<style scoped lang="scss">
.xl-map {
    width: 100%;
    height: 100%;
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