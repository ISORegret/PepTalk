# PepTalk — What to Add or Remove

Suggestions based on the current app structure. Pick what fits your users.

**Implemented:** Quick actions on Summary, Journal removed from More, Unit reference moved into Dose Calculator, Constitute/doctor export removed. **Add section:** Logging streak, side effects summary (Insights), Remind me link (Upcoming Injections), goal weight + progress bar (Summary), welcome/update modal with “Do not show again” (shows when app version changes).

---

## Remove or simplify

### 1. **Duplicate Journal entry point** ✅ Done
- **What:** Journal was available as a **main tab** (Journal) and again under **More → Journal**. Same content, two paths.
- **Done:** Removed the Journal section block from More. Only the main Journal tab remains.

### 2. **Quick Reference card (standalone)**
- **What:** Under More → Tools, the “Quick Reference” card (1 mL = 100 units, 1 mg = 1000 mcg, etc.) sits at the bottom of the Tools section.
- **Recommendation:** Remove the standalone card. Move the same unit conversions into the **Dose Calculator** (or Reconstitution Calculator) as a small “Unit reference” link or collapsible section. Keeps the info where it’s needed and reduces clutter.

### 3. **Calendar under More**
- **What:** More → Calendar shows a monthly grid of injection days and an adherence summary.
- **Recommendation:** Optional trim. Summary already has “Upcoming Injections” and Injections tab has the list. If usage is low, consider removing the Calendar section and folding a simple “Upcoming” list into Summary/Injections. If users like the month view, keep it.

### 4. **“Constitute calculator” export option**
- **What:** Under Tools → Data → Export, one option is “Constitute calculator — Print / Save as PDF”.
- **Recommendation:** If you don’t actively support or document this, remove this option and keep **JSON backup** and **CSV** only. Prevents confusion.

---

## Keep as-is (high value)

- **Summary:** Time range, This week, stats, goal date, On track?, Your loss vs typical, Milestones, Upcoming Injections, Dose tracking. Core dashboard.
- **Weight, Injections, Insights, Journal (main tab):** Core use cases.
- **More → Body:** Measurements and progress photos (different from weight; useful for some).
- **More → Daily:** Nutrition/hydration and meal estimator (useful for GLP-1 users).
- **More → Tools:** Dose calculator, Reconstitution, TDEE, Schedules, Titration, Notifications, Data (export/import/wipe).
- **More → Glucose:** Glucose & A1C (clear for diabetes/GLP-1 users).

---

## Add (high impact, low clutter)

### 1. **Quick actions on Summary**
- **What:** One or two buttons on Summary, e.g. “Log weight” and “Log injection”, that open the same forms as Weight/Injections tabs.
- **Why:** Lets users log from the dashboard without switching tabs. Makes the main screen actionable.

### 2. **Logging streak or consistency**
- **What:** On Summary or Weight, a small line like “You’ve logged weight 4 weeks in a row” or “Logged X of last 7 days”.
- **Why:** Encourages consistent logging without adding a new feature.

### 3. **Side effects summary from Journal**
- **What:** On Insights (or Summary), a small card: “From your journal: most mentioned — Nausea, Fatigue” (parsed from journal text or from the existing side-effect tags on injections).
- **Why:** Surfaces journal value without extra data entry.

### 4. **Single “Reminder” or “Notifications” entry point**
- **What:** Notifications are under More → Tools → Notifications (deep). If reminders are important, add a direct link from Summary (e.g. near “Upcoming Injections”: “Remind me” → opens notification settings) or a “Reminders” item in More’s top-level menu that goes straight to notification settings.
- **Why:** Easier to discover and turn on injection reminders.

### 5. **Goal weight on Summary**
- **What:** You already have “To goal” in lbs. If goal weight is stored, add a short line like “Goal: 180 lbs” or a progress bar (current → goal) on Summary.
- **Why:** Reinforces the target and makes “To goal” and “Estimated Goal Date” more meaningful.

### 6. **Optional: First-time setup**
- **What:** On first launch (or when no data): “Set your goal weight”, “Add your medication”, “When do you want injection reminders?”. Pre-fills Summary and reduces empty state.
- **Why:** Better onboarding and more relevant default view.

---

## Summary table

| Action   | Item                          | Reason |
|----------|--------------------------------|--------|
| Remove   | Journal from More menu        | Duplicate of main Journal tab |
| Simplify | Quick Reference (Tools)       | Move into Dose Calculator as unit reference |
| Consider | Calendar under More           | Remove if low usage; Summary already has upcoming |
| Consider | “Constitute calculator” export | Remove if not supported |
| Add      | Quick “Log weight” / “Log injection” on Summary | Fewer taps and tab switches |
| Add      | Logging streak / consistency  | Encourages habit |
| Add      | Side effects from journal on Insights | More value from existing data |
| Add      | Easier path to Notifications  | More users will set reminders |
| Add      | Goal weight on Summary        | Clearer progress to goal |

**See also:** [COMPETITOR-FEATURES.md](./COMPETITOR-FEATURES.md) for ideas from other peptide/hormone tracking apps (vial inventory, site rotation, bloodwork, hydration goal, etc.).

If you tell me which of these you want (e.g. “remove duplicate Journal and add quick log buttons”), I can outline the exact code changes in `App.jsx` and related files.
