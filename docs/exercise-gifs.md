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
offline and does not break if the CDN goes away. They are 180x180 (96 files,
9,446,781 bytes / 9.01 MiB total, 96.1 KiB average).

### Primary Planfit library media

Every one of the 167 bundled library exercises now has a curated match in
Planfit's public [exercise guide](https://planfit.ai/en/exercise). Planfit calls
the movement media a "gif", but serves it as a muted, looping MP4 alongside a
PNG thumbnail. The app references those hosted, watermarked assets directly;
they are not copied into this repository and require a network connection.

`src/data/planfitExerciseMedia.ts` is the durable local-ID-to-Planfit-ID map.
It contains 136 distinct Planfit records: 102 high-confidence matches, 24 close
matches with a small modifier or equipment difference, and 41 explicitly
documented low-confidence fallbacks where Planfit has no faithful playable
clip. Every selected thumbnail and MP4 returned HTTP 200 with the expected
media type at the time of the migration. Do not silently replace a low-
confidence entry: review the visible movement and keep its `note` current.

The bundled ExerciseDB files and `src/data/exerciseGifs.ts` remain in the repo
for rollback or a future explicit offline-fallback path. They are not selected
automatically while a Planfit mapping exists. They are still managed only by
`scripts/fetch-exercise-gifs.mjs`; the refresh script never overwrites the
Planfit mapping.

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
Pull*.

The durable artifact is the curated `libraryId -> exerciseId` pairing in
`src/data/exerciseGifs.ts`. The fuzzy matching was a one-off curation step and is
deliberately **not** re-run by the refresh script, so results cannot silently
drift. The map includes hand-picked overrides from the original pass and later
media audits.

## Adding a new Planfit mapping

1. Search the official Planfit exercise guide, including alternate naming.
2. Compare the equipment, stance, movement path, and defining modifiers with
   the local coaching text. Do not match on the title alone.
3. Confirm both `training-image/<id>_thumbnail.png` and
   `training-videos-watermarked/<id>.mp4` return the expected media types.
4. Add the reviewed ID, slug, source name, confidence, and any mismatch note to
   `src/data/planfitExerciseMedia.ts`.

## Adding a bundled ExerciseDB fallback

1. Find the movement in the dataset JSON (match on `name` / `targetMuscles`).
2. Add an entry to `src/data/exerciseGifs.ts` with its `exerciseId`.
3. Run `node scripts/fetch-exercise-gifs.mjs`.

If the dataset has no faithful animation, **leave it out**. The Planfit media
remains primary online, and a missing bundled fallback is better than teaching
the wrong movement offline.

## Exercises intentionally left without a bundled ExerciseDB fallback

71 of the 167 library exercises have no local ExerciseDB GIF. This is the
offline-fallback inventory, not the primary Planfit coverage described above.

### No faithful match exists in the dataset (70)

The dataset has no face pull, pec deck, hip thrust, bird dog, hollow hold, ab
rollout-from-knees, or plain plank / box jump, and nothing for the posture,
mobility, walking and boxing work:

- 90/90 Hip Lift with Full Exhale
- Band Pull-Apart — the available row is an anchored reverse fly, not a free pull-apart
- Bayesian Cable Curl — the available row faces the stack and does not load the arm behind the torso
- Bird Dog with Pause — no quadruped bird-dog row exists
- Bodyweight Reverse Lunge — every rear-lunge row uses dumbbells or a barbell
- Bodyweight Step-Up — every true step-up row uses a band, dumbbells, or a barbell
- Box Jump
- Boxing Defense Drill
- Boxing Footwork Drill
- Brisk Walking — no level bodyweight walking row exists
- Cable Pallof Press — the only horizontal Pallof row uses a resistance band
- Captain's Chair Knee Raise — the only chair row keeps the legs straight
- Chin Tuck
- Couch Hip-Flexor Stretch
- Countermovement Jump — the nearest row is a continuous jump squat without a reset
- Deficit Push-Up — the deep-push-up row uses round dumbbells instead of stable non-rolling supports
- Dumbbell Hip Thrust
- Dumbbell Squeeze Press
- Easy Indoor Swimming — `swimmer kicks` is a prone floor exercise, not swimming
- Easy Treadmill Cool-Down Walk — the only treadmill row is an incline walk, not a flat easy cool-down
- Elbows-Out Dumbbell Row — available rows add chest or unilateral bench support
- Four-Way Neck Isometric
- Front-Foot-Elevated Dumbbell Reverse Lunge — the dumbbell rear-lunge row has no front-foot elevation
- Front-Foot-Elevated Smith Reverse Lunge
- Hanging Knee Raise — the only knee-raise row is explicitly assisted
- Heavy-Bag Boxing
- Heels-Elevated Goblet Squat — the goblet-squat row has no heel elevation
- Hip Flexor Stretch — available rows require a stability ball or rope
- Hip Thrust
- Hip-Thrust Machine
- Hollow Body Hold
- Lean-Away Dumbbell Lateral Raise — the lateral-raise rows do not include the lean-away setup
- Light Band Face Pull
- Light Walking
- Low-Impact Jumping Jack — the only jack row jumps and is not low-impact
- One-Arm Dumbbell Floor Press — the one-arm press row is performed on a bench
- One-Arm Machine Row — the available one-arm lever row is a high row without chest support
- Overhead Dumbbell Triceps Extension
- Pec Deck
- Pendulum Squat
- Pike Push-up
- Plank — the only ordinary front-plank row is visibly weighted
- Plank with Glute Squeeze
- Prone Y-Raise
- Rear-Delt Dumbbell Row — available rows add prone or unilateral bench support
- Resistance-Band Kneeling Crunch — the only kneeling band row twists instead of crunching straight ahead
- Resistance-Band Leg Curl
- Resistance-Band Overhead Triceps Extension
- Resistance-Band Triceps Pressdown
- Reverse Pec Deck
- Rotational Medicine-Ball Throw
- Shadowboxing
- Side Plank — the only plain side-plank row elevates the forearm on a bench
- Side-Plank Reach-Through
- Single-Leg Hip Thrust
- Sliding Hamstring Curl — nearby rows depict standing or kneeling curls, not a supine slider curl
- Smith Machine Hip Thrust
- Smith Machine Romanian Deadlift — the only Smith deadlift row uses a conventional knee-dominant pull
- Standing Knee Raise — the nearest row is rapid, alternating, and wall-supported
- Standing Knee-to-Elbow — the only elbow-to-knee row is a lying crunch
- Standing Punches — the only boxing-punch row is a unilateral left hook
- Step Touch — no lateral step-touch row exists
- Suitcase Carry
- Suitcase Hold
- Thoracic Extension / Reach
- Treadmill Incline Walk — the depicted movement matches, but its dataset equipment is `leverage machine`, not treadmill
- VR Boxing
- Wall Slide
- Wall Tibialis Raise
- Weighted Push-up

### Match was too weak to trust (1)

Best candidate scored below the acceptance threshold and was not convincing on
review, so it was dropped:

- Landmine Press - best was `landmine 180`
