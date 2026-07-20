# Space courses & modules

Space content is organized as **Courses** that contain **Modules**.  
Each module is a **custom React page** owned by a teammate.

## Routes

| Path | Component |
|------|-----------|
| `/space` | Course catalogue (`SpaceHome`) |
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

1. Create `courses/<course-id>/course.ts` exporting a `SpaceCourseDefinition`.
2. Add one import + one entry in `core/registry.ts` (`COURSES` array).

## Shared systems

- **Knowledge glossary** — `[[id|label]]` markers via `KnowledgeText` / `KnowledgeProvider` (`src/lib/knowledge`, `src/components/knowledge`)
- **Physics 3D / sim** — owned by the physics module under `modules/physics/` (scenes, sim clock, thermal)

## Reference

- Types: [`../core/types.ts`](../core/types.ts)
- Registry: [`../core/registry.ts`](../core/registry.ts)
- Route helpers: [`../core/routes.ts`](../core/routes.ts)
- Example (full): [`cubesat-for-beginner/modules/physics/`](cubesat-for-beginner/modules/physics/)
- Placeholder stub: [`cubesat-for-beginner/modules/PlaceholderModule.tsx`](cubesat-for-beginner/modules/PlaceholderModule.tsx)
