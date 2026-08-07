import { getBodyCheckIns } from './bodyCheckInUtils'
import { getActiveWorkoutSession } from './liveWorkoutUtils'
import { getNutritionLogs } from './nutritionUtils'
import { getWorkoutSessions } from './progressUtils'
import {
  getCustomWorkoutPlan,
  getUserProfileSettings,
  getWorkoutForDate,
} from './settingsUtils'
import { safeGetJSON, safeSetJSON } from './storageUtils'

export const REMINDER_SETTINGS_KEY = 'reminderSettings'
export const REMINDER_SETTINGS_EVENT = 'fitness-reminder-settings-updated'

export const defaultReminderSettings = {
  notificationsEnabled: false,

  workoutReminderEnabled: true,
  workoutReminderTime: '18:00',

  creatineReminderEnabled: true,
  creatineReminderTime: '10:00',

  proteinReminderEnabled: true,
  proteinReminderTime: '20:00',

  waterReminderEnabled: true,
  waterReminderTimes: ['11:00', '15:00', '19:00'],

  bodyCheckInReminderEnabled: true,
  bodyCheckInDay: 'Sunday',
  bodyCheckInTime: '09:00',

  weeklyReviewReminderEnabled: true,
  weeklyReviewDay: 'Sunday',
  weeklyReviewTime: '20:00',

  unfinishedWorkoutReminderEnabled: true,
  unfinishedWorkoutDelayMinutes: 60,

  restTimerNotificationEnabled: true,
}

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function getReminderSettings() {
  if (typeof window === 'undefined') {
    return clone(defaultReminderSettings)
  }

  return normalizeReminderSettings(
    safeGetJSON(REMINDER_SETTINGS_KEY, clone(defaultReminderSettings)),
  )
}

export function saveReminderSettings(settings) {
  const normalized = normalizeReminderSettings(settings)

  if (typeof window !== 'undefined') {
    if (safeSetJSON(REMINDER_SETTINGS_KEY, normalized)) {
      notifyReminderSettingsChanged()
    }
  }

  return normalized
}

export function resetReminderSettings() {
  const defaults = clone(defaultReminderSettings)

  if (typeof window !== 'undefined') {
    if (safeSetJSON(REMINDER_SETTINGS_KEY, defaults)) {
      notifyReminderSettingsChanged()
    }
  }

  return defaults
}

export async function requestNotificationPermission() {
  if (!canUseNotifications()) {
    return 'unsupported'
  }

  try {
    return await window.Notification.requestPermission()
  } catch {
    return getNotificationPermissionStatus()
  }
}

export function canUseNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermissionStatus() {
  if (!canUseNotifications()) {
    return 'unsupported'
  }

  return window.Notification.permission
}

export function showBrowserNotification(title, options = {}) {
  if (!canUseNotifications() || window.Notification.permission !== 'granted') {
    return false
  }

  try {
    const notification = new window.Notification(title, {
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      ...options,
    })

    return Boolean(notification)
  } catch {
    return false
  }
}

export function shouldSendWorkoutReminder(
  settings,
  currentTime,
  workoutSessions,
) {
  const safeSettings = normalizeReminderSettings(settings)
  const now = toDate(currentTime)

  return (
    safeSettings.workoutReminderEnabled &&
    isMatchingTime(now, safeSettings.workoutReminderTime) &&
    !hasCompletedWorkoutOn(workoutSessions, toDateKey(now))
  )
}

export function shouldSendCreatineReminder(
  settings,
  currentTime,
  nutritionLogs,
) {
  const safeSettings = normalizeReminderSettings(settings)
  const now = toDate(currentTime)
  const todayLog = getTodayNutritionLog(nutritionLogs, now)

  return (
    safeSettings.creatineReminderEnabled &&
    isMatchingTime(now, safeSettings.creatineReminderTime) &&
    !todayLog?.creatineTaken
  )
}

export function shouldSendProteinReminder(
  settings,
  currentTime,
  nutritionLogs,
) {
  const safeSettings = normalizeReminderSettings(settings)
  const now = toDate(currentTime)
  const todayLog = getTodayNutritionLog(nutritionLogs, now)
  const proteinTarget = getProteinTargetMin()
  const protein = toNumber(todayLog?.proteinGrams, 0)

  return (
    safeSettings.proteinReminderEnabled &&
    isMatchingTime(now, safeSettings.proteinReminderTime) &&
    protein < proteinTarget
  )
}

