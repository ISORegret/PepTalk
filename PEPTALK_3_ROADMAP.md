# PepTalk 3.0 rebuild roadmap

PepTalk 3.0 is a staged rebuild. A step is not considered complete until the UI is deployed and the previous duplicate/legacy surface for that feature is retired.

## 1. Design foundation — IN PROGRESS
- [x] New dark neutral/slate visual system
- [x] Mint primary accent; violet reserved for analytics
- [x] Amber attention; red only for genuine problems
- [x] Reduced glow and card heaviness
- [x] Stronger typography and readable secondary text
- [x] Consistent card/control/nav radii and spacing
- [x] Calmer motion and reduced-motion support
- [ ] Verify production deployment and iPhone behavior

## 2. Today / Summary command center
- [ ] Make Summary function as Today
- [ ] Next scheduled dose and daily completion first
- [ ] Quick Log weight and Log dose actions
- [ ] Compact weight/trend snapshot
- [ ] Important inventory/run-out warning only
- [ ] One concise weekly snapshot
- [ ] Remove supporting clutter and duplicate analytics

## 3. Weight
- [ ] Weight-only information architecture
- [ ] Current, starting, total lost, body-weight-lost %, 7-day trend, 30-day change
- [ ] Trend-first chart; raw readings muted
- [ ] Optional protocol markers on chart
- [ ] Recent readings with obvious edit/delete
- [ ] Outlier undo/review
- [ ] Remove all stack-response analysis from Weight

## 4. Insights
- [ ] Stack Response is the single weekly stack/weight analysis
- [ ] Use preferred Stack Response card/list presentation
- [ ] Add 7-day “What changed?” summary
- [ ] Active compounds first; inactive archived/collapsed
- [ ] Single-compound estimated-level detail
- [ ] Explicit non-causation wording for correlations
- [ ] Remove duplicate giant combined analysis surfaces

## 5. Protocols
- [ ] Cards show planned dose, days/time, next dose, status and inventory remaining
- [ ] Active / Paused / All organization
- [ ] Progressive editor: Basics → Schedule → Dose plan → Vial/blend → Alerts → Notes
- [ ] Effective-date future dose changes preserve history
- [ ] Duplicate protocol
- [ ] Pause-until date
- [ ] Calendar export kept with protocol
- [ ] No invented medical dosing recommendations

## 6. Dose History
- [ ] Rename/position as History
- [ ] Today / Yesterday / date grouping
- [ ] Search and filter chips
- [ ] Compact rows with compound, amount, time, route/site
- [ ] Edit/delete always available on iPhone
- [ ] Copy/repeat last unscheduled dose
- [ ] Undo after accidental log/delete/skip where technically safe

## 7. Inventory
- [ ] Dedicated Inventory screen
- [ ] Remaining amount and doses remaining
- [ ] Projected run-out date
- [ ] Opened/reconstituted/expiration status
- [ ] Low supply warnings surfaced only when useful
- [ ] Source vial visible from dose history where available

## 8. Calendar
- [ ] Agenda-first mobile view
- [ ] Month as secondary mode
- [ ] Day detail: Scheduled / Taken / Skipped / Missed + weight
- [ ] Adherence summary secondary, not competing with schedule

## 9. More / settings cleanup
- [ ] Profile / account
- [ ] Body
- [ ] Labs
- [ ] Calendar
- [ ] Inventory
- [ ] Notifications
- [ ] Data & Backup
- [ ] Help / changelog
- [ ] Remove/de-emphasize Wellness from normal navigation
- [ ] Developer/Supabase detail moved under Advanced

## 10. Reliability, backup and release UX
- [ ] Backup health: last successful cloud sync/export
- [ ] Proper Changelog under Help
- [ ] Reliable What’s New per release
- [ ] Clear offline/on-device/backed-up state
- [ ] Apple Health import status/history
- [ ] No continuous whole-DOM observers

## 11. Code consolidation
- [ ] Retire temporary 2.x redesign patch layers
- [ ] Split large App.jsx into stable screen/components where practical
- [ ] Consolidate design tokens and shared components
- [ ] Remove dead goals/journal/glucose/generic daily-tracking UI/code when confirmed unused
- [ ] Remove duplicate legacy screens and terminology
- [ ] Production build/runtime verification

## 12. PepTalk 3.0 release
- [ ] Full regression pass on iPhone/PWA
- [ ] Verify stored weight, dose, protocol, vial and history data unchanged
- [ ] Version 3.0.0
- [ ] Complete 3.0 What’s New / changelog
- [ ] Final production deployment
