
let URLModule = globalThis.location.pathname.replace(/^\/|\/$/g, '');
export default {
    storagePrefix: URLModule ? URLModule.toUpperCase() : 'CLOUD-API',
    storage: globalThis.localStorage,
    URLModule
} as ConfigInterface;

export const zipMimeType = [
    'application/x-zip-compressed',
    'application/zip',
    'application/x-zip-compresse',
    'application/octet-stream',
    'application/x-compress',
    'application/x-compressed',
    'multipart/x-zip',
    'application/x-rar-compressed',
    'application/x-rar',
    'application/x-tar',
    'application/x-gzip',
    'application/x-7z-compressed',
    'application/x-zip',
];