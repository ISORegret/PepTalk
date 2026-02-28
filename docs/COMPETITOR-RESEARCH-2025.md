# PepTalk — Competitor Research & Feature Suggestions (2025)

Research from peptide apps, GLP-1 trackers, health trackers, and glucose trackers, with a direct comparison to PepTalk and prioritized suggestions.

---

## 1. Competitor apps researched

### GLP-1 / peptide trackers

| App | Positioning | Key features |
|-----|-------------|--------------|
| **Shotlee** | "#1 GLP-1 & Peptide Tracker," free, 10k+ users, 4.8★ | AI health chat, automated progress summaries, smart medication level predictions, progress photo comparisons, **blood pressure**, **energy/mood/appetite** as separate metrics, data export for providers, BPC-157/GHK-Cu. |
| **Pep (GLP-1 Tracker)** | All-in-one, 4.7★ | **AI food scanner** (photo/barcode → calories, protein, fiber), **hydration reminders**, injection site rotation, **multiple units** (lb/kg/stones, in/cm), calendar + daily dashboard, smart reminders (injection, weigh-in, meals, hydration). |
| **Phaze** | Body transformation + habit building | **Habit streaks** (protein, water, movement); **phase progression** (Quick Start → Sustain); **AI meal photo analysis** (Pro); **shareable milestone cards** (celebrate without revealing med); **Apple Health sync**; fasting timer (Pro). |
| **GLP Compass** | Shot tracker + analytics | **Half-life curve** (7-day semaglutide), **pain level** on injection log, **side effect severity + timing**, shot history calendar, **community support**, protein/calorie/water logging. |
| **PepTracker** | Dose log + protocols | **Unlimited protocol creation**, built-in dose calculators, precision logging, optional premium. |
| **Regimen** | Peptide & TRT | **Half-life visualization** (compound levels over time), **multi-compound stack** management, progress (weight, photos, energy, sleep), custom scheduling; free preview, premium $4.99/mo. |

### Glucose / diabetes trackers (feature ideas)

| App | Notable features |
|-----|------------------|
| **Sugarmate** | 30+ customizable tiles, **activity feed** (exercise, meds, food, insulin), **nutrition DB** (FatSecret), **customizable alerts** (e.g. phone call for low glucose), caregiver view. |
| **Gluroo** | **AI photo → carbs/calories/sugar**, CGM (Dexcom, Libre), **smart notifications** (reduce alert fatigue), **GluCrew** (share with providers/caregivers), Apple Watch. |
| **GlucoSense** | **GlucoScore** (daily stability + time in range), insights: sleep, meals, workouts, stress, insulin; AI food logging. |

---

## 2. Gap analysis: PepTalk vs competitors

| Area | Competitors | PepTalk today | Suggestion |
|------|-------------|---------------|------------|
| **Medication levels** | Half-life curves, "levels in your system" | ✅ Level curve + phases (SubQ/IM aware) | Keep; consider "steady state" callout. |
| **Injection logging** | Site, dose, date, **pain level**, **severity** for side effects | Site, dose, date, route, side effects (no severity) | **Add:** optional pain level (1–5); optional severity for side effects (mild/moderate/severe). |
| **Nutrition** | AI meal scan, photo → macros, barcode | Meal estimator (manual), daily protein/calories | **Consider:** daily **protein goal** + progress (you already have data). |
| **Hydration** | Goal + reminders, progress ring | Logging only | **Add:** optional daily goal (e.g. 64 oz) + small progress on Summary/Daily. |
| **Habits / streaks** | Protein, water, movement streaks | ✅ Logging streak (weight), weeks in a row | Optional **habit checklist** (e.g. "Protein goal met today"). |
| **Progress photos** | Side-by-side, before/after alignment | Grid + dates | **Consider:** optional side-by-side compare view (two dates). |
| **Milestones** | Shareable cards, celebrations | ✅ Milestones + celebration popup | Consider **shareable card** (image for social) without revealing medication. |
| **Blood work** | TRT/peptide apps: Test, E2, A1C | A1C + glucose only | **Add:** optional **Bloodwork** section: lab name, date, key values (e.g. Testosterone, Estradiol, HbA1c), simple trend. |
| **AI / insights** | Chat, auto summaries, predictions | Phase timelines, "on track," effect profiles | **Later:** optional weekly digest; keep local-first. |
| **Export for provider** | PDF, share link, caregiver view | JSON, CSV, print summary | Ensure **PDF/print** is easy to find; include meds + weight + A1C + side effect summary. |
| **Health sync** | Apple Health / Google Fit (weight, steps) | None | **Roadmap:** read weight; write weight if API allows. |
| **Reminders** | Injection, weigh-in, meals, hydration | Injection notifications | **Consider:** optional weigh-in reminder; hydration reminder (if goal set). |
| **Side effects** | By day in cycle, severity, patterns | Tags per injection, summary (most mentioned) | **Add:** "Side effects by day in cycle" (e.g. day 1–2 vs 5–7) on Insights; optional severity. |
| **Units** | lb, kg, stones; in, cm | lb/in in most places | **Check:** support kg + cm where it matters (profile, goals). |
| **Pen / vial** | "Opened on," "use within X days" | ✅ Vial mg + deduction | **Consider:** for pens, optional "opened on" + "use by" for multi-dose pens. |

