import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
    let isProd = mode === 'production'

    console.log(isProd);

    return ({
        base: '',
        css: {
            devSourcemap: true
        },
        build: {
            sourcemap: 'true',
        },
        plugins: [vue()],
        clearScreen: false
    })
})
