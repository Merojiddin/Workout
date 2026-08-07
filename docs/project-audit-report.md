# Project Audit Report

> Living document. Initial static audit: 2026-08-06. As implementation work proceeds, update the affected sections and add a dated entry to Change Log.

The initial audit was static and read-only. It did not run the application, development server, build, lint, typecheck, tests, migrations, network requests, Supabase operations, package installation, environment-value inspection, or browser-storage inspection.

## 1. Executive Summary

- Stack: React 19, mixed TypeScript/JavaScript, Vite 8, Supabase, Recharts, Lucide, and vite-plugin-pwa.
- Architecture: client-side Vite SPA. Navigation is React state, not URL routing.
- Storage: localStorage is the primary working store. Supabase is an optional authenticated cloud mirror with an offline queue.
- Workout plan: one compiled seven-day default plus one full custom override. No plan ID, version, installed-version marker, semantic migration framework, or multiple-plan support exists.
- Current default: 7 days, 44 exercise occurrences, 42 unique exercise IDs, and 134 prescribed sets/rounds.
- Exercise Library: 43 complete base records; aliases resolve every current plan movement except light-walking-only.
- Overall condition: broad feature coverage, but persistence and historical-compatibility guarantees are weak. Automated tests are absent.
- Main update risk: a changed default will not reach users with customWorkoutPlan. Replacing that key can erase customization, while resetting it only locally allows an old cloud plan to return.
- Critical cross-cutting risks:
  - local data and pending queue entries are not scoped to a user account;
  - Data Health’s “full backup” has no functioning restore path in the UI.

## 2. Repository Map

### Repository state

| Item | Finding |
|---|---|
| Repository root | /Users/merojiddin/Desktop/Workout  (directory has a trailing space) |
| Branch | main, tracking origin/main |
| Working tree | Dirty before the audit: src/App.css only |
| Existing diff | 10 lines: 3 insertions, 7 deletions; exercise-thumbnail sizing/aspect-ratio work |
| Package manager | npm; package-lock.json lockfile version 3 |
| Architecture | Vite SPA |
| Languages | Mixed TS/TSX and JS/JSX |
| Entry | index.html → src/main.tsx → src/App.tsx |
| Hosting | Vercel SPA rewrite in vercel.json |
| AGENTS.md | None |
| .openai/hosting.json | None |

Only two commits exist:

1. e005078 — 2026-07-11 — Add custom exercise media editor + live workout polish
2. c62dc46 — 2026-07-10 — Initial production deployment

### Main directories

| Path | Purpose |
|---|---|
| src/components/ | Shared UI, workout, media, auth, sync, chart, modal components |
| src/pages/ | Application screens |
| src/data/ | Default plan, exercise library, profiles, persisted record types |
| src/utils/ | Storage, plan normalization, analytics, media, export, reminders |
| src/services/ | Supabase CRUD, synchronization, photos, health, notifications |
| src/context/ | Authentication context |
| src/hooks/ | Online state, automatic sync, reminders |
| src/lib/ | Supabase client |
| src/print/ | Printable React views |
| src/types/ | Navigation/shared types |
| public/ | PWA icons and exercise placeholders |
| supabase/ | Database and Storage SQL |
| docs/ | Deployment, tests, security, Supabase guidance, this report |
| artifacts/ | 72 screenshots without automated assertions/provenance |
| dist/ | Ignored generated build/PWA artifacts |
| test-results/ | Ambiguous prior failed status with no failed-test IDs |

### Tooling

Important dependencies:

- React and ReactDOM: UI runtime.
- @supabase/supabase-js: auth, database, Storage.
- Recharts: charts.
- Lucide React: icons.
- Vite and React plugin: build tooling.
- vite-plugin-pwa: manifest/service-worker generation.
- TypeScript: type checking.
- Oxlint: linting.

Scripts:

| Script | Command |
|---|---|
| dev | vite |
| build | tsc -b && vite build |
| build:prod | vite build |
| lint | oxlint |
| typecheck | tsc -b |
| preview | vite preview |

build:prod bypasses type checking.

CSS is global: tokens/reset in src/index.css and approximately 7,500 lines in src/App.css. There is no Tailwind, CSS Modules, or component library. App.css contains repeated selectors and late overrides.

README.md is a generic Vite template. Useful guidance is in docs/deployment.md, docs/production-test-plan.md, docs/security-checklist.md, docs/supabase-production-checklist.md, and .claude/skills/verify/SKILL.md.

## 3. Routing and Pages

There is no router dependency. src/App.tsx:61-159 stores activePage in React state and switches on logical IDs.

Consequences:

- no real URL routes;
- refresh initializes Dashboard;
- no deep links or Back/Forward page history;
- no URL-level auth redirects;
- no not-found route;
- Vercel avoids HTTP 404s but /progress still renders the default Dashboard state;
- documented refresh checks for /dashboard, /progress, /nutrition, and /settings are incomplete/misleading.

One ProtectedRoute wraps the app shell. Configured cloud mode requires authentication; local mode bypasses login.

| Logical page | Component | Protection | Purpose | Status |
|---|---|---|---|---|
| dashboard | src/pages/Dashboard.tsx | Cloud auth | Summary/today/history/body/nutrition | Implemented |
| today-workout | src/pages/TodayWorkout.tsx | Cloud auth | Start, log, restore, finish workout | Implemented |
| weekly-plan | src/pages/WeeklyPlan.tsx | Cloud auth | Seven-day plan | Implemented |
| progress | src/pages/Progress.tsx | Cloud auth | Strength, volume, completion, body charts | Partial |
| body-check-in | src/pages/BodyCheckIn.tsx | Cloud auth | Measurements/photos | Implemented; partial cloud behavior |
| nutrition | src/pages/Nutrition.tsx | Cloud auth | Daily logs/summaries/charts | Implemented |
| exercise-library | src/pages/ExerciseLibrary.tsx | Cloud auth | Search, guides, media edits | Partial sync |
| weekly-review | src/pages/WeeklyReview.jsx | Cloud auth | Weekly score/advice | Implemented with hardcoded rules |
| coach | src/pages/Coach.jsx | Cloud auth | Readiness/coaching | Implemented with hardcoded rules |
| plan-editor | src/pages/PlanEditor.tsx | Cloud auth | Plan/library customization | Partial |
| data-health | src/pages/DataHealth.jsx | Cloud auth | Storage/sync health, backup/reset | Partial |
| settings | src/pages/Settings.tsx | Cloud auth | Profile, reminders, sync, backup | Partial |
| export-print | src/pages/ExportPrint.jsx | Cloud auth | JSON/CSV/print | Partial |
| privacy | src/pages/Privacy.jsx | Cloud auth | Privacy information | Implemented |
| disclaimer | src/pages/Disclaimer.jsx | Cloud auth | Fitness disclaimer | Implemented |
| pre-deploy-checklist | src/pages/PreDeployChecklist.jsx | Cloud auth | Manual checklist | Partial/manual only |

Auth views are conditional rather than routed:

- Login: implemented.
- Register: implemented.
- Forgot password: reset email implemented, but update-password/recovery completion is missing.

No Test Center exists. src/pages/OfflineFallback.jsx and src/components/PlaceholderPage.tsx are unused.

## 4. Component Architecture

Main relationship:

src/main.tsx → AuthProvider → App → ProtectedRoute → Layout → selected page.

Key groups:

- Layout: src/components/Layout.tsx, Sidebar.tsx, BottomNav.tsx, OfflineBanner.jsx, NotificationCenter.jsx, DataModeIndicator.jsx.
- Workout: ActiveExerciseCard.tsx, LiveWorkoutHeader.tsx, SetLogger.tsx, RestTimer.tsx, AssistantCard.tsx, ExerciseSummaryCard.tsx, UnfinishedWorkoutPrompt.tsx, FinishSummary.tsx.
- Exercise/media: ExerciseCard.tsx, ExerciseFilters.tsx, ExerciseDetailModal.tsx, ExerciseMedia.tsx, ExerciseMediaEditor.tsx.
- Charts: ProgressChart.tsx, MeasurementChart.tsx, NutritionChart.tsx, MuscleVolumeChart.tsx.
- Auth: src/context/AuthContext.jsx, ProtectedRoute.jsx, components/auth/.
- Errors/loading: ErrorBoundary.jsx, LazyPageBoundary.jsx, GlobalErrorToast.jsx, LoadingState.
- PWA/offline: InstallPWAButton.jsx, OfflineSyncPanel.jsx, OfflineBanner.jsx.

Inconsistencies:

- no central modal/dialog system;
- only Exercise Detail supports Escape/backdrop close;
- no inspected focus trap, focus restoration, or body-scroll lock;
- no general toast provider;
- overlapping chart implementations;
- mixed JS/TS and multiple competing data helpers;
- page-specific empty states;
- ErrorBoundary offers a raw backup that cannot currently be restored through UI.

## 5. Workout Plan Architecture

Default plan: src/data/workoutPlan.ts:44-691.

It exports WorkoutDay[], not a root plan object.

| Field | Present |
|---|---|
| Plan ID | No |
| Plan name | No |
| Plan version | No |
| Plan updatedAt | No |
| Separate day ID | No; numeric day is effective ID |
| Exercise ID | Yes |
| Exercise name | Yes |

Day shape:

- day: number
- estimatedTime: string
- exercises: Exercise[]
- focus: string[]
- name: string

Exercise shape:

- optional duration
- equipment
- formTips[]
- id
- muscleGroup
- name
- optional repRange
- restSeconds
- sets

The normalizer also preserves optional notes, despite notes being absent from the declared types and default.

### Selection and precedence

src/utils/settingsUtils.js:113-126,234-240,457-522:

1. On sign-in, nonempty custom_workout_plans.plan is backed up and overwrites local customWorkoutPlan.
2. Otherwise local customWorkoutPlan wins.
3. Otherwise weeklyPlan is normalized and used.

Exact persistence:

- localStorage: customWorkoutPlan
- Supabase table: public.custom_workout_plans
- Supabase column: plan

Weekday selection is hardcoded Monday→index 0 through Sunday→index 6. It uses array position rather than searching the day number.

Normalization:

- always produces seven default-based days;
- discards extra custom days;
- fills missing days/fields positionally;
- preserves an explicitly empty exercise list;
- can inherit an incorrect default ID by index for malformed/reordered imported exercises.

One custom plan is supported. There is no plan registry, installed version, semantic migration, update prompt, preview/install flow, or multiple-plan support.

Plan Editor writes local custom data, not the source default, and bypasses the cloud-aware settings service. Manual local→cloud sync can upload it later. Local reset does not delete the cloud row.

Plan loading is not centrally reactive:

- Today, Progress, Weekly Review, and Export/Print snapshot on mount;
- Plan Editor initializes once;
- Dashboard, Weekly Plan, and Coach read during render;
- navigation normally remounts a page;
- cloud hydration increments dataVersion and remounts.

Starting a workout snapshots the selected day into activeWorkoutSession. A later plan change does not rewrite that snapshot.

Direct default imports:

- src/pages/PlanEditor.tsx
- src/utils/progressionUtils.ts
- src/utils/settingsUtils.js

Hardcoded old references:

- fixed benchmarks in src/utils/weeklyReviewUtils.js:14-23;
- Dashboard targets in src/data/userProfile.ts;
- Day 6 review advice;
- seven static labels in ExerciseDetailModal.tsx;
- “6 on · 1 recovery” in WeeklyPlan.tsx;
- weekly target 6 in Dashboard/userProfile;
- media aliases in exerciseLibrary.ts;
- demo sessions in progressUtils.ts;
- keyword rules in coachUtils.js/liveWorkoutUtils.ts.

## 6. Current Weekly Plan

This is the exact code-defined default. Browser/cloud custom data was not inspected.

No default day/exercise has notes. Every exercise has all required fields and exactly one of repRange or duration.

Shared cue groups:

- STD: ribs down; abs tight; control lowering; stop 1–2 reps before form breaks.
- POSTURE: ribs down; abs tight; glutes slightly squeezed; do not over-arch; move slowly with control.
- PULL: shoulders down; elbows toward ribs; chest tall; control lowering; do not swing.

### Day 1 — Chest Heavy + Shoulders + Triceps

Effective ID/number 1. Focus: Chest, Shoulders, Triceps, Abs. Time: 45-60 min.

| ID | Exercise | Target | Rest | Group | Equipment | Cues |
|---|---|---|---:|---|---|---|
| bench-press | Bench Press | 4×6-10 | 150s | Chest | Barbell / Bench | Shoulder blades back/down; feet planted; controlled lowering; no bounce; ribs down |
| weighted-push-up | Weighted Push-up | 4×8-15 | 90s | Chest | Backpack / Bodyweight | Ribs down; abs tight; no lumbar arch; controlled lowering; stop before form breaks |
| dips | Dips | 3×6-12 | 120s | Chest / Triceps | Dip bars | Slight lean; shoulders down; control bottom; press palms; stop before pain |
| incline-dumbbell-press | Incline Dumbbell Press | 3×8-12 | 120s | Upper chest | Dumbbells / Incline bench | Modest incline; tucked elbows; lower evenly; press up/in; upper chest active |
| dumbbell-lateral-raise | Dumbbell Lateral Raise | 3×12-20 | 60s | Shoulders | Dumbbells | Lead elbows; light/control; shoulder-height limit; no shrug; still torso |
| diamond-push-up | Diamond Push-up | 2×10-15 | 75s | Triceps / Chest | Bodyweight | STD |
| dead-bug | Dead Bug | 3×10 each side | 45s | Abs / Posture | Bodyweight / Mat | POSTURE |

### Day 2 — Back + Biceps

Effective ID/number 2. Focus: Back, Biceps, Rear delts, Abs. Time: 45-60 min.

| ID | Exercise | Target | Rest | Group | Equipment | Cues |
|---|---|---|---:|---|---|---|
| pull-ups | Pull-ups | 4×6-10 | 120s | Back | Pull-up bar | PULL |
| barbell-row | Barbell Row | 4×8-12 | 120s | Back | Barbell | Hinge/brace; neutral spine; pull to lower ribs; no jerk; control lowering |
| one-arm-dumbbell-row | One-arm Dumbbell Row | 3×10-12 each side | 90s | Back | Dumbbell / Bench | PULL |
| chin-ups | Chin-ups | 3×8-12 | 120s | Back / Biceps | Pull-up bar | PULL |
| rear-delt-raise | Rear Delt Raise | 3×15-20 | 60s | Rear delts | Dumbbells | Slight hinge; relaxed neck; rear delts; light control; no swing |
| barbell-dumbbell-curl | Barbell/Dumbbell Curl | 3×8-12 | 75s | Biceps | Barbell / Dumbbells | Elbows near ribs; no lean; squeeze top; lower slowly; stop shoulder drift |
| hollow-body-hold | Hollow Body Hold | 3×20-40 sec | 45s | Abs | Bodyweight / Mat | POSTURE |

### Day 3 — Legs + Abs + Posture

Effective ID/number 3. Focus: Legs, Glutes, Abs, Posture. Time: 50-60 min.

| ID | Exercise | Target | Rest | Group | Equipment | Cues |
|---|---|---|---:|---|---|---|
| squat | Squat | 4×8-12 | 150s | Legs | Barbell / Dumbbells | Brace; knees track toes; mid-foot balance; controlled depth; no collapse |
| romanian-deadlift | Romanian Deadlift | 4×8-12 | 120s | Hamstrings / Glutes | Barbell / Dumbbells | Hip hinge; tight lats; soft knees; hamstring stretch; no over-arch |
| bulgarian-split-squat | Bulgarian Split Squat | 3×8-12 each leg | 90s | Legs | Dumbbells / Bench | Stable stance; controlled drop; drive front foot; tall torso; equal sides |
| weighted-glute-bridge-hip-thrust | Weighted Glute Bridge / Hip Thrust | 4×10-15 | 90s | Glutes | Barbell / Dumbbell / Bench | POSTURE |
| calf-raise | Calf Raise | 3×15-25 | 45s | Calves | Bodyweight / Dumbbells | Full range; pause top; slow lowering; stable ankles; no bounce |
| hanging-knee-raise | Hanging Knee Raise | 3×10-15 | 60s | Abs | Pull-up bar | POSTURE |
| side-plank | Side Plank | 2×30-45 sec each side | 45s | Abs / Obliques | Bodyweight / Mat | POSTURE |
| hip-flexor-stretch | Hip Flexor Stretch | 2×45 sec each side | 30s | Mobility / Posture | Bodyweight / Mat | Rear glute; ribs down; no arch; slow breathing; steady tension |

### Day 4 — Chest Volume + Shoulders

Effective ID/number 4. Focus: Chest, Shoulders, Upper body, Posture. Time: 45-60 min.

| ID | Exercise | Target | Rest | Group | Equipment | Cues |
|---|---|---|---:|---|---|---|
| incline-dumbbell-press | Incline Dumbbell Press | 4×8-12 | 120s | Upper chest | Dumbbells / Incline bench | Blades back; controlled lowering; tucked elbows; smooth press; ribs down |
| feet-elevated-push-up | Feet-elevated Push-up | 4×10-20 | 90s | Chest | Bodyweight | STD |
| dumbbell-fly-squeeze-press | Dumbbell Fly / Squeeze Press | 3×12-15 | 75s | Chest | Dumbbells / Bench | Small elbow bend; open slowly; no overstretch; squeeze chest; abs tight |
| dips | Dips | 3×8-12 | 90s | Chest / Triceps | Dip bars | Slight lean; controlled shoulders/lowering; no shrug; stop before pain |
| pike-push-up-dumbbell-shoulder-press | Pike Push-up / Dumbbell Shoulder Press | 3×8-12 | 90s | Shoulders | Bodyweight / Dumbbells | Ribs down; brace; controlled overhead press; no lumbar flare |
| lateral-raise | Lateral Raise | 4×15-20 | 60s | Shoulders | Dumbbells | Lead elbows; neutral wrists; shoulder-height limit; no shrug; steady tempo |
| posterior-pelvic-tilt | Posterior Pelvic Tilt | 3×15 | 45s | Posture / Abs | Bodyweight / Mat | POSTURE |

### Day 5 — Back + Arms + Abs

Effective ID/number 5. Focus: Back, Arms, Abs, Upper body. Time: 45-60 min.