---

## 3. Suggested features and changes (prioritized)

### Add — high value, reasonable effort

1. **Hydration goal** — Optional daily goal (e.g. 64 oz). Show "X / goal" and a small progress bar on Summary or Daily. Reuses existing hydration data.
2. **Daily protein goal** — Optional goal (g). Show "X / 120 g today" from existing nutrition entries. No new data model.
3. **Side effects by day in cycle** — On Insights (or Summary): "For [med], side effects most often on day 1–2 vs day 5–7." Aggregate from injection logs; simple text or tiny chart.
4. **Bloodwork section** — More → Bloodwork: lab name, date, key values (e.g. Testosterone total, Estradiol, HbA1c). List + optional simple trend per metric. Appeals to TRT/peptide users.
5. **Pain level (injection)** — Optional 1–5 or 1–3 on each injection log. Enables "pain by site" or "pain over time" later.
6. **Side effect severity** — Optional mild / moderate / severe per tag when logging. Enables better pattern summaries.

### Add — medium value

7. **Weigh-in reminder** — Optional reminder (e.g. "Weigh in weekly" or "Daily weigh-in") in Notifications. Complements injection reminders.
8. **Progress photo side-by-side** — View: pick two dates, show two photos aligned (before/after). Different from grid.
9. **Shareable milestone card** — Generate an image for "10 lb down" (or similar) without mentioning medication. Privacy-friendly sharing.
10. **Pen / opened-date** — For GLP-1 pens: "Opened on" + "Use within X days." Show "Use by" on Summary. Smaller audience but high value for those who need it.

### Change / improve (no new features)

11. **"On track" and loss vs typical** — You already have dose-aware comparison. Surface it more on Summary (e.g. "Your loss vs typical at this dose" with one line of explanation).
12. **Doctor export** — Make PDF/print easy to find (e.g. "Share with doctor" in Tools → Data or Summary). Ensure it includes: med list, last dose dates, weight trend, A1C/glucose if present, side effect summary.
13. **Units** — If not already: allow goal weight and height in kg/cm; show units consistently in exports.

### Later / larger scope

14. **HealthKit / Google Fit** — Read weight (and optionally steps); write weight. Bigger build; differentiator.
15. **AI / weekly digest** — Optional "This week: X lb change, Y injections, top side effects." Could be local-only (no cloud).
16. **Recipes / resources** — Link to a curated "GLP-1 friendly" or "high protein" resource list; in-app recipes = much larger scope.

---

## 4. What PepTalk already does well (vs competitors)

- **One app for GLP-1 + peptides + TRT** — Broader med list and phase timelines than most.
- **Medication level curve + phases** — SubQ/IM aware; same idea as Regimen/GLP Compass half-life views, with more meds.
- **Titration plan builder** — Built-in steps and timelines; many apps don't have this.
- **Reconstitution + dose + TDEE** — All in one place.
- **Vial inventory** — Track total mg, deduct on log; many don't have this.
- **Injection site rotation suggestion** — One-tap "use suggested" when logging.
- **No account required** — Local-first, good for privacy.
- **PDF/print for doctor** — Many competitors hide it behind paywall.
- **Daily hydration + protein** — Simple and aligned with GLP-1/weight goals.
- **Glucose & A1C** — In one app with weight and injections; glucose-only apps don't cover meds.

---

## 5. One-line positioning vs competitors

- **vs Shotlee / Pep:** "No account, no AI lock-in — your data stays on device. Same med levels, phases, and logging."
- **vs Phaze:** "Habit and streak ideas without a subscription; we add hydration/protein goals and reminders you control."
- **vs Regimen / PepTracker:** "One app for GLP-1, peptides, and TRT; built-in titration, reconstitution, and vial tracking."
- **vs glucose-only apps:** "We do glucose and A1C plus weight, injections, and med levels — one place for GLP-1 and peptides."

---

**See also:** [COMPETITIVE-COMPARISON.md](./COMPETITIVE-COMPARISON.md) (broader matrix), [COMPETITOR-FEATURES.md](./COMPETITOR-FEATURES.md) (already-implemented + backlog).
