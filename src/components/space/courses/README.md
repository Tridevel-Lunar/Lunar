# Space courses & modules

Space content is organized as **Courses** that contain **Modules**.  
Each module is a **custom React page** owned by a teammate.

## Catalog vs registry

| | Catalog (backend) | Registry (frontend) |
|--|-------------------|---------------------|
| File | `backend/data/space/catalog.json` | `core/registry.ts` + `courses/<id>/` |
| Purpose | Tree browse + LAIKA metadata (`summary`, `teaches`, `intentHints`, …) | Runnable React modules |
| Enterable | Only leaves with `status: "published"` | Only ids registered here |

**Bridge:** catalog course `id` === registry `id` when published.  
LAIKA recommends **only** ids from the catalog digest — never invent courses, never treat folders as lessons. Prefer `published`; `coming_soon` may be mentioned as upcoming; Lunar is space technology broadly (not CubeSat-only).

## Routes

| Path | Component |
|------|-----------|
| `/space` | Home tab |
| `/space/path` | Path tab (saved DAG map) |
| `/space/path/session` | LAIKA path session (chat + live graph) |
| `/space/explore` | Explore catalog browser |
| `/space/course/:courseId` | Course overview (`SpaceCourse`) |
| `/space/course/:courseId/module/:moduleId` | Custom module page via `SpaceModuleRoute` |

## Add a module (existing course)

1. Create a folder under the course, e.g.  
   `courses/cubesat-for-beginner/modules/my-module/`
2. Add `MyModule.tsx` that exports a default component accepting `SpaceModulePageProps`:

```tsx
import type { SpaceModulePageProps } from "@/components/space/core/types";

export default function MyModule({ user, course, module }: SpaceModulePageProps) {
  return <div>…</div>;
}
```

3. Add `index.ts` that exports a `SpaceModuleDefinition`:

```ts
import { lazy } from "react";
import type { SpaceModuleDefinition } from "@/components/space/core/types";

export const myModule: SpaceModuleDefinition = {
  id: "my-module",
  title: "MY MODULE",
  titleTh: "โมดูลของฉัน",
  description: "…",
  accent: "#00e5ff",
  icon: "overview",
  progress: 0,
  Component: lazy(() => import("./MyModule")),
};
```

4. Register it in `courses/cubesat-for-beginner/course.ts` — one import + one entry in `modules`.

## Add a course

1. Add / update the leaf in `backend/data/space/catalog.json` (LAIKA fields + `status`).
2. When ready to ship: set `status: "published"`, keep `outline` module ids in sync.
3. Create `courses/<course-id>/course.ts` exporting a `SpaceCourseDefinition`.
4. Add one import + one entry in `core/registry.ts` (`COURSES` array).

## Shared systems

- **Knowledge glossary** — `[[id|label]]` markers via `KnowledgeText` / `KnowledgeProvider` (`src/lib/knowledge`, `src/components/knowledge`)
- **Physics 3D / sim** — owned by the physics module under `modules/physics/` (scenes, sim clock, thermal)

## Reference

- Catalog UI: [`../catalog/`](../catalog/)
- Types: [`../core/types.ts`](../core/types.ts)
- Registry: [`../core/registry.ts`](../core/registry.ts)
- Route helpers: [`../core/routes.ts`](../core/routes.ts)
- Example (full): [`cubesat-for-beginner/modules/physics/`](cubesat-for-beginner/modules/physics/)
- Placeholder stub: [`cubesat-for-beginner/modules/PlaceholderModule.tsx`](cubesat-for-beginner/modules/PlaceholderModule.tsx)
