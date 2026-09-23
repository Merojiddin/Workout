# Project maintenance

- Read `docs/PROJECT_MAP.md` before changing application files.
- Keep `docs/PROJECT_MAP.md` current in every change: update affected file responsibilities, behavior/data flow, storage formats, and verification commands. If the architecture is unchanged, record the relevant behavior change in the map's update notes.
- Preserve users' existing workout programs, edits, session history, and per-account data isolation.
- Add user-facing messages in both English and Vietnamese locale files.
- Run checks appropriate to the change; `npm run build` checks TypeScript and the production build. See the map for feature regression scripts.
