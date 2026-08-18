/**
 * Build-time switches for things that must never reach a real user.
 *
 * The demo-data helpers write fabricated sessions, check-ins and nutrition logs
 * into the same storage keys as real entries, with no way to tell them apart
 * afterwards. They are useful while developing and dangerous in a shipped
 * build, so the buttons that call them are gated on this.
 */
export const SHOW_DEMO_DATA = import.meta.env.DEV === true

/**
 * The pre-deploy checklist is a developer runbook ("npm run build passes"), not
 * something a person tracking their training needs to see.
 */
export const SHOW_DEV_PAGES = import.meta.env.DEV === true
