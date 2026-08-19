# Exercise media audit

Audited 2026-08-19 against the 1,500-record ExerciseDB JSON snapshot and the live YouTube oEmbed endpoint.

- Original scope: 114 GIF mappings and 35 explicit `videoUrl` declarations (34 non-empty).
- Classification: 28 Wrong rows (27 GIF, 1 video), 6 Suspicious rows (5 GIF, 1 video), and 115 OK rows (82 GIF, 33 video).
- Applied: 9 GIF records replaced, 18 unfaithful GIF mappings/files removed, and the empty VR Boxing video fields removed.
- Result: 96 mapped GIFs for 167 exercises; 71 exercises are intentionally unanimated.
- Integrity: 96 map keys exactly match 96 non-zero bundled GIF files; there are no missing files or orphans. All mapped metadata matches the source dataset.
- YouTube: all 34 non-empty URLs use `https://www.youtube.com/embed/<ID>` and all 34 returned HTTP 200 from oEmbed. No live video was dead or provably off-topic.

## Wrong

| Media | Library id | Our name | Current source/title | Finding | Change or decision |
|---|---|---|---|---|---|
| GIF | band-pull-apart | Band Pull-Apart | sTfvVsG / band reverse fly | Anchored reverse fly; ours is a free-band pull-apart. | Removed map entry and bundled file; no faithful record exists. |
| GIF | bayesian-cable-curl | Bayesian Cable Curl | G08RZcQ / cable curl | Ordinary curl facing the stack; no arm-behind-body Bayesian setup. | Removed map entry and bundled file; no faithful record exists. |
| GIF | cable-pallof-press | Cable Pallof Press | 9pa4H5m / band horizontal pallof press | Substitutes a resistance band for the required cable. | Removed map entry and bundled file; no cable Pallof record exists. |
| GIF | captains-chair-knee-raise | Captain's Chair Knee Raise | weoDEpH / captains chair straight leg raise | Demonstrates a straight-leg raise, not a knee raise. | Removed map entry and bundled file; no faithful chair knee-raise record exists. |
| GIF | countermovement-jump | Countermovement Jump | LIlE5Tn / jump squat | Continuous jump squats without the required landing reset. | Removed map entry and bundled file; no faithful reset CMJ record exists. |
| GIF | deficit-push-up | Deficit Push-Up | x6KpKpq / close-grip push-up | Floor push-up with no deficit. The deep-push-up candidate uses round, roll-capable dumbbells, conflicting with the safety cue. | Removed map entry and bundled file; no proven safe faithful record exists. |
| GIF | elbows-out-dumbbell-row | Elbows-Out Dumbbell Row | 7vG5o25 / dumbbell incline row | Chest-supported incline row instead of a bilateral unsupported elbows-wide row. | Removed map entry and bundled file; no faithful record exists. |
| GIF | front-foot-elevated-dumbbell-reverse-lunge | Front-Foot-Elevated Dumbbell Reverse Lunge | SSsBDwB / dumbbell rear lunge | Front foot remains on the floor. | Removed map entry and bundled file; no faithful elevated record exists. |
| GIF | hammer-curl | Hammer Curl | GNhAeJ0 / dumbbell hammer curls (with arm blaster) | Adds an arm blaster absent from our setup and equipment. | Replaced with slDvUAU / dumbbell hammer curl and re-downloaded the GIF. |
| GIF | hanging-knee-raise | Hanging Knee Raise | 03lzqwk / assisted hanging knee raise | Assisted variation rather than an unassisted hanging raise. | Removed map entry and bundled file; no faithful unassisted record exists. |
| GIF | heels-elevated-goblet-squat | Heels-Elevated Goblet Squat | yn8yg1r / dumbbell goblet squat | Heels are not elevated. | Removed map entry and bundled file; no faithful elevated record exists. |
| GIF | incline-bench-rear-delt-raise | Incline-Bench Rear-Delt Dumbbell Raise | mu5Guxt / dumbbell rear delt raise | Standing bent-over raise with no incline-bench support. | Replaced with vYk8lqw / dumbbell incline rear lateral raise and re-downloaded the GIF. |
| GIF | kneeling-barbell-rollout | Kneeling Barbell Rollout | xnInPfE / barbell standing ab rollerout | Standing rollout rather than kneeling. | Replaced with 7M66AVi / barbell rollerout and re-downloaded the GIF. |
| GIF | lean-away-dumbbell-lateral-raise | Lean-Away Dumbbell Lateral Raise | DsgkuIt / dumbbell lateral raise | Ordinary bilateral raise with no lean or support. | Removed map entry and bundled file; no faithful record exists. |
| GIF | one-arm-dumbbell-floor-press | One-Arm Dumbbell Floor Press | zGSIWQi / dumbbell lying one arm press | Performed on a bench, not the floor. | Removed map entry and bundled file; no faithful floor-press record exists. |
| GIF | one-arm-dumbbell-row | One-arm Dumbbell Row | BJ0Hz5L / dumbbell bent over row | Bilateral unsupported row. | Replaced with C0MA9bC / dumbbell one arm bent-over row; its GIF uses bench support as ours does. |
| GIF | one-arm-machine-row | One-Arm Machine Row | OIFMAp1 / lever one arm lateral high row | High-row machine without the chest support required by ours. | Removed map entry and bundled file; no exact one-arm chest-supported record exists. |
| GIF | rear-delt-dumbbell-row | Rear-Delt Dumbbell Row | XUUD0Fs / dumbbell lying rear delt row | Prone chest-supported row instead of a bilateral unsupported hinge. | Removed map entry and bundled file; no faithful record exists. |
| GIF | resistance-band-kneeling-crunch | Resistance-Band Kneeling Crunch | 225x2Vd / band kneeling twisting crunch | Twists instead of performing straight trunk flexion. | Removed map entry and bundled file; no faithful record exists. |
| GIF | rope-hammer-curl | Rope Hammer Curl | PcPe0P5 / cable rope hammer preacher curl | Adds preacher-pad mechanics. | Replaced with HPlPoQA / cable hammer curl (with rope) and re-downloaded the GIF. |
| GIF | side-plank | Side Plank | 5VXmnV5 / bodyweight incline side plank | Forearm is elevated on a bench, not placed on the floor/mat. | Removed map entry and bundled file; no standard side-plank record exists. |
| GIF | single-leg-romanian-deadlift | Single-Leg Romanian Deadlift | rR0LJzx / dumbbell romanian deadlift | Bilateral stance with no free leg reaching back. | Replaced with gKozT8X / dumbbell single leg deadlift and re-downloaded the GIF. |
| GIF | sliding-hamstring-curl | Sliding Hamstring Curl | C5jncD2 / standing single leg curl | Standing knee flexion instead of a supine sliding bridge curl. | Removed map entry and bundled file; nearby records depict standing or kneeling curls. |
| GIF | smith-machine-romanian-deadlift | Smith Machine Romanian Deadlift | UfePqpx / smith deadlift | Conventional knee-dominant Smith deadlift, not an RDL hinge. | Removed map entry and bundled file; no Smith RDL record exists. |
| GIF | supported-seated-dumbbell-press | Supported Seated Dumbbell Press | 3d7wHyd / dumbbell bench seated press | Uses a flat bench without back support. | Replaced with f1jf47L / dumbbell seated shoulder press (parallel grip), whose GIF has a backrest. |
| GIF | triceps-extension | Triceps Extension | mpKZGWz / dumbbell lying triceps extension | Lying skull-crusher rather than an overhead extension. | Replaced with kont8Ut / dumbbell seated triceps extension and re-downloaded the GIF. |
| GIF | weighted-single-leg-calf-raise | Weighted Single-Leg Calf Raise | fKZgDEO / single leg calf raise (on a dumbbell) | GIF does not visibly hold the prescribed weight. | Replaced with 1kB3Wmk / dumbbell single leg calf raise and re-downloaded the GIF. |
| Video | vr-boxing | VR Boxing | videoUrl: ''; videoType: none; videoTitle: '' | Explicit empty video fields; there is no ID to validate. | Removed the three empty fields; no replacement ID was guessed. |

