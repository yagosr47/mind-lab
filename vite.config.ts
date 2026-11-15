import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Resolve os aliases definidos em `compilerOptions.paths` do
    // tsconfig.app.json (ex.: `@/components/Counter` → `src/components/Counter`).
    tsconfigPaths: true,
  },
})
