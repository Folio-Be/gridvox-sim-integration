import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    server: {
        port: 3000,
        open: true,
    },
    resolve: {
        alias: {
            '@SimVox/track-map-core': resolve(__dirname, '../track-map-core/src'),
            '@SimVox/track-map-ams2': resolve(__dirname, '../track-map-ams2/src'),
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
