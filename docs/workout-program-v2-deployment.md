# Workout Program Version 2 Deployment Runbook

This runbook covers preview verification and a later, separately approved production release of the workout/program upgrade. It does not authorize a production deployment.

## Branch and release state

- The repository's production branch is `main`.
- Vercel is the existing deployment provider and is connected to `Merojiddin/Workout`.
- Push a focused non-`main` branch to create a Vercel Preview deployment through the existing Git integration.
- Do not merge or promote the preview branch until preview verification is complete and production approval is explicit.
- Keep unrelated working-tree changes, local exercise images, `.env` files, credentials, build output, debug files, and storage exports out of the release commit.

## Required local checks

Run these commands from the repository root before creating or updating a preview:

```sh
npm run build
npm run lint
npm run typecheck
npm run verify:plan-reset
```

Also run the Version 2 validator and the isolated Program Manager, timed logging, historical compatibility, export/backup, and cloud-path verification harnesses documented in the Part 6A audit. Do not point any harness at production Supabase or real user browser storage.

## Expected release files

The focused workout/program release includes only the Program Manager and registry architecture, Version 2 program data, shared exercise and identity changes, active-program consumers, timed logging/history/export/print support, reset regression harness, and associated documentation. Before committing, inspect both `git diff --cached --name-status` and `git diff --cached`; do not use broad staging that could collect unrelated files.

In particular:

- include only the scoped Program Manager and Extra Workouts additions from `src/App.css`;
- exclude the pre-existing exercise-thumbnail CSS edits;
- exclude unrelated local exercise image substitutions in `src/data/exerciseLibrary.ts`;
- exclude the untracked `public/exercise-images/` directory; and
- never include `.env*`, `.vercel/`, credentials, local storage exports, `dist/`, or `node_modules/`.

## Create a Vercel Preview

1. Create or switch to a focused non-`main` release branch.
2. Stage only the audited workout/program files and partial hunks described above.
3. Recheck the staged patch for whitespace errors, unrelated changes, and secrets.
4. Commit the focused patch.
5. Push that non-`main` branch to `origin` without force.
6. Wait for the linked Vercel Git deployment to finish and record only the real Preview URL returned by Vercel.

Do not run a production deployment command, push workout changes directly to `main`, change the Vercel production branch, or modify production environment variables.

## Preview smoke checks

Use an authorized preview session and avoid destructive tests if the preview could share production data.

1. Confirm the application loads and the authentication boundary behaves correctly.
2. Confirm the legacy workout path loads.
3. Open Program Manager. Version 2 must be available but not automatically installed.
4. Preview `upper-recomposition@2.0.0`; confirm all seven days, six training days, one rest day, and the intended exercises.
5. In isolated/non-production storage, install Version 2 and confirm an install backup is created.
6. Open Plan Editor, modify a Version 2 day, reset it, and confirm the exact Version 2 baseline returns without any Version 1-only exercise.
7. Reload, modify, and reset again; confirm program identity is still `upper-recomposition@2.0.0` and unrelated days/history are unchanged.
8. Log representative timed sets: Farmer Carry `40s`, Easy Indoor Swimming `1320s`, and Couch Hip-Flexor Stretch `45s`. Confirm recovery, completion, history, CSV, and print where practical.
9. Confirm timed-only sets are counted correctly and excluded from strength charts.
10. Confirm legacy/id-less/archived historical entries remain readable.
11. Check for relevant runtime, network, and console errors.

If the Preview environment shares production storage or Supabase, do not install, reset, complete, delete, or otherwise mutate data there. Limit the smoke test to read-only paths and report the constraint.

## PWA reload note

The application ships a service worker. After a new deployment, close stale tabs or perform a hard reload and wait for the new service worker to activate before diagnosing an apparent old-bundle result. Do not clear all site storage as a routine cache fix because that can erase local workout data and install backups.

## Later production rollout — separate approval required

Only after preview verification and explicit production authorization:

1. Reconfirm the focused commit and all required checks.
2. Confirm production environment configuration is already present; do not copy, reveal, or manually rewrite secrets during rollout.
3. Merge through the repository's normal reviewed flow to the configured production branch.
4. Let the existing Vercel Git integration create the production deployment.
5. Perform non-destructive production smoke checks first. Version 2 must remain opt-in and existing users must remain on their current active program.
6. Never clear user storage and never manually edit production Supabase rows to install, repair, or roll back a program.

## Rollback

For an application-release problem, use Vercel's existing deployment history to restore or promote the previous known-good deployment according to the project's normal provider workflow. Do not force-push or rewrite Git history.

For an individual user's explicit Version 2 rollback, use the Program Manager's stored install backup/restore action. That path preserves the existing workout history and verifies cloud/local ordering. Do not simulate rollback by deleting browser keys, clearing site storage, or editing Supabase rows manually.

After either rollback, reload with the PWA note above and verify the active program identity, all seven days, workout history, and timed-session compatibility.
