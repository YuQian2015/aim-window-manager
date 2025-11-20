import { defineConfig } from 'vite'
import path from 'node:path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: false
    })
  ],
  build: {
    lib: {
      entry: {
        main: path.resolve(__dirname, 'src/index.main.ts'),
        renderer: path.resolve(__dirname, 'src/index.renderer.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => (format === 'es' ? `${entryName}.esm.js` : `${entryName}.cjs.js`),
    },
    rollupOptions: {
      external: ["electron", "path", "fs", "util", "os", "process", "node:fs", "node:path", "node:util", "node:os", "node:process"],
    }
  }
})