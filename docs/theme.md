# Theme — Orbit Night

**Theme name:** Orbit Night  
**Product:** Lunar — Space Technology learning platform  
**Source of truth (tokens):** [`src/index.css`](../src/index.css)  
**High-level taste:** [workspace `DESIGN.md`](../../DESIGN.md)

---

## One-line pitch

Deep navy learning surfaces lit by cyan telemetry — space is the **subject**, not decoration.

---

## Intent

Orbit Night makes Lunar feel like a **serious educational mission console**, not a sci-fi game HUD.

| Feel | Means |
|------|--------|
| Curious | Invite exploration without cartoon spectacle |
| Credible | Quiet navy, readable type, restrained accent |
| Hands-on | Interactive lessons (3D, FlatSat, ground-station camera) stay clear |
| Local | Thai body copy stays warm and readable (`Sarabun` / `Noto Sans Thai`) |

**Do:** treat cyan as a signal (CTA, progress, active state).  
**Don't:** galaxy wallpaper, neon glow stacks, emoji decoration, fake NASA chrome.

---

## Color

### Core palette

| Token | Hex / value | Role |
|-------|-------------|------|
| `bg` | `#030812` | App canvas — deep space navy |
| `bg-2` / card | `#060e1c` | Raised panels, sidebar, cards |
| `cyan` (primary) | `#00e5ff` | Accent, CTA, focus ring, progress |
| `teal` | `#1de9b6` | Secondary success / soft accent |
| `amber` | `#ffab00` | Warning, pause, attention |
| `text` | `#e8edf5` | Primary copy |
| `muted` | `rgba(232,237,245,0.72)` | Secondary copy |

### Semantic (Shadcn-aligned)

| Token | Use |
|-------|-----|
| `destructive` `#f87171` | Errors, camera denied, failed checks |
| `border` `rgba(255,255,255,0.1)` | Hairline structure |
| `ring` cyan @ ~45% | Focus visibility |

### Rules

1. **One primary accent:** cyan. Teal/amber only for meaning.
2. Gradients only as **thin** panel washes (`from-cyan/[0.07]`, hero edge fades) — never full-page rainbow.
3. Glass / blur is for **interactive panels** (lesson sidebars), not every box.
4. Keep WCAG AA contrast on text over `bg` / `bg-2`.

---

## Typography

| Role | Family | Tailwind / CSS |
|------|--------|----------------|
| Display / module titles | Orbitron | `font-display` |
| English UI / brand | Syne | `font-en` |
| Thai body / lesson copy | Sarabun | `font-section-thai` |
| Thai UI fallback | Noto Sans Thai | `font-thai` (body default) |
| Telemetry / labels | Space Mono | `font-mono` |
| Platform / denser UI | Space Grotesk | `font-platform` |

### Hierarchy habits

- Display: short English labels, wide tracking (`tracking-[0.14em]`–`0.2em`).
- Mono: step indices, `UPPERCASE` micro-labels, status chips.
- Thai section font: explanations, quiz, mission brief — never force Orbitron on long Thai paragraphs.

---

## Surfaces & layout

| Pattern | Guidance |
|---------|----------|
| App shell | `bg-bg` full bleed; sidebar on `bg-2` |
| Lesson HUD | Dark panel + `border-white/10` + light cyan when active |
| Cards | Prefer border + subtle fill; avoid nested cards |
| Radius | Prefer `--radius` (~0.75rem); clip buttons when brand needs it (`btn-clip`) |
| Imagery | Real Earth / satellites / CubeSat models; low-contrast hero fades so type wins |

---

## Motion

Allowed: fade, slide, gentle float, HMR-friendly lesson transitions, pauseable data-flow particles.  
Avoid: star explosions, constant lens flare, competing glow pulses on every control.

Auth may use stronger glow/scan keyframes; **Space lessons** stay quieter so 3D content remains primary.

---

## Module accents (Space)

Use module accent sparingly (icon glow, progress bar) — still sit on Orbit Night base:

| Module | Accent (example) |
|--------|------------------|
| Overview | `#00e5ff` (cyan) |
| Anatomy | `#7dd3fc` (soft sky) |
| Physics | violet-leaning accent when needed |
| Programming | amber `#ffab00` |

Ground-station / webcam activity: cyan frame + rose only for error states.

---

## Tone of voice (UI copy)

- Mission-brief clarity: short Thai + optional English label.
- Prefer verbs: “ถ่ายภาพ”, “หยุดจุดวิ่ง”, “ถัดไป”.
- No fake badges (“Official NASA”), no emoji as icon system.

---

## Checklist before shipping UI

- [ ] Reads as Orbit Night without relying on galaxy wallpaper  
- [ ] Cyan used as signal, not wallpaper  
- [ ] Thai body uses section/Thai fonts, not display face  
- [ ] One clear primary CTA per section  
- [ ] Motion supports understanding, not spectacle  
- [ ] Tokens come from `@theme` / `:root` — avoid one-off hex sprawl unless documented here  

---

## Name alternatives (rejected)

Kept for reference if branding needs a second option later:

| Name | Why not default |
|------|-----------------|
| Lunar Signal | Strong, but overlaps product name too hard |
| Night Telemetry | Accurate, slightly too ops/industrial |
| Deep Horizon | Softer, less “console / learn” energy |
