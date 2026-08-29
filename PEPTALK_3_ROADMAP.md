# PepTalk 3.0 rebuild roadmap

PepTalk 3.0 is a staged rebuild. A step is not considered complete until the UI is deployed and the previous duplicate/legacy surface for that feature is retired.

## 1. Design foundation — COMPLETE / VERIFYING IN PRODUCTION
- [x] New dark neutral/slate visual system
- [x] Mint primary accent; violet reserved for analytics
- [x] Amber attention; red only for genuine problems
- [x] Reduced glow and card heaviness
- [x] Stronger typography and readable secondary text
- [x] Consistent card/control/nav radii and spacing
- [x] Calmer motion and reduced-motion support
- [ ] Final iPhone verification continues through staged rebuild

## 2. Today / Summary command center — COMPLETE / DEPLOYING
- [x] Make Summary function as Today
- [x] Next scheduled dose and daily completion first
- [x] Quick Log weight and Log dose actions
- [x] Compact weight/trend snapshot retained as primary progress information
- [x] Important inventory/run-out warning only receives attention styling
- [x] Weekly progress kept concise on Today; deeper stack analysis stays in Insights
- [x] Supporting cards collapsed behind Show more
- [x] Remove duplicate analytics from the focused Today view
- [ ] Final iPhone/PWA verification after deployment

## 3. Weight — IN PROGRESS / DEPLOYING
- [x] Weight-only information architecture established
- [x] Current/progress/trend cards prioritized
- [x] Trend-first chart presentation
- [ ] Optional protocol markers on chart
- [x] Recent readings separated and touch targets reinforced
- [ ] Outlier undo/review
- [x] Remove all stack-response analysis from Weight
- [ ] Final iPhone/PWA verification after deployment

## 4. Insights — IN PROGRESS / DEPLOYING
- [x] Stack Response is the single weekly stack/weight analysis
- [x] Use preferred Stack Response card/list presentation
- [x] Add a 7-day “What changed?” summary surface
- [x] Active compounds visually prioritized; inactive/archived de-emphasized
- [x] Preserve single-compound estimated-level detail
- [x] Add explicit non-causation wording for correlations
- [x] Hide duplicate giant combined analysis surfaces when repeated
- [ ] Final iPhone/PWA verification after deployment

## 5. Protocols — IN PROGRESS / DEPLOYING
- [x] Protocol cards prioritize planned dose, timing/route, status and linked inventory remaining when available
- [x] Active / Paused / All organization
- [x] Protocol editor gets progressive section navigation for Basics & schedule → Vial/blend → Notes without moving React-owned fields
- [ ] Split the large Basics & schedule surface further into Dose plan and Alerts during native component extraction
- [ ] Effective-date future dose changes preserve history
- [ ] Duplicate protocol
- [ ] Pause-until date
- [x] Existing calendar export remains with protocol tools
- [x] No invented medical dosing recommendations; Step 5 additions are organization and stored-data math only
- [ ] Final iPhone/PWA verification after deployment

## 6. Dose History — IN PROGRESS / DEPLOYING
- [x] Rename/position Doses as History in the active screen
- [ ] Native Today / Yesterday / date grouping during component extraction
- [x] Search by compound, dose, route, site and notes
- [x] Today / 7D / 30D / All quick range filters where rendered rows can be matched to stored entries
- [x] Compact history-row treatment and clearer hierarchy
- [x] Edit/delete touch targets enlarged for iPhone
- [x] Linked-vial indicator surfaced when a recorded entry has a vial reference
- [ ] Copy/repeat last unscheduled dose
- [ ] Undo after accidental manual delete; existing schedule/taken actions already use undo where technically safe
- [ ] Final iPhone/PWA verification after deployment

## 7. Inventory — IN PROGRESS / DEPLOYING
- [x] Dedicated Inventory screen accessible from More
- [x] Remaining amount and informational doses remaining when protocol dose is stored in mg
- [x] Projected run-out date from stored protocol frequency and current vial supply
- [x] Reconstituted/opened and expiration status surfaced per vial
- [x] Low supply warnings limited to low-dose-count / low-remaining cases
- [x] Source vial indicator already surfaced from Dose History when a recorded entry has a vial reference
- [ ] Native Inventory component extraction and direct edit/add actions
- [ ] Final iPhone/PWA verification after deployment

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
