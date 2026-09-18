<div align="center">

<img src="./Baton_logo.png" alt="Baton" width="200">

# Baton

**A Figma plugin that writes React + Tailwind the way a developer would.**

Not a dump of absolute coordinates — flex and grid, repeated blocks folded into
arrays, icons pulled into components, colours turned into theme tokens.

<!-- Скриншоты и видео: docs/preview.png, docs/demo.mp4 (или ссылка на YouTube) -->
<!-- ![Preview and code side by side](./docs/preview.png) -->
<!--  -->

</div>

---

## The problem

Every design-to-code tool hits the same wall: a Figma frame is a bag of
rectangles with coordinates, and the obvious translation is a pile of
`position: absolute`. That output compiles, renders once, and then nobody can
edit it — there is no layout to reason about, no data to change, no components to
reuse.

Baton takes the opposite route: it treats the frame as **geometry to be
understood**, not a tree to be transcribed. Where the designer used auto-layout,
that layout is used. Where they didn't, layout is inferred from positions,
alignment and gaps. Where six blocks merely *look* alike — different text,
different icons, different colours, grouped differently in the layers panel —
they collapse into one component and one array of data.

## Who it is for

A designer handing a page over, and a developer who has to build it. The plugin
does not replace either — it removes the mechanical half of the handover: typing
out spacing, colours, repeated cards and icon paths by hand.

## Where to get it

Being prepared for the Figma Community. <!-- ссылку вставить после публикации -->
Until then, the plugin runs locally from source; the source repository is
private.

## What comes out

A frame goes in. Seven tabs come out, each a real file you can drop into a
project:

| File             | Contents                                                          |
| ---------------- | ----------------------------------------------------------------- |
| `components.tsx` | main component, child components, shared ones with props           |
| `consts.tsx`     | repeated blocks as `const` arrays of data                          |
| `types.ts`       | item and prop types (TypeScript mode)                              |
| `icons.tsx`      | every icon and logo as its own named SVG component                 |
| `images.ts`      | design images inlined as data URIs                                 |
| `tailwind.config.js` | theme for Tailwind 3.4 — colours and fonts                     |
| `@theme` CSS     | the same tokens, CSS-first, for Tailwind 4.1                       |

Colour token names in the code and in the theme always match: both sides build
them from the same tree.

### A real example

Six team cards in a Figma file — the designer had split them into three frames of
two, with a different photo, name and icon in each. Baton produces one component
and one array:

```tsx
export default function Team() {
  return (
    <div className="grid grid-cols-[repeat(3,_387px)] grid-rows-[repeat(2,_331px)] gap-x-10 gap-y-10">
      {items.map((item) => (
        <Card key={item.id} {...item} />
      ))}
    </div>
  );
}
```

```tsx
export const items: Item[] = [
  { id: 1, icon: <Icon1 />, title: "John Smith",  role: "CEO and Founder", … },
  { id: 2, icon: <Icon2 />, title: "Jane Doe",    role: "Director of Operations", … },
  …
];
```

The photo inside each card is masked by an organic blob shape — that becomes a
real `clip-path`, not a square crop.

---

### Inside the plugin

- Live preview beside the code, with a draggable splitter and its own zoom.
- Pick the preview background — light, white, dark, a transparency checkerboard,
  or any colour — so a white design on white is actually visible.
- TypeScript or JavaScript output, switchable; the types tab hides in JS mode.
- Code themes, line wrapping, and settings that survive a restart.
- A feedback button that copies the technical details and opens a form. The
  report carries the frame name, the failed step and the error — never the
  design.
- The panel follows Figma's light and dark theme.

### Hints in layer names

Most of the time nothing is required. When a layout is genuinely ambiguous, a
prefix in the layer name settles it — Tailwind-like, so it reads as itself:

```
[flex-col gap-4 items-center]
```

The plugin reads only these tokens and invents nothing; order does not matter.

## How it works

Six stages, each a pure transformation of the previous one:

