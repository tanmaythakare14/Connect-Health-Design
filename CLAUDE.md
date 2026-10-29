# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build (type-check + bundle)
npm run lint           # eslint . --fix
npm run lint:check     # eslint . --ext .ts
npm run format:check   # prettier --check .
npm run prettier:fix   # prettier --write .
npm run commit         # commitizen (cz-customizable, config in .cz.config.cjs)
```

There is no test runner installed (no jest/vitest in `package.json`, no test script). Verify changes with `npm run build` + `npm run lint:check`.

Git hooks (husky): `pre-commit` runs lint-staged (eslint + prettier on staged `.ts`/`.tsx`); `commit-msg` enforces conventional commits via commitlint; `pre-push` runs `lint:check`, `format:check`, and `build`. Commit messages must be conventional-commit formatted.

## Architecture

Currently a small React 19 + TypeScript + Vite + Tailwind v4 boilerplate with HIPAA-oriented security infra. `src/App.tsx` is a demo page exercising that infra; the real app has not been built yet.

- `src/utils/secureStorage.ts` / `encryption.ts` — AES (crypto-js) wrappers around `localStorage`/`sessionStorage`. Key comes from `VITE_ENCRYPTION_KEY` (required in production).
- `src/store/index.ts` — Redux Toolkit store persisted via `redux-persist` using the encrypted storage adapter. Only a placeholder `sample` reducer exists. Use the typed `useAppDispatch`/`useAppSelector` from `src/store/hooks.ts`, not raw react-redux hooks.
- `src/utils/logger.ts` — logger that redacts PHI/PII patterns (SSN, phone, email, MRN, DOB, cards). Use it instead of `console.*`. In production only warn/error emit.
- `src/config/environment.ts` — single place to read `import.meta.env` (`VITE_ENCRYPTION_KEY`, `VITE_DISABLE_LOGGING`, `VITE_DISABLE_PHI_REDACTION`, `VITE_API_URL`).
- `src/examples/usage-examples.ts` — reference snippets only.

## Project conventions (`.claude/rules/*.md`)

Detailed rules exist for api, components, dialog, modules, state, styling, testing, and typescript. They are written for a target architecture (Auth0, shadcn/ui, `src/modules/<feature>/`, `@/` alias) that **does not exist in the repo yet** — no `@/` path alias is configured in `tsconfig.app.json`/`vite.config.ts`, no shadcn/Auth0/react-hook-form/zod dependencies are installed, and there is no `src/modules`, `src/components`, or `src/lib/utils.ts`. Check what actually exists before following a rule's examples; add dependencies/config deliberately rather than assuming them. The rules also reference a student/course-management product and a `PRODUCT_NAME` constant, and some are partly historical (`onboarding-patterns.md`).

Headline rules to follow when building features:

- Feature code lives in `src/modules/<feature>/` with `@types/index.ts`, `components/`, `service/{api,mapper}.ts`, `constants/`, `utils/`; all `fetch` calls only in `service/api.ts` (explicit return types, base URL from `config.apiUrl`).
- Server data stays out of Redux (component-local state); Redux is for global UI state only. Never put PII in Redux.
- shadcn/ui primitives only, Tailwind utilities (no inline `style`, no hardcoded hex — semantic tokens), `cn()` for conditional classes.
- Forms: React Hook Form + Zod, types derived via `z.infer`. No `any`; explicit return types on exported functions; interfaces in `@types/index.ts`.

Design tokens/layout guidance is in `design.md` and `DESIGN_SYSTEM.md` (untracked, template-style; fill-in values are samples).

## Claude slash commands / skills

`.claude/commands/` has `commit-push`, `free-ports`, and `update-postman`; some reference an `apps/web` + `apps/api` (NestJS) Nx layout and Postman collection that are not in this repo. `.claude/skills/optimize-changes` is a pre-PR review against the rules above.
