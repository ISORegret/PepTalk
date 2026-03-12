---
name: Widen weight chart
overview: Make the "Weight over time" chart at the bottom of the Summary tab fill the full width of its background card by breaking the chart out of the padded content area and optionally tightening the chart's internal margins.
todos: []
isProject: false
---

# Widen Weight Over Time Graph to Fill Card

## Current structure

The Weight over time block lives in [src/App.jsx](c:\Users\rtayl\Music\health-tracker-app (1)\PepTalk\src\App.jsx) (lines 3919–4092):

- **Outer:** `ui-card overflow-hidden` (the visible “box”)
- **Inner:** `div` with `px-2 sm:px-3 pt-5 pb-1` — adds horizontal padding (8px / 12px)
- **Chart:** `ResponsiveContainer width="100%"` and `ComposedChart` with `margin={{ top: 8, right: 8, left: 44, bottom: 4 }}`

So the chart only uses the width *inside* that padding, and the Y-axis reserves 44px on the left. That makes the plot look inset and slightly to the right relative to the card.

## Approach

1. **Let the chart span the full card width**
  Keep padding for the header (title + range buttons), but put only the chart in a full-width wrapper that cancels the horizontal padding with negative margins so the chart aligns with the card edges.
2. **Optionally tighten chart margins**
  Slightly reduce the ComposedChart `left` margin (e.g. 44 → 40) so the plot area uses a bit more width; keep enough space for Y-axis labels.

## Changes in [src/App.jsx](c:\Users\rtayl\Music\health-tracker-app (1)\PepTalk\src\App.jsx)

- **Lines 3919–3937:**  
  - Keep the existing padded wrapper for the **header only** (the “Weight over time” title and the 4w/8w/12w/All buttons).  
  - Close that div after the header.
- **Chart wrapper:**  
  - Add a new wrapper around `ResponsiveContainer` that extends the chart to the full card width:
    - Use negative horizontal margin to offset the card’s padding, e.g. `-mx-2 sm:-mx-3`.
    - Use a width that compensates for that margin so the chart actually fills the card: e.g. `w-[calc(100%+0.5rem)] sm:w-[calc(100%+0.75rem)]` (Tailwind) so the chart spans the full card width.
- **ComposedChart (line 3938):**  
  - Optionally change `margin` from `left: 44` to `left: 40` so the plot area is slightly wider and less shifted right.
- **Legend / footer:**  
  - Keep the legend and “Green ring = injection…” in a padded section (same `px-2 sm:px-3` as the header) so that text doesn’t sit flush on the edges.

Resulting structure:

```text
ui-card
  div.px-2.sm:px-3 (header only)
    h3 + range buttons
  div.-mx-2.sm:-mx-3.w-[calc(100%+0.5rem)].sm:w-[calc(100%+0.75rem)]  (chart full width)
    ResponsiveContainer > ComposedChart
  div.px-2.sm:px-3 (footer: legend + caption)
```

No new components or CSS files; all edits stay in the existing Weight over time block in `App.jsx`.