import { defineConfig } from '@bunli/core'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  
  commands: {
    directory: './src/commands'
  },
  
  build: {
    entry: './src/index.ts',
    outdir: './dist',
    targets: ['native'],
    // targets: ['darwin-arm64', 'darwin-x64', 'linux-arm64', 'linux-x64', 'windows-x64'],
    minify: true,
    sourcemap: false,
    compress: false
  },
  
  dev: {
    watch: true,
    inspect: true
  },
  
  test: {
    pattern: ['**/*.test.ts', '**/*.spec.ts'],
    coverage: true,
    watch: false
  },

  plugins: [],
})