## Suspicious (needs a human eye)

| Media | Library id | Our name | Current source/title | Finding | Change or decision |
|---|---|---|---|---|---|
| GIF | high-incline-dumbbell-press | High-Incline Dumbbell Press | ns0SIbU / dumbbell incline bench press | Dataset specifies a normal 45-degree incline; playback review should decide whether the GIF angle is sufficiently high. | Left unchanged for human review. |
| GIF | high-incline-one-arm-dumbbell-press | High-Incline One-Arm Dumbbell Press | rDAiRf9 / dumbbell incline one arm press | The movement is right, but the defining high-incline angle is not proven. | Left unchanged for human review. |
| GIF | one-arm-cable-row | One-Arm Cable Row | EIsE3u8 / cable one arm bent over row | Correct unilateral cable row, but it adds a pronounced bent-over split stance. | Left unchanged for human review. |
| GIF | one-arm-dumbbell-overhead-press | Standing One-Arm Dumbbell Overhead Press | ocYc6Db / dumbbell standing one arm palm in press | Adds a neutral grip and free-hand bench support absent from our metadata. | Left unchanged for human review. |
| GIF | paused-barbell-bench-press | Paused Barbell Bench Press | EIeI8Vf / barbell bench press | Dataset instructions require a pause, but the generic record name does not prove that the GIF visibly holds it. | Left unchanged for playback review. |
| Video | plank-with-glute-squeeze | Plank with Glute Squeeze | A2b2EmIg0dA / Plank with Glute Squeeze Form Guide; oEmbed: How To Plank (Proper Form \| Cues \| Progressions) — E3 Rehab | The live source metadata proves only a generic plank tutorial, not the glute-squeeze/posterior-tilt modifier. | Left unchanged for playback review. |

