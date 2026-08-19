# Adding Workout Programs

There are two ways to add a program.

## 1. Add it in the app (no deploy)

Open **Settings → Program → Add a workout program**, upload the `.json` file or
paste the JSON, press **Check**, then **Save program**. It joins the program
list on that screen and installs through the same backup-and-verify path as a
bundled program. An account with no program installed sees the same upload step
as a first-run screen instead.

Pasted programs are stored per signed-in user and sync to Supabase
(`user_workout_programs`), so they follow the account rather than the device.
The paste box also accepts JSON wrapped in markdown fences or surrounded by
chat prose, and fills in a missing `version`, `updatedAt`, `description`, or
`id` automatically — it reports whatever it filled in.

Use **Copy AI prompt** on that panel to get a ready-made prompt for an AI chat:
paste the prompt plus your plan in any wording, and paste the JSON it returns
straight back into the app. The prompt is built by
`buildProgramAuthoringPrompt()` in `src/utils/userWorkoutPrograms.ts` and is
generated from the live Exercise Library, so it always lists every current
exercise ID. It also asks for the `coaching` block the Nutrition screen reads,
and tells the chat to avoid the fields this app version hides or rejects
(`optional`, `alternatives`). Keep it in step with
`src/utils/workoutProgramValidation.ts` whenever the accepted shape changes.

The prompt exists in both languages (`src/i18n/locales/{en,vi}/prompt.ts`) and
asks for a bilingual program either way: every string a person reads comes back
as `English (Tiếng Việt)` in one string, so the same JSON reads in both
languages without a schema change or a language switch. Fields the app matches
on or translates itself — every `id`, plus `muscleGroup`, `equipment`, `focus`,
`repRange`, `duration`, `estimatedTime` and `targetRir` — stay English-only:
`muscleGroup` is keyword-matched in `weeklyReviewUtils.js` and used verbatim as
a chart label in `trainingProgressUtils.ts`, and `equipment` is translated for
display through `src/i18n/exercises/terms.ts`.

Exercise IDs that are not in the bundled Exercise Library are accepted with a
warning. Those exercises track fully (sets, reps, rest, form tips come from the
program JSON) but have no built-in form guide, image, or demo video. Reuse the
IDs listed in the AI prompt wherever a movement matches to get that media; an
exercise whose `name` matches a library entry exactly also resolves — and
because `findLibraryExerciseForWorkout()` strips bracketed text before
matching, the bilingual `Bench Press (Đẩy ngực nằm)` form resolves too. A
Vietnamese-only name does not, which is why the prompt puts English first.

## 2. Bundle it with the app (requires a deploy)

No program ships with the app today — `src/data/workout-programs/` holds only
`_template.example.json` — but the build-time path below still works and is how
a program would be shipped to every account.

Workout programs are also JSON documents discovered automatically at build time. They reference one shared bundled Exercise Library by stable exercise ID; exercise instructions, form guidance, and media are not embedded in program JSON. Adding a valid program does not require a new TypeScript import and does not activate it. A user must explicitly install a discovered program through the Program Manager.

### Build-time workflow

1. Prepare a workout-program JSON file by copying `src/data/workout-programs/_template.example.json` and renaming it. The installable filename must not start with `_` or end with `.example.json`.
2. Reference existing shared exercise IDs wherever the movement is already defined.
3. For each genuinely new exercise, add one complete record to `src/data/exerciseLibrary.ts`.
4. Paste the completed program JSON into `src/data/workout-programs/`.
5. Run `npm run build`.
6. The registry automatically discovers the workout program; no manual import is needed.
7. Reuse the same stable exercise ID in any future program that needs that exercise.

Copying a file into the folder changes only the build-time program catalog. It does not by itself select the program, write browser storage, or write cloud data.

Do not embed Exercise Library records inside a workout-program JSON file. Do not duplicate a shared record merely because another program uses it: add a missing exercise once, then reference that ID from unlimited programs. Removing a program must not remove its shared exercise records, because old programs and workout history may still need them.

## Supported JSON structure

Program files must contain one JSON object with this structure:

