import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Matches the "@/*" path in tsconfig.app.json. Two separate places
      // have to agree on this: TypeScript needs it to typecheck the import,
      // Vite needs it to actually resolve the file at build/dev time. This
      // exact path.resolve(__dirname, ...) form is also what the shadcn CLI
      // statically parses to figure out where "@" points — an fileURLToPath
      // version compiled correctly but the CLI couldn't detect it and wrote
      // new components into a literal "./@" folder instead.
      '@': path.resolve(__dirname, './src'),
    },
  },
})