export function shouldSendWaterReminder(settings, currentTime, nutritionLogs) {
  const safeSettings = normalizeReminderSettings(settings)
  const now = toDate(currentTime)
  const currentTimeKey = toTimeKey(now)
  const todayLog = getTodayNutritionLog(nutritionLogs, now)
  const waterTarget = getWaterTargetMin()
  const water = toNumber(todayLog?.waterLiters, 0)

  return (
    safeSettings.waterReminderEnabled &&
    safeSettings.waterReminderTimes.includes(currentTimeKey) &&
    water < waterTarget
  )
}

export function shouldSendBodyCheckInReminder(
  settings,
  currentTime,
  bodyCheckIns,
) {
  const safeSettings = normalizeReminderSettings(settings)
  const now = toDate(currentTime)

  return (
    safeSettings.bodyCheckInReminderEnabled &&
    isMatchingDay(now, safeSettings.bodyCheckInDay) &&
    isMatchingTime(now, safeSettings.bodyCheckInTime) &&
    !hasRecentBodyCheckIn(bodyCheckIns, now, 7)
  )
}

export function shouldSendWeeklyReviewReminder(
  settings,
  currentTime,
  workoutSessions,
) {
  const safeSettings = normalizeReminderSettings(settings)
  const now = toDate(currentTime)

  return (
    safeSettings.weeklyReviewReminderEnabled &&
    isMatchingDay(now, safeSettings.weeklyReviewDay) &&
    isMatchingTime(now, safeSettings.weeklyReviewTime) &&
    Array.isArray(workoutSessions)
  )
}

export function shouldSendUnfinishedWorkoutReminder(
  settings,
  activeWorkoutSession,
) {
  const safeSettings = normalizeReminderSettings(settings)
  if (
    !safeSettings.unfinishedWorkoutReminderEnabled ||
    !activeWorkoutSession ||
    activeWorkoutSession.completed === true
  ) {
    return false
  }

  const lastActive = getActiveWorkoutTimestamp(activeWorkoutSession)
  if (!lastActive) {
    return false
  }

  const elapsedMinutes = (Date.now() - lastActive) / 60000
  return elapsedMinutes >= safeSettings.unfinishedWorkoutDelayMinutes
}

export function getInAppReminders() {
  const settings = getReminderSettings()
  const now = new Date()
  const today = toDateKey(now)
  const currentTime = toTimeKey(now)
  const weekKey = getWeekKey(now)
  const workoutSessions = safeArray(getWorkoutSessions())
  const nutritionLogs = safeArray(getNutritionLogs())
  const bodyCheckIns = safeArray(getBodyCheckIns())
  const activeWorkoutSession = getActiveWorkoutSession()
  const todayWorkout = getTodayWorkout(now)
  const reminders = []

  if (shouldSendWorkoutReminder(settings, now, workoutSessions)) {
    reminders.push(
      createReminderCandidate({
        type: 'workout',
        title: 'Workout Reminder',
        message: `Today's workout is Day ${todayWorkout.day} - ${todayWorkout.name}. Start when ready.`,
        logKey: `workout-${today}`,
      }),
    )
  }

  if (shouldSendCreatineReminder(settings, now, nutritionLogs)) {
    reminders.push(
      createReminderCandidate({
        type: 'creatine',
        title: 'Creatine Reminder',
        message: 'Creatine not logged today. Take 3-5 g if you have not taken it.',
        logKey: `creatine-${today}`,
      }),
    )
  }

  if (shouldSendProteinReminder(settings, now, nutritionLogs)) {
    reminders.push(
      createReminderCandidate({
        type: 'protein',
        title: 'Protein Reminder',
        message: 'Protein is below target. Aim for 120-160 g today.',
        logKey: `protein-${today}`,
      }),
    )
  }

  if (shouldSendWaterReminder(settings, now, nutritionLogs)) {
    reminders.push(
      createReminderCandidate({
        type: 'water',
        title: 'Water Reminder',
        message: 'Water is low today. Drink more, especially if taking creatine.',
        logKey: `water-${today}-${currentTime}`,
      }),
    )
  }

  if (shouldSendBodyCheckInReminder(settings, now, bodyCheckIns)) {
    reminders.push(
      createReminderCandidate({
        type: 'body-check-in',
        title: 'Body Check-in Reminder',
        message:
          'No body check-in this week. Log weight, waist, chest, shoulders, and photos.',
        logKey: `body-check-in-${weekKey}`,
      }),
    )
  }

  if (shouldSendWeeklyReviewReminder(settings, now, workoutSessions)) {
    reminders.push(
      createReminderCandidate({
        type: 'weekly-review',
        title: 'Weekly Review Reminder',
        message: 'Review workouts, nutrition, body progress, and next week focus.',
        logKey: `weekly-review-${weekKey}`,
      }),
    )
  }

  if (shouldSendUnfinishedWorkoutReminder(settings, activeWorkoutSession)) {
    reminders.push(
      createReminderCandidate({
        type: 'unfinished-workout',
        title: 'Unfinished Workout',
        message: 'You have an unfinished workout. Continue or discard it.',
        logKey: `unfinished-workout-${activeWorkoutSession.id}-${today}`,
      }),
    )
  }

  return reminders
}