```json
{
  "id": "example-program-family-id",
  "name": "Example Program Name",
  "version": "1.0.0",
  "updatedAt": "2026-08-06",
  "description": "A short explanation of the program.",
  "goals": [
    "First program goal",
    "Second program goal"
  ],
  "benchmarkExerciseIds": [
    "example-repetition-exercise-id",
    "example-duration-exercise-id"
  ],
  "rules": {
    "effort": [
      "First effort rule",
      "Second effort rule"
    ],
    "progression": [
      "First progression rule",
      "Second progression rule"
    ],
    "postureCue": "A program-wide posture cue.",
    "returnAfterBreak": [
      "First return-after-break rule",
      "Second return-after-break rule"
    ]
  },
  "days": [
    {
      "day": 1,
      "name": "Day 1 Name",
      "estimatedTime": "30-45 min",
      "focus": [
        "Primary focus",
        "Secondary focus"
      ],
      "exercises": [
        {
          "id": "example-repetition-exercise-id",
          "name": "Example Repetition Exercise",
          "sets": 3,
          "repRange": "8-12",
          "restSeconds": 90,
          "muscleGroup": "Example muscle group",
          "equipment": "Example equipment",
          "formTips": [
            "First form cue",
            "Second form cue"
          ]
        },
        {
          "id": "example-duration-exercise-id",
          "name": "Example Duration Exercise",
          "sets": 3,
          "duration": "30 sec",
          "restSeconds": 45,
          "muscleGroup": "Example muscle group",
          "equipment": "Example equipment",
          "formTips": [
            "First form cue",
            "Second form cue"
          ]
        }
      ]
    }
  ]
}
```

The example above shows the complete root, day, and exercise shapes while abbreviating the `days` array to one entry for readability. A normal weekly program should contain seven day objects numbered `1` through `7`, all using the same day structure. The complete seven-day reference is `_template.example.json`.

JSON values must remain JSON-compatible. Do not put functions, React components, JavaScript comments, `Date` objects, `Map`, `Set`, trailing commas, or other JavaScript-only values in a program file.

## Standalone workouts

`standaloneWorkouts` is an optional root-level array for sessions that belong to a program but are not scheduled workout days. Each standalone workout has its own stable `id`, display details, focus list, optional rules, and non-empty exercise list. A program may contain multiple standalone workouts.

Standalone workouts:

- do not have or require a numeric `day` field;
- do not become part of the Monday-Sunday schedule or change its seven day objects;
- reuse stable IDs from the shared Exercise Library just like scheduled-day exercises; and
- are selected explicitly instead of being chosen automatically from the weekday.

Examples include Full Body Reset, Travel Workout, Short Recovery Workout, and Equipment-Free Workout. See `_template.example.json` for a small JSON example.

## Field reference

### Program fields

| Field | Required | Supported value |
|---|---:|---|
| `id` | Yes | Non-empty string identifying the program. Keep it stable for revisions of the same program. |
| `name` | Yes | Non-empty display name. |
| `version` | Yes | Non-empty version string. The combination of program ID and version must identify one revision. |
| `updatedAt` | Yes | Valid date string, preferably ISO `YYYY-MM-DD`. |
| `description` | Recommended | Human-readable summary. Omitting it produces a validation warning. |
| `goals` | No | Array of goal strings. An empty or omitted list may produce a warning. |
| `benchmarkExerciseIds` | No | Array of stable shared Exercise Library IDs used as benchmarks. An empty or omitted list may produce a warning. |
| `rules` | No | Program-wide effort, progression, posture, and return-after-break guidance. Shown on the Weekly Plan screen. |
| `durationWeeks` | No | Positive integer. When supplied alongside `progressionPhases`, the phases must cover every week from `1` to this value. |
| `normalWeeklyDays` | No | Positive integer. Must equal the length of `days` when supplied. |
| `progressionPhases` | No | Non-empty array of phases. Each needs `weeks` (positive integers, no overlap), `name`, `volumeGuidance`, `rirGuidance`, and `priorities`; `targetRir` (a number or range from `0` to `10`), `setVolumeMultiplier` (above `0`, at most `1`), `restrictions`, and `assessmentItems` are optional. |
| `coaching` | No | Nutrition and recovery defaults read by the Nutrition screen. |
| `days` | Yes | Non-empty array of workout days; weekly programs should contain exactly seven. Day `1` is Monday and day `7` is Sunday. |
| `standaloneWorkouts` | No | Array of explicitly selected workouts outside the Monday-Sunday day sequence. Every exercise ID inside one must exist in the Exercise Library — unknown IDs are rejected here rather than warned about. |

Supported `rules` fields are:

- `effort`: an array of strings.
- `progression`: an array of strings.
- `postureCue`: a string.
- `returnAfterBreak`: an array of strings.
- `rest`: an array of strings.
- `substitutions`: an array of strings.
- `safety`: an array of strings.
- `optionalNeckWork`: an array of strings.

