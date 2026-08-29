# PepTalk 3.0 rebuild roadmap

PepTalk 3.0 is the consolidated mobile-first rebuild focused on protocols, dose history, weight, inventory and analysis. User-facing release work is complete; remaining native component extraction is technical debt and does not block the 3.0 web release.

## 1. Design foundation — COMPLETE
- [x] Dark neutral/slate visual system
- [x] Mint primary accent; violet reserved for analytics
- [x] Amber attention; red only for genuine problems
- [x] Reduced glow/card heaviness, stronger typography and readable secondary text
- [x] Consistent card/control/nav radii and calmer motion

## 2. Today / Summary — COMPLETE
- [x] Schedule-first Today command center
- [x] Quick weight and dose actions
- [x] Compact progress snapshot and meaningful inventory warning
- [x] Supporting detail kept out of the primary flow

## 3. Weight — COMPLETE
- [x] Weight-only information architecture
- [x] Current/progress/trend cards and trend-first chart
- [x] Recent readings with larger mobile touch targets
- [x] Stack-response analysis removed from Weight
- [x] Existing outlier review copy retained; protocol markers remain optional to avoid chart-axis regression risk

## 4. Insights — COMPLETE
- [x] Single Stack Response presentation
- [x] 7-day “What changed?” surface
- [x] Active compounds prioritized and inactive compounds de-emphasized
- [x] Estimated-level detail retained with non-causation wording

## 5. Protocols — COMPLETE FOR 3.0
- [x] Planned dose, timing/route, status and inventory context prioritized
- [x] Active / Paused / All organization
- [x] Progressive editor organization
- [x] Unit-based planned doses show informational mg equivalent from stored vial concentration
- [x] No invented dosing recommendations
- [ ] Effective-date protocol changes / duplicate / pause-until remain future enhancements

## 6. Dose History — COMPLETE FOR 3.0
- [x] Doses presented as History
- [x] Search and quick date-range filters
- [x] Compact history rows and enlarged edit/delete controls
- [x] Linked-vial context
- [x] Unit-based extra doses show informational mg equivalent from stored vial concentration
- [ ] Repeat-last and manual-delete undo remain future enhancements

## 7. Inventory — COMPLETE FOR 3.0
- [x] Dedicated Inventory view from More
- [x] Remaining amount, informational doses remaining and projected run-out
- [x] Reconstitution/opened/expiration status and low-supply warnings
- [x] Step 7 build-name collision fixed

## 8. Calendar — COMPLETE
- [x] Agenda-first mobile view
- [x] Month and adherence as secondary modes
- [x] Scheduled / Taken / Skipped / Missed status
- [x] Weight surfaced on agenda days when available
- [x] Unscheduled administrations remain visible

## 9. More / settings cleanup — COMPLETE
- [x] Profile / account, Body, History, Calendar, Data & alerts, Labs and Help use a compact settings-row treatment
- [x] Dedicated Inventory launcher retained
- [x] Wellness removed from normal navigation
- [x] Deployment/Supabase detail moved behind Advanced presentation
- [x] Help includes a proper 3.0 changelog

## 10. Reliability, backup and release UX — COMPLETE FOR 3.0
- [x] Existing last successful cloud-sync status retained in Profile
- [x] Export/backup use records a local last-export timestamp for backup health
- [x] Proper changelog and 3.0 What’s New
- [x] Offline/on-device/cloud state remains visible through existing Profile/banners
- [x] No continuous whole-DOM observers
- [x] PWA cache generation bumped to v3 with network-first non-hashed shell/config requests
- [ ] Expanded Apple Health import history remains a future enhancement

## 11. Code consolidation — COMPLETE FOR RELEASE / NATIVE EXTRACTION DEFERRED
- [x] Retired the temporary 2.5 structural-redesign and Build 5 runtime imports
- [x] Consolidated active visual system under PepTalk 3.0 layers
- [x] Legacy Wellness, fasting/journal surfaces are removed from normal 3.0 UI while stored data is preserved
- [x] Duplicate legacy terminology reduced (Doses → History in active UI)
- [x] No continuous MutationObserver introduced
- [ ] Large App.jsx native screen/component extraction remains future maintainability work

## 12. PepTalk 3.0 release — RELEASE CANDIDATE
- [x] Version 3.0.0
- [x] Complete 3.0 What’s New / changelog
- [x] User-facing 3.0 redesign and cleanup wired into production build
- [x] Stored health/protocol data is not intentionally mutated by the release-cleanup layers
- [ ] Final GitHub Pages build/deployment success check
- [ ] Final hands-on iPhone/PWA tap-through after deployment
