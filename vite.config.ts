import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import typescript from 'rollup-plugin-typescript2'

export default defineConfig({
   build: {
      minify: true,
      lib: {
         entry: resolve(__dirname, 'src/index.ts'),
         name: 'vue3-sticky-directive',
         formats: ['es', 'cjs'],
         fileName: (format) => (format === 'es' ? 'index.js' : 'index.umd.cjs')
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
      vue(),
      typescript({
         check: false,
         tsconfig: 'tsconfig.json',
         include: [
            'src/index.ts',
            'src/sticky.ts'
         ],
         tsconfigOverride: {
            compilerOptions: {
               declaration: true
            }
         },
         exclude: [
            'vite.config.ts'
         ]
      })
   ]
})