```
Figma selection
   │
   ├─ extract        raw data out of the Figma API
   ├─ normalize      one predictable node shape
   ├─ inferSemantic  what things ARE: buttons, inputs, lists, cards, masks
   ├─ resolveNode    what things LOOK like: CSS objects
   ├─ generateTree   AST with Tailwind classes already on it
   └─ generate       markup, components, data, icons, theme
```

The backend (Figma sandbox) computes the tree; the UI renders both the live
preview and the code from it. Images travel separately as bytes and become blob
URLs for the preview and data URIs for the code, so copied code renders straight
away.

### One design, stage by stage

A "Team" section: six cards, which the designer had split into three frames of
two. Each card holds a photo masked by an organic blob, a name, a role and a
LinkedIn badge. What the pipeline decides:

| Stage | Decision |
| --- | --- |
| `normalize` | every node gets one predictable shape: box, fills, strokes, text, geometry |
| `inferSemantic` | the three frames are dissolved — that split is a Figma convenience, not a fact about the page; the six cards now sit in one 2×3 grid |
| | the white plate behind each card is absorbed into the card itself, instead of staying a stray `div` |
| | the mask group keeps its clip shape, so the photo stays blob-shaped |
| `resolveNode` | no auto-layout on the section, so the grid is recovered from geometry: equal cells, equal gaps, aligned columns |
| `generateTree` | CSS becomes Tailwind classes; colours become tokens |
| `generate` | six structurally identical cards fold into one `Card` component and one `items` array; the badge moves to `icons.tsx`; photos are inlined into `images.ts` |

The result is the snippet above: a grid, a `.map()`, and data you can edit.

### Passes worth mentioning

A few of the transformations that make the output readable:

- **Repeat folding.** Identical siblings become an array plus `.map()`; similar
  ones become a shared component with props. Two blocks are enough.
- **Twin canonicalisation.** Designers assemble the same card three different
  ways. A pass rewrites them to one shape — comparing by *role multiset*
  (heading, paragraph, number), not by layer nesting — so the folding pass can
  see them as repeats.
- **Grid dissolution.** A row of cards split into frames "two at a time" is
  reassembled into a single grid, because that split is a convenience in Figma,
  not a fact about the page.
- **BSP grouping.** Where there is no auto-layout, the tree is cut along clean
  horizontal and vertical lines to recover the implicit structure.
- **Heading hierarchy from typography.** The most frequent font size is body
  copy; larger sizes become `h1`…`h6` by descending size; text in a wide column
  becomes `p`. Layer names are a hint, never the source of truth.
- **Design tokens.** The palette is derived from the whole tree and named by
  meaning — `accent-*` for brand colours, `foreground` / `muted` / `surface` /
  `border` for neutrals.

### Problems that turned out to be interesting

The honest part of the work was not the pipeline — it was the long tail:

- **Rotation is reported in world space.** A vector rotated 45° inside a mirrored
  group needs `rotate(45deg) scaleX(-1)` locally, not `rotate(-45deg)`. The fix
  computes the local transform from the matrices: `parent⁻¹ · node`.
- **A hairline is not zero.** Figma reports a horizontal line's height as
  `1.7e-6`, not `0`. A `=== 0` check missed it, and an arrow drawn with a 3 px
  stroke collapsed to nothing.
- **Tailwind preflight fights you.** `img { max-width: 100% }` silently squeezed
  photos that are deliberately wider than their mask.
- **Paint opacity lives apart from colour alpha.** A white arrow at 40 % paint
  opacity rendered fully white until stroke paints started folding it in.
- **A negative auto-layout gap** is how designers overlap children. CSS has no
  such thing, so that layout falls back to geometry.

Every one of them arrived as a real design that came out wrong, was reproduced
from a dump as a fixture, and left behind a test. Three are written up in full in
[CASE-STUDIES.md](./CASE-STUDIES.md).

---

## Design decisions

The parts that were choices, not defaults — with what they cost:

**A pipeline of pure stages, not one clever walk.**
Six transformations, each taking the previous shape and returning a new one.
Debugging a wrong layout means diffing two stages, not stepping through a
recursive function. The cost is memory: the tree exists several times over.