export function formatReminderDayAndTime(day, time) {
  return `${normalizeDay(day, 'Sunday')} at ${normalizeTime(time, '09:00')}`
}

export function toDateKey(date = new Date()) {
  const safeDate = toDate(date)
  const year = safeDate.getFullYear()
  const month = String(safeDate.getMonth() + 1).padStart(2, '0')
  const day = String(safeDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function toTimeKey(date = new Date()) {
  const safeDate = toDate(date)
  const hours = String(safeDate.getHours()).padStart(2, '0')
  const minutes = String(safeDate.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export function getDayNames() {
  return [...dayNames]
}

function createReminderCandidate({ type, title, message, logKey }) {
  return {
    id: `${logKey}-${Date.now()}`,
    type,
    title,
    message,
    createdAt: new Date().toISOString(),
    seen: false,
    dismissed: false,
    logKey,
  }
}

function normalizeReminderSettings(settings) {
  const source = isPlainObject(settings) ? settings : {}

  return {
    notificationsEnabled: toBoolean(
      source.notificationsEnabled,
      defaultReminderSettings.notificationsEnabled,
    ),
    workoutReminderEnabled: toBoolean(
      source.workoutReminderEnabled,
      defaultReminderSettings.workoutReminderEnabled,
    ),
    workoutReminderTime: normalizeTime(
      source.workoutReminderTime,
      defaultReminderSettings.workoutReminderTime,
    ),
    creatineReminderEnabled: toBoolean(
      source.creatineReminderEnabled,
      defaultReminderSettings.creatineReminderEnabled,
    ),
    creatineReminderTime: normalizeTime(
      source.creatineReminderTime,
      defaultReminderSettings.creatineReminderTime,
    ),
    proteinReminderEnabled: toBoolean(
      source.proteinReminderEnabled,
      defaultReminderSettings.proteinReminderEnabled,
    ),
    proteinReminderTime: normalizeTime(
      source.proteinReminderTime,
      defaultReminderSettings.proteinReminderTime,
    ),
    waterReminderEnabled: toBoolean(
      source.waterReminderEnabled,
      defaultReminderSettings.waterReminderEnabled,
    ),
    waterReminderTimes: normalizeTimeList(
      source.waterReminderTimes,
      defaultReminderSettings.waterReminderTimes,
    ),
    bodyCheckInReminderEnabled: toBoolean(
      source.bodyCheckInReminderEnabled,
      defaultReminderSettings.bodyCheckInReminderEnabled,
    ),
    bodyCheckInDay: normalizeDay(
      source.bodyCheckInDay,
      defaultReminderSettings.bodyCheckInDay,
    ),
    bodyCheckInTime: normalizeTime(
      source.bodyCheckInTime,
      defaultReminderSettings.bodyCheckInTime,
    ),
    weeklyReviewReminderEnabled: toBoolean(
      source.weeklyReviewReminderEnabled,
      defaultReminderSettings.weeklyReviewReminderEnabled,
    ),
    weeklyReviewDay: normalizeDay(
      source.weeklyReviewDay,
      defaultReminderSettings.weeklyReviewDay,
    ),
    weeklyReviewTime: normalizeTime(
      source.weeklyReviewTime,
      defaultReminderSettings.weeklyReviewTime,
    ),
    unfinishedWorkoutReminderEnabled: toBoolean(
      source.unfinishedWorkoutReminderEnabled,
      defaultReminderSettings.unfinishedWorkoutReminderEnabled,
    ),
    unfinishedWorkoutDelayMinutes: clampNumber(
      source.unfinishedWorkoutDelayMinutes,
      defaultReminderSettings.unfinishedWorkoutDelayMinutes,
      5,
      360,
    ),
    restTimerNotificationEnabled: toBoolean(
      source.restTimerNotificationEnabled,
      defaultReminderSettings.restTimerNotificationEnabled,
    ),
  }
}

function getTodayWorkout(date) {
  try {
    return getWorkoutForDate(date, getCustomWorkoutPlan())
  } catch {
    return { day: 1, name: 'Workout' }
  }
}

function getTodayNutritionLog(logs, date) {
  const today = toDateKey(date)
  return safeArray(logs).find((log) => log?.date === today) ?? null
}

function hasCompletedWorkoutOn(sessions, dateKey) {
  return safeArray(sessions).some((session) => {
    if (session?.date !== dateKey) {
      return false
    }

    if (session.completed === true) {
      return true
    }

    return safeArray(session.exercises).some((exercise) =>
      safeArray(exercise?.sets).some(isCompletedSet),
    )
  })
}

function isCompletedSet(set) {
  return (
    toNumber(set?.reps, 0) > 0 || toNumber(set?.timeSeconds, 0) > 0
  )
}

function hasRecentBodyCheckIn(checkIns, date, days) {
  const cutoff = new Date(date)
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)

  return safeArray(checkIns).some((checkIn) => {
    const checkInDate = parseDateKey(checkIn?.date)
    return checkInDate !== null && checkInDate >= cutoff
  })
}

function getActiveWorkoutTimestamp(session) {
  const timestamps = [parseDateTime(session?.startedAt)]

  for (const exercise of safeArray(session?.exercises)) {
    for (const set of safeArray(exercise?.sets)) {
      timestamps.push(parseDateTime(set?.completedAt))
    }
  }

  return Math.max(0, ...timestamps.filter((value) => value > 0))
}

function getProteinTargetMin() {
  try {
    return clampNumber(
      getUserProfileSettings()?.supplements?.proteinTargetMin,
      120,
      1,
      500,
    )
  } catch {
    return 120
  }
}

function getWaterTargetMin() {
  try {
    return clampNumber(
      getUserProfileSettings()?.supplements?.waterTargetMin,
      2,
      0.1,
      20,
    )
  } catch {
    return 2
  }
}

function isMatchingTime(date, time) {
  return toTimeKey(date) === normalizeTime(time, '00:00')
}

function isMatchingDay(date, day) {
  return dayNames[date.getDay()] === normalizeDay(day, 'Sunday')
}

function getWeekKey(date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  return toDateKey(start)
}

function normalizeTime(value, fallback) {
  if (typeof value !== 'string') {
    return fallback
  }

  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    return fallback
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return fallback
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function normalizeTimeList(value, fallback) {
  const source = Array.isArray(value) ? value : fallback
  const times = source
    .map((time) => normalizeTime(time, ''))
    .filter(Boolean)
    .slice(0, 8)

  return times.length > 0 ? [...new Set(times)] : [...fallback]
}

function normalizeDay(value, fallback) {
  if (typeof value !== 'string') {
    return fallback
  }

  const found = dayNames.find(
    (day) => day.toLowerCase() === value.trim().toLowerCase(),
  )

  return found ?? fallback
}

function notifyReminderSettingsChanged() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(REMINDER_SETTINGS_EVENT))
}

function parseDateKey(value) {
  if (typeof value !== 'string') {
    return null
  }

  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  parsed.setHours(0, 0, 0, 0)
  return parsed
}

function parseDateTime(value) {
  if (typeof value !== 'string') {
    return 0
  }

  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function toDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function toBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return fallback
  }

  return Math.min(Math.max(number, min), max)
}

function toNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}
