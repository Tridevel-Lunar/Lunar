# LUNAR Frontend Stack

Current technology stack used by the frontend application.

## Core

- **Build tool**: Vite 7
- **UI runtime**: React 19
- **Routing**: React Router 7
- **Language**: TypeScript
- **Package manager**: npm

## Styling and UI

- Tailwind CSS v4
- Radix UI primitives (`dialog`, `popover`, `select`, `tooltip`, `slot`)
- Utility helpers: `clsx`, `tailwind-merge`, `class-variance-authority`
- Animation: `framer-motion`, `tw-animate-css`
- Icons: `react-icons`, `lucide-react`

## 3D / Visualization

- `three`
- `@react-three/fiber`
- `@react-three/drei`

Used for Space visuals and canvas-based experiences.

## Arena Visual Coding

- `blockly` (v13)
- Custom block definitions and toolbox assets under:
  - `src/components/arena/blockly/*`
  - `public/blockly/media/*`

Flow: Blockly workspace -> AST -> backend run APIs -> frontend result rendering.

## Studio AI Chat Rendering

- Streaming markdown parser: `micromark` + GFM/math extensions
- Final markdown renderer: `react-markdown`
- Markdown plugins: `remark-gfm`, `remark-math`
- Math rendering: `rehype-katex` + `katex`
- Diagram rendering: `mermaid` (lazy-loaded in chat code blocks)

## Authentication

- Cookie-based auth against backend endpoints
- Google Identity Services via browser script (`accounts.google.com/gsi/client`)
- Frontend auth helpers in `src/lib/auth.ts`

## Tooling and Quality

- ESLint 9 + TypeScript ESLint
- React hooks and react-refresh lint plugins
- Vite React plugin
- Type definitions for React/Node/Three

## Architecture Notes

- SPA with route guards (`GuestRoute`, `ProtectedRoute`)
- API layer centralized in `src/lib/api.ts`
- Feature-oriented component organization:
  - `components/space`
  - `components/arena`
  - `components/studio`
  - `components/backoffice`

## Environment Contract

- `VITE_API_URL` (optional; defaults to `/api`)
- `VITE_PROXY_TARGET` (dev proxy target)
- `GOOGLE_CLIENT_ID` (public GIS client ID)

`vite.config.ts` explicitly exposes only `VITE_*` and `GOOGLE_CLIENT_ID`.