| ID | Exercise | Target | Rest | Group | Equipment | Cues |
|---|---|---|---:|---|---|---|
| weighted-pull-up | Weighted Pull-up | 4×6-10 | 150s | Back | Pull-up bar / Backpack | PULL |
| barbell-row-volume | Barbell Row | 3×10-15 | 100s | Back | Barbell | Brace; lower-rib pull; control; neutral neck; no lower-back yank |
| dumbbell-pullover | Dumbbell Pullover | 3×10-15 | 75s | Lats / Chest | Dumbbell / Bench | Ribs down; shoulder motion; lat stretch; no rib flare; control |
| inverted-row | Inverted Row | 3×10-15 | 75s | Back | Bar / Table / Rings | PULL |
| hammer-curl | Hammer Curl | 3×10-12 | 60s | Biceps / Forearms | Dumbbells | Elbows close; control; no swing; squeeze; slow lowering |
| triceps-extension-skull-crusher | Triceps Extension / Skull Crusher | 3×10-12 | 75s | Triceps | Dumbbell / Barbell | Stable elbows; controlled lowering; no rib flare; smooth press; stop discomfort |
| hanging-knee-raise-leg-raise | Hanging Knee Raise / Leg Raise | 3×10-15 | 60s | Abs | Pull-up bar / Mat | POSTURE |

### Day 6 — Fat Control + Abs + Posture

Effective ID/number 6. Focus: Fat control, Abs, Posture, Conditioning. Time: 35-55 min.

| ID | Exercise | Target | Rest | Group | Equipment | Cues |
|---|---|---|---:|---|---|---|
| treadmill-incline-walk | Treadmill Incline Walk | 1×25-35 minutes | 60s | Conditioning | Treadmill | Incline; smooth steps; no speed chasing; stop shin flare; controlled breathing |
| optional-vr-boxing-skipping-rope | Optional VR Boxing / Skipping Rope | 1×10-15 minutes | 60s | Conditioning | VR Quest 2 / Skipping rope | Light feet; relaxed shoulders; short rounds; stop shin pain; breathe |
| dead-bug-rounds | Dead Bug | 3×10 each side | 45s | Abs / Posture | Bodyweight / Mat | POSTURE |
| reverse-crunch | Reverse Crunch | 3×12-15 | 45s | Abs | Bodyweight / Mat | POSTURE |
| plank-with-glute-squeeze | Plank with Glute Squeeze | 3×30-45 sec | 45s | Abs / Posture | Bodyweight / Mat | POSTURE |
| side-plank-rounds | Side Plank | 3×30 sec each side | 45s | Abs / Obliques | Bodyweight / Mat | POSTURE |
| glute-bridge | Glute Bridge | 3×20 | 45s | Glutes / Posture | Bodyweight / Mat | POSTURE |

### Day 7 — Rest

Effective ID/number 7. Focus: Recovery, Walking, Mobility. Time: 20-40 min.

| ID | Exercise | Target | Rest | Group | Equipment | Cues |
|---|---|---|---:|---|---|---|
| light-walking-only | Light walking only | 1×Easy pace | 90s | Recovery | Walking shoes | Easy pace; nasal breathing if possible; relaxed; stop shin pain; recovery |

### Volume and consistency

Planned sets/rounds per day: 22, 23, 25, 24, 22, 17, 1 = 134.

A reliable major-muscle direct-set roll-up is impossible because muscleGroup mixes primary/secondary labels without allocation rules. Exact raw labels:

| Label | Sets | Label | Sets |
|---|---:|---|---:|
| Chest | 15 | Chest / Triceps | 6 |
| Triceps / Chest | 2 | Upper chest | 7 |
| Shoulders | 10 | Rear delts | 3 |
| Back | 21 | Back / Biceps | 3 |
| Lats / Chest | 3 | Biceps | 3 |
| Biceps / Forearms | 3 | Triceps | 3 |
| Legs | 7 | Hamstrings / Glutes | 4 |
| Glutes | 4 | Glutes / Posture | 3 |
| Calves | 3 | Abs | 12 |
| Abs / Posture | 9 | Posture / Abs | 3 |
| Abs / Obliques | 5 | Mobility / Posture | 2 |
| Conditioning | 2 | Recovery | 1 |

Repeated exact IDs: dips and incline-dumbbell-press.

Same names under different IDs: Barbell Row, Dead Bug, Side Plank.

Fourteen plan IDs lack an exact library ID; aliases resolve thirteen. light-walking-only has no library record.

UI exceptions:

- Weekly Plan always says 6 on · 1 recovery.
- Dashboard previews five exercises.
- Dashboard weekly target is statically 6.
- Form Guide uses library guidance rather than plan formTips.
- Combined movements resolve to one library guide.

## 7. Exercise Library and Media

Path: src/data/exerciseLibrary.ts:1-2319.

Schema includes ID/name/category, primary and secondary muscles, equipment, difficulty, form cue, instructions, form tips, mistakes, progression, regression, posture notes/focus, demo links, related days, and optional image/video fields.

There are 43 records with unique IDs/names. Every base record contains all required instructional fields.

Category counts: Chest 8, Back 7, Shoulders 4, Arms 5, Legs 6, Abs 7, Posture 3, Conditioning 3.

Equipment values: Bodyweight, Backpack, Pull-up bar, Dips, Dumbbells, Barbell, Bench, Treadmill, Skipping rope, VR Quest 2, Mat. Mat is omitted from the UI filter despite being used.

### Library/media matrix

| ID | Used | Image | Video | Complete | Main issue |
|---|---|---|---|---|---|
| bench-press | Direct | Local | YouTube | Yes | — |
| weighted-push-up | Direct | Local | YouTube | Yes | — |
| feet-elevated-push-up | Direct | Local | YouTube | Yes | — |
| dips | Direct | Local | YouTube | Yes | Repeated plan ID |
| incline-dumbbell-press | Direct | Local | YouTube | Yes | Repeated plan ID |
| dumbbell-fly | Alias | Local | YouTube | Yes | Combined movement maps to fly |
| dumbbell-squeeze-press | No | Fallback | None | Yes | Unused; no explicit media |
| diamond-push-up | Direct | Local | YouTube | Yes | — |
| pull-up | Alias | Local | YouTube | Yes | Plan ID is plural |
| weighted-pull-up | Direct | Local | YouTube | Yes | — |
| chin-up | Alias | Local | YouTube | Yes | Plan ID is plural |
| barbell-row | Direct + alias | Local | YouTube | Yes | Two plan IDs collapse |
| one-arm-dumbbell-row | Direct | Local | YouTube | Yes | — |
| inverted-row | Direct | Local | YouTube | Yes | — |
| dumbbell-pullover | Direct | Fallback | None | Yes | No explicit media |
| dumbbell-shoulder-press | No | Local | YouTube | Yes | Combined plan maps to Pike Push-up |
| pike-push-up | Alias | Local | YouTube | Yes | Combined guide covers pike |
| dumbbell-lateral-raise | Direct + alias | Local | YouTube | Yes | Two plan IDs collapse |
| rear-delt-raise | Direct | Local | YouTube | Yes | — |
| barbell-curl | Alias | Fallback | None | Yes | Combined guide; no media |
| dumbbell-curl | No | Fallback | None | Yes | Unused; no media |
| hammer-curl | Direct | Fallback | None | Yes | No media |
| triceps-extension | Alias | Fallback | None | Yes | Combined guide; no media |
| skull-crusher | No | Fallback | None | Yes | Combined plan maps to extension |
| squat | Direct | Local | YouTube | Yes | — |
| romanian-deadlift | Direct | Local | YouTube | Yes | — |
| bulgarian-split-squat | Direct | Local | YouTube | Yes | — |
| glute-bridge | Direct | Local | YouTube | Yes | — |
| hip-thrust | Alias | Local | YouTube | Yes | Combined guide covers thrust |
| calf-raise | Direct | Fallback | None | Yes | No media |
| hanging-knee-raise | Direct + alias | Local | YouTube | Yes | Combined movement collapses |
| lying-leg-raise | No | Local | YouTube | Yes | Combined plan maps to knee raise |
| reverse-crunch | Direct | Local | YouTube | Yes | — |
| plank | No | Local | YouTube | Yes | Unused |
| side-plank | Direct + alias | Local | YouTube | Yes | Two plan IDs collapse |
| hollow-body-hold | Direct | Local | YouTube | Yes | — |
| dead-bug | Direct + alias | Local | YouTube | Yes | Two plan IDs collapse |
| posterior-pelvic-tilt | Direct | Local | YouTube | Yes | — |
| hip-flexor-stretch | Direct | Local | YouTube | Yes | — |
| plank-with-glute-squeeze | Direct | Local | YouTube | Yes | — |
| treadmill-incline-walk | Direct | Local | YouTube | Yes | — |
| skipping-rope | No | Local | YouTube | Yes | Combined plan maps to VR |
| vr-boxing | Alias | Local | None | Yes | Explicit no-video |
| light-walking-only | Plan only | Fallback | None | No | Sole unresolved plan record |

36 of 43 library records are resolver-used. Seven are unused: dumbbell-curl, dumbbell-shoulder-press, dumbbell-squeeze-press, lying-leg-raise, plank, skipping-rope, skull-crusher.

Media behavior:

- supports YouTube watch, youtu.be, embed, Shorts, and /v/;
- rejects search, playlist, malformed/non-HTTP, and non-YouTube URLs;
- arbitrary external videos are effectively unsupported;
- card images and iframes are lazy;
- workout videos are collapsed/no-auto-open by default;
- opening Form Guide creates its iframe online;
- offline mode suppresses video;
- broken images fall back to default placeholder;
- demo links are generated YouTube search links;
- external links were not fetched;
- custom images resize to 960px/0.82, then store as base64;
- one image is capped at 1.2M characters, aggregate library size is uncapped;
- custom libraries replace rather than merge with new defaults.

## 8. Live Workout Flow

activeWorkoutSession stores:

- identity/date/day/name/start/finish/completed;
- exercise/set cursor;
- exercise snapshots with ID, name, targets, rest, muscle, equipment, tips;
- sets with number, reps, weight, RPE, pain, notes, completedAt.

Completed workoutSessions store:

- identity/date/day/name/start/finish/completed;
- exercise name and targets;
- set values;
- optional sync metadata.

Conversion drops exerciseId, muscleGroup, equipment, formTips, and plan version.

Flow:

1. Today reads plan, history, display settings, and active session on mount.
2. Today is Monday-first index selection; user can choose another day.
3. Start snapshots the chosen day to activeWorkoutSession.
4. Sets begin with nullable values.
5. Save stamps completedAt, persists, advances, and starts rest.
6. Skip advances without completing.
7. Navigation and extra sets persist.
8. Previous/best performance use exact case-sensitive names.
9. Progression uses names.
10. Media resolves custom library, aliases, then default library.
11. Navigation away preserves the active snapshot.
12. Returning offers Continue/Discard.
13. Unsaved form input is lost on refresh.
14. No workout-level pause exists.
15. Rest state is component-only and lost on refresh.
16. Finish is allowed with zero completed sets.
17. Finish prepends history and clears active.
18. Service save then runs in the background.
19. Local mode marks local-only.
20. Cloud success marks synced; failure queues create.
21. Active workouts never cloud-sync.
22. Cloud stores raw session and flattened workout_sets.

Defects:

- RPE/pain parsing does not clamp to 10.
- live completion and analytics use different “completed set” definitions;
- timed exercises have no timeSeconds input;
- weight/RPE-only sets can disappear from analytics;
- safeSetJSON failures are often ignored;
- active can be cleared after failed history persistence;
- UTC session dates can disagree with local weekday selection;
- finish is nontransactional;
- cloud failure is hidden on finish screen;
- previous history assumes newest-first;
- legacy builders/readers remain alongside liveWorkoutUtils;
- completed data is name-based.

## 9. Local Storage Inventory

| Key | Shape/purpose | Main readers/writers | Risk |
|---|---|---|---|
| workoutSessions | Completed history array | Workout, Dashboard, Progress, Review, Coach, export, services | Names only; multiple semantics |
| activeWorkoutSession | Active snapshot/cursor/sets | Today, Dashboard, reminders, Data Health | Local-only; failure can lose work |
| bodyCheckIns | Measurements/ratings/photos | Body, Dashboard, Progress, Coach, services | Base64 quota/signed URLs |
| nutritionLogs | Daily nutrition array | Nutrition, Dashboard, Review, Coach, services | Weak import validation |
| userProfileSettings | Profile/equipment/goals/supplements/coach/display | Settings and most pages | Reset/import cloud divergence |
| customWorkoutPlan | Seven-day override | Plan pages/editor/sync | No version; cloud resurrection |
| customExerciseLibrary | Full custom library/media | Library/editor/sync | Masks defaults; base64 |
| reminderSettings | Flags/times/days/delay | Settings/reminder hooks | Local-only; omitted backup |
| reminderHistory | Up to 100 notifications | Notification UI/service | Local-only |
| sentReminderLog | Dynamic sent map | Reminder service | Unbounded |
| pendingSyncQueue | Type/action/payload/attempt/status | Services/hooks/Data Health | Not user-scoped; large payloads |
| lastOfflineSyncAt | Raw ISO time | Queue/offline panel | Only queue success updates |
| preDeployChecklist | Item→boolean | Checklist | Omitted by Settings clear |
| cloudHealthLastCheck | Health result | Health/Data Health | Email in raw backup |
| key__cloudBackup | Previous serialized key | Cloud download/Data Health | Single overwritten copy/no restore UI |
| corrupted_key_timestamp | Raw corrupt data | Safe JSON/Data Health | Broken source remains |

settingsActiveTab is sessionStorage.

No app-defined themePreference, appDataVersion, planVersion, or installedWorkoutPlanVersion exists.

Safety behavior:

- safeGetJSON falls back and quarantines parse errors;
- corrupt source remains;
- safeSetJSON catches errors and returns false;
- most callers ignore false;
- no runtime data version/migration exists;
- import is nontransactional and weakly validates history;
- body/library images can exceed quota;
- pending body data can duplicate base64.

## 10. Supabase Architecture

Client: src/lib/supabaseClient.js.

Environment names only:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- optional VITE_APP_NAME
- optional VITE_APP_ENV

Missing Supabase variables permit local-only mode.

Auth supports persisted/refreshing session, sign-up, sign-in, reset-email request, and sign-out. Password-reset completion is missing.

| Feature | Table/bucket | Service | Local fallback | Status/risk |
|---|---|---|---|---|
| Profiles | profiles | No frontend table service | Settings | Triggered row unused |
| Workouts | workout_sessions | workoutService.js | Yes | Likely upsert-index mismatch |
| Sets | workout_sets | workoutService.js | Raw session | exercise_id normally null |
| Body | body_check_ins | bodyCheckInService.js | Yes | Likely upsert mismatch/photos |
| Nutrition | nutrition_logs | nutritionService.js | Yes | Likely upsert mismatch/no date unique |
| Settings | user_settings.settings | settingsService.js | Yes | Reset bypasses cloud |
| Plan | custom_workout_plans.plan | settingsService.js | Yes | Editor bypasses service |
| Library | custom_exercise_libraries.library | settingsService.js | Yes | Editor bypasses service |
| Photos | progress-photos | photoService.js | Base64 | Offline replay/delete incomplete |
| Active/reminders | None | Local utilities | Local only | No continuity |

RLS owner policies exist on all SQL tables. Storage bucket progress-photos is private and path-scoped:

<user_id>/<checkin_id>/<front|side|back>.jpg

Signed URLs last one hour. Public-URL fallback is unlikely to work for the private bucket.

Likely schema defect: services upsert on user_id,local_id while SQL defines only partial unique indexes WHERE local_id IS NOT NULL. PostgreSQL/PostgREST conflict inference may fail. This was not live-tested.

Other issues:

- cloud download replaces whole nonempty categories;
- no timestamp merge/conflict resolution;
- empty cloud does not clear stale local data;
- global hydration can drop rows missing raw_data;
- workout set delete/reinsert is not transactional;
- imports, demo, repair, reset, and clear can bypass cloud;
- manual upload does not clear matching queue items;
- hydration and queue replay can race.

## 11. Offline and Sync Architecture

| Mode | Decision | Behavior |
|---|---|---|
| Local | Supabase absent/no user | localStorage only |
| Cloud | Configured + authenticated | local-first, then cloud |
| Offline | navigator.onLine false | local write plus queue |
| Pending | Cloud write fails | pending local metadata + queue |
| Synced | Cloud succeeds | synced local metadata |

Page integration:

- Body uses cloud-aware CRUD and signed URLs.
- Nutrition writes via service but reads the global local mirror.
- Today cloud-syncs only completed sessions.
- Dashboard, Progress, Review, Coach, Export read local mirrors.
- Plan Editor/Exercise Library write local utilities.
- Settings mixes service and direct-local operations.
- Manual cloud download requires page reopen.

Queue supports workout, body, nutrition, settings, custom plan, and custom library; create/update/delete; five attempts. Auto processing happens initially and on offline→online, not periodically after online server failures.

Critical: keys/queue entries are not user-scoped. Replay uses the currently signed-in user. Account B can see/upload Account A’s local mirror/queue on one browser. Sign-out does not clear/namespace it.

Offline limitations:

- active workout never syncs;
- editor changes do not enqueue;
- queued body replay does not upload Storage files;
- queued body deletion can orphan Storage files;
- plan/library reset does not queue cloud delete;
- no service-worker Background Sync.

## 12. Body, Nutrition, Progress and Coach Systems

### Body

Fields include date, weight, waist, belly, chest, shoulders, arms, hips, posture, abs visibility, energy, sleep, notes, three local photos, optional cloud paths/URLs, timestamps/sync metadata.

Validation:

- date required;
- finite nonnegative measurements;
- ratings 1–10;
- weight optional;
- no plausible maximums;
- duplicate dates allowed.

Photos:

- JPEG/JPG, PNG, WebP; 5MB input max;
- resize to 1400px at JPEG 0.85;
- local base64;
- cloud path plus signed URL;
- failed canvas conversion can mismatch content/extension metadata;
- signed URLs expire;
- expired persisted URL does not auto-refresh after image error;
- manual migration retains base64/signed URL;
- offline deletion can orphan objects;
- retry of failed create can duplicate rows.

Body integrates with Dashboard, Progress charts/photos, and Coach. Energy is collected but unused by readiness.

### Nutrition

Fields include weight, protein, water, calories, creatine, whey, eggs, seafood, oysters, nuts, dark chocolate, fruit, coffee, notes, timestamps/sync metadata.

Hardcoded targets:

- protein 120–160g, high 180, warning 220;
- water 2–3L, form maximum 10L;
- creatine 3–5g, warning 10g.

Only date is required. Protein/creatine warnings do not block. Supplement checklist bypasses the water form max. Taken flags are not validated against quantities. 161–180g protein is still labelled target. Settings targets do not drive most Nutrition/Review/Coach rules.

