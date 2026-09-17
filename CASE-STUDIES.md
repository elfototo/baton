# Case studies

Three bugs worth writing down. Each arrived the same way — a designer generated a
block, something looked wrong, and the node dump came with it. Each left behind a
test named after the design that broke.

They are here because the interesting part of this project was never the
pipeline. It was the long tail.

---

## 1. The star that pointed the wrong way

**Symptom.** An illustration had a green four-pointed star inside it. In Figma it
sits at 45°. In the generated code it came out rotated the other way.

**What the data said.** The star is a `VECTOR` with `rotation: 45`, inside a
group whose matrix is `[[-1, 0], [0, 1]]` — a horizontal mirror, which Figma
reports as `rotation: -180`.

**The catch.** Figma's `rotation` is a **world** angle, not a local one. In CSS
the parent applies its own transform and children nest inside it, so a child's
transform has to be expressed in the parent's frame. The code did subtract the
parent's angle — but only when both angles were non-zero, and it never
normalised the result:

```
-180 − 45 = -225
```

`-225` is past the `> 179.9` threshold that means "this is a flip", so the whole
rotation collapsed into a bare `scaleX(-1)` and the 45° vanished.

**Why subtraction was the wrong tool.** The parent is a mirror and the star is a
pure rotation, so the child's local transform must itself be a reflection —
something no single `rotate()` can express. The honest answer is matrix algebra:

```
local = parent⁻¹ · node
```

Decompose the result: positive determinant means a plain rotation, negative
means rotation plus a flip. For this star it gives `rotate(45deg) scaleX(-1)` —
which, composed with the parent's mirror, lands exactly on the world `-45°` that
Figma reported.

**Worth noting.** With an unrotated parent the matrix is the identity and the
decomposition returns precisely the old formula, so the change is invisible
everywhere else. That property is what made it safe to ship, and it is asserted
in its own test.

---

## 2. The photo that shrank, and the arrow that disappeared

Two symptoms, weeks apart, one cause.

**Symptom A.** Team photos are masked by an organic blob. The photo filled only
the left part of the blob; the rest showed the dark shape behind it. It read as
"the photo is shifted left".

**Investigation.** Every number in the markup matched the design: the photo's
box, its offset inside the mask, the clip path, the crop mode. Measuring the
rendered screenshot against the blob gave the answer — the image element was
being drawn at half its width, with a hard vertical edge exactly where it ended.

**Cause.** Tailwind's preflight:

```css
img { max-width: 100%; height: auto; }
```

`max-width` beats `width`. A photo 188 px wide inside a 97 px mask was clamped to
97. And photos in masks are *deliberately* wider than their mask — that is how
cropping works.

**Fix.** An image with a width we set gets `max-w-none`. An image without one
keeps the guard, which is still useful.

**Symptom B**, same family: a navigation arrow vanished. Its height was `1.7e-6`
— Figma's way of saying "a horizontal line has no height" — and a check for
`height === 0` missed it, so instead of the stroke's 3 px the element got a box
of one-millionth of a pixel.

**The lesson from both.** The layout engine's own defaults are part of the
output. Generating correct numbers is not enough if the framework then overrides
them, and geometry from a design tool is full of values that are zero in spirit
but not in floating point.

---

## 3. Six cards that would not become one

**Symptom.** A team section of six identical cards produced *five* array items
and one card written out separately in the markup. Then, once that was fixed,
the whole thing came out flattened: plates and labels scattered as absolutely
positioned fragments.

**First cause.** In one card the photo was 105 × 105 while the blob mask was
97.8 — close enough that the "find this block's background" pass claimed the
photo as the card's background, absorbed it, and threw the mask group away with
it. That card's structure no longer matched the other five, so the folding pass
left it out.

The fix states the rule the code was missing: a mask group's contents are
content, never a parent's background. The search stops at its boundary.

**Second cause, and the more interesting one.** With all six cards finally under
one parent, a different pass woke up — the one that rewrites twins the designer
assembled differently. It needs three blocks to fire; before, there had only ever
been two per frame.

It compared the cards' structures, found a difference, and did what it is built
to do: laid all six out flat so they would match. The difference it found was one
card whose photo sat directly in the group while the others had theirs inside an
`Illustration` frame. One redundant wrapper, in one card out of six — and the
layout of all six was rebuilt.

**Fix.** An empty wrapper around a single child is not a structural difference.
The generator collapses such wrappers later anyway, so the comparison now ignores
them — for the reader, a photo in a frame and a photo on its own are the same
thing.

**What it says about the design.** Passes that reshape a tree are powerful and
cheap to write, which is exactly why each one needs a guard that says when *not*
to fire. Most of the work on this project has been adding those guards, one real
design at a time.
