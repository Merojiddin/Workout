# Production Test Plan

Manual test cases to run against the deployed production URL (and once
locally with `npm run build && npm run preview`). Track pass/fail with the
in-app **Pre-Deploy Checklist** page (Settings footer → Pre-Deploy Checklist).

Tip: Data Health → **Create Production Test Data** seeds 1 workout,
1 body check-in, and 1 nutrition log (all marked `isTestData`) so chart and
list tests have something to show. Remove it afterwards with
**Remove Production Test Data**.

---

### 1. Fresh install
- **Steps:** Open the production URL in a private/incognito window (no
  existing localStorage).
- **Expected:** Dashboard loads with default plan data, no crash, no console
  errors. Local Mode / Cloud Mode pill shows in the top bar.

### 2. Local mode without Supabase
- **Steps:** On a deployment without Supabase env vars (or logged out with a
  cleared session), open Settings → Cloud Sync.
- **Expected:** Notice reads "Cloud sync is not configured. This deployment is
  using local browser storage only." App remains fully usable; data persists
  across reloads in the browser.

### 3. Cloud mode with login
- **Steps:** On the Supabase-configured deployment, register or log in.
- **Expected:** Top bar pill switches to "Cloud Sync On". Settings → Cloud
  Sync shows the signed-in email. Cloud Health check passes.

### 4. Start workout
- **Steps:** Dashboard → Today's Workout → Start Workout. Log a set on the
  first exercise.
- **Expected:** Live mode opens with timer; the set saves and shows as
  completed.

### 5. Refresh during workout
- **Steps:** With a live workout running, refresh the browser tab.
- **Expected:** No 404. The unfinished-workout prompt offers to resume, and
  previously logged sets are still there.

### 6. Finish workout
- **Steps:** Complete or skip remaining sets → Finish Workout.
- **Expected:** Finish summary shows totals; the session appears in workout
  history and (in cloud mode) syncs.

### 7. Progress page charts
- **Steps:** Open Progress with data present; also once with a fresh profile
  (no data).
- **Expected:** Charts render with data; with no data they show empty states —
  never a crash.

### 8. Body check-in with photos
- **Steps:** Body Check-in → fill measurements → attach front/side photos →
  save.
- **Expected:** Check-in appears in history with photo thumbnails. In cloud
  mode photos upload to the private bucket and display via signed URLs.

### 9. Nutrition log
- **Steps:** Nutrition → log protein/water/supplements for today → save.
- **Expected:** Log saved, daily targets card updates, entry visible in
  history table.

### 10. Weekly review
- **Steps:** Open Weekly Review after logging at least one workout this week.
- **Expected:** Weekly score, summary, and next-week focus render without
  errors.

### 11. Smart Coach
- **Steps:** Open Coach page.
- **Expected:** Daily advice, warnings, and readiness render based on recent
  data; no crash with sparse data.

### 12. Export/print
- **Steps:** Export/Print → print the weekly plan; also print a workout
  session.
- **Expected:** Print preview shows the printable layout (no app chrome);
  paper-friendly styling.

### 13. Offline mode
- **Steps:** Load the app once, then enable airplane mode / DevTools offline.
  Navigate between Dashboard and Today's Workout; log a set.
- **Expected:** Offline banner appears; cached pages work; logged data is
  queued and syncs when back online (cloud mode).

### 14. PWA install
- **Steps:** Browser menu → Install app (or the in-app install button).
- **Expected:** App installs with the correct name/icon and opens standalone
  without browser UI.

### 15. Mobile layout
- **Steps:** Open on a phone (or 375px-wide viewport). Visit Dashboard,
  Today's Workout, Settings.
- **Expected:** No horizontal scrolling, bottom nav visible and tappable,
  buttons at least ~44px touch targets.

### 16. Theme switch
- **Steps:** Toggle any display options (Settings → Workout Display) and
  verify the app theme colors render consistently (status bar / manifest
  theme color on installed PWA).
- **Expected:** Consistent dark theme; no unstyled flashes.

### 17. Exercise video inside workout
- **Steps:** In live workout, tap **Watch Video** on an exercise; then hide
  it. Also test with network offline.
- **Expected:** Video iframe loads only after the tap and plays inline;
  offline shows "Video requires internet connection."

### 18. Data backup/export
- **Steps:** Settings → Backup → Export All Data; Data Health → Create Full
  Backup.
- **Expected:** A JSON file downloads containing app data keys.

### 19. Import backup
- **Steps:** Settings → Backup → Import Data → select the exported JSON.
- **Expected:** Confirmation notice with restored item count; data appears
  after reopening pages. Invalid files are rejected with a friendly message.

### 20. Clear data
- **Steps:** Settings → Backup → Clear All Data (confirm the warning).
- **Expected:** Confirmation dialog appears first; after confirming, all local
  data resets to defaults. Cloud data (if any) is untouched until next sync.