Local persistence enforces one entry/date; SQL does not.

### Progress

- exact case-sensitive name matching;
- tracked exercises come from current plan;
- removed/renamed exercises vanish from charts;
- strength uses max weight, otherwise max reps;
- completion can include partially logged sessions;
- weekly completion is binary per date;
- multiple workouts on one date collapse;
- UTC date conversion can shift positive-timezone labels;
- muscle volume is completed-set count, not load×reps;
- current-plan name map sends old unmatched names to Other.

### Progression

- exact-name, not ID;
- Increase when counted sets reach maximum, pain zero, RPE absent/≤9;
- Keep when counted sets reach minimum;
- Reduce/form warning for low reps, RPE 10, or pain ≥4;
- does not require all planned sets;
- one top-range set may trigger increase;
- missing RPE is acceptable;
- timed movements are incomplete.

### Weekly Review

Benchmarks: Bench Press, Weighted Push-up, Pull-ups, Dips, Incline Dumbbell Press, Squat, Romanian Deadlift, Hanging Knee Raise.

Score:

- workout 40;
- nutrition 25;
- body check-in 10;
- abs/posture 15;
- progression 10.

Repeated sessions can earn completion points while other plan days remain missed. Multi-muscle sets receive full credit per group. Removed/renamed history can disappear from volume. Fixed targets include Chest 18, Back 12, Abs 3 sessions, Posture 4, nutrition 5 days, and Day 6 advice. Empty data still produces a score.

### Coach

Readiness starts at 75:

- protein ≥120: +10; 0–99: −10;
- creatine: +5;
- water ≥2L: +5; 0–<2: −5;
- latest sleep ≥7: +5;
- recent pain ≥4: −15; otherwise any history +5;
- latest average RPE ≥9.8: −10;
- hard workout yesterday RPE ≥9: −10;
- seven distinct workout dates: −10;
- clamp 0–100.

Labels: ≥85 hard, ≥70 normal, ≥50 reduced, otherwise recovery.

No-data still yields 75. Sleep can be stale, energy is ignored, one hard workout can incur two penalties, and coach style/priority barely alter rules.

Old workout detail/export retains names. Progress, Review, Coach, and progression do not reliably preserve continuity after plan changes.

## 13. Settings, Plan Editor and Export

Settings structure:

- profile;
- equipment;
- goals;
- supplements;
- coach;
- workout display.

Tabs: Profile, Goals, Equipment, Supplements, Reminders, Workout Display, Coach, Cloud Sync, Offline & Sync, Backup.

Core settings save local-first/cloud-aware. Reset is local without confirmation/cloud deletion. Reminders are separate/local-only. No theme setting exists. Two conflicting hardcoded profile datasets exist.

Plan Editor supports day/exercise edits, reorder/remove/add, empty/reset day, reset plan, and library editing.

Limitations:

- fixed seven days;
- IDs not editable;
- manual category is dropped;
- duplicate library use can append Date.now to ID;
- library editor omits several fields/media;
- deleting custom records does not check references;
- no version, preview, diff, install, migration, validation;
- writes only local custom data;
- cloud can later overwrite/reset resurrection.

Confirmation is inconsistent: whole-plan/day-empty/library destructive actions confirm; individual remove/reset/reorder/add do not.

Backup formats conflict:

1. semantic backup: settings, custom plan/library, workouts, body, nutrition;
2. Data Health raw envelope with serialized keys.

restoreLocalStorageBackup exists but is unused. Settings import expects semantic format. Raw “full backup” import can report success while restoring nothing.

Semantic backup omits active workout, reminders, queue, last sync, health, checklist, corruption, cloud backups. It has no schema/plan version, pre-import backup, restore count, or cloud write.

CSV exports workout sets, body, nutrition, weekly summary. CSV escaping exists but formula prefixes are not neutralized.

Print supports weekly plan, daily/today log, today workout, latest session, weekly review, body, nutrition.

Print limitations:

- no plan metadata/version;
- empty custom day has no rows;
- “Latest Completed” can choose any session containing exercises;
- waits fixed 120ms, not image completion;
- signed photos may be blank;
- old history exports;
- weekly/today uses active plan, but review retains fixed benchmarks.

## 14. PWA, Reminders and Theme

PWA configuration:

- auto registration/update;
- standalone portrait manifest;
- root start/scope;
- 192/512/maskable icons;
- precaches JS/CSS/HTML/icons/images/fonts;
- navigation fallback index.html;
- Supabase NetworkOnly;
- static assets CacheFirst, 80 entries/30 days.

No hand-authored service worker. Ignored dist artifacts do not prove current build health. OfflineFallback is unused.

Install UX handles beforeinstallprompt and iOS instructions.

Default plan is bundled:

- open clients retain loaded JS until reload;
- offline clients retain cached bundle;
- custom plans override the new default indefinitely;
- PWA staleness is Medium; custom precedence is higher.

Reminders are foreground-only:

- page interval every 60 seconds;
- new Notification, not service-worker delivery;
- exact-minute checks;
- closed/suspended app can miss reminders;
- history capped 100, sent log unbounded;
- local-only and omitted from backup/cloud;
- rest beep/vibrate/notification;
- rest state not persisted.

Theme:

- fixed dark tokens/meta;
- no ThemeContext/key/toggle/light/system mode.

Responsive findings:

- Sidebar ≥920px; five-item BottomNav below;
- BottomNav lacks bottom safe-area padding;
- Today hides mobile nav for entire page;
- live controls do use safe-area padding;
- responsive media/charts;
- horizontally scrolling Settings tabs;
- modal/focus/scroll risks;
- dense navigation at 320px.

## 15. Testing and Deployment

Testing:

- no test script/framework/config/test source;
- testDataUtils is demo generation;
- 20-scenario manual test doc;
- 24-item self-checked predeploy list;
- 72 screenshots without assertions/provenance;
- test-results says failed but provides no runner/failure IDs;
- major flows untested: storage failure, account switching, migrations, conflicts, offline photos, history renames, restore, timed sets, PWA update.

A static resolver found no missing target among 288 relative imports. This does not verify types, package exports, transformations, or runtime.

Build/deploy:

- build/lint/typecheck/tests not executed in the initial audit;
- Vercel rewrites all paths to index.html;
- no CI/deployment workflow;
- no Node pin;
- locked Vite needs Node ^20.19.0 or ≥22.12.0;
- build:prod skips types;
- production build generates PWA;
- dist does not prove current source builds.

## 16. Implementation Status Matrix

| Feature | Implemented | Partial | Missing | Broken risk |
|---|---:|---:|---:|---|
| Dashboard | Yes | — | — | Static targets/profile assumptions |
| Live workout | Yes | Yes | Timed model | Name-only completion/storage failure |
| Workout recovery | Yes | Yes | Persistent rest/pause | Unsaved/rest state lost |
| Workout history | Yes | Yes | Stable exercise identity | IDs/groups dropped |
| Progress | Yes | Yes | Historical aliases | Renames hide charts |
| Body | Yes | Yes | Conflict control | Retry duplicates |
| Photos | Yes | Yes | Offline Storage replay | Orphans/expired URLs |
| Nutrition | Yes | Yes | Settings-driven targets | Target/validation mismatch |
| Library | Yes | Yes | Walking record/full merge | Custom masks defaults |
| Media | Yes | Yes | Nine videos/media | External unsupported/quota |
| Weekly review | Yes | Yes | ID benchmarks | Old names/scoring |
| Coach | Yes | Yes | Confidence-aware score | No-data/stale sleep |
| Progression | Yes | Yes | Timed/ID model | One-set/missing-RPE increase |
| Plan Editor | Yes | Yes | Version/preview/migration | Cloud resurrection |
| Settings | Yes | Yes | Theme | Reset/import divergence |
| Export/print | Yes | Yes | Restorable full backup | Raw restore unavailable |
| Authentication | Yes | Yes | Recovery completion | Shared local account data |
| Supabase sync | — | Yes | Reconciliation/scoping | Likely upsert mismatch |
| Offline/PWA | Yes | Yes | Background Sync | Stale/editor bypass |
| Reminders | — | Yes | Background delivery | Exact-minute foreground |
| Data Health | Yes | Yes | Reachable restore | Rollback illusion |
| Theme | — | — | Yes | Docs can mislead |
| Automated tests | — | — | Yes | No regression protection |
| Deployment | Yes | Yes | CI/Node pin | Typecheck bypass |

## 17. Workout Plan Update Risks

| Severity | Risk | Consequence |
|---|---|---|
| Critical | Replace custom local/cloud plan | Customization loss |
| Critical | Local reset leaves cloud plan | Old plan returns |
| Critical | Full backup lacks restore UI | Rollback failure |
| Critical | Storage/queue not user-scoped | Cross-account data/upload |
| High | No installed version/migration | Installed plan unknowable |
| High | Rename exercises | Break history/progression/charts |
| High | Completed data drops IDs/groups | History cannot remap reliably |
| High | Custom library masks defaults | New exercises absent |
| High | Fixed benchmarks/Day 6 | Old review/coach logic |
| High | Likely partial-index mismatch | Cloud writes may fail |
| High | Cloud replacement sync | Newer local data overwritten |
| Medium | Change IDs | Media/form/active lookup breaks |
| Medium | Change day numbers | Historical attribution changes |
| Medium | Positional seven-day normalizer | Silent corruption |
| Medium | Install during active workout | Split old/new semantics |
| Medium | PWA cache | Old plan until reload/reconnect |
| Medium | Timed exercise model | Cannot log cleanly |
| Medium | localStorage quota | Persistence failure |
| Medium | Print/review mismatch | Old benchmarks remain |
| Low | Old history export | Safe if untouched |

Safest direction:

- preserve history/active/custom/cloud/queue/photo data;
- retain canonical IDs;
- do not destructively rename historical entries;
- introduce read-time legacy aliases;
- version default plans separately from customization;
- explicit Keep/Merge/Install choice;
- defer install during active workout;
- fix and verify restore first;
- define cloud conflict/reset/delete semantics.

Minimum tests:

- fresh local;
- existing local custom;
- existing cloud custom;
- conflicting local/cloud;
- offline edits/reconnect;
- reset local/cloud;
- old renamed/removed history;
- active workout during install;
- timed logging;
- analytics/export/print;
- quota failure;
- two accounts one browser;
- installed/open/offline PWA update;
- actual Supabase upserts/RLS.

## 18. Minimal Safe Update Strategy

| Stage | Expected work | Tests/risk | Rollback |
|---|---|---|---|
| 0 Backup/protection | Make raw restore reachable/verified; capture all local/cloud/photo state; protect/tag current commit | Restore in isolated browser | Restore snapshots/deployment |
| 1 Add plan inactive | New versioned module/registry; v1 remains selected | Ensure no accidental activation | Revert additive module |
| 2 Add library records | Append stable records/media; preserve IDs | Uniqueness/required fields/coverage | Revert additions |
| 3 Validate schema | Pure validator for metadata/days/IDs/targets/library | Valid/malformed/duplicate/timed plans | Keep v1 active |
| 4 Preview/install | Version/diff/preview/explicit install/active guard | Preview/cancel/install/no-write | Keep v1, restore snapshot |
| 5 Preserve/migrate custom | Installed version; Keep/Merge/Install; cloud reset/delete; account scope | All local/cloud/offline conflicts | Restore exact custom JSON |
| 6 Update references | Benchmarks, aliases, labels, Coach/Review, Dashboard, demos | Every old/new name/ID | Restore rules/aliases |
| 7 Test local | Fresh/existing/custom/import/export/resume/timed/quota/reminders | Local overwrite/quota | Restore browser backup |
| 8 Test cloud | Upserts/RLS/sync/conflict/reset/photos/queue | Schema/overwrite | Restore cloud/local |
| 9 Test history | Old IDs/names/removed/incomplete/active fixtures | Visibility/attribution | Revert mappings, retain raw |
| 10 Build/deploy | Tests, Node pin, typecheck, lint, build, preview, PWA, Vercel Preview | Build/PWA/cloud regression | Promote previous deployment |

## 19. Exact Files Relevant to the Update

Definitely:

- src/data/workoutPlan.ts
- src/data/exerciseLibrary.ts

Likely:

- src/utils/settingsUtils.js
- src/utils/storageUtils.js
- src/services/settingsService.js
- src/services/syncService.js
- src/pages/PlanEditor.tsx
- src/pages/ExerciseLibrary.tsx
- src/utils/weeklyReviewUtils.js
- src/utils/progressionUtils.ts
- src/utils/progressUtils.ts
- src/utils/coachUtils.js
- src/utils/liveWorkoutUtils.ts
- src/pages/TodayWorkout.tsx
- src/pages/WeeklyPlan.tsx
- src/pages/Dashboard.tsx
- src/components/ExerciseDetailModal.tsx
- src/data/userProfile.ts
- src/utils/exportUtils.js
- src/utils/printUtils.js
- src/pages/ExportPrint.jsx
- src/utils/offlineSyncQueue.js
- src/hooks/useAutoSync.js

Cloud/schema context:

- src/lib/supabaseClient.js
- src/services/workoutService.js
- src/services/bodyCheckInService.js
- src/services/nutritionService.js
- src/services/photoService.js
- supabase/schema.sql
- supabase/storage.sql

Test/deploy:

- package.json
- package-lock.json
- vite.config.ts
- vercel.json
- docs/production-test-plan.md
- src/pages/PreDeployChecklist.jsx

Do not destructively rewrite:

- workoutSessions
- bodyCheckIns
- nutritionLogs
- activeWorkoutSession
- pending queue without owner-safe migration
- historical Supabase rows
- Storage photo objects
- custom local/cloud plan/library without verified snapshots
- the unrelated existing src/App.css modification.

## 20. Unknowns and Unverified Items

- Current build, typecheck, lint, tests, and runtime.
- Actual browser/mobile/modal/media behavior.
- Actual local custom data.
- Actual cloud records/accounts.
- Whether SQL matches deployed Supabase.
- Inferred partial-index upsert behavior live.
- Deployed RLS behavior.
- External YouTube/demo availability.
- Signed-photo behavior after expiry.
- Notification platform support.
- PWA update timing across browsers/install/offline.
- Vercel project settings/deployed Node.
- Whether dist matches source.
- test-results provenance.
- screenshot provenance.
- real browser quota behavior.
- whether hardcoded personal defaults are production data or fixtures.
- password recovery outside the repository.

## Change Log

| Date | Change | Sections updated | Verification |
|---|---|---|---|
| 2026-08-06 | Saved the initial read-only audit as a living project document. No application implementation was changed by this entry. | 1–20 | Markdown structure and repository status checked |
| 2026-08-06 | Completed Part 1 of the workout-program upgrade: additive JSON program types, validation, registry, legacy wrapper, template, and contributor documentation. No program was activated and no user data was changed. | Workout Program Upgrade Progress | `npm run build` passed (`tsc -b` and Vite production build) |
| 2026-08-06 | Completed Part 2A of the workout-program upgrade: added the inactive `upper-recomposition` version `2.0.0` JSON program. No program was activated and no user data was changed. | Workout Program Upgrade Progress | Registry discovery and validator checks passed with 0 errors and 38 expected unknown-library warnings; `npm run build` passed |
| 2026-08-06 | Completed corrected Part 2B: added the 37 missing Version 2 IDs once to the shared bundled Exercise Library and changed UI/library lookup reads to overlay custom records without hiding bundled records. Version 2 remains inactive and no stored user or cloud data was rewritten. | Workout Program Upgrade Progress | All 80 bundled IDs are unique; Version 2 and legacy lookup coverage have 0 unresolved IDs; final `npm run build` passed |
| 2026-08-06 | Completed Part 3 of the workout-program upgrade: added duration-mode workout logging, strict set completion, active-session recovery, future history metadata, timed display/export/print support, and analytics compatibility. Version 2 remains inactive; old history, the Supabase schema, and the unrelated `src/App.css` changes were not modified. | Workout Program Upgrade Progress | Duration/parser, active-session recovery, render, legacy-history, CSV, analytics-exclusion, lint, typecheck, and production-build checks passed; in-app browser click-through was unavailable |
| 2026-08-06 | Completed Part 4A of the workout-program upgrade: added a local-only Program Manager with read-only previews, explicit installation, rollback, dismiss/keep behavior, and a capped backup/restore flow. Version 2 remains opt-in, workout history and Supabase remain unchanged, and cloud installation remains deferred. | Workout Program Upgrade Progress | Registry/render, storage isolation, failure rollback, active-workout, restore, cloud-disable, manual-edit, CSS-preservation, lint, typecheck, and production-build checks passed; browser backend was unavailable |
| 2026-08-06 | Completed Part 4B of the workout-program upgrade: enabled verified cloud installation, cloud backup/restore, cloud-safe reset, cloud dismissal metadata, and account-scoped Program Manager hydration using the existing Supabase JSON documents. Version 2 remains opt-in; workout history, active workout contents, the Supabase schema, packages, and the unrelated CSS work were unchanged. | Workout Program Upgrade Progress | The 12 focused offline/active/install/merge/ordering/rollback/restore/reset/history/default/CSS checks passed with an isolated fake-cloud transaction harness; `npm run build` passed |
| 2026-08-06 | Completed Part 5A of the workout-program upgrade: added conservative central exercise identity, kept removed and unknown historical exercises visible, made future strength/progression lookup ID-first, and preserved recorded names in history/export/print. Version 2 remains opt-in; no stored history, Supabase schema, packages, or unrelated CSS were changed. | Workout Program Upgrade Progress | All 14 focused identity/history/catalog/matching/muscle/export/default/CSS checks passed; `npm run lint` and `npm run build` passed |
| 2026-08-06 | Completed Part 5B of the workout-program upgrade: Dashboard, Weekly Plan, Weekly Review, Coach, Exercise Detail, progression callers, demo generation, print, and plan export now follow the active program. Version 2 remains opt-in; workout history, the Supabase schema, packages, and unrelated CSS were unchanged. | Workout Program Upgrade Progress | All 12 focused runtime/SSR assertions and the dedicated active-program/demo checks passed; `npm run lint`, `npm run typecheck`, `git diff --check`, and `npm run build` passed; the in-app browser backend was unavailable |
| 2026-08-06 | Completed Part 5C of the workout-program upgrade: added optional registry-owned standalone workouts, the Full Body Reset session, explicit standalone session identity, Today Workout access, and separate scheduled-adherence reporting. No eighth day was added; Version 2 remains opt-in; stored history and Supabase schema were not rewritten. | Workout Program Upgrade Progress | All 12 focused standalone access/session/history/adherence/export/default/CSS checks passed with Vite-loaded runtime and SSR fixtures; `npm run build` passed; the in-app browser backend was unavailable |
| 2026-08-07 | Completed Part 6A final integration verification and fixed Plan Editor reset isolation. Managed installed programs now resolve selected-day defaults and resets through the authoritative active-program architecture; Version 2 can no longer reset to legacy Version 1 content. No production deployment or Supabase access occurred. | Workout Program Upgrade Progress — Part 6A | Build, lint, Version 2 validation, isolated install/storage, focused reset, timed logging, recovery/history, CSV/print/counting/chart exclusion, historical compatibility, export/backup, and cloud-path static checks passed |

