import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'; //
import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Apply compatibility fix to the React flat config
  ...fixupConfigRules(pluginReact.configs.flat.recommended),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        // Explicitly setting the version can also bypass the crashing auto-detection
        version: 'detect',
      },
    },
  },
  {
    files: ['client/**/*.{ts,tsx}'],
    plugins: {
      // Wrap the Hooks plugin to fix missing legacy context methods
      'react-hooks': fixupPluginRules(pluginReactHooks),
      'react-compiler': reactCompilerConfig,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-compiler/react-compiler': 'error',
    },
  },
  {
    files: ['server/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
);
