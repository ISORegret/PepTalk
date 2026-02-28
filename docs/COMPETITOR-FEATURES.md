# PepTalk — Features from Other Peptide / Hormone Apps

Ideas taken from popular apps (OptiPin, Regimen, PepTracker, Dose Track, GLPer, Glapp, Peptide Tracker & Calculator, etc.) that could benefit PepTalk. Ordered by impact vs effort.

---

## High priority

### 1. Vial / inventory tracking ✅ Done
- **What:** Add "Vials" under More or Tools: track vials per medication (total mg, optional expiry). When the user logs an injection, optionally select a vial and the dose is deducted (in mg) from that vial.
- **Done:** More → Tools → **Vials**: add vials (medication, total mg, optional expiry). On Log Injection, "Use from vial" dropdown shows vials for that med with remaining mg; selecting one and logging deducts the dose (converted to mg) from the vial. Export/import/wipe include vials.

### 2. Injection site rotation suggestion ✅ Done
- **What:** When logging an injection, suggest "Next: Right thigh" (or next in rotation) based on the last injection site for that medication. One-tap to apply.
- **Done:** On the Log Injection form, above Body location: "Rotate: try [suggested site]" with "Use suggested" button. Suggestion = next site in BODY_LOCATIONS order after the last used site for that medication.

---

## Medium priority

### 3. Bloodwork / lab results
- **What:** New section (e.g. More → Bloodwork): log lab name, date, and key values (e.g. Testosterone total, Estradiol, HbA1c). List + optional simple trend per metric.
- **Why:** TRT/peptide users often track labs; keeps everything in one app.

### 4. Side effects by day in cycle
- **What:** On Insights (or Summary), for a selected med: "Side effects most often on day 1–2 after dose" vs "day 5–7" (aggregate from injection logs). Simple text or small chart.
- **Why:** GLP-1 apps show patterns across the week; helps users anticipate.

### 5. Daily protein (or calorie) target
- **What:** In More → Daily: optional daily protein goal (g) and/or calorie target. Show "X / 120 g today" from existing nutrition entries; optional reminder to log.
- **Why:** Many GLP-1/weight apps emphasize protein; reuses current nutrition data.

### 6. Hydration goal
- **What:** Daily hydration already exists; add optional goal (e.g. 64 oz) and a small progress bar or ring on Summary or Daily.
- **Why:** Simple and visible; encourages consistency.

---

## Lower priority

### 7. Pen / opened-date tracking
- **What:** For GLP-1 pens: log "opened on" date and (if known) "use within X days." Show "Use by" or "Discard after" on Summary.
- **Why:** Some users need to track multi-dose pen life; smaller audience.

### 8. Quick daily symptom check
- **What:** Separate from Journal: 30-second checklist (energy 1–5, sleep quality, libido, etc.) with optional one-tap submit. Trend over time.
- **Why:** OptiPin-style "daily symptom tracking"; good for TRT/wellness.

---

## Later / bigger scope

### 9. HealthKit / Google Fit sync
- **What:** Read weight (and optionally steps) from system health; write injections or weight if APIs allow.
- **Why:** Bigger build; nice differentiator later.

### 10. Recipes / meal ideas link
- **What:** Link to a curated list or external "GLP-1 friendly" recipes (or a single "Resources" screen with links).
- **Why:** Some apps bundle 500+ recipes; a link is low effort, in-app recipes are high.

---

## Suggested first additions

1. **Vial inventory** – High value for peptide/TRT users; fits naturally next to Schedules/Titration and Injections (e.g. "Log from vial" with remaining doses).
2. **Site rotation suggestion** – Small change: when adding an injection, compute "suggested site" from recent sites for that med and show it (e.g. "Rotate: try Right thigh").
3. **Hydration goal** – Reuse existing hydration data; add a goal field and a small progress indicator on Summary or Daily.

To implement any of these, say which one(s) and we can wire them into the app step by step.
