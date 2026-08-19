import { t } from '../i18n/t'
/**
 * Step 20 - environment config helpers.
 *
 * Single place to read Vite env vars so pages never touch import.meta.env
 * directly. Missing Supabase values are NOT an error: the app falls back to
 * LOCAL MODE (localStorage only) and validateEnv() reports it as a warning.
 */

const DEFAULT_APP_NAME = 'Fitness Tracker'

function readEnv() {
  try {
    return import.meta.env ?? {}
  } catch {
    return {}
  }
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function getEnvConfig() {
  const env = readEnv()

  const supabaseUrl = cleanString(env.VITE_SUPABASE_URL)
  const supabaseAnonKey = cleanString(env.VITE_SUPABASE_ANON_KEY)
  const appName = cleanString(env.VITE_APP_NAME) || DEFAULT_APP_NAME

  // VITE_APP_ENV is the app-level flag; Vite's own MODE is the fallback so
  // "vite build" still counts as production when VITE_APP_ENV is not set.
  const appEnv =
    cleanString(env.VITE_APP_ENV) ||
    (env.PROD ? 'production' : 'development')

  return {
    supabaseUrl,
    supabaseAnonKey,
    appName,
    appEnv,
    isSupabaseConfigured: Boolean(
      supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'),
    ),
    isProduction: appEnv === 'production',
  }
}

/**
 * Returns a list of { level: 'warn'|'info', message } entries describing
 * environment problems. An empty list means cloud mode is fully configured.
 */
export function validateEnv() {
  const config = getEnvConfig()
  const warnings = []

  if (!config.supabaseUrl) {
    warnings.push({
      level: 'warn',
      message: t('env.missingUrl'),
    })
  } else if (!config.supabaseUrl.startsWith('http')) {
    warnings.push({
      level: 'warn',
      message: 'VITE_SUPABASE_URL does not look like a valid URL.',
    })
  }

  if (!config.supabaseAnonKey) {
    warnings.push({
      level: 'warn',
      message: t('env.missingKey'),
    })
  }

  if (!config.isSupabaseConfigured) {
    warnings.push({
      level: 'info',
      message: config.isProduction
        ? t('env.notConfigured')
        : t('env.localOnly'),
    })
  }

  return warnings
}

/** Short label for the environment badge in Settings / Data Health. */
export function getEnvironmentLabel() {
  const config = getEnvConfig()
  const runtime = config.isProduction
    ? t('env.production')
    : t('env.development')
  const mode = config.isSupabaseConfigured ? t('env.cloudMode') : t('env.localMode')
  return { runtime, mode }
}
