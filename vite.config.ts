import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
   build: {
      lib: {
         entry: path.resolve(__dirname, 'src/index.ts'),
         name: 'vue3-sticky-directive',
         formats: ['es', 'cjs'],
         fileName: (format) => `index.${format}.js`
      },
      rollupOptions: {
         external: ['vue'],
         output: {
            globals: {
               vue: 'Vue'
            }
         }
      }
   },
   plugins: [
      vue()
   ]
})
