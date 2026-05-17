# React + TypeScript + Vite

This client is a Vite-powered React + TypeScript application. The React Compiler is enabled through `@vitejs/plugin-react` and `babel-plugin-react-compiler`.

## Tooling

Linting and formatting are handled by Biome from the repository root.

- `pnpm lint` / `pnpm check` runs `biome check .`
- `pnpm lint:fix` / `pnpm check:write` runs `biome check --write .`
- `pnpm format` runs `biome format --write .`

The Vite `@/` alias continues to point at `client/src` through `client/vite.config.ts` and `client/tsconfig.app.json`.
