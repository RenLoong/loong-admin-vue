export { };

declare global {
    namespace TMap {
        class LatLng {
            constructor(lat: number, lng: number);
            lat: number;
            lng: number;
        }

        interface MapOptions {
            [key: string]: any;
        }

        class Map {
            constructor(container: string | HTMLElement, options?: MapOptions);
            setCenter(center: LatLng): void;
            destroy(): void;
            [key: string]: any;
        }
        class MarkerStyle {
            constructor(options: MarkerStyleOptions);
            [key: string]: any;
        }
    }

    interface Window {
        TMap: typeof TMap;
    }
}