AUDIT COMPLETE — NO FILES MODIFIED

> The footer above records the state of the initial read-only audit. The living-document implementation progress begins below.

## Workout Program Upgrade Progress

### Part 1 — JSON Program Registry

- **Completion date:** 2026-08-06
- **Status:** Complete — architecture only
- **Part completed:** Part 1, reusable inactive JSON workout-program registry
- **Current default program ID:** `legacy-workout-v1`
- **Active application plan source:** Unchanged; the application still resolves the existing `weeklyPlan`/`customWorkoutPlan` flow and does not read the registry for active workouts.

#### Files created

- `src/types/workoutProgram.ts`
- `src/utils/workoutProgramValidation.ts`
- `src/data/workoutProgramRegistry.ts`
- `src/data/workout-programs/legacy-v1.json`
- `src/data/workout-programs/_template.example.json`
- `docs/adding-workout-programs.md`

#### Files modified

- `docs/project-audit-report.md` — this progress entry and Change Log row only.

`src/data/workoutPlan.ts`, `src/utils/settingsUtils.js`, `src/pages/PlanEditor.tsx`, and `src/data/exerciseLibrary.ts` were inspected but not modified. The unrelated pre-existing `src/App.css` working-tree change was not altered.

#### Architecture added

- `WorkoutProgram` reuses the existing `WorkoutDay` type and adds JSON-compatible program metadata, optional goals/benchmarks/rules, and a validation-result type. No duplicate workout-day or plan-exercise model was introduced.
- `legacy-v1.json` wraps the compiled default with ID `legacy-workout-v1`, version `1.0.0`, and the required metadata. Its seven-day payload was generated directly from `weeklyPlan`, preserving all 7 days, 44 exercise occurrences, 42 unique exercise IDs, 134 sets/rounds, targets, rest values, focus labels, equipment, muscle groups, and form tips.
- `workoutProgramRegistry.ts` uses an eager Vite `import.meta.glob` over `src/data/workout-programs/*.json`. Files are loaded as raw JSON text and parsed individually so a malformed file can be diagnosed and excluded without throwing from registry initialization.
- Filenames beginning with `_` or ending with `.example.json` are ignored. `_template.example.json` therefore remains documentation only.
- Parseable programs are validated before registration. Invalid programs and exact duplicate `id` + `version` conflicts are excluded, while diagnostics retain their filenames, IDs, versions, errors, and warnings. All files sharing an exact conflicting identity are excluded rather than choosing one by filename order.
- The same program ID may represent multiple distinct versions; those IDs are tracked in development diagnostics. This preserves meaningful `getWorkoutProgramByIdAndVersion` and `getLatestWorkoutProgramById` behavior. Program ID + version remains the unique registry identity.
- Usable programs have deterministic ID/version/date/filename ordering. Retrieval functions return JSON clones so callers cannot mutate registry state.
- Exports include `getWorkoutPrograms`, `getWorkoutProgramById`, `getWorkoutProgramByIdAndVersion`, `getLatestWorkoutProgramById`, `getWorkoutProgramValidationResults`, `isWorkoutProgramAvailable`, a development-only diagnostic export, `LEGACY_WORKOUT_PROGRAM_ID`, and `CURRENT_DEFAULT_PROGRAM_ID`.
- `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`; the constant does not change the current selection flow or activate a registry program.

#### Validator behavior

- `validateWorkoutProgram` is pure: it neither normalizes nor mutates its input and does not access browser storage, Supabase, or React state.
- It rejects invalid root metadata, missing/invalid days and fields, duplicate day numbers, invalid day numbers, missing focus/exercise arrays, empty exercise IDs/names, duplicate exercise IDs within one day, invalid sets/rest, missing or conflicting repetition/duration targets, and missing exercise metadata/form tips.
- It warns for non-seven-day programs, non-sequential days, missing optional description, empty goals/benchmarks, and exercise IDs absent from a supplied known-ID set.
- When `requireKnownExercises` is enabled, unknown exercise IDs become errors; registry loading leaves it disabled so unknown IDs are diagnostic warnings rather than an activation-affecting rejection.
- The current legacy program remains valid. Its alias/composite workout IDs generate non-blocking direct-ID warnings against the Exercise Library set; the original audit already documented these ID aliases and the unresolved `light-walking-only` library record.

#### Automatic discovery workflow

Future prepared program JSON files are pasted into `src/data/workout-programs/`. Vite expands the eager glob at build time, so no per-program import statement or registry edit is needed. The exact copy/rename/fill/build workflow and supported JSON structure are documented in `docs/adding-workout-programs.md`.

#### Build result

- Command: `npm run build`
- Result: Passed on 2026-08-06.
- TypeScript: `tsc -b` passed.
- Production bundle: Vite 8.1.4 passed; 2,510 modules transformed and PWA output generated.
- No new packages or test frameworks were installed.

#### Remaining work and unresolved issues

- A future part must add Program Manager preview/installation and explicitly connect a selected registry program to application behavior. Part 1 deliberately does neither.
- Installed-program state, migration/merge behavior, local/cloud persistence, active-workout guards, historical compatibility, analytics/reference updates, and UI work remain deferred as laid out in the original staged strategy.
- The existing Exercise Library aliases resolve most legacy plan IDs, but the validator's supplied `Set<string>` represents exact library IDs. Alias/composite IDs therefore remain warnings, and `light-walking-only` still has no library record. Strict known-exercise enforcement should not be enabled until that compatibility policy is defined.
- Per instruction, no test framework or broader manual test suite was added; verification was limited to the existing TypeScript-inclusive production build.

#### Scope and data confirmations

- **Workout program activated:** No.
- **Existing active workout behavior changed:** No.
- **`customWorkoutPlan` behavior changed:** No.
- **localStorage modified by implementation:** No.
- **Supabase read/write behavior modified:** No.
- **Workout history, active workouts, analytics, Exercise Library, Plan Editor, navigation, pages, export, or print modified:** No.
- **User data modified:** No.
- **`src/App.css` altered by Part 1:** No; its unrelated pre-existing change remains untouched.
- **Deployment, commit, or push performed:** No.

#### Deviations and audit clarifications

- No selection-behavior deviation from the original audit was found; all three required pre-edit assumptions remained correct.
- The original audit's phrase “nonempty cloud plan” is slightly imprecise: current hydration uses JavaScript truthiness, so even an empty array is truthy and can overwrite the local key before normalizing to defaults. A backup is created only when a local custom-plan value exists. This is an audit wording clarification, not a Part 1 behavior change.
- Cloud-over-local precedence spans `src/App.tsx`, `src/services/syncService.js`, and `src/services/serviceUtils.js`, rather than being established by `settingsUtils.js` alone. Again, no behavior changed.
- The registry uses eager raw-text glob imports plus guarded `JSON.parse` instead of Vite's default JSON-module import form. This is an intentional implementation refinement so malformed JSON can be excluded without crashing registry initialization; discovery remains synchronous and automatic.

### Part 2A — Version 2 Program JSON

- **Completion date:** 2026-08-06
- **Status:** Complete — data only; discoverable but inactive
- **File created:** `src/data/workout-programs/upper-recomposition-v2.json`
- **Program ID:** `upper-recomposition`
- **Program version:** `2.0.0`
- **Days:** 7
- **Exercise occurrences:** 42 (41 unique exercise IDs)
- **Registry discovery result:** Passed. The registry loads `legacy-workout-v1@1.0.0` and `upper-recomposition@2.0.0`. `_template.example.json` is discovered by the glob, remains on the ignored-file list, and is not registered.
- **Validator result:** Valid; 0 errors and 38 warnings. Every warning is an expected unknown Exercise Library ID occurrence; 37 IDs are unique because `ninety-ninety-hip-lift` occurs on two days. Unknown IDs remain non-blocking under normal registry loading, so the new program is registered without enabling `requireKnownExercises`.
- **Unknown Exercise Library IDs (37):** `bird-dog-with-pause`, `chest-supported-dumbbell-row`, `close-grip-push-up`, `couch-hip-flexor-stretch`, `deficit-push-up`, `dumbbell-reverse-lunge`, `dumbbell-step-up`, `easy-indoor-swimming`, `elbows-out-dumbbell-row`, `farmer-carry`, `front-squat`, `glute-bridge-march`, `hanging-leg-raise`, `heels-elevated-goblet-squat`, `incline-barbell-press`, `incline-dumbbell-curl`, `kneeling-barbell-rollout`, `lean-away-dumbbell-lateral-raise`, `light-walking-only`, `ninety-ninety-hip-lift`, `one-arm-dumbbell-floor-press`, `one-arm-dumbbell-overhead-press`, `overhead-dumbbell-triceps-extension`, `paused-barbell-bench-press`, `pendlay-row`, `prone-y-raise`, `rear-delt-dumbbell-row`, `seated-dumbbell-calf-raise`, `shoulder-width-pull-up`, `side-plank-reach-through`, `single-leg-hip-thrust`, `single-leg-romanian-deadlift`, `sliding-hamstring-curl`, `suitcase-carry`, `sumo-deadlift`, `wall-tibialis-raise`, and `weighted-chin-up`.
- **Build result:** `npm run build` passed on 2026-08-06. TypeScript (`tsc -b`) and Vite 8.1.4 production build passed; 2,510 modules were transformed and PWA output was generated.

#### Scope and data confirmations

- **Workout program activated:** No. `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`, and the application still uses the existing `weeklyPlan`/`customWorkoutPlan` flow.
- **localStorage changed:** No.
- **Supabase changed:** No.
- **User data changed:** No.
- **`src/App.css` changed by Part 2A:** No; its unrelated pre-existing working-tree change remains untouched.
- **Other application behavior changed:** No. Exercise Library, history, active sessions, plan selection, pages, Plan Editor, print, export, navigation, and cloud behavior were not modified.
- **Packages, commit, push, or deployment:** None.

#### Remaining Part 2B work

- Add matching Exercise Library records for the 37 currently unknown IDs and re-run registry validation so the 38 occurrence-level warnings are resolved. No Exercise Library records were added during Part 2A.

### Part 2B — Shared Exercise Library Coverage

- **Completion date:** 2026-08-06
- **Status:** Complete — shared library coverage and custom-overlay reads; Version 2 remains inactive
- **Corrected architecture:** Workout-program JSON continues to contain metadata, goals, rules, benchmark IDs, workout days, and stable exercise ID references only. Exercise Library records remain in one shared bundled library and are not embedded in program files.
- **Previous embedded-library approach:** No completed embedded-library implementation existed. A partial type-only edit left by the interrupted earlier request was removed before this implementation; no embedded validator behavior, program-specific library registry helpers, JSON examples, or contributor guidance remained to remove.

#### Existing Version 2 records reused

The source comparison found 41 unique IDs across 42 Version 2 exercise occurrences. These four IDs already existed in the bundled Exercise Library and were reused without duplicate records or ID changes:

- `calf-raise`
- `dead-bug`
- `pull-up`
- `reverse-crunch`

#### Shared records added

Thirty-seven complete `LibraryExercise` records were added to `src/data/exerciseLibrary.ts`:

- `bird-dog-with-pause`
- `chest-supported-dumbbell-row`
- `close-grip-push-up`
- `couch-hip-flexor-stretch`
- `deficit-push-up`
- `dumbbell-reverse-lunge`
- `dumbbell-step-up`
- `easy-indoor-swimming`
- `elbows-out-dumbbell-row`
- `farmer-carry`
- `front-squat`
- `glute-bridge-march`
- `hanging-leg-raise`
- `heels-elevated-goblet-squat`
- `incline-barbell-press`
- `incline-dumbbell-curl`
- `kneeling-barbell-rollout`
- `lean-away-dumbbell-lateral-raise`
- `light-walking-only`
- `ninety-ninety-hip-lift`
- `one-arm-dumbbell-floor-press`
- `one-arm-dumbbell-overhead-press`
- `overhead-dumbbell-triceps-extension`
- `paused-barbell-bench-press`
- `pendlay-row`
- `prone-y-raise`
- `rear-delt-dumbbell-row`
- `seated-dumbbell-calf-raise`
- `shoulder-width-pull-up`
- `side-plank-reach-through`
- `single-leg-hip-thrust`
- `single-leg-romanian-deadlift`
- `sliding-hamstring-curl`
- `suitcase-carry`
- `sumo-deadlift`
- `wall-tibialis-raise`
- `weighted-chin-up`

Every new record uses the existing schema and supported categories/equipment tags, including instructions, form cues/tips, common mistakes, progressions, regressions, posture guidance, demo search links, and related workout days. No unverified external images or invented YouTube video IDs were added; the existing category image fallback and `videoType: 'none'` behavior apply.

`light-walking-only` is now a shared Conditioning record. It directly resolves the previously unresolved legacy-plan ID as well as the Version 2 recovery-day reference.

#### Shared-library and custom-overlay design

- Workout programs reuse stable IDs from one global bundled Exercise Library. A genuinely new exercise is added once to `src/data/exerciseLibrary.ts` and remains available if a program file is later removed.
- `getEffectiveExerciseLibrary()` returns a new array. It starts with cloned bundled records in bundled order, replaces a matching bundled position with a cloned stored custom record of the same ID, then appends cloned custom-only records in their stored order. Neither source is mutated.
- `getStoredCustomExerciseLibrary()` keeps stored custom records separate from the display merge. `getCustomExerciseLibraryOverrides()` read-only-compacts legacy full-library snapshots into records that differ from bundled data plus custom-only records; it does not rewrite storage by itself.
- The existing `customExerciseLibrary` key, raw save/reset APIs, export/import payload, cloud synchronization paths, and cloud behavior remain unchanged. New Exercise Library and Plan Editor saves pass only custom records/overrides to the raw save API; they never pass the full effective library or copy the bundled library into storage.
- Editing a bundled exercise creates a custom record with the same ID. Removing that override in Plan Editor reveals the unchanged bundled record again. Whole-library reset still removes the custom key and returns to bundled display data.

#### Read paths updated

- `src/pages/ExerciseLibrary.tsx` displays, searches, filters, and reopens records from the effective library while saving only compact custom overrides.
- `src/pages/PlanEditor.tsx` uses the effective library for its picker, search results, add flow, and editor display. Per-record reset/delete now removes only the raw custom entry, and full reset refreshes from the bundled library.
- `src/utils/settingsUtils.js` now defaults `findLibraryExerciseForWorkout` to the effective library. This updates Weekly Plan guides and Today Workout/live-workout form-guide and media resolution without changing workout-plan selection or active-session data.
- `ExerciseDetailModal`, `ExerciseMedia`, and `ActiveExerciseCard` remain leaf consumers of the already-resolved effective record; they required no independent global-library lookup.
- Raw sync, backup/import/export, and data-health paths deliberately remain raw rather than merging bundled records into stored or cloud custom data.

#### Coverage and build result

- **Bundled records:** 80 records and 80 unique IDs; no duplicate bundled IDs.
- **Version 2 coverage:** All 42 occurrences and all 41 unique IDs resolve directly in the bundled library. Remaining unresolved IDs: none.
- **Legacy coverage:** All 44 occurrences and all 42 unique workout IDs resolve through direct shared IDs or the existing legacy alias/name resolver. Remaining unresolved IDs: none.
- **Build command:** `npm run build`.
- **Final result:** Passed on 2026-08-06. TypeScript (`tsc -b`) passed; Vite 8.1.4 transformed 2,510 modules and completed the production build; PWA service-worker output was generated. The first build exposed an in-scope optional-media inference mismatch in the new JavaScript helper, which was corrected before the successful final run.
- No test framework or package was added.

#### Scope and data confirmations

- **Workout program activated:** No. `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`, and application selection still uses the existing `weeklyPlan`/`customWorkoutPlan` flow.
- **`customWorkoutPlan` changed:** No.
- **Workout history or `workoutSessions` changed:** No.
- **`activeWorkoutSession` changed:** No.
- **Existing localStorage data rewritten during implementation:** No. The implementation performed no browser-storage migration or write.
- **Raw `customExerciseLibrary` meaning:** Custom-created records and same-ID overrides only for new UI writes; complete bundled/effective arrays are not saved. Existing stored data remains untouched until an explicit user edit or reset.
- **Supabase schema, synchronization behavior, or production data changed:** No.
- **`src/App.css` changed by Part 2B:** No; its unrelated pre-existing working-tree change remains untouched.
- **Packages, commit, push, or deployment:** None.

#### Remaining Part 3 work

- Add explicit timed-exercise logging semantics and UI support while preserving repetition-based history. Exercises with duration targets remain represented in the program data, but Part 2B does not change workout-session logging.

### Part 3 — Timed Exercise Logging

- **Completion date:** 2026-08-06
- **Status:** Complete — timed workout logging and compatibility only; Version 2 remains inactive
- **Purpose completed:** Exercises with a `duration` target can now save positive elapsed time without treating time as repetitions or requiring a database migration.

#### Files changed

- `src/utils/exerciseLoggingUtils.ts` — new pure logging-mode, duration-parser, and duration-formatting helpers.
- `src/data/workoutSessions.ts` — optional timed-set and future completed-exercise metadata.
- `src/utils/liveWorkoutUtils.ts` — active timed-set snapshots, persistence, completion, summaries, and neutral live guidance.
- `src/pages/TodayWorkout.tsx` — saves timed input and passes separate rep/duration targets.
- `src/components/SetLogger.tsx` — repetition/duration input modes.
- `src/components/ActiveExerciseCard.tsx`
- `src/components/ExerciseSummaryCard.tsx`
- `src/components/WorkoutFinishSummary.tsx`
- `src/components/WorkoutDetailModal.tsx`
- `src/print/PrintableWorkoutSession.jsx`
- `src/utils/exportUtils.js`
- `src/utils/progressionUtils.ts`
- `src/utils/progressUtils.ts`
- `src/pages/Progress.tsx`
- `src/utils/weeklyReviewUtils.js`
- `src/utils/coachUtils.js`
- `src/utils/reminderUtils.js`
- `src/utils/dataValidationUtils.js`
- `docs/project-audit-report.md` — this progress section and Change Log row.

