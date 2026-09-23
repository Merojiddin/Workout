# Workout OS

React + TypeScript/JavaScript workout tracker built with Vite, with optional Supabase accounts, offline storage, English/Vietnamese, and PWA support.

Start with the [project map](docs/PROJECT_MAP.md) for pages, feature ownership, data flow, storage, and verification. Keep it updated whenever the app changes; see [AGENTS.md](AGENTS.md).

```sh
npm install
npm run dev
npm run build
npm run lint
```

Workout plans are personal uploads. On the main Workout page, choose Home or Gym, then select a saved plan. Add plan saves another option in Home, Gym, or both without replacing your current plan. See [program authoring and import](docs/adding-workout-programs.md).

```sh
npm run verify:plan-library
npm run verify:plan-reset
npm run verify:v2.1
```

See [deployment](docs/deployment.md) and [multi-user setup](docs/multi-user-setup.md) for hosting and Supabase configuration.
