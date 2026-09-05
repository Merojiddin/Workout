# Guided workouts

Timed, follow-along sessions that run as one continuous timeline: get ready →
work → rest → work → … → done. They sit beside the strength program rather than
inside it — nothing here is logged in reps and weight, and no step is swapped
for an alternative.

Reached from **More → Guided Workouts**, and from the link on Today's Workout.

## Where everything lives

| | |
|---|---|
| Movement catalog (136 movements) | `src/data/guidedExercises.ts` |
| Categories + shipped workouts | `src/data/guidedWorkouts.ts` |
| Workouts the user builds | `src/utils/customGuidedWorkouts.ts`, `src/components/GuidedWorkoutBuilder.tsx` |
| Timeline builder, totals, history row | `src/utils/guidedWorkoutUtils.ts` |
| The clock | `src/hooks/useGuidedTimeline.ts` |
| Spoken guide | `src/utils/guidedAudio.ts` |
| Chime / buzz | `src/utils/timerFeedback.ts` (`playPhaseCue`, `playCountdownTick`) |
| Cue switches | `src/utils/guidedSettings.ts` (`guidedWorkoutSettings` key) |
| Screens | `src/pages/GuidedWorkouts.tsx`, `src/components/GuidedWorkoutPlayer.tsx` |
| Vietnamese wording | `src/i18n/exercises/guidedVi.ts` (content), `src/i18n/locales/*/guided.ts` (UI) |

## Building a workout in the app

**More → Guided Workouts → Build your own workout.** Name it, pick a category
and difficulty, set work / rest / rounds / round break / get-ready with the
steppers, then add movements from the whole 136-movement library (searchable,
filterable by whether they need equipment). Movements reorder with the arrows
and each one can override the workout's work time. The running total at the top
is the real timeline, not an estimate.

Saved workouts:

- are stored under `customGuidedWorkouts`, which `storageUtils` namespaces per
  signed-in user, so two accounts on one browser never see each other's;
- are ordinary `GuidedWorkout` objects, so they run through the same player,
  timeline, audio guide and history path with no special cases;
- appear at the top of the list with a "Yours" badge, and open with Edit and
  Delete buttons in their detail sheet.

They are **local to the device** — there is no cloud table for them yet, so a
workout built on a phone will not appear on a laptop. Adding that means a new
Supabase table and a service alongside the others in `src/services/`.

## Adding a workout in code

One object in `guidedWorkouts`. Nothing else changes — the card, the durations,
the timeline, the player and the progress bar are all derived from it.

```ts
{
  id: 'cardio-my-session',
  categoryId: 'cardio',          // cardio | abs | posture | mobility
  name: 'My Session',
  description: 'One line, shown on the card.',
  level: 'Beginner',
  focus: ['Conditioning'],       // two or three words each
  prepareSeconds: 10,            // get-ready countdown
  rounds: 3,                     // the step list runs this many times
  roundRestSeconds: 30,          // the longer break between rounds
  workSeconds: 30,               // default per step
  restSeconds: 10,               // default rest after a step
  steps: [
    { exerciseId: 'jumping-jacks' },
    { exerciseId: 'plank', seconds: 45, restSeconds: 20 },  // per-step overrides
  ],
}
```

A rest follows every movement except the last one of the last round. A step may
also carry `cue` to replace the movement's coaching line for this workout only.

Thirty sessions ship with the app across four categories — 10 Beginner, 5
Intermediate and 15 Advanced, seven of them 20 to 31 minutes. They are examples
as much as anything: delete the ones you do not want.

## Adding a movement

One entry in `guidedExercises.ts`:

```ts
{
  id: 'my-movement',
  name: 'My Movement',
  cue: 'One line, printed under the name and read aloud as it starts.',
  instructions: ['First line.', 'Second line.'],
  planfitId: 9006,               // demonstration; see below
  perSide: true,                 // the voice says "switch sides" at halfway
  impact: 'high',                // excluded from the low-impact badge
  equipment: ['Resistance bands'],
  audioCues: [{ at: 15, say: 'Keep the hips down.' }],
  audioUrl: 'https://…/my-voiceover.mp3',   // optional; replaces the cue above
}
```

A workout can also define a movement inline (`steps: [{ exercise: {...} }]`)
instead of naming a catalog id, for a one-off.

### Demonstration media

`planfitId` is all a movement needs: the still and the looping clip are both
derived from it by `getPlanfitMediaById`. To find the id for a new movement,
open its Planfit page and read the number out of the MP4 URL:

```bash
curl -s https://planfit.ai/en/exercise/<slug> |
  grep -oE 'training-videos-watermarked/[0-9]+\.mp4'
```

Confirm both assets return 200 before committing the number:

```
https://d2m0n84d5tgmh1.cloudfront.net/training-image/<id>_thumbnail.png
https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/<id>.mp4
```

Where the clip is a near match rather than the exact movement, say so in
`mediaNote` — it is printed under the movement in the detail sheet.

A movement can carry `animationUrl` / `imageUrl` instead, for media hosted
anywhere else.

> **Never add a service-worker runtime-caching rule for the MP4s.** CloudFront
> sends no CORS header, so any response the worker returns for them is opaque,
> and WebKit refuses to play an opaque response in a media element. See
> `docs/exercise-gifs.md` and the note in `vite.config.ts`. Verify media
> changes in Playwright's `webkit`, not only in Chrome.

Cards and list thumbnails render the still only (`variant="still"`); the clip is
streamed on the player screen alone, so browsing fifteen workouts does not pull
fifteen videos.

## Cues

Four independent switches, saved per user under `guidedWorkoutSettings`:

- **Sound** — the phase tone at every step change and a blip over the last
  three seconds.
- **Voice guide** — the device's speech voice reads the movement starting, its
  cue, "switch sides", the rest and what is next, in the app's language. An
  exercise carrying `audioUrl` plays that recording instead.
- **Vibration** — a distinct buzz for work, rest and finish.
- **Keep screen on** — a Screen Wake Lock for the length of the session.

Both audio paths need unlocking inside a user gesture, which is why the Start
button calls `unlockAudio()` and `primeSpeech()`.

## What is written to history

A finished session is saved as a normal `WorkoutSession` with
`sessionType: 'standalone'` and `standaloneWorkoutId: 'guided:<workout id>'`, so
it appears in Progress and the weekly review. Each movement becomes one logged
exercise and each round one set, holding the seconds it ran for.

**Only steps that ran all the way down are logged.** A skipped movement is not
something you did, and a session ended before anything finished writes no row at
all — the finish screen stays silent rather than claiming a save that did not
happen.

## Copy and translation

Workout names, descriptions, movement names, cues and instructions are plain
English in the data files, so a new workout needs no message catalog entry.
They are translated the way the exercise library is: by exact phrase through
`translateGuidedText`, with anything unrecognised passing through as written.
Add Vietnamese wording to `src/i18n/exercises/guidedVi.ts` when you add content;
the screen's own chrome (buttons, labels, spoken templates) lives in
`src/i18n/locales/{en,vi}/guided.ts` and **must** be added to both, or the build
fails.
