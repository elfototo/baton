# Architecture

How Baton turns a Figma frame into code, for the reader who wants the detail.
The [README](./README.md) has the short version.

---

## The shape of the thing

Six stages. Each takes the previous shape and returns a new one — nothing is
mutated in place, and no stage reaches back.

```
Figma selection
   │
   ├─ extract         raw data out of the Figma API
   ├─ normalize       → NormalizedNode   one predictable shape
   ├─ inferSemantic   → NormalizedNode   what things ARE
   ├─ resolveNode     → ResolvedNode     what things LOOK like
   ├─ generateTree    → GeneratedNode    AST with Tailwind classes
   └─ generate…       markup, components, data, icons, theme
```

The split is not decoration. When a layout comes out wrong, the question is
always *which stage first got it wrong*, and the answer is a diff between two
tree dumps rather than a session in a debugger.

The backend runs in the Figma plugin sandbox and computes the tree; the UI
renders both the live preview and the code from that same tree. Images travel
separately as raw bytes, because the sandbox and the UI need them in different
forms — blob URLs for the preview, data URIs for code you can paste anywhere.

## Three node shapes

| Shape | Owns | Example fields |
| --- | --- | --- |
| `NormalizedNode` | what Figma gave us, tidied | `boundingBox`, `style.fills`, `geometry.paths`, `layoutChild` |
| `ResolvedNode` | what it looks like | `css: CSSObject`, `element: "div" \| "button" \| …` |
| `GeneratedNode` | how it will be written | `tag`, `className`, `children`, `map` |

Keeping them apart is what makes the pipeline debuggable. A wrong colour is a
`ResolvedNode` problem; a wrong tag is `inferSemantic`; a wrong class is
`generateTree`.

## Layers

```
src/
├── parser/      61 modules   Figma API → NormalizedNode
│   ├── extract/                raw data out of the API
│   ├── normalize/              node, layout, geometry, style, text
│   └── semantic/               16 passes: what things ARE
├── resolver/    32 modules   NormalizedNode → CSS objects
├── generator/   41 modules   CSS → markup, components, data, icons, theme
├── types/       25 modules   the three node shapes and everything they carry
└── utils/       16 modules   colour, geometry, image helpers
```

`parser`, `resolver` and `generator` — 134 modules — import nothing from Preact,
the icon set or the code editor. The engine is plain TypeScript over plain data.
Two things follow: the whole test suite runs in Node with no DOM, and a second
framework target would be a folder beside `generator/component/react`, not a
rewrite.

---

## How a semantic pass is written

The semantic stage is where most of the thinking lives: sixteen passes, each
answering one question about the tree. They share a shape — take a node, return
a node, decide nothing you cannot justify from geometry.

A small one, close to the real thing:

```ts
/**
 * Ребёнок выходит за границы родителя.
 *
 * Потоком такой ребёнок не выражается: в потоке он встаёт ВНУТРЬ родителя, и
 * вылезшая часть просто исчезает, а сиблинги уезжают на её место.
 *
 * Для GROUP это никогда не срабатывает: габарит группы и есть объединение
 * детей. То есть правило работает ровно там, где дизайнер сам вынес ребёнка за
 * рамку фрейма.
 */
export function escapesParent(child: NormalizedNode, parentBox?: Rect): boolean {
  if (!hasRect(parentBox)) return false;

  // ТЕКСТ не считаем никогда: текст, вылезший за свою рамку, — рядовой артефакт
  // макета, а не приём.
  if (child.nodeType === "TEXT") return false;

  const tolX = Math.max(ESCAPE_TOLERANCE, parentBox.width * ESCAPE_RATIO);
  …
}
```

Three habits show up in every pass and are the reason the codebase stayed
workable past twenty thousand lines:

- **The comment says why, not what.** The signature already says what. What gets
  lost is the design that broke — so that is what is written down.
- **Every rule has a guard.** "Sticks out of its frame" fires on a deliberate
  overhang and must not fire on a caption two pixels wider than its box. The
  guard is usually a tolerance relative to the parent, plus an exclusion for the
  noisy case.
- **The narrow version ships.** A pass that fires on three blocks and skips two
  is better than one that reshapes everything and is wrong once in ten.

## The pass that pays for itself

Folding repeats is the feature people notice, and the one with the most edge
cases.

The generator walks the tree and computes a **structure key** for every node —
tags and nesting, with values deliberately left out. Siblings whose keys match
are repeats. Then it diffs them field by field: what differs becomes a field of
the array item, what matches stays in the template. Text, class strings, icons,
image hashes and nested lists each have their own rule for what "differs" means.

Two blocks are enough to fold. Two passes ask for three instead — rows split by
separators, and twins the designer grouped differently — because reshaping a
structure on the evidence of a single pair is a coin flip.

The hard part is not the diff. It is everything that makes two visually identical
cards look structurally different to a machine:

- one card has its photo inside an `Illustration` frame, another has it loose;
- one heading is a single text layer, another is two;
- a shadow layer exists in three cards out of six;
- the same plate is a `RECTANGLE` here and a `VECTOR` there.

Each of those is a separate pass that runs *before* folding, bringing the blocks
to one shape — absorbing background plates, dissolving empty wrappers,
canonicalising twins by their role multiset rather than their nesting.

## Design tokens

Colours are collected from the whole tree, clustered, and named by meaning:
`accent-*` for brand colours, `secondary` / `tertiary` for muted ones,
`foreground` / `muted` / `background` / `surface` / `border` for neutrals. Alpha
survives as a Tailwind suffix (`bg-accent-background/40`).

There is one invariant worth stating, because breaking it is silent: the code
generator and the theme generator build tokens **from the same tree**, so a class
in `components.tsx` always resolves against `tailwind.config.js`. Any change to
one side has to keep that true.

---

## Testing

333 tests across 58 files, in a Node environment with no DOM.

Almost every fixture started as a real design that came out wrong:

1. The plugin prints the node tree to the console.
2. The dump is rebuilt as a `NormalizedNode` fixture — real coordinates, real
   font sizes, real path data.
3. The test asserts on the generated markup, and is checked to **fail before the
   fix** — a test that passes either way is worse than none.

That is why the suite reads like a list of designs: *a photo the size of its
mask*, *a paragraph inside a shape is not a button label*, *an upright vector in
a rotated group is not turned twice*. Each name is a bug that shipped once.

Three kinds of test carry the weight:

- **Unit** — pure functions with awkward inputs: colour conversion, line-height
  normalisation, text ink boxes.
- **Pass-level** — one transformation, one fixture, one assertion about the tree.
- **End-to-end** — `NormalizedNode` → finished `components.tsx`, asserting on the
  markup a user would copy. These catch the interactions no unit test can.

## Performance and limits

The pipeline is synchronous: once it starts on a large tree, Figma is blocked
until it finishes. Rather than pretend otherwise, the plugin counts the subtree
first and asks before starting past ~2000 nodes.

Generation is tied to the selection, debounced by 200 ms, and every run carries a
token — if the selection changes mid-run, the result is dropped instead of
racing the new one. Images are downscaled before being inlined, because a 4000 px
photo becomes seven megabytes of base64 and makes the code tab unusable.
