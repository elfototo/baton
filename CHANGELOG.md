# Changelog

Notable changes to Baton. Dates are release dates.

## 2026-09-16

Sharper output for masks, rotated icons and overlapping decorations — plus a
preview background picker and a UI that follows Figma's light and dark theme.

**Layout**

- A child the designer marked "absolute position" in Figma now really leaves the
  flow, instead of pushing the rest of the section around.
- Decorations that overflow their frame keep their place.
- A row of cards split into frames "two at a time" is reassembled into one grid,
  so it folds into a single component and a single array.
- Auto-layout with a negative gap (a designer's way of overlapping children)
  falls back to geometry, which CSS can express.

**Shapes and images**

- Photos masked by an organic shape keep that shape instead of a square crop.
- A colour painted over an image tints it, instead of being dropped.
- Images wider than their frame are no longer squeezed by Tailwind preflight.
- Stroke-only shapes keep their thickness, their arrowheads, and their paint
  opacity.

**Semantics**

- A speech bubble with a long quote is no longer mistaken for a button.
- A group that contains a button is no longer a button itself — nested buttons
  broke the markup when the browser reparsed it.

**Interface**

- Pick the preview background: light, white, dark, a transparency checkerboard,
  or any colour of your own.
- The panel follows Figma's light and dark theme.
