import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
import tailwindPlugin from 'eslint-plugin-tailwindcss';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'backup_duplicates/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '_archive/**',
      '_extended/**',
      'src/_archive/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  ...tailwindPlugin.configs['flat/recommended'],
  {
    rules: {
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/no-arbitrary-value': 'off',
      // Large legacy surface: keep as warnings so `next lint` stays actionable;
      // tighten over time. Hooks rule violations stay errors.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/jsx-no-comment-textnodes': 'warn',
      'prefer-const': 'warn',
      'tailwindcss/no-contradicting-classname': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/use-memo': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['src/**'],
              message:
                'Legacy Leakage: Imports from monorepo root src/ are restricted in synth-1-full. Keep logic under synth-1-full/src or use an adapter.',
            },
          ],
        },
      ],
    },
    settings: {
      tailwindcss: {
        callees: ['cn', 'clsx', 'cva', 'twMerge'],
      },
    },
  },
  // Zod: `const InputSchema = z.object(...)` используется только в `z.infer<typeof InputSchema>`.
  {
    files: ['src/ai/flows/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^InputSchema$',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Граница слоя: прикладной lib не импортирует Next app routes (импорт из `@/app` — только в тестах).
  {
    files: ['src/lib/**/*.ts', 'src/lib/**/*.tsx'],
    ignores: ['src/lib/**/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['src/**'],
              message:
                'Legacy Leakage: Imports from monorepo root src/ are restricted in synth-1-full. Keep logic under synth-1-full/src or use an adapter.',
            },
            {
              group: ['@/app/**'],
              message:
                'Layering: src/lib must not import Next.js app routes or pages. Move shared logic into lib and keep route handlers thin; contract tests may import @/app from src/lib/__tests__ only.',
            },
          ],
        },
      ],
    },
  },
];
