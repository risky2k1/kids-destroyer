import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

// Layer boundaries — see .claude/skills/fe-react-structure/SKILL.md §2.
const noParentHops = { group: ['../../*'], message: 'Dùng alias @/ thay vì ../../' };
const restrict = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns: [noParentHops, ...patterns] }],
});
const ban = (group, message) => ({ group, message });

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ['src/**/*.{ts,tsx}'], rules: restrict() },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: restrict(
      ban(
        ['@/app/*', '@/packages/*', '@/plugins/*'],
        'core không được biết đến app/packages/plugins',
      ),
    ),
  },
  {
    files: ['src/themes/**/*.{ts,tsx}'],
    rules: restrict(
      ban(['@/app/*', '@/core/*', '@/packages/*', '@/plugins/*'], 'themes chỉ chứa UI trình bày'),
    ),
  },
  {
    files: ['src/packages/**/*.{ts,tsx}'],
    rules: restrict(
      ban(['@/app/*'], 'packages không import app'),
      ban(['@/packages/*/*'], 'Import module qua public index: @/packages/<name>'),
      ban(['@/plugins/*', '!@/plugins/registry'], 'packages chỉ được import @/plugins/registry'),
    ),
  },
  {
    files: ['src/plugins/**/*.{ts,tsx}'],
    rules: restrict(
      ban(['@/app/*'], 'plugins không import app'),
      ban(['@/packages/*/*'], 'Import module qua public index: @/packages/<name>'),
    ),
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.superpowers/**',
  ]),
]);

export default eslintConfig;