`src/services/workoutService.js`, `src/utils/printUtils.js`, `src/components/WorkoutHistoryTable.tsx`, `supabase/schema.sql`, workout-program JSON, the program registry/default ID, and `src/App.css` were inspected but not changed by Part 3.

#### Set schema and future history shape

`LoggedSet` retains all legacy fields and adds one optional field:

```ts
interface LoggedSet {
  setNumber: number
  reps: number | null
  timeSeconds?: number | null
  weightKg: number | null
  rpe: number | null
  painLevel?: number | null
  notes: string
  completedAt?: string | null
}
```

A set may contain positive `reps` or positive `timeSeconds`; neither field requires the other. Existing records with no `timeSeconds` remain valid. Future completed exercise snapshots preserve `exerciseId`, `exerciseName`, `muscleGroup`, `targetSets`, `targetReps`, and `targetDuration` when available. Legacy fields remain in place.

#### Logging-mode detection and duration parsing

- `getExerciseLoggingMode(exercise)` returns `reps` when an explicit `repRange` exists, otherwise `duration` when an explicit `duration` exists, and `reps` as the safe malformed/legacy fallback. Active/completed snapshot fields are supported defensively; common legacy duration text formerly stored in `targetReps` is recognized at read time.
- `isTimedExercise(exercise)` reuses that decision; none of the helpers depend on React.
- `parseDurationTarget(text)` preserves the trimmed original text and returns nullable minimum/maximum seconds. It supports the project formats `30-45 seconds`, `30-45 seconds each side`, `45 seconds each side`, `20-30 minutes`, `20-40 minutes optional`, and `25-35 minutes`. “Each side” is not multiplied. Unrecognized text such as `Easy pace` remains visible and manual time entry remains available.
- `formatDuration(seconds)` renders `MM:SS` below one hour and `H:MM:SS` at one hour or above.

#### Set Logger behavior

- Repetition mode keeps Reps, Weight, RPE, Pain, and Notes and saves `timeSeconds: null`.
- Duration mode replaces Reps with non-negative whole Minutes and Seconds, keeps Weight/RPE/Pain/Notes, shows the original duration target, and previews the entered formatted time.
- Seconds values of 60 or more immediately roll into Minutes. Empty time fields save `null`; entered zero saves `0` but is not completed. Timed saves set `reps: null`.
- Examples verified: 40 seconds saves `timeSeconds: 40`; 22 minutes saves `timeSeconds: 1320`.
- No stopwatch, lap tracking, pause persistence, or rest-timer persistence was added.

#### Completion rules and active-session persistence

- A set is complete only when `reps > 0` or `timeSeconds > 0`.
- Weight, RPE, pain, notes, `completedAt`, or a legacy duration string alone do not complete a set. Zero and negative duration values do not complete a set; active-session normalization rejects negative duration values.
- Live counters, exercise summaries, finish summaries, Progress totals, weekly review, reminders, and data-health empty-session detection now share those semantics.
- `timeSeconds` is included in every active set, saved in `activeWorkoutSession` on commit, restored by the defensive active-session normalizer, and copied into the completed workout. Unsaved form input remains component-local as before.

#### Live display, completed history, export, and print

- Timed live cards show the target duration and neutral duration guidance. Completed sets render formatted duration plus entered weight, RPE, and pain without showing `0 reps`.
- Future workout detail records retain their original exercise name and snapshot metadata. Workout details render `Duration: MM:SS/H:MM:SS` for timed sets and `Reps` for repetition sets; old history without `timeSeconds` continues to render.
- Workout CSV adds the exact columns `Duration Seconds` and `Formatted Duration`. Repetition rows leave both duration columns empty; timed rows leave Reps empty. JSON backup/export already serializes the expanded records without a special transform.
- Completed-workout print adds a Duration column and prints formatted duration instead of repetitions for timed rows. Existing layout and elapsed-workout duration remain otherwise unchanged.

#### Progress and progression compatibility

- Valid timed sets count toward workout/set completion and count as one completed set in muscle-volume summaries.
- Strength charts, weekly strength comparisons, and Coach strength-decrease scoring require positive repetitions; timed swimming and weighted carries are excluded rather than interpreted as rep/strength results.
- Timed exercises remain available to progression suggestions but use neutral guidance: “Maintain the target duration with controlled effort.” Pain warnings still take priority.
- No duration-specific chart or analytics redesign was added.

#### Cloud behavior

- Completed sessions continue to round-trip losslessly through `workout_sessions.raw_data`; cloud download prefers and restores that raw object, including `timeSeconds` and the new exercise snapshot fields.
- The existing normalized `workout_sets.time_seconds` column is suitable and `workoutService` already maps `timeSeconds` to it, so normalized rows also retain duration.
- No Supabase schema or SQL migration was changed or applied.

#### Focused verification and build result

- Part 2B prerequisite: passed. Version 2 has 42 occurrences/41 unique exercise IDs, zero unresolved shared-library IDs, and zero validator errors/warnings with strict known-exercise checking.
- Duration helper matrix: all six requested formats parsed to the expected minimum/maximum seconds; unparsed `Easy pace` preserved its original text; `40 → 00:40`, `1320 → 22:00`, and `3600 → 1:00:00` passed.
- Repetition regression: an 8-rep set saved/reloaded with `reps: 8` and `timeSeconds: null`.
- Timed persistence: a 40-second Farmer Carry and 1,320-second swim survived active-session localStorage serialization/normalization; finish conversion retained time plus exercise ID, muscle group, and target duration.
- Strict completion: zero-time, weight/RPE/pain/notes-only, and completed-timestamp-only fixtures did not count as completed sets.
- History/render: a timed detail rendered `Duration: 00:40` with no `Reps: 0`; a legacy record without `timeSeconds` rendered `Reps: 9`; Set Logger rendered Reps only in repetition mode and Minutes/Seconds only in duration mode.
- CSV: all rows retained the 12-column shape; repetition duration cells were empty; carry exported `40`/`00:40`; swim exported `1320`/`22:00`.
- Analytics: a weighted timed carry produced no strength-chart point while still counting as a completed set.
- Browser limitation: the in-app browser backend was unavailable, so no click-through UI session was claimed. Equivalent compiled-module storage, server-rendering, and export assertions were used for the focused cases.
- `npm run lint`: passed with the existing unrelated `react(only-export-components)` warning in `src/context/AuthContext.jsx`.
- `npm run typecheck`: passed.
- `npm run build`: passed on 2026-08-06. TypeScript passed; Vite 8.1.4 transformed 2,511 modules; PWA output was generated.

#### Scope and data confirmations

- **Old workout history rewritten:** No. No migration, repair, or browser-storage rewrite was run against existing `workoutSessions`.
- **Version 2 activated:** No. `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`, and active plan selection remains the existing `weeklyPlan`/`customWorkoutPlan` flow.
- **Workout-program JSON changed by Part 3:** No.
- **Supabase schema changed:** No.
- **Packages installed:** No.
- **`src/App.css` changed by Part 3:** No. Its unrelated pre-existing working-tree diff remains untouched.
- **Commit, push, or deployment:** None.

#### Remaining Part 4 work

- Add Program Manager preview, backup, and installation with explicit user choice and the active-workout/history protections already described by the audit. Part 4 was not started or activated in this task.

### Part 4A — Local Program Manager

- **Completion date:** 2026-08-06
- **Status:** Complete — explicit local preview, installation, backup, rollback, restore, and dismiss behavior; cloud installation remains deferred to Part 4B
- **Default program:** `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`.
- **Activation behavior:** `upper-recomposition@2.0.0` is discoverable and available but is never installed automatically. Installation requires an enabled Install action and the explicit confirmation dialog.
- **Active plan override:** `customWorkoutPlan` remains the only plan override key used by the application.

#### Files changed

- `src/utils/workoutProgramManager.ts` — new typed local manager results, metadata/dismissal/backup helpers, canonical registry installation, verification, rollback, restore, update discovery, plan comparison, modified-plan comparison, and active/cloud protections.
- `src/components/WorkoutProgramManager.tsx` — new registry cards, statuses, read-only preview, comparison, confirmation/export, dismiss toggle, backup list, restore/export controls, notices, and state refresh behavior.
- `src/pages/PlanEditor.tsx` — embeds Workout Programs above the preserved Custom Plan Editor, tracks unsaved manual drafts, and keeps manual plan editing on `customWorkoutPlan`.
- `src/utils/settingsUtils.js` — adds a safe custom-plan save result, exports canonical plan normalization, includes Program Manager keys in explicit clear-all behavior, and prevents positional fallback targets from adding repetitions to duration exercises or duration to repetition exercises.
- `src/utils/storageUtils.js` — registers the three Program Manager JSON keys and adds safe raw-key existence detection for fail-closed active-workout protection.
- `src/App.css` — appended scoped Program Manager, preview, confirmation, backup, and responsive styling only.
- `docs/project-audit-report.md` — this Change Log row and Part 4A progress section.

No workout-program JSON, Exercise Library data, workout history schema, active-session schema, Supabase file, cloud service, package manifest, or unrelated page was changed by Part 4A.

#### New localStorage keys

- `installedWorkoutProgram` stores `{ id, version, installedAt }` for the last explicitly installed registry program.
- `dismissedWorkoutPrograms` stores version-specific `{ id, version, dismissedAt }` entries. Dismissing a program is an upsert, so the same identity is not duplicated.
- `workoutPlanBackups` stores at most five newest-first backup records in one array key. Each record contains a unique ID, creation timestamp, reason, previous program ID/version or nulls, and the normalized plan.

All three keys use `safeGetJSON`, `safeSetJSON`, and `safeRemove` paths. Every required manager getter/mutation returns an explicit success/failure result. A false `safeSetJSON` result is never reported as success. The keys are registered with the application storage-key and JSON-key lists; no timestamp-named localStorage keys are created.

#### Installation flow and rollback behavior

1. The requested ID/version is resolved back to its canonical registry clone; caller-supplied workout days are never trusted as the installation payload.
2. The canonical program is revalidated. Validation errors block installation; legacy compatibility warnings remain visible and non-blocking.
3. Cloud mode, an existing `activeWorkoutSession` key, and unsaved manual Plan Editor drafts block the UI action. The utility rechecks the supplied cloud-mode guard and active key at mutation time.
4. The effective current/custom plan and exact raw plan, installed-metadata, and dismissal key-presence/value snapshots are captured.
5. A normalized backup is successfully saved and verified before the active plan is changed.
6. The registry program days are normalized through the existing settings architecture and written to `customWorkoutPlan` with an exposed `safeSetJSON` result.
7. The stored plan is read back and compared with the expected canonical normalized plan.
8. Only after the plan passes readback verification is `installedWorkoutProgram` written and verified.
9. A matching dismissed identity is cleared last.

If the plan write/readback, metadata write/readback, or dismissal clearing fails after backup creation, the exact previous `customWorkoutPlan` presence/value, installed metadata, and dismissal data are restored and verified. A previously absent custom-plan or metadata key is removed during rollback rather than replaced with a default value. The safety backup remains available after a failed attempt. `workoutSessions`, `activeWorkoutSession`, completed records, and every unrelated storage domain are never written by the manager.

The shared normalizer was tightened for program installation: an explicit duration suppresses positional fallback repetitions and an explicit repetition target suppresses positional fallback duration. This preserves Version 2 swimming, carries, stretches, and recovery work as timed exercises after storage normalization.

#### Backup and restore behavior

- Backups are newest first and capped at five records inside `workoutPlanBackups`.
- Installation reasons use `Before installing <id> <version>`.
- Restore refuses while an active-workout key exists or while cloud mode is active.
- Restore finds and validates the selected backup, creates and verifies a safety backup of the currently saved plan, writes and verifies the selected normalized plan, and restores the backup's previous installed-program ID/version when both are present.
- Restored installed metadata receives the restore-time `installedAt` because the required backup record stores only previous ID/version. Null/null previous metadata removes the installed-program key.
- When restoring the oldest of five backups, retention preserves both the selected record and the new safety backup while evicting the oldest different record. The selected backup is never deleted automatically.
- Export Backup downloads only the selected backup record. No automatic delete-backup action was added.

#### Preview and comparison behavior

- Preview is read-only React state and invokes only registry, validation, normalization, and comparison reads. It performs no storage mutation.
- It shows program ID, name, version, description, updated date, day/exercise counts, goals, rules, benchmark exercise names/IDs, validation warnings, and all seven days.
- Every day shows name, focus, estimated time, exercise names, sets with repetition range or duration, and rest seconds.
- The simple comparison shows the saved current plan name, selected program name, current/new exercise-occurrence totals, changed day names, and exact-ID added/removed exercise sets. It does not build a line-by-line diff.
- Export Current Plan is always available, including during an active workout. It downloads only `exportedAt`, `installedProgram`, and the saved `customWorkoutPlan`; unsaved editor drafts are explicitly excluded and identified in the UI. No history, body, nutrition, photos, account data, or secrets are included.

#### Dismiss/Keep Current behavior

- Keep Current Plan adds only the exact program ID/version dismissal entry.
- It leaves `customWorkoutPlan`, `installedWorkoutProgram`, `workoutSessions`, and all unrelated data unchanged.
- Dismissed cards are hidden by default and can be shown again with the version-specific Dismissed status. Explicit installation clears the matching dismissal only after plan and metadata verification.

#### Active-workout and unsaved-draft protection

- Preview, current-plan export, and backup export remain available while an active workout exists.
- Install and Restore are disabled and both utilities fail closed whenever the `activeWorkoutSession` key physically exists, including malformed JSON.
- The UI shows: “Finish or discard the active workout before changing programs.”
- The manager never discards, rewrites, or replaces the active workout.
- Unsaved manual plan fields also disable Install and Restore so the visible draft cannot be silently replaced. Manual saves expose localStorage failure and keep the draft marked unsaved if persistence fails.

#### Cloud-mode restrictions

- Preview and exports remain available in cloud mode.
- Install and Restore buttons are disabled through the shared cloud/active predicate, their handlers guard again, and the local mutators receive the actual configured-and-signed-in cloud-mode value for a final refusal.
- The UI shows: “Cloud program installation will be added in Part 4B.”
- Part 4A neither writes a cloud plan independently nor calls Supabase. No Supabase schema, SQL, service, synchronization, or production data was changed.

#### Modified-after-install detection and manual editing

- Installed metadata remains intact after manual plan editing, as required.
- The badge “Modified after installation” compares the normalized saved `customWorkoutPlan` with the normalized installed registry program days, avoiding false differences from storage-added fields.
- Unsaved keystrokes use a separate draft warning rather than changing the installed-program badge.
- Existing day/exercise/library editing, saves, resets, adding, deleting, and ordering remain available under the explicitly labeled Custom Plan Editor.
- Program Manager state refreshes after saved plan revisions and on browser `storage`, focus, and visibility events so current/legacy/modified status and active-workout controls do not remain stale.

#### Focused verification and build result

- Prerequisite gate: Parts 1, 2A, 2B, and 3 passed inspection; both registry programs loaded, Version 2 had complete shared-library coverage and timed logging, the default stayed legacy, and `customWorkoutPlan` stayed the override.
- Registry/UI render: a Vite-loaded compiled render contained both program names, Workout Programs, Preview/Install/Current controls, current-plan export, and the backup section.
- Preview isolation: storage snapshots before and after registry/preview comparison generation were identical.
- Keep Current isolation: only the dismissal key changed; custom plan, installed metadata, and workout history remained byte-for-byte unchanged.
- Installation: Version 2 created a backup, wrote its seven normalized days/42 occurrences to `customWorkoutPlan`, preserved duration-only targets, and saved installed metadata only after plan verification.
- Failure injection: one-shot plan, metadata, and dismissal write failures all returned failure and restored the previous plan/metadata/dismissal snapshots. False storage writes never returned success.
- History: `workoutSessions` stayed byte-for-byte unchanged through install and restore checks.
- Active protection: valid and malformed active-session keys blocked install and restore without changing storage.
- Restore: the prior custom plan returned, a safety backup was added, prior installed metadata semantics were restored, and the selected backup remained present, including the oldest-of-five case.
- Cloud restriction: the cloud-disable predicate disabled both local changes and the mutators returned `cloud-mode` without storage changes when given active cloud mode.
- Manual editor: an ordinary manual save persisted, installed metadata remained unchanged, and canonical comparison detected the saved modification.
- CSS preservation: the pre-existing square-thumbnail/object-fit `src/App.css` hunks remained byte-for-byte present; all Part 4A CSS was appended under scoped Program Manager selectors.
- Browser limitation: the browser-control backend reported no available browser, so no click-through or screenshot was claimed. Equivalent isolated Vite-module localStorage checks and server-rendered compiled UI assertions passed.
- `npm run lint`: passed with only the pre-existing `react(only-export-components)` warning in `src/context/AuthContext.jsx`.
- `npm run typecheck`: passed.
- `npm run build`: passed on 2026-08-06; TypeScript and the Vite 8.1.4 production/PWA build completed successfully.
- No package or test framework was installed, and no full production checklist was run.

#### Scope confirmations

- **Workout history changed:** No. No code path or verification action rewrote `workoutSessions` or completed workout records.
- **Active workout contents changed:** No.
- **Body, nutrition, photo, reminder, sync, or account data changed:** No.
- **Supabase changed or written:** No.
- **Version 2 automatically activated:** No. It remains available until the user explicitly confirms local installation.
- **Unrelated `src/App.css` changes preserved:** Yes. The pre-existing thumbnail aspect-ratio/contain diff remains intact and the new additions are Program Manager-specific.
- **Packages installed, commit, push, or deployment:** None.

#### Remaining Part 4B work

- Define the cloud-side installed-program and backup/restore persistence model, synchronization/conflict rules, server-authoritative transaction flow, account-scoped permissions, and migration/rollback verification.
- Enable cloud Install and Restore only after those behaviors are implemented and tested. Part 4A deliberately does not mirror local manager keys or write local/cloud plans independently in cloud mode.

### Part 4B — Cloud Program Installation

- **Completion date:** 2026-08-06
- **Status:** Complete — authenticated online cloud users can explicitly install registry programs, restore cloud backups, reset the cloud custom plan to the current registry default, and dismiss an offered program without using the offline queue.
- **Default program:** `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`; `upper-recomposition@2.0.0` remains available but is not installed automatically.

#### Files changed

