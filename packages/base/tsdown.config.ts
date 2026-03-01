import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./index.ts'],
  outDir: './dist',
  clean: true,
  minify: true,
  dts: true,
  format: ['esm'],
  fixedExtension: false,
})