**Geometry over layer structure.**
The designer's grouping is a working convenience — blocks get split "two at a
time", wrappers are left empty, the same card is assembled three different ways.
Reading the tree literally reproduces that mess in code, so the passes read
positions, sizes and roles instead. The cost is that every rule needs a guard:
"looks like a grid" must not fire on a list that merely happens to line up.

**Heuristics, not a model.**
Every decision is a rule that can be read, tested and explained in a commit
message. A model would generalise better and fail silently; a rule fails loudly,
on a fixture, with a name.

**An engine that knows nothing about React.**
`parser`, `resolver` and `generator` — 134 modules — import nothing from Preact,
the icon set or the editor. React sits beside them as one implementation of the
last step. That is why the whole suite runs in Node with no DOM, and why Vue
would be a folder rather than a rewrite.

**Tests from real failures, not invented inputs.**
Every fixture started as a design that came out wrong. The dump is captured from
the plugin console, rebuilt as a `NormalizedNode`, and the fix is verified against
the geometry that actually broke. Invented inputs would have passed.

## Engineering

| | |
| --- | --- |
| **Language** | TypeScript, strict |
| **UI** | Preact (aliased as `react`), inline styles, light/dark palette |
| **Output** | Tailwind CSS 3.4 and 4.1 |
| **Build** | esbuild via `@create-figma-plugin` |
| **Tests** | Vitest — **333 tests** across 58 files |
| **Size** | ~181 modules, ~21 600 lines |

### Layout

```
src/
├── parser/      61  Figma API → NormalizedNode
│   ├── extract/     raw data out of the API
│   ├── normalize/   one predictable node shape
│   └── semantic/    16 passes: what things ARE
├── resolver/    32  NormalizedNode → CSS objects
├── generator/   41  CSS → markup, components, data, icons, theme
├── types/       25  the three node shapes and everything they carry
└── utils/       16  colour, geometry, image helpers
```

Three node shapes carry the work, and each stage only ever sees the previous
one: **`NormalizedNode`** (what Figma gave us, tidied) → **`ResolvedNode`** (what
it looks like, as CSS) → **`GeneratedNode`** (an AST with Tailwind classes on it).
Keeping them separate is what makes a wrong layout debuggable: the question is
always *which stage first got it wrong*.

### Tests grow out of bug reports

Tests are built from **real dumps** — when a frame generates badly, the node tree
is captured, rebuilt as a fixture, and the fix is verified against the geometry
that actually failed. That is why the suite reads like a list of designs rather
than a list of functions.

---

## What it doesn't do

Stated plainly, because the first sceptic will check:

- One frame at a time. Past ~2000 layers it asks before starting — the pipeline
  is synchronous and can't be interrupted.
- Tailwind only. No plain CSS, no styled-components.
- React only, for now.
- Layout inference is good, not perfect. Unusual overlaps still need a hand.

---

## In this repository

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — the pipeline in detail: the three node
  shapes, how a pass is written, how repeats are folded, how it is tested.
- [`CASE-STUDIES.md`](./CASE-STUDIES.md) — three bugs worth writing down, from
  symptom to fix.
- [`examples/`](./examples) — real files the plugin produced, unedited.
- [`docs/`](./docs) — screenshots and video.
- [`CHANGELOG.md`](./CHANGELOG.md) — what changed in each release.

## What's next

- Vue output — the engine is ready for it; only the last step is React-specific.
- Plain CSS and CSS Modules alongside Tailwind.
- Multi-frame selection, and a faster path for very large trees.
- Component detection across frames: the same card on three pages should become
  one component, not three.

## Status

A solo project, in active development, being prepared for the Figma Community.
<!-- допиши срок, если хочешь: "Started in …", "~N months of work" -->

**This repository is a showcase.** The plugin's source lives in a private
repository; what you see here is the story of the project, its architecture and
its output. Happy to walk through the code in a call.

---

## Author

Built by [@elfototo](https://github.com/elfototo).
<!-- добавь почту или Telegram, если хочешь, чтобы писали напрямую -->

Questions, or curious about the implementation? Open an issue — happy to walk
through any part of the pipeline.