- `src/services/workoutProgramService.ts` — new cloud Program Manager orchestration, metadata validation/merge, local/cloud backup creation, install/restore/reset/dismiss operations, refetch verification, local commit, and verified rollback.
- `src/services/settingsService.js` — adds cloud-only settings/plan snapshot, write, and delete primitives that never update the local mirror or offline queue.
- `src/services/syncService.js` — hydrates account-scoped Program Manager metadata after the existing cloud settings download while backing up affected local mirror keys first.
- `src/components/WorkoutProgramManager.tsx` — enables authenticated online cloud Install, Keep Current, and Cloud backup Restore; adds operation states, reactive offline/active guards, backup-source labels, and unavailable-program messaging.
- `src/pages/PlanEditor.tsx` — routes authenticated reset through the verified cloud reset operation and propagates the existing data refresh signal.
- `src/App.tsx` — exposes the existing `dataVersion` refresh callback to Plan Editor and lets Plan Editor refresh its mirror without losing the completed operation notice.
- `src/utils/settingsUtils.js` — preserves unrelated and future settings fields during normalization and exposes verified local settings persistence.
- `src/utils/storageUtils.js` — registers an account-scoped cloud Program Manager cache key while retaining the separate Part 4A local-backup key.
- `docs/project-audit-report.md` — adds this section and the Part 4B Change Log row.

`src/App.css`, workout-program JSON, workout history/session code, active-workout contents, the Supabase client/auth context, schema/SQL, package manifests, and unrelated pages were not changed by Part 4B.

#### Cloud metadata location and structure

Program Manager cloud metadata is merged into the existing per-user `user_settings.settings` JSON document:

```text
workoutProgramManager: {
  installedProgram: { id, version, installedAt } | null,
  dismissedPrograms: [
    { id, version, dismissedAt }
  ],
  backups: [
    {
      id,
      createdAt,
      reason,
      previousProgram: { id, version, installedAt } | null,
      plan
    }
  ]
}
```

- Every write starts from the latest valid complete cloud settings object and replaces only its nested `workoutProgramManager` field. Unknown top-level, known nested, and future Program Manager fields are retained.
- Existing malformed settings or Program Manager metadata fail closed instead of being sanitized and overwritten.
- Cloud backups are validated, newest first, capped at three, and contain only a normalized workout plan plus program identity metadata. They never contain `workoutSessions` or other history.
- Part 4A local backups remain separately stored in `workoutPlanBackups`, newest first and capped at five.
- The local cloud metadata cache is scoped by user ID. Hydration never writes the cloud backup array into `workoutPlanBackups`.

#### Cloud installation sequence and verification

1. Recheck configured Supabase, authenticated user ID, `navigator.onLine`, and raw `activeWorkoutSession` key absence.
2. Resolve the requested ID/version back to the canonical registry program and validate it against the shared Exercise Library.
3. Fetch the current cloud settings and plan, capture the current local plan, and reject malformed cloud documents.
4. Create and verify a local backup, then merge, save, refetch, and verify a new cloud backup before replacing the plan.
5. Save the canonical normalized program days only to `custom_workout_plans.plan`.
6. Refetch the latest settings, merge installed ID/version/time, clear only the matching dismissal, retain at most three cloud backups, and save the complete settings document.
7. Refetch both cloud documents. Success requires the plan to match the selected program, the complete settings merge to match, installed metadata to match, and required backups to remain present.
8. Only after cloud verification, save and verify local `customWorkoutPlan`, installed/dismissed mirrors, user settings metadata, and the account-scoped cache.
9. Invoke the application `dataVersion` refresh callback only after that verified local commit.

The UI reports `Saving cloud plan…`, `Verifying cloud plan…`, and, when needed, `Restoring previous plan…`. `Installation complete` is shown only after both cloud readback and local commit succeed.

#### Failure and rollback behavior

- A plan-write failure never advances installed metadata or the local plan. Rollback restores and refetch-verifies the exact prior cloud plan presence/value and prior manager metadata while retaining the created safety backup.
- If the plan write succeeds but the final metadata write fails, the prior cloud plan is restored, the prior installed/dismissed metadata is restored, unrelated settings remain present, and the created local/cloud backups remain available.
- A cloud plan/settings mismatch during verification is failure, not partial success, and follows the same rollback path.
- A local commit failure after successful cloud verification also rolls back the cloud documents and verifies the exact pre-commit local snapshots. Overall rollback is reported successful only if every attempted cloud and local domain verifies.
- A failed and successfully rolled-back installation reports `Installation failed and previous plan restored`; incomplete rollback reports `rollback-failed` instead.
- Status callbacks are best-effort UI notifications and cannot interrupt persistence or rollback.

Because schema/RPC changes were prohibited, plan and settings writes span two existing tables and cannot be one database transaction. The flow minimizes the window by refetching immediately before each full settings merge and detects failures by readback, but a simultaneous write from another device can still race a whole-document write or rollback. This is the principal remaining cloud consistency risk.

#### Cloud backup restore behavior

- Cloud restore finds the chosen backup only in the authenticated account's hydrated/verified cloud metadata.
- It backs up the current local plan and effective current cloud plan before changing either active plan.
- It retains both the selected backup and the new safety backup while enforcing the three-record cap and newest-first display.
- It restores the selected plan to `custom_workout_plans.plan` and restores the backup's full previous installed-program metadata when present.
- The cloud plan, complete settings document, selected backup, and safety backup are read back before the local plan/metadata changes.
- Failure preserves the current local plan and attempts verified cloud rollback. `workoutSessions` is never read or written by the operation.

#### Cloud reset behavior

- Authenticated cloud reset never falls through to the old local-only reset.
- It creates local and cloud safety backups, deletes the user's `custom_workout_plans` row with the cloud-only persistence primitive, and refetches to prove the row is absent.
- It then saves and verifies installed metadata for the current registry default.
- Only after both cloud conditions pass is local `customWorkoutPlan` removed. The effective local fallback is normalized and compared with the registry default.
- Reset does not alter workout history or activate Version 2; the registry default is still legacy Version 1.

#### Keep Current Program and cloud hydration

- In cloud mode, Keep Current Program merges a version-specific dismissal into `user_settings.settings`, verifies it, and only then updates the local dismissed cache. It does not queue offline, change the custom plan, or touch history.
- Cloud download continues to use the existing backup-before-overwrite hydration convention. It hydrates installed/dismissed metadata and the account-scoped cloud backup cache, while preserving the Part 4A local backup list.
- Metadata for a registry program absent from this build is retained. The UI shows `Installed program unavailable in this build.` and does not remove the active custom plan.

#### Offline and active-workout restrictions

- Cloud Install, Cloud backup Restore, cloud reset, and cloud Keep Current are disabled while offline. The service independently rechecks connectivity and returns: `Connect to the internet before changing a cloud workout program.`
- No Program Manager action is added to `pendingSyncQueue`; program replacement is never deferred for later sync.
- Install, Cloud Restore, and cloud reset are disabled and independently rejected whenever the raw `activeWorkoutSession` key exists, including malformed stored data.
- Preview and exports remain available. Keep Current remains allowed during an active workout because it changes only dismissal metadata, not a workout plan or session.

#### Focused verification results

The required focused checks were run with an ephemeral Vite-loaded Node assertion harness, in-memory localStorage, and an injected fake cloud store. The harness used a dummy configured Supabase environment only to exercise production guards and made no network or real Supabase request. The temporary harness was removed afterward.

1. **Offline Install:** passed — exact message returned, zero cloud operations, and no local plan/queue change; UI predicates disable cloud Install/Restore offline.
2. **Active workout:** passed — Install and Restore returned `active-workout` before any cloud operation; UI buttons include the same guard.
3. **Version 2 cloud plan:** passed — canonical normalized Version 2 days were written to the fake `custom_workout_plans.plan` document.
4. **Installed metadata merge:** passed — ID/version/time, matching-dismissal removal, and cloud backup metadata were nested under `workoutProgramManager`.
5. **Existing settings preservation:** passed — profile data, unknown top-level/nested settings, and an unknown Program Manager field remained deeply equal.
6. **Cloud-before-local ordering:** passed — the harness asserted the old local plan during every cloud call; the local plan write occurred only after the final cloud plan/settings refetch.
7. **Metadata-save failure:** passed — a simulated final settings-write failure restored and verified the previous cloud plan/metadata, preserved the created backup, returned failure, and left local plan/history/queue unchanged.
8. **Cloud backup restore:** passed — the selected previous cloud plan returned to cloud and local storage, prior installed metadata returned, the selected backup remained, and a safety backup was added within the three-record cap.
9. **Cloud reset ordering:** passed — cloud plan deletion and absent-plan/settings verification preceded local custom-plan removal; local fallback matched the registry default.
10. **Workout history isolation:** passed — the raw `workoutSessions` value remained byte-for-byte unchanged through install, rollback, restore, reset, dismissal, and hydration checks.
11. **No automatic Version 2 activation:** passed — module loading caused no storage write and `CURRENT_DEFAULT_PROGRAM_ID` remained `legacy-workout-v1`.
12. **CSS preservation:** passed — the pre-existing square-thumbnail `aspect-ratio: 1 / 1`, `height: 100%`, and `object-fit: contain` diff and the Part 4A scoped Program Manager CSS remain present; Part 4B did not edit `src/App.css`.

#### Build result and scope confirmations

- `npm run build`: passed on 2026-08-06. TypeScript completed; Vite 8.1.4 transformed 2,519 modules; PWA output was generated. Vite retained its non-fatal large-chunk warning.
- **Supabase schema changed:** No. No table, column, policy, migration, SQL, or deployed cloud data was changed by this implementation/verification.
- **Workout history changed:** No. No history migration or existing `workoutSessions` rewrite occurred.
- **Active workout contents changed:** No.
- **Version 2 automatically activated:** No. Installation remains an explicit confirmed action; reset selects the legacy registry default.
- **Offline queue used for program changes:** No.
- **Packages installed:** No.
- **Commit, push, or deployment:** None.
- **Full production checklist:** Not run, as required by the focused Part 4B scope.

#### Remaining Part 5 work

- No Part 5 specification is present in the repository or the Part 4B request, so no Part 5 implementation is claimed.
- A future Part 5 should perform real signed-in browser/mobile/PWA acceptance against a non-production Supabase account, including RLS, network interruption, session refresh, and multi-device conflict cases.
- If stronger multi-device atomicity is required, add an authorized compare-and-swap/RPC design for the two-document plan/settings transaction; Part 4B could not add schema or database functions.
- The full production checklist, preview deployment, live-data backup, monitored rollout, and any decision to make Version 2 a default remain deferred.

### Part 5A — Historical Exercise Compatibility

- **Completion date:** 2026-08-06
- **Status:** Complete — historical exercise identity is resolved conservatively at read time; removed and unknown exercises remain visible without rewriting stored sessions.
- **Default program:** `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`. Version 2 remains available only through explicit Program Manager installation.

#### Files created

- `src/data/exerciseIdentity.ts` — central identity types, conservative normalization and aliases, library resolution, archive detection, movement-family metadata, identity equality, and the active-plus-historical exercise catalog.

#### Files modified

- `src/data/exerciseLibrary.ts` — separates and exports the 12 performance-safe historical ID aliases while keeping the broader `barbell-dumbbell-curl` mapping guide-only.
- `src/data/workoutSessions.ts` — makes previous-performance lookup accept an ID/name identity while retaining the name-only call form.
- `src/utils/liveWorkoutUtils.ts` — makes best-performance lookup identity-aware without changing session creation or the timed logging model.
- `src/utils/progressionUtils.ts` — carries exercise IDs into history lookup and applies ID/name/explicit-alias matching without changing progression rules or timed guidance.
- `src/utils/progressUtils.ts` — makes strength charts identity-aware, aggregates matching records per session, and changes legacy muscle fallback to reliable shared-library resolution or `Other`.
- `src/pages/TodayWorkout.tsx` — supplies the current exercise ID to previous, best, and progression lookup.
- `src/pages/Dashboard.tsx` and `src/pages/Coach.jsx` — supply the effective library to their existing current-workout progression lookup without changing Dashboard targets or Coach rules.
- `src/pages/Progress.tsx` — replaces the active-plan-only strength list with an active-first union catalog and keeps next-workout suggestions restricted to active exercises.
- `src/components/ProgressChart.tsx` — supports read-only status badges and explanatory text for archived/unknown chart selections.
- `src/components/WorkoutHistoryTable.tsx` — shows each recorded exercise name plus read-time Archived/Unknown status instead of hiding historical identities behind a count.
- `src/components/WorkoutDetailModal.tsx` — preserves the recorded heading, adds archive/unknown/current-library metadata, and continues to show every logged set field.
- `src/utils/exportUtils.js` — preserves recorded CSV labels, adds Exercise ID/resolved ID/archive columns, and retains both repetitions and duration values; JSON backup remains raw.
- `src/print/PrintableWorkoutSession.jsx` — keeps recorded names, adds archive/unknown and pain labels, preserves repetitions and duration, and retains exercises with zero stored sets.
- `src/pages/ExportPrint.jsx` — supplies the active plan and effective library to completed-session printing.
- `src/utils/printUtils.js` — adds print-only styling for exercise compatibility labels; Weekly Review calculations and benchmarks were not changed.
- `docs/project-audit-report.md` — adds this section and the Part 5A Change Log row.

`src/services/workoutService.js`, `src/services/syncService.js`, session completion builders, workout-program installation services, Supabase files, package manifests, Weekly Review logic, Coach rules, Dashboard targets/copy, workout-program JSON, registry defaults, and `src/App.css` required no Part 5A change.

#### Identity resolution priority

The resolver returns newly allocated metadata and never mutates its input or a library record:

1. Exact valid `exerciseId` in the supplied/effective Exercise Library.
2. One of the explicitly approved historical ID aliases.
3. Exact conservatively normalized current library name.
4. One of the explicitly approved conservatively normalized historical-name aliases.
5. Unresolved historical identity with `canonicalId: null`, the exact recorded `originalName`, and source `unknown`.

Normalization only case-folds, removes diacritics, normalizes punctuation/dashes, and collapses whitespace. It does not remove meaningful qualifiers such as paused, front, sumo, weighted, dumbbell, or barbell. Two conflicting IDs never fall through to movement-family or fuzzy-name matching.

For strength and progression history, exact IDs are authoritative for ID-bearing records. ID-less legacy records use exact normalized names and then only the explicit alias tables. Movement family is never a performance key.

#### Legacy aliases added

The 12 approved historical ID mappings are shared by the existing guide lookup and the new performance-safe resolver:

- `pull-ups` → `pull-up`
- `chin-ups` → `chin-up`
- `barbell-row-volume` → `barbell-row`
- `dead-bug-rounds` → `dead-bug`
- `side-plank-rounds` → `side-plank`
- `lateral-raise` → `dumbbell-lateral-raise`
- `hanging-knee-raise-leg-raise` → `hanging-knee-raise`
- `dumbbell-fly-squeeze-press` → `dumbbell-fly`
- `triceps-extension-skull-crusher` → `triceps-extension`
- `optional-vr-boxing-skipping-rope` → `vr-boxing`
- `pike-push-up-dumbbell-shoulder-press` → `pike-push-up`
- `weighted-glute-bridge-hip-thrust` → `hip-thrust`

Explicit historical label compatibility covers Pull-ups/Pullups, Chin-ups/Chinups, Dead Bug Rounds, Side Plank Rounds, Lateral Raise, the approved combined legacy movement labels above, Standing Calf Raise, and Light walking only. Barbell Row, Dead Bug, Side Plank, and Calf Raise already resolve as exact normalized library names. The guide-only `barbell-dumbbell-curl` mapping was deliberately excluded from performance identity because barbell and dumbbell loads are not safely interchangeable.

No alias was added between Bench Press and Paused Barbell Bench Press, Pull-Up and Weighted Chin-Up, Squat and Front Squat, Romanian Deadlift and Sumo Deadlift, Hanging Knee Raise and Hanging Leg Raise, or Incline Dumbbell Press and Incline Barbell Press.

#### Movement-family behavior

The resolver optionally exposes explicit broad families including horizontal press, vertical press/pull, horizontal pull, squat, hip hinge, calf raise, hanging abs, and core stability. This metadata is available only for related-exercise display, archive/replacement navigation, and future migration assistance. It is not read by strength charts, progression, volume, personal records, or identity de-duplication. Exercises in the same family therefore remain separate performance histories unless an explicit identity alias exists.

#### Future completed-session identity fields

Part 3 was reverified and not duplicated. Both standard and live completion already preserve `exerciseId`, the original `exerciseName`, `muscleGroup`, `targetSets`, `targetReps`, and `targetDuration`. Local saving retains the full object; `workout_sessions.raw_data` retains the full object; service/cloud download prefers that raw object. These fields remain optional for legacy sessions. No old record or `workoutSessions` array was migrated or rewritten.

#### Historical display and archived exercise behavior

- Workout History now lists exact recorded exercise names and read-time status metadata.
- Workout Details continues to use the exact recorded name as the heading and shows repetitions, duration, weight, RPE, pain, and notes. It may show a secondary current-library match, but never renames the row.
- An identity absent from the active plan receives `Archived exercise`; it remains present in the session, detail view, Progress catalog, chart, CSV, JSON, and print view.
- `Unknown exercise` appears only when neither a library record nor an explicit ID/name alias resolves. Unknown names remain intact and selectable, and can also be archived.
- Archive and unknown flags are calculated from cloned read-time metadata. Stored sessions remain unchanged.

#### Progress catalog and strength matching

Progress uses the conservative union of active-plan exercises and all exercise IDs/names found in workout history. Active identities are listed first; historical-only identities follow. Exact/aliased duplicates are removed by canonical identity, while unresolved IDs and normalized unknown names remain separate when uncertain.

The Exercise history selector exposes active, archived, and unknown entries. Selecting an archived exercise renders its existing strength chart and states that it is not in the current program; it never suggests that data was deleted. The chart matches future records by ID and legacy records by exact normalized name or explicit alias. A session containing multiple compatible records is aggregated into one best point for that session. Timed-only sets remain excluded from strength values.

Bench Press/Paused Barbell Bench Press and Squat/Front Squat were explicitly verified as separate. The same code path keeps all other prohibited benchmark pairs separate. Shared movement-family metadata does not affect the result.

#### Progression compatibility

Progression history and latest-result lookup now accept an exercise identity. Today Workout supplies `exerciseId` for previous-set, best-performance, and progression lookup, so new records are matched by ID. ID-less legacy names use conservative normalization and explicit aliases only. The progression decision algorithm was not redesigned, and the neutral `Maintain Duration` guidance for timed exercises remains unchanged.

Archived exercise history can still be analyzed through the shared progression helper, but the Progress page's `Next Workout Suggestions` list is built only from active catalog entries. Archived exercises are not presented as part of today's program.

#### Muscle attribution behavior

