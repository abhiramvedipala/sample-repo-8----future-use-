import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // shadcn/ui components under src/components/ui are generated and
    // managed by the shadcn CLI (`npx shadcn add ...`), not hand-written —
    // they get overwritten wholesale on update. Several of them export a
    // small "variants" helper alongside the component itself (e.g.
    // buttonVariants next to Button), which trips react-refresh's rule
    // against mixing component and non-component exports in one file. That
    // rule exists to keep Fast Refresh precise; violating it here only
    // means editing one of these files triggers a full reload instead of a
    // hot patch, not a real bug — not worth fighting the CLI's own output.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
