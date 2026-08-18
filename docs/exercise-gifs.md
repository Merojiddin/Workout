# Exercise animations (GIFs)

## Where they come from

| | |
|---|---|
| Source project | [ExerciseDB](https://oss.exercisedb.dev) (open source) |
| Dataset | [bootstrapping-lab/exercisedb-api](https://github.com/bootstrapping-lab/exercisedb-api) -> `src/data/exercises.json` (1500 exercises) |
| Media CDN | `https://static.exercisedb.dev/media/<exerciseId>.gif` |
| Bundled at | `public/exercise-gifs/<library-exercise-id>.gif` |
| Map + metadata | `src/data/exerciseGifs.ts` |
| Refresh with | `node scripts/fetch-exercise-gifs.mjs` |

GIFs are **downloaded into the repo**, not hot-linked, so the app still works
offline and does not break if the CDN goes away. They are 180x180 and average
~95KB (111 files, ~11MB total).

### Do not page the public API

`oss.exercisedb.dev` is behind an aggressive Cloudflare rate limit (`error code:
1015` after a handful of requests), and its cursor pagination returns the *same
first page* every time - you can only ever retrieve 25 of the 1500 rows that way.
The `/exercises/search` endpoint returns empty results. Pull the dataset JSON
from GitHub instead; it is unthrottled and complete.

## How exercises were matched

Names were matched with a fuzzy scorer (token coverage + sequence similarity,
weighted by whether the equipment agreed), and then **every match was reviewed by
hand**. The scorer alone was not safe: it picked `smith bench press` for
*Bench Press*, `squat jerk` for *Squat*, `resistance band leg extension` for
*Resistance-Band Leg Curl*, and `band assisted pull-up` for *Light Band Face
Pull*. 46 of the 111 entries are hand-picked overrides.

The durable artifact is the curated `libraryId -> exerciseId` pairing in
`src/data/exerciseGifs.ts`. The fuzzy matching was a one-off curation step and is
deliberately **not** re-run by the refresh script, so results cannot silently
drift.

## Adding a new one

1. Find the movement in the dataset JSON (match on `name` / `targetMuscles`).
2. Add an entry to `src/data/exerciseGifs.ts` with its `exerciseId`.
3. Run `node scripts/fetch-exercise-gifs.mjs`.

If the dataset has no faithful animation, **leave it out**. The app falls back to
the existing photo or category placeholder, and showing the wrong movement is
worse than showing none.

## Exercises intentionally left without an animation

45 of our 156 library exercises have no GIF.

### No faithful match exists in the dataset (44)

The dataset has no face pull, pec deck, hip thrust, bird dog, hollow hold, ab
rollout-from-knees, or plain plank / box jump, and nothing for the posture,
mobility, walking and boxing work:

- 90/90 Hip Lift with Full Exhale
- Bird Dog with Pause
- Box Jump
- Boxing Defense Drill
- Boxing Footwork Drill
- Brisk Walking
- Chin Tuck
- Couch Hip-Flexor Stretch
- Dumbbell Hip Thrust
- Dumbbell Squeeze Press
- Easy Indoor Swimming
- Four-Way Neck Isometric
- Front-Foot-Elevated Smith Reverse Lunge
- Heavy-Bag Boxing
- Hip Flexor Stretch
- Hip Thrust
- Hip-Thrust Machine
- Hollow Body Hold
- Light Band Face Pull
- Light Walking
- Overhead Dumbbell Triceps Extension
- Pec Deck
- Pendulum Squat
- Pike Push-up
- Plank
- Plank with Glute Squeeze
- Prone Y-Raise
- Resistance-Band Leg Curl
- Resistance-Band Overhead Triceps Extension
- Resistance-Band Triceps Pressdown
- Reverse Pec Deck
- Rotational Medicine-Ball Throw
- Shadowboxing
- Side-Plank Reach-Through
- Single-Leg Hip Thrust
- Smith Machine Hip Thrust
- Suitcase Carry
- Suitcase Hold
- Thoracic Extension / Reach
- Treadmill Incline Walk
- VR Boxing
- Wall Slide
- Wall Tibialis Raise
- Weighted Push-up

### Match was too weak to trust (1)

Best candidate scored below the acceptance threshold and was not convincing on
review, so it was dropped:

- Landmine Press - best was `landmine 180`