Future records continue to prefer their stored `muscleGroup`. A legacy record without that field resolves through the effective shared Exercise Library by exact ID/name or explicit alias and uses the reliable library muscle/category metadata. An unresolved name is assigned `Other`; no arbitrary exercise-name keyword inference is used. Unknown and `Other` exercises remain visible.

#### Export and print behavior

- Workout CSV retains the exact stored `exerciseName`, includes `Exercise ID` when present, and adds optional resolved canonical ID and Archived columns. Repetition and duration columns retain their independently stored values.
- Full JSON export still returns the raw stored `workoutSessions` array, so old labels are neither normalized nor replaced and future IDs remain present.
- Completed-session print keeps the recorded exercise label, adds Archived/Unknown metadata, prints pain plus all other set fields, and no longer drops a historical exercise merely because its `sets` array is empty.
- Weekly Review print and benchmark logic were not changed.

#### Focused verification results

An ephemeral Vite-loaded Node assertion harness used in-memory fixtures and server-rendered history/print components. It created no framework, made no network/Supabase request, did not write repository data, and was removed after the run. All 14 checks passed:

1. Exact future `exerciseId` won over a deliberately conflicting recorded name.
2. A future completion retained ID, original name, muscle group, target sets, target repetitions, and target duration.
3. An ID-less legacy exercise remained catalogued, and Pull-ups resolved through its explicit alias.
4. Bench Press and Paused Barbell Bench Press stayed separate even though both expose `horizontal-press`.
5. Squat and Front Squat stayed separate.
6. The active-first Progress catalog included resolved archived history and an unknown historical name.
7. Server-rendered history/details preserved the exact unknown name, Archived/Unknown badges, repetitions, duration, weight, RPE, pain, and notes.
8. Progression history selected the ID-bearing Paused Bench record and did not absorb legacy Bench Press.
9. Timed progression retained neutral `Maintain Duration` guidance.
10. Legacy Pull-ups muscle attribution resolved to Back, an unresolved legacy name resolved to Other, and a stored future Chest value remained authoritative.
11. CSV/JSON retained the original `Bench Press` label while CSV included its future `paused-barbell-bench-press` ID and repetitions.
12. Print retained original names, archive/unknown labels, pain/notes, and an exercise with zero sets.
13. `CURRENT_DEFAULT_PROGRAM_ID` remained `legacy-workout-v1`; square-thumbnail/object-fit and Program Manager CSS remained present.
14. Every identity/history/catalog/export read left the original workout-session fixtures deeply equal to their pre-check snapshot.

Additional focused quality checks:

- `npm run lint`: passed with the existing non-fatal `react(only-export-components)` warning in `src/context/AuthContext.jsx`.
- `git diff --check`: passed.
- The full production checklist was not run.

#### Build result and scope confirmations

- `npm run build`: passed on 2026-08-06. TypeScript completed; Vite 8.1.4 transformed 2,520 modules; PWA output was generated. Vite retained its non-fatal large-chunk warning.
- **Old workout history rewritten:** No. The implementation contains no migration and the focused fixtures remained deeply unchanged.
- **Version 2 automatically activated:** No. The registry default remains `legacy-workout-v1`, and installation still requires explicit confirmation.
- **Supabase schema changed:** No. No schema, SQL, migration, table, column, policy, RPC, or deployed data was changed.
- **Workout-program installation behavior changed:** No. Only read-time identity lookup was added.
- **Weekly Review benchmarks changed:** No.
- **Coach rules changed:** No.
- **Dashboard targets or weekly target/“6 on · 1 recovery” copy changed:** No.
- **Packages installed:** No.
- **Commit, push, or deployment:** None.
- **`src/App.css` changed by Part 5A:** No. The pre-existing square-thumbnail/object-fit diff and scoped Program Manager CSS remain intact.

#### Remaining Part 5B work

- Weekly Review benchmark selection, Coach rules, Dashboard targets, weekly target copy, and `6 on · 1 recovery` messaging remain deferred exactly as required by the Part 5A scope.
- Any decision to activate Version 2 by default, offer replacement-exercise selection, migrate historical records, or combine broader movement-family performance requires a separate explicit specification and remains unimplemented.
- Signed-in browser/mobile/PWA acceptance, non-production Supabase verification, the full production checklist, preview deployment, monitored rollout, and multi-device conflict work remain deferred.

### Part 5B — Program-Aware Pages and Rules

- **Completion date:** 2026-08-06
- **Status:** Complete — application workout targets, labels, benchmarks, recommendations, demo sessions, print data, and plan exports now resolve from the active program context.
- **Default program:** `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`; `upper-recomposition@2.0.0` remains available only through explicit Program Manager installation.

#### Files created

- `src/utils/activeWorkoutProgram.ts` — synchronous active-program metadata resolution plus pure training/rest, exercise, benchmark, and day-label calculation helpers.

#### Files modified

- `src/pages/Dashboard.tsx` — derives target, current day/focus, program metadata, benchmarks, prior performance, and review/coach inputs from the active program.
- `src/pages/WeeklyPlan.tsx` — replaces fixed schedule copy with active program metadata, goals, scheduled-session/rest counts, and modified status.
- `src/pages/WeeklyReview.jsx` — resolves program benchmarks through the effective library and supplies active program data to scoring, advice, and print.
- `src/pages/Coach.jsx` — supplies active day, focus, exercises, rules, benchmarks, and installed program metadata to coach calculations.
- `src/pages/TodayWorkout.tsx` — supplies active program/library identity to pre-workout coaching and program metadata to today-workout print.
- `src/pages/ExportPrint.jsx` — uses the active program for plan/today/review print data and exposes active workout-plan JSON export.
- `src/components/ExerciseDetailModal.tsx` — resolves related workout-day labels from the active program.
- `src/components/WorkoutProgramManager.tsx` — routes current-plan JSON download through the shared program-aware export builder.
- `src/data/userProfile.ts` — removes legacy program-owned weekly completion and static benchmark target data while retaining genuine user/profile defaults.
- `src/utils/weeklyReviewUtils.js` — removes the fixed benchmark array, exact-name-only performance matching, fallback target of six, fixed Day 6 advice, and legacy plan volume thresholds.
- `src/utils/coachUtils.js` — derives exercise, rest-day, core/posture, volume, and progression advice from the active program while retaining the readiness calculation.
- `src/utils/progressUtils.ts` — generates demo sessions from active non-rest days and preserves active exercise IDs, names, targets, muscle groups, and duration mode.
- `src/utils/printUtils.js` — builds weekly plan and review print data with active metadata, benchmarks, identity matching, effective-library muscle attribution, and printed date.
- `src/utils/exportUtils.js` — adds the exact active-plan JSON envelope and exported timestamp without changing raw history export.
- `src/print/PrintableWeeklyPlan.jsx` — prints program name/ID/version, modified status, and date.
- `src/print/PrintableTodayWorkout.jsx` — prints program name/ID/version, modified status, program posture rule, and date.
- `src/print/PrintableWeeklyReview.jsx` — prints active program metadata/date and the already program-resolved benchmark comparison.
- `docs/project-audit-report.md` — adds this progress section and the Part 5B Change Log row.

No workout-program JSON, installation transaction, storage key, workout-history schema, Supabase file, package manifest, or `src/App.css` rule was changed by Part 5B.

#### Active program context behavior

`getActiveWorkoutProgram()` reads days through the existing `getCustomWorkoutPlan()` path and reads installed identity through the existing Program Manager metadata getter. It does not replace or write active-plan storage.

Resolution order is:

1. Recognized installed `id` + `version`: return registry name, description, goals, rules, benchmark IDs, and the active stored days; set `installed: true`; compare normalized registry/stored days and set `modifiedAfterInstallation` when they differ.
2. Stored custom plan without recognized installed metadata: return `Custom Workout Plan`, null ID/version, empty registry metadata, `source: custom`, and the active stored days.
3. No stored custom plan: return the current registry default metadata with the legacy getter fallback days and `source: legacy-default`.

The context always supplies fresh arrays/objects for days, goals, rules, and benchmarks. Merely importing the registry or resolving the context performs no installation or storage write.

#### Training and rest-day derivation

- `isRestDay`, `getTrainingDays`, `getRestDays`, and `getWeeklyWorkoutTarget` are the shared source for schedule counts.
- An exact `Rest` day is rest. A clearly recovery-only day is rest only when it has no real prescribed training. A focus label containing Recovery is insufficient by itself.
- Legacy resolves to six scheduled sessions and one rest day.
- Version 2 resolves to six scheduled sessions and one rest day; `Swimming and Posture Recovery` remains a training session and Day 7 remains rest.
- Day/exercise ID/count/benchmark lookup and `Day X · Actual Name` formatting are centralized alongside these helpers.

#### Dashboard and Weekly Plan

- Dashboard weekly percentage and progress bars use the active non-rest-day target and handle a zero-session custom plan without division by zero.
- The hero identifies the active program name/version/modified state and the actual current day name/focus. The existing Workout card remains the exercise preview for that resolved day.
- Dashboard benchmarks resolve stable active-program IDs through the effective Exercise Library. Previous performance uses ID-first matching and Part 5A aliases; progression receives the matching active plan exercise and identity.
- A custom plan with no benchmark metadata gets up to three sensible repetition-based active exercises in memory only. Nothing is written to storage.
- The legacy registry currently declares no benchmark IDs, so the legacy Dashboard shows an explicit no-benchmarks state instead of silently reintroducing hardcoded Bench/Pull-up/Plank cards.
- Weekly Plan retains the seven-day card layout, displays program name/version/goals/modified state, and replaces `6 on · 1 recovery` with derived `N scheduled sessions · N rest days` copy.

#### Weekly Review benchmarks and rules

- The fixed eight-name legacy benchmark array was removed. Registered programs use every benchmark ID that resolves through the effective library; custom/no-metadata plans may use the same read-only three-exercise fallback as the Dashboard.
- `getStrengthComparison` accepts ID/name identities and uses `exerciseIdentitiesMatch`: ID-bearing sessions match by ID; ID-less history uses exact normalized names and the explicit Part 5A aliases only.
- Movement family is never a performance key. Bench Press/Paused Barbell Bench Press, Squat/Front Squat, Romanian Deadlift/Sumo Deadlift, and Hanging Knee Raise/Hanging Leg Raise remain separate.
- Completion target/missed-day calculations use active non-rest days. Muscle-volume targets and session frequencies are calculated from active focus labels, exercise muscle groups, and planned sets.
- Next-week focus and warnings use missed active-day details and scheduled muscle/exercise data; the fixed `Day 6 abs/posture` and fallback Pull-up recommendation were removed.
- The 40/15/10/25/10 general score categories remain; their workout, abs/posture, and progression inputs are now program-aware.

#### Coach behavior

- The readiness calculation remains intact.
- Today advice uses the current active day name/focus/exercise identities, recent completed-session RPE/pain, program effort/posture rules, and program name/version.
- Scheduled rest advice is gated by `isRestDay`; Version 2's swimming/recovery training day is not treated as full rest.
- Timed exercises remain outside load/repetition progression and receive neutral controlled-duration guidance.
- Abs/posture targets and recommended exercise names come from active training days, focus arrays, and exercise muscle groups rather than legacy exercise lists or fixed 3/4 targets.
- Strength-trend and current-exercise matching uses the Part 5A identity resolver, so archived history remains readable without becoming today's recommendation.

#### Exercise Detail and user profile targets

- Exercise Detail removed its seven-item static legacy map. A related day now renders the active program's actual label and falls back to `Day X` when the legacy day number has no active match.
- `userProfile.weeklyCompletion` and `userProfile.lastPerformance` were legacy workout-program defaults and were removed as application target sources.
- Actual user measurements, abilities, body goals, equipment, and posture reminder remain unchanged. The retained `Pull-ups: 15` string is a user ability, not an active-plan benchmark definition.

#### Progression compatibility

- The Part 5A algorithm remains ID-first for new records and exact-name/explicit-alias-only for legacy records.
- Dashboard, Coach, Today Workout, Weekly Review, and print now pass the active exercise identity and effective library into progression/history lookup.
- Archived exercises can retain historical charts/progression analysis but are never added to today's target list.
- Timed exercises retain neutral `Maintain Duration` behavior. Program benchmark IDs select identities; they do not alter progression scoring.

#### Print and export metadata

- Weekly Plan and Today Workout printouts include printed date, program name, ID/version when known, and modified-after-installation status.
- Today Workout uses the active program posture rule when present and a neutral control fallback otherwise.
- Weekly Review screen and print are built from the same active benchmark identities, including the custom read-only fallback, and use the effective library for muscle attribution.
- Current-plan JSON export is `{ exportedAt, program: { id, version, name, modifiedAfterInstallation }, days }`. Both Plan Editor's Program Manager and Export & Print use the shared builder.
- Full backup/CSV/completed-session print continue to preserve every stored workout-history name and ID exactly as recorded; no historical normalization or migration was added.

#### Demo-data behavior

- Weekly Review demo workouts now select active non-rest days instead of fixed legacy days/exercise names.
- Generated sessions snapshot the active workout name/day plus actual exercise ID, name, muscle group, set target, repetition target, duration target, and duration-mode `timeSeconds` where applicable.
- Re-adding demos replaces only generated `demo-<day>-<date>` records. It does not modify real session IDs or contents.
- A Version 2 fixture generated four sessions with active IDs, no legacy Bench/RDL labels, and duration sets for timed work.

#### Hardcoded assumptions removed and retained aliases

Removed as active-plan logic: the profile target of six; `6 on · 1 recovery`; the fixed Weekly Review benchmark names; static Dashboard performance targets; exact-name-only benchmark comparison; generic fallback target of six; the static seven-day Exercise Detail label map; `Day 6 abs/posture`; Pull-up fallback advice; fixed abs/posture frequencies; legacy demo exercises; and the old `{ installedProgram, customWorkoutPlan }` plan-export shape.

Intentionally retained:

- Real Exercise Library and workout-program exercise names.
- The conservative Part 5A historical ID/name aliases documented above, including Pull-ups/Pullups and the approved composite legacy labels.
- No alias between any prohibited distinct movement pair and no performance use of movement-family metadata.
- User ability/profile copy such as `Pull-ups: 15`, which is not used for benchmarks, targets, review scoring, or coach exercise selection.

#### Focused verification results

An ephemeral Vite-loaded Node harness used in-memory localStorage fixtures plus server-rendered print components. It created no framework, made no Supabase/network request, did not touch real browser or workout data, and was removed. All 12 grouped runtime assertions passed:

1. Legacy default resolved to six scheduled sessions and one rest day.
2. Version 2 resolved to six scheduled sessions and one rest day; Swimming/Posture Recovery stayed training and Day 7 stayed rest.
3. Weekly Plan source no longer contains `6 on · 1 recovery`.
4. Active benchmarks changed from the legacy program's empty configured set to all seven resolved Version 2 IDs; custom fallback returned three without storage writes.
5. Weekly Review and print used active benchmark IDs and returned all seven Version 2 comparisons.
6. A mixed fixture with Bench Press at 200 kg and Paused Barbell Bench Press at 60 kg reported the Paused benchmark as 60 kg; histories stayed separate.
7. Coach named the active Version 2 day/focus, did not recommend legacy Bench Press, and returned scheduled-rest advice for the active Rest day.
8. Active day labeling returned the full Version 2 Day 1 name; Exercise Detail's old static `Chest Heavy` label was absent. A separate SSR check rendered the full active related-day label.
9. Weekly Review print used active benchmarks and preserved the same 60 kg Paused/200 kg legacy Bench separation.
10. Plan export had exactly `exportedAt`, `program`, and `days`; program ID/version/name/modified status and all seven days were present.
11. A manual edit to installed Version 2 set `modifiedAfterInstallation: true`; Weekly Plan and print expose that status.
12. Registry loading performed zero storage writes, the default ID remained `legacy-workout-v1`, Version 2 was not installed, and the pre-existing square-thumbnail/object-fit plus scoped Program Manager CSS markers remained present.

Additional focused checks passed: active-program/custom/rest runtime fixtures, Version 2 ID/duration demo fixtures, `npm run typecheck`, `npm run lint` (only the pre-existing `AuthContext.jsx` Fast Refresh warning), and `git diff --check`.

The in-app browser skill was initialized for rendered click-through verification, but the environment exposed no browser backend. No visual/click-through result is claimed. The full production checklist was not run.

#### Build result and scope confirmations

- `npm run build`: passed on 2026-08-06. TypeScript completed; Vite 8.1.4 transformed 2,521 modules; PWA output and 59 precache entries were generated.
- **Workout history rewritten:** No. No migration or rewrite was added; full export/CSV/print retain recorded labels and IDs.
- **Version 2 automatically activated:** No. Default remains `legacy-workout-v1`; installation still requires the existing explicit confirmation flow.
- **Supabase schema changed:** No. No schema, SQL, migration, table, column, policy, RPC, or deployed data was changed.
- **Workout-program installation logic changed:** No. Only current-plan export formatting was routed through a shared pure builder; local/cloud install transactions were untouched.
- **Packages installed:** No.
- **Commit, push, or deployment:** None.
- **`src/App.css` changed by Part 5B:** No. The pre-existing 475-line/7-line working-tree diff and the audited thumbnail/object-fit plus Program Manager markers remain intact.

#### Remaining final deployment work

- Complete signed-in desktop/mobile/PWA browser acceptance when a browser backend is available.
- Run the existing non-production Supabase verification with authorized test data and confirm multi-device hydration/conflict behavior.
- Follow the documented production checklist: backup, privacy/security confirmation, preview deployment, smoke test, monitored rollout, and rollback readiness.
- Do not change the default program or auto-activate Version 2 without a separate explicit decision.

### Part 5C — Standalone Full Body Reset

- **Completion date:** 2026-08-06
- **Status:** Complete — Version 2 provides Full Body Reset as an explicitly selected standalone workout without changing the seven-day schedule.
- **Default program:** `CURRENT_DEFAULT_PROGRAM_ID` remains `legacy-workout-v1`; `upper-recomposition@2.0.0` and Full Body Reset remain available only after explicit Program Manager installation.

#### Files changed