## OK

| Media | Library id | Our name | Current source/title | Finding | Change or decision |
|---|---|---|---|---|---|
| GIF | assisted-pull-up | Assisted Pull-Up | kiJ4Z2K / assisted pull-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | barbell-curl | Barbell Curl | 25GPyDY / barbell curl | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | barbell-row | Barbell Row | eZyBC3j / barbell bent over row | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | bench-press | Bench Press | EIeI8Vf / barbell bench press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | bulgarian-split-squat | Bulgarian Split Squat | qx4fgX7 / dumbbell single leg split squat | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | cable-chest-fly | Cable Fly | FVmZVhk / cable low fly | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | cable-curl | Cable Curl | G08RZcQ / cable curl | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | cable-kneeling-crunch | Cable Kneeling Crunch | WW95auq / cable kneeling crunch | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | cable-lateral-raise | Cable Lateral Raise | goJ6ezq / cable lateral raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | cable-overhead-triceps-extension | Cable Overhead Triceps Extension | 2IxROQ1 / cable overhead triceps extension (rope attachment) | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | cable-rear-delt-fly | Cable Rear-Delt Fly | P5p0j8B / cable standing cross-over high reverse fly | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | cable-row | Seated Cable Row | fUBheHs / cable seated row | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | cable-triceps-pressdown | Cable Triceps Pressdown | gAwDzB3 / cable triceps pushdown (v-bar) | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | calf-raise | Calf Raise | bJYHBIN / bodyweight standing calf raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | chest-press-machine | Chest Press Machine | DOoWcnA / lever chest press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | chest-supported-dumbbell-row | Chest-Supported Dumbbell Row | 7vG5o25 / dumbbell incline row | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | chest-supported-machine-row | Chest-Supported Machine Row | 7I6LNUG / lever seated row | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | chest-supported-t-bar-row | Chest-Supported T-Bar Row | aaXr7ld / lever t bar row | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | chin-up | Chin-up | T2mxWqc / chin-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | close-grip-push-up | Close-Grip Push-Up | x6KpKpq / close-grip push-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dead-bug | Dead Bug | iny3m5y / dead bug | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | diamond-push-up | Diamond Push-up | soIB2rj / diamond push-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dips | Dips | O2K9Vb5 / wide-grip chest dip on high parallel bars | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | double-dumbbell-squat | Double-Dumbbell Squat | HsvHqgf / dumbbell squat | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-bench-press | Dumbbell Bench Press | SpYC0Kp / dumbbell bench press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-curl | Dumbbell Curl | NbVPDMW / dumbbell biceps curl | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-fly | Dumbbell Fly | yz9nUhF / dumbbell fly | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-lateral-raise | Dumbbell Lateral Raise | DsgkuIt / dumbbell lateral raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-pullover | Dumbbell Pullover | 9XjtHvS / dumbbell pullover | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-reverse-lunge | Dumbbell Reverse Lunge | SSsBDwB / dumbbell rear lunge | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-romanian-deadlift | Dumbbell Romanian Deadlift | rR0LJzx / dumbbell romanian deadlift | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-shoulder-press | Dumbbell Shoulder Press | znQUdHY / dumbbell seated shoulder press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | dumbbell-step-up | Dumbbell Step-Up | aXtJhlg / dumbbell step-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | elliptical-cardio | Elliptical Cardio | rjtuP6X / walk elliptical cross trainer | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | farmer-carry | Farmer Carry | qPEzJjA / farmers walk | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | feet-elevated-push-up | Feet-elevated Push-up | i5cEhka / decline push-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | front-squat | Front Squat | zG0zs85 / barbell front squat | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | glute-bridge | Glute Bridge | u0cNiij / low glute bridge on floor | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | glute-bridge-march | Glute Bridge March | GibBPPg / glute bridge march | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | goblet-squat | Heavy Goblet Squat | yn8yg1r / dumbbell goblet squat | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | hack-squat | Hack Squat | Qa55kX1 / sled hack squat | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | hanging-leg-raise | Hanging Leg Raise | I3tsCnC / hanging leg raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | incline-barbell-press | Incline Barbell Press | 3TZduzM / barbell incline bench press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | incline-chest-press-machine | Incline Chest Press Machine | jHAnWmT / lever incline chest press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | incline-dumbbell-curl | Incline Dumbbell Curl | ae9UoXQ / dumbbell incline curl | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | incline-dumbbell-press | Incline Dumbbell Press | ns0SIbU / dumbbell incline bench press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | incline-push-up | Incline Push-Up | B1EVP9F / incline push-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | incline-smith-machine-press | Incline Smith Machine Press | 5v7KYld / smith incline bench press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | inverted-row | Inverted Row | bZGHsAZ / inverted row | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | lateral-raise-machine | Lateral Raise Machine | dRTfGZT / lever lateral raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | leg-extension | Leg Extension | my33uHU / lever leg extension | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | leg-press | Leg Press | 10Z2DXU / sled 45в° leg press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | leg-press-calf-raise | Leg-Press Calf Raise | IeDEXTe / lever seated squat calf raise on leg press machine | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | lying-leg-curl | Lying Leg Curl | 17lJ1kr / lever lying leg curl | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | lying-leg-raise | Lying Leg Raise | 9IxJdtC / lying leg-hip raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | machine-row | Seated Machine Row | 7I6LNUG / lever seated row | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | machine-shoulder-press | Machine Shoulder Press | 67n3r98 / lever shoulder press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | neutral-grip-lat-pulldown | Neutral-Grip Lat Pulldown | rkg41Fb / twin handle parallel grip lat pulldown | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | neutral-grip-pull-up | Neutral-Grip Pull-Up | 0V2YQjW / pull up (neutral grip) | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | pendlay-row | Pendlay Row | r0z6xzQ / barbell pendlay row | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | posterior-pelvic-tilt | Posterior Pelvic Tilt | NKJ8o6x / pelvic tilt | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | preacher-curl | Preacher Curl | b6hQYMb / lever preacher curl | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | pull-up | Pull-up | lBDjFxJ / pull-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | push-up-plus | Push-Up Plus | pvBMLHA / push-up plus | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | rear-delt-raise | Rear Delt Raise | mu5Guxt / dumbbell rear delt raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | resistance-band-pallof-press | Resistance-Band Pallof Press | 9pa4H5m / band horizontal pallof press | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | reverse-crunch | Reverse Crunch | nCU1Ekp / reverse crunch | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | romanian-deadlift | Romanian Deadlift | wQ2c4XD / barbell romanian deadlift | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | seated-calf-machine-raise | Seated Calf Machine Raise | bOOdeyc / lever seated calf raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | seated-dumbbell-calf-raise | Seated Dumbbell Calf Raise | r29jP7S / dumbbell seated calf raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | seated-leg-curl | Seated Leg Curl | Zg3XY7P / lever seated leg curl | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | shoulder-width-pull-up | Shoulder-Width Pull-Up | YtgD7Xq / shoulder grip pull-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | skipping-rope | Skipping Rope | e1e76I2 / jump rope | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | skull-crusher | Skull Crusher | mpKZGWz / dumbbell lying triceps extension | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | smith-machine-bulgarian-split-squat | Smith Machine Bulgarian Split Squat | wWFspEi / smith single leg split squat | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | smith-machine-squat | Smith Machine Squat | jFtipLl / smith squat | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | squat | Squat | qXTaZnJ / barbell full squat | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | standing-calf-machine-raise | Standing Calf Machine Raise | ykUOVze / lever standing calf raise | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | stationary-cycling | Stationary Cycling | H1PESYI / stationary bike run | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | sumo-deadlift | Sumo Deadlift | KgI0tqW / barbell sumo deadlift | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | weighted-chin-up | Weighted Chin-Up | Gk1r408 / weighted close grip chin-up on dip cage | Faithful movement, equipment, muscles, and defining setup. | None. |
| GIF | weighted-pull-up | Weighted Pull-up | HMzLjXx / weighted pull-up | Faithful movement, equipment, muscles, and defining setup. | None. |
| Video | barbell-row | Barbell Row | kBWAon7ItDw / Barbell Row Form Guide; oEmbed: How To PROPERLY Barbell Row For A Bigger Back (Stop Making These Mistakes!) — Jeremy Ethier | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | bench-press | Bench Press | 4Y2ZdHCOXok / Bench Press Form Guide; oEmbed: How to PROPERLY Bench Press for Growth (5 Easy Steps) — Jeremy Ethier | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | bulgarian-split-squat | Bulgarian Split Squat | DeCnHqrN22U / Bulgarian Split Squat Form Guide; oEmbed: How To Perform Bulgarian Split Squats \| Legs Exercise Tutorial — Buff Dudes Workouts | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | chin-up | Chin-up | e1YSApl-QcM / Chin-up Form Guide; oEmbed: PERFECT CHIN-UPS \| The Only Chin-up Tutorial You'll Ever Need (Full Guide) — Simonster Strength | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | dead-bug | Dead Bug | bxn9FBrt4-A / Dead Bug Form Guide; oEmbed: How to do a Dead Bug \| Proper Form & Technique \| NASM — National Academy of Sports Medicine (NASM) | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | diamond-push-up | Diamond Push-up | J0DnG1_S92I / Diamond Push-up Form Guide; oEmbed: How To: Diamond Push-Up — ScottHermanFitness | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | dips | Dips | yN6Q1UI_xkE / Dips Form Guide (Chest Focus); oEmbed: How To Do Dips For A Bigger Chest and Shoulders (Fix Mistakes!) — Jeff Nippard | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | dumbbell-fly | Dumbbell Fly | QENKPHhQVi4 / Dumbbell Fly Form Guide; oEmbed: How to Properly Do a DUMBBELL FLY \| Mind Pump — Mind Pump TV | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | dumbbell-lateral-raise | Dumbbell Lateral Raise | XNKqPCDtC1k / Dumbbell Lateral Raise Form Guide; oEmbed: Dumbbell Lateral Raises \| How To \| Proper Form & Technique — FITTR | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | dumbbell-shoulder-press | Dumbbell Shoulder Press | qEwKCR5JCog / Dumbbell Shoulder Press Form Guide; oEmbed: How To: Dumbbell Shoulder Press — ScottHermanFitness | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | feet-elevated-push-up | Feet-elevated Push-up | SKPab2YC8BE / Feet-elevated (Decline) Push-up Form Guide; oEmbed: How To: Decline Push-Up — ScottHermanFitness | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | glute-bridge | Glute Bridge | wPM8icPu6H8 / Glute Bridge Form Guide; oEmbed: How To Do A Glute Bridge \| The Right Way \| Well+Good — Well+Good | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | hanging-knee-raise | Hanging Knee Raise | G6a5267YpHM / Hanging Knee Raise Form Guide; oEmbed: Hanging Knee Raise \| Proper Form Tutorial for Core Strength — FIT.nl | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | hip-flexor-stretch | Hip Flexor Stretch | Bfb-9dIWEr4 / Hip Flexor Stretch Form Guide; oEmbed: How To: Half Kneeling Hip Flexor Stretch — Live Lean TV Daily Exercises | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | hip-thrust | Hip Thrust | pBH7pKHn-dI / Hip Thrust Form Guide; oEmbed: How to Perform Barbell Hip Thrusts \| Glutes Exercise Tutorial — Buff Dudes Workouts | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | hollow-body-hold | Hollow Body Hold | 0yPin8hSc8o / Hollow Body Hold Form Guide; oEmbed: Hollow Body Hold \| Proper Form Tutorial for Core Stability — FIT.nl | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | incline-dumbbell-press | Incline Dumbbell Press | 8iPEnn-ltC8 / Incline Dumbbell Press Form Guide; oEmbed: How To: Dumbbell Incline Chest Press — ScottHermanFitness | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | inverted-row | Inverted Row | GdyhjXlxE-U / Inverted Row Form Guide; oEmbed: How To PROPERLY Inverted Row For Muscle Gain — Colossus Fitness | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | lying-leg-raise | Lying Leg Raise | xJJu-WiROM8 / Lying Leg Raise Form Guide; oEmbed: How To Perform The Lying Leg Raise Exercise — Dimitri Giankoulas | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | one-arm-dumbbell-row | One-arm Dumbbell Row | pYcpY20QaE8 / One-arm Dumbbell Row Form Guide; oEmbed: How To: Dumbbell Bent-Over Row (Single-Arm) — ScottHermanFitness | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | pike-push-up | Pike Push-up | 2b5t0Cu2nQI / Pike Push-up Form Guide; oEmbed: How to do a Pike Push-Up \| Proper Form & Technique \| NASM — National Academy of Sports Medicine (NASM) | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | plank | Plank | mH5Sfb_KTGg / Plank Form Guide; oEmbed: How to do a Forearm Plank \| The Right Way \| Well+Good — Well+Good | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | posterior-pelvic-tilt | Posterior Pelvic Tilt | D00Ixukw8bw / Posterior Pelvic Tilt Form Guide; oEmbed: How to do a Posterior Pelvic Tilt - Posture, Strength, & Warm Up - Wellen — Wellen | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | pull-up | Pull-up | MhokcbRLP5w / Pull-up Form Guide; oEmbed: How to Pull-Up CORRECTLY (3 Step Guide) — FitnessFAQs | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | rear-delt-raise | Rear Delt Raise | rQhdsa5QdVU / Rear Delt Raise Form Guide; oEmbed: How to Perform the Standing Rear Delt Raise / Reverse Dumbbell Fly — Brian Schmitt Fitness | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | reverse-crunch | Reverse Crunch | yH-oSzE5_g0 / Reverse Crunch Form Guide; oEmbed: How to do a Reverse Crunch \| The Right Way \| Well+Good — Well+Good | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | romanian-deadlift | Romanian Deadlift | uhghy9pFIPY / Romanian Deadlift Form Guide; oEmbed: How To Perform PERFECT Romanian Deadlifts \| RDLs (Everything You Need To Know) — E3 Rehab | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | side-plank | Side Plank | XeN4pEZZJNI / Side Plank Form Guide; oEmbed: How To Do A Side Plank \| The Right Way \| Well+Good — Well+Good | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | skipping-rope | Skipping Rope | _UTR1VWg8WY / Skipping Rope Beginner Guide; oEmbed: How to Jump Rope for Beginners (Step-by-Step Tutorial to Learn Fast) — Always Ghadi | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | squat | Squat | gcNh17Ckjgg / Squat Form Guide; oEmbed: How to PROPERLY Squat for Growth (4 Easy Steps) — Jeremy Ethier | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | treadmill-incline-walk | Treadmill Incline Walk | NAsObfFJXvE / Treadmill Incline Walk Guide (12-3-30); oEmbed: How To: Incline Treadmill Walk (12-3-30 Workout) — Live Lean TV Daily Exercises | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | weighted-pull-up | Weighted Pull-up | HuuyDNGrCI8 / Weighted Pull-up Form Guide; oEmbed: How To: Weighted Pull-Up — ScottHermanFitness | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
| Video | weighted-push-up | Weighted Push-up | _M0YXeKNB5s / Weighted Push-up (Backpack) Form Guide; oEmbed: Weighted Push Up with Backpack and Weight Plate - Exercise Demo Video — THECoachDannyB | Canonical embed URL; oEmbed returned HTTP 200 and the title is on-topic. | None. |