Supported `coaching` fields are `proteinMinGrams`, `proteinDefaultGrams`, and
`proteinMaxGrams` (non-negative numbers satisfying min ≤ default ≤ max),
`creatineDailyGrams`, `sleepHours`, `targetWeightLossKgPerWeek`,
`stalledTrendGuidance`, `fastLossGuidance` (non-empty strings), and
`healthContext` (an array of strings). Omitting the block leaves the Nutrition
screen on its built-in fallbacks (120-160 g protein, `3-5 g/day` creatine,
`7-8+ hours` sleep).

### Day fields

| Field | Required | Supported value |
|---|---:|---|
| `day` | Yes | Positive day number. Weekly programs should use sequential values `1` through `7` without duplicates. |
| `name` | Yes | Non-empty workout-day name. |
| `estimatedTime` | Yes | Non-empty display string such as `30-45 min`. |
| `focus` | Yes | Array of focus-area strings. |
| `exercises` | Yes | Array of exercise objects. |

### Exercise fields

| Field | Required | Supported value |
|---|---:|---|
| `id` | Yes | Non-empty, stable shared Exercise Library ID; it must be unique within its scheduled day or standalone workout. |
| `name` | Yes | Non-empty exercise name. |
| `sets` | Yes | Number of sets or rounds, at least `1`. |
| `repRange` | Conditional | Non-empty repetition target such as `8-12`. Use for repetition-based exercises. |
| `duration` | Conditional | Non-empty timed target such as `30 sec`. Use for timed exercises. |
| `restSeconds` | Yes | Rest duration in seconds; `0` or greater. |
| `muscleGroup` | Yes | Non-empty muscle-group label. |
| `equipment` | Yes | Non-empty equipment label. |
| `formTips` | Yes | Array of form-cue strings. |

Every exercise must contain exactly one target field: `repRange` for a repetition exercise or `duration` for a timed exercise. An exercise should not contain both unless the application later explicitly supports that model.

Optional exercise fields: `targetRir` (a number or range from `0` to `10`, such as `1-2`), `guidance` (an array of strings), and `phaseTargets` (per-week overrides of `sets`, `repRange`/`duration`, and `guidance`).

`optional: true` and `alternatives` still validate, but the simplified app has no UI to opt an optional exercise in or to switch a home/gym variant by hand: an optional exercise never appears in the workout, and an `alternatives` block must list every variant with an Exercise Library ID and include the primary exercise's own ID among them. The AI prompt tells chats to avoid both.

## IDs, revisions, and history

Exercise IDs should remain stable between programs and between plan revisions. Changing an ID breaks the reliable link between the program, shared Exercise Library, media, and historical records. If an ID already exists in `src/data/exerciseLibrary.ts`, reuse it instead of creating a duplicate record. Program IDs should likewise remain stable when a file is a new version of the same program, while its `version` changes to identify the revision.

Avoid renaming exercises without a migration or legacy alias. Historical comparisons can depend on exercise names as well as IDs, so a rename can split or hide comparisons with earlier workout sessions.

Old JSON program files should normally remain in `src/data/workout-programs/` so previous versions can still be identified. Do not overwrite or delete an old revision merely to add a newer one.

## Discovery and validation

The registry eagerly discovers JSON files in `src/data/workout-programs/` through Vite's `import.meta.glob`. Discovery is synchronous in application code and requires no per-file import statement.

Documentation files are excluded from the installable catalog when either condition is true:

- The filename starts with `_`.
- The filename ends with `.example.json`.

Therefore `_template.example.json` is ignored under both naming rules.

Each discovered installable file is validated before it enters the usable program list. Invalid or conflicting programs are excluded instead of crashing the application. Registry diagnostics retain the filename, program ID, version, validation errors, and validation warnings for development inspection. Raw internal errors are not shown to normal users, and development logging is limited to development mode.

Validation rejects malformed metadata, days, standalone workouts, exercise targets, duplicate day or standalone-workout IDs, duplicate exercise IDs within one scheduled day or standalone workout, invalid set/rest values, and conflicting program identifiers. The registry compares program exercise references with the shared bundled Exercise Library. Standalone exercise IDs must resolve whenever a known-library set is supplied. Scheduled-day unknown IDs retain the existing warning behavior unless strict checking is requested; add one complete shared record for each genuinely new ID instead of putting the record in the program JSON.

## Build check

Run exactly:

```sh
npm run build
```

The build includes TypeScript checking. Fix errors caused by the new program file, then re-run the same command. The future Program Manager should only offer programs that the registry accepted.