- `src/types/workoutProgram.ts` — adds the JSON-compatible `StandaloneWorkout` interface and optional `WorkoutProgram.standaloneWorkouts`.
- `src/utils/workoutProgramValidation.ts` — independently validates optional standalone metadata, identities, exercise targets, fields, and shared-library resolution without adding standalone workouts to day-order validation.
- `src/data/workout-programs/upper-recomposition-v2.json` — adds Full Body Reset and its 11 shared-library exercises after the unchanged seven scheduled days.
- `src/data/workout-programs/_template.example.json` — adds one small documentation-only standalone example.
- `docs/adding-workout-programs.md` — documents optional standalone workouts, lack of a day number, schedule isolation, shared Exercise Library IDs, multiple entries, and example uses.
- `src/utils/activeWorkoutProgram.ts` — exposes cloned standalone definitions only from the active installed registry program; custom and legacy-default contexts expose an empty list.
- `src/pages/TodayWorkout.tsx` — renders Extra Workouts details, starts the selected standalone through the existing live flow, and rechecks active-session protection before any start.
- `src/App.css` — adds scoped Extra Workouts card styles while retaining the unrelated thumbnail and Program Manager changes already in the working tree.
- `src/data/workoutSessions.ts` — adds optional session identity fields, permits a null standalone day, and marks new scheduled sessions explicitly.
- `src/utils/liveWorkoutUtils.ts` — creates, normalizes, persists, and completes scheduled/standalone sessions without coercing a standalone to Day 0 or another scheduled day.
- `src/components/LiveWorkoutHeader.tsx`, `src/components/WorkoutFinishSummary.tsx`, and `src/components/UnfinishedWorkoutPrompt.tsx` — display the standalone label throughout active, recovery, and completion screens.
- `src/utils/weeklyReviewUtils.js`, `src/pages/WeeklyReview.jsx`, and `src/print/PrintableWeeklyReview.jsx` — separate total sessions, scheduled-day adherence, and standalone count while retaining all completed sets, duration, and muscle volume.
- `src/pages/Dashboard.tsx` and `src/utils/coachUtils.js` — keep weekly progress and coaching adherence tied only to completed scheduled days.
- `src/components/WorkoutHistoryTable.tsx` and `src/components/WorkoutDetailModal.tsx` — show Full Body Reset with a `Standalone workout` label and retain duration output.
- `src/utils/exportUtils.js` — adds session type/standalone ID CSV fields, separate weekly counts, raw JSON identity preservation, and standalone definitions in plan JSON.
- `src/print/PrintableWorkoutSession.jsx` — labels the completed session type and prints timed sets.
- `src/data/exerciseIdentity.ts`, `src/pages/Progress.tsx`, and `src/pages/ExportPrint.jsx` — let history/detail/print identity checks include standalone exercise containers without inventing day numbers or changing scheduled progression suggestions.
- `docs/project-audit-report.md` — adds this Part 5C record and Change Log row.

No Supabase, package-manifest, lockfile, schema, migration, or deployment file changed for Part 5C.

#### StandaloneWorkout schema

```ts
interface StandaloneWorkout {
  id: string
  name: string
  description: string
  recommendedUse: string
  estimatedTime: string
  focus: string[]
  rules?: string[]
  exercises: Exercise[]
}

interface WorkoutProgram {
  // existing program fields
  days: WorkoutDay[]
  standaloneWorkouts?: StandaloneWorkout[]
}
```

The shape is plain JSON data and reuses the existing `Exercise` type. It has no `day` field. Programs that omit `standaloneWorkouts` remain valid.

#### Validator changes

- `standaloneWorkouts`, when supplied, must be an array.
- Standalone workout IDs must be non-empty and unique within the program.
- Name, description, recommended use, and estimated time must be non-empty strings; focus must be an array; optional rules must contain only non-empty strings.
- Exercises must be a non-empty array with unique IDs inside that standalone workout.
- Every exercise follows the existing scheduled-exercise field validation and must contain exactly one of `repRange` or `duration`.
- When the shared-library ID set is supplied, an unresolved standalone exercise ID is a validation error. Full Body Reset resolves all 11 IDs without adding or duplicating a library record.
- Standalone workouts never enter the scheduled day-number, duplicate-day, seven-day, or sequential-order calculations.

#### Full Body Reset structure

Full Body Reset is a moderate 45–60 minute return session with the requested description, recommended-use guidance, ten focus labels, five load/effort/recovery rules, and these shared-library exercises:

1. Front Squat — 3 × 6–10.
2. Romanian Deadlift — 2 × 8–12.
3. Paused Barbell Bench Press — 3 × 6–10.
4. Pull-Up — 3 × 6–10.
5. Chest-Supported Dumbbell Row — 2 × 8–12.
6. Standing One-Arm Dumbbell Overhead Press — 2 × 8–12 each side.
7. Hammer Curl — 2 × 10–12.
8. Overhead Dumbbell Triceps Extension — 2 × 10–15.
9. Standing Calf Raise — 2 × 15–25.
10. Hanging Leg Raise — 2 × 8–12.
11. Farmer Carry — 2 × 30–45 seconds.

The first ten movements are repetition-based. Farmer Carry is duration-based only and uses the existing timed-set logger.

#### Access from Today Workout

- Today Workout reads standalone definitions from the active installed registry program. They are not copied into `customWorkoutPlan`, cloud plan documents, or the Monday-Sunday array.
- An Extra Workouts section shows name, standalone label, description, recommended use, estimated time, focus, exercise count, and a Start button.
- Merely resolving/rendering the preview is read-only. The runtime fixture recorded zero storage writes.
- Starting Full Body Reset uses `createActiveWorkoutSession`, the same active-session key, set logger, rest timer, exercise flow, recovery prompt, and completion path as a scheduled session.
- A fresh start rechecks for an existing active session. If one exists, the existing Continue/Discard prompt is shown and nothing is overwritten.
- No weekday selects a standalone workout automatically, and no standalone workout appears in the scheduled day picker.

#### Session identity fields

Completed and active session shapes now support these backward-compatible optional fields:

```ts
sessionType?: 'scheduled' | 'standalone'
standaloneWorkoutId?: string | null
```

New scheduled sessions store `sessionType: 'scheduled'`, `standaloneWorkoutId: null`, and their existing numeric `workoutDayId`. Full Body Reset stores `sessionType: 'standalone'`, `standaloneWorkoutId: 'full-body-reset'`, `workoutDayId: null`, and `workoutName: 'Full Body Reset'`. Completion retains recorded exercise IDs, names, muscle groups, targets, set data, and Farmer Carry `timeSeconds`. Legacy records missing the new fields still read as scheduled without a migration or stored-data rewrite.

The existing cloud service already writes the complete session into `workout_sessions.raw_data` and maps a null day to the existing nullable row value, so no schema change was needed.

#### Weekly progress behavior

- `completedWorkouts` remains the count of all completed training sessions, including standalone sessions.
- `scheduledCompletedWorkouts` is the unique set of matched scheduled training days and is used for target adherence, score, Dashboard progress, coach conclusions, and missed-day detection.
- `standaloneWorkoutsCompleted` reports the separate standalone total and renders singular/plural copy such as `1 standalone workout completed`.
- Standalone sessions cannot match a scheduled day by ID or name and are excluded from scheduled-rest-day warnings.
- All completed standalone exercises still contribute completed exercises, completed sets, workout duration, strength history, and muscle-volume totals.
- The weekly target continues to derive only from the seven scheduled days; installed-program metadata is not changed by starting or completing a standalone workout.

#### History, export, and print behavior

- Active header, unfinished-session prompt, finish summary, Workout History, Workout Detail, Progress history, CSV, and completed-session print show `Full Body Reset` plus `Standalone workout`.
- Workout CSV includes `Session Type` and `Standalone Workout ID`; a Farmer Carry row retains both raw duration seconds and formatted duration.
- Full JSON backup preserves raw `sessionType`, `standaloneWorkoutId`, null `workoutDayId`, workout name, exercise identities, muscle groups, and timed sets.
- Current-plan JSON includes the optional standalone definitions separately from the unchanged `days` array.
- Weekly summary CSV and Weekly Review print report all, scheduled, standalone, and target workout counts separately.
- Standalone exercise containers participate in read-time archived/current identity display without receiving fake scheduled-day fields.

#### Focused verification results

The focused checks used direct JSON assertions plus an ephemeral Vite-loaded Node runtime with in-memory localStorage and server-rendered React components. It added no test framework, made no network/Supabase request, and did not read or rewrite real browser workout data. The in-app browser control workflow was initialized for visual verification, but this environment exposed no browser backend; no click-through result is claimed.

1. **Seven scheduled days:** passed — Version 2 remains exactly days 1 through 7; the standalone object has no `day` property.
2. **Extra Workouts access:** passed — SSR rendered Extra Workouts, Full Body Reset, description, recommended use, 45–60 minutes, focus, 11 exercises, and its Start button.
3. **No Day 8:** passed — no Day 8 was present in the data, scheduled picker, session identity, or rendered preview.
4. **Read-only preview:** passed — rendering the installed-program preview produced zero storage writes.
5. **Standalone start identity:** passed — creation produced `sessionType: 'standalone'`, ID `full-body-reset`, name `Full Body Reset`, and null `workoutDayId`; a scheduled control fixture retained Day 1 and `sessionType: 'scheduled'`.
6. **Active workout protection:** passed — a stored standalone session rendered Continue/Discard instead of another start, and Program Manager installation returned `active-workout` without changing history or installed metadata.
7. **History completion:** passed — completion cleared the active key, added one session to workout history, and history/detail rendered the standalone label.
8. **Weekly separation:** passed — the standalone fixture counted as one total session and one standalone session, zero scheduled days, two completed sets, and nonzero muscle volume; every scheduled target day remained missed and the target did not increase.
9. **Farmer Carry duration:** passed — 40 seconds survived active storage, completion, history detail, CSV, JSON, and print with repetitions null.
10. **Export and print identity:** passed — CSV, raw JSON, plan JSON, history/detail SSR, and completed-session print retained the standalone label and ID.
11. **No automatic Version 2 installation:** passed — registry loading made zero storage writes and `CURRENT_DEFAULT_PROGRAM_ID` remained `legacy-workout-v1`.
12. **CSS preservation:** passed — the unrelated square-thumbnail `aspect-ratio: 1 / 1`, `height: 100%`, and `object-fit: contain` changes plus prior scoped Program Manager CSS remain present; Part 5C only appended scoped Extra Workouts rules.

Registry validation additionally passed for Version 2 with zero errors and zero warnings, and every prescribed Full Body Reset ID resolves to the shared Exercise Library exactly once.

#### Build result and scope confirmations

- `npm run build`: passed on 2026-08-06. TypeScript completed; Vite 8.1.4 transformed 2,521 modules; PWA output with 63 precache entries was generated.
- **Eighth scheduled day added:** No. Version 2 still has exactly seven scheduled day objects.
- **Workout history rewritten:** No. No migration or historical-record update was added or run.
- **Version 2 automatically activated:** No. Legacy Version 1 remains the registry default and installation remains explicit.
- **Supabase schema changed:** No. No table, column, policy, migration, SQL, RPC, or deployed cloud data changed.
- **Installed-program metadata changed automatically:** No. Standalone discovery and preview are read-only; session completion writes only the normal workout-session record.
- **Unrelated `src/App.css` changes preserved:** Yes. The pre-existing square-thumbnail/object-fit and Program Manager diff remains intact alongside the new scoped rules.
- **Packages installed:** No.
- **Commit, push, or deployment:** None.
- **Full production checklist:** Not run, as required by the focused Part 5C scope.

### Part 6A — Final Integration Verification

**Completed:** 2026-08-07
**Status:** `PART 6A COMPLETE — READY FOR PREVIEW DEPLOYMENT`

#### Blocking defect and root cause

Plan Editor still imported the legacy `weeklyPlan` value and used it as both the selected-day fallback and the `Reset Day to Default` baseline. That bypassed the Program Manager's installed-program identity. Consequently, a user with `upper-recomposition@2.0.0` installed could edit a day and then reset it to unrelated Version 1 content.

The fix reuses the authoritative installed/active-program path in `src/utils/activeWorkoutProgram.ts`; it does not introduce a second program-selection system. The resolver distinguishes three states:

- a valid managed install resolves the exact registered program ID and version;
- an invalid or incomplete managed install fails closed and never falls through to Version 1; and
- the legacy baseline remains available only when no managed program is installed, preserving the existing compatibility behavior.

Plan Editor now resolves its selected-day fallback from that active baseline. Resetting a day calls a shared pure reset helper that deep-clones the exact canonical day, replaces only the matching saved day, and leaves every other day reference untouched. Program identity and source metadata remain under the existing Program Manager service; reset does not rewrite them. Workout history is not read or written. Missing managed program definitions, missing requested days, and missing saved target days return a safe failure with no plan write.

#### Regression coverage

The focused `npm run verify:plan-reset` harness uses in-memory storage and the same Vite-loaded application modules as Plan Editor and Program Manager. It verified:

1. `upper-recomposition@2.0.0` resolves all seven Version 2 days: six training days and one rest day.
2. A modified Version 2 training day resets to a deeply equal canonical Version 2 day, including exercise IDs, order, targets, configuration, and rest semantics.
3. No Version 1-only exercise appears after reset.
4. Persist/reload, modify, and reset again still restores the Version 2 baseline.
5. Installed identity remains `upper-recomposition@2.0.0` with registry source.
6. All unrelated days and the complete workout-history storage value remain unchanged.
7. Mutating the reset result cannot mutate the registered Version 2 definition.
8. An unresolved day or missing managed registry definition fails closed without a storage write or legacy fallback.

#### Complete Part 6A gate

| Gate | Result |
|---|---|
| Upgrade prerequisites | Passed — Parts 1, 2A, 2B, 3, 4A, 4B, 5A, 5B, and 5C are complete and retain their prior audit history. |
| `npm run build` | Passed — TypeScript and Vite production build completed; the PWA bundle was generated. |
| `npm run lint` | Passed — no lint errors; one pre-existing `react(only-export-components)` warning remains in `src/context/AuthContext.jsx`. |
| `npm run typecheck` | Passed. |
| Version 2 validation | Passed — 7 sequential days, 6 training and 1 rest, 42 scheduled exercise occurrences, all referenced and benchmark IDs resolved, 0 errors, 0 warnings. |
| Isolated install/storage harness | Passed — 17 assertions covering read-only discovery, explicit install, backup, keep/restore behavior, reload, history isolation, active-workout protection, capped backups, and no automatic Version 2 install. |
| Focused Plan Editor reset regression | Passed — all conditions listed above; registered-program mutation check remained false. |
| Farmer Carry | Passed — `40s` survived logging, recovery/completion, history, CSV, JSON, and print. |
| Easy Indoor Swimming | Passed — `1320s` survived the same duration pipeline and formats as `22:00`. |
| Couch Hip-Flexor Stretch | Passed — `45s` survived the same duration pipeline. |
| Recovery and history | Passed — active recovery and completion preserved duration and identity. |
| CSV and print | Passed — raw seconds and formatted durations were retained and rendered. |
| Completion counting | Passed — timed sets counted once only when a valid duration was present. |
| Strength-chart exclusions | Passed — timed-only sets produced no strength data points. |
| Historical compatibility | Passed — id-less, archived, unknown, aliased, and renamed historical records remained readable; original recorded names were preserved in detail, table, print, and CSV. |
| Export and backup | Passed — plan identity/days, history-inclusive full backup, install backup, and secret-key exclusions were verified. |
| Cloud-path static verification | Passed — guards, cloud-write/verify/local-commit ordering, rollback, reset ordering, and settings merge were verified statically without contacting Supabase. |
| Static integration sweep | Passed — Program Manager, Dashboard, Today Workout, Weekly Plan, Plan Editor, Exercise Library, Progress, progression callers, Weekly Review, Coach, export/print, and history detail use the active-program/identity architecture. No active fixed benchmark, six-on/one-rest, Day 6, static target, or static day-name consumer remains; legitimate historical aliases remain. Registry discovery passed, the default remains `legacy-workout-v1`, and discovery does not install Version 2 or rewrite history. |
| `git diff --check` | Passed. |

#### Files changed for the complete workout-program upgrade

- Program registry, JSON definitions, types, validators, installed-program service, Program Manager UI, active-program helpers, and Plan Editor integration.
- Exercise identity/library, timed logging, active-session, history, analytics, export, print, dashboard, weekly review, coach, and compatibility consumers.
- `scripts/verify-plan-editor-reset.mjs` plus the `verify:plan-reset` package script.
- Contributor documentation, this living audit, and `docs/workout-program-v2-deployment.md`.

The exact Part 6A-specific files are `src/pages/PlanEditor.tsx`, `src/utils/activeWorkoutProgram.ts`, `scripts/verify-plan-editor-reset.mjs`, `package.json`, `docs/workout-program-v2-deployment.md`, and `docs/project-audit-report.md`.

#### Scope and safety confirmations

- **Production deployment:** No.
- **Production Supabase access or mutation:** No. No production credentials, rows, schema, migrations, policies, or environment variables were accessed or changed.
- **Real browser/user storage modified:** No. All stateful verification used isolated in-memory storage.
- **Automatic Version 2 installation:** No. `legacy-workout-v1` remains the compatibility default; Version 2 installation is explicit.
- **Workout history rewritten:** No.
- **Unrelated days changed by reset:** No.
- **Registered Version 2 data mutated:** No.
- **Unrelated `src/App.css` work discarded:** No. The pre-existing thumbnail changes remain in the working tree and are excluded from the focused release commit.
- **Packages or test framework added:** No. The focused regression is a repository script using the existing toolchain.
- **Commit, push, or deployment during Part 6A:** None. Those actions belong to the subsequent Part 6B phase.
- **Browser claim:** No interactive browser result is claimed for Part 6A because the in-app browser backend was unavailable. Isolated runtime, SSR, build, and static verification covered the gate instead.

#### Remaining non-blocking findings

1. `src/utils/progressionUtils.ts` retains legacy-plan default parameters for callers that omit an active plan. Current application callers pass the active plan, so this is a latent compatibility path rather than a Part 6A reset defect.
2. Restoring an implicit legacy backup reproduces the prior days but can classify those restored days as custom rather than `legacy-default`; the accepted backup contract is preserved, but source-label normalization could be refined later.
3. The user-facing `exportAllDataJSON()` full JSON export includes history but omits installed-program, dismissal, and Program Manager backup metadata. The separate raw Data Health/local-storage backup includes registered application keys. This distinction is unchanged and should be made clearer in the UI later.
4. Cloud plan and settings data remain separate documents, so simultaneous multi-device writes are not an atomic cross-document transaction; the previously audited verification and rollback safeguards remain in place.
5. The previously inferred Supabase partial-index/upsert compatibility concern remains untested and out of scope; no production schema or data was accessed to resolve it.
6. Interactive browser verification remains deferred to the preview smoke-test phase because no browser backend was exposed during Part 6A.

No required Part 6A check failed. The work may proceed to a focused preview commit and preview-only deployment; production remains explicitly out of scope.
