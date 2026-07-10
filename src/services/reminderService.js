import {
  getInAppReminders,
  getReminderSettings,
  showBrowserNotification,
} from '../utils/reminderUtils'
import { safeGetJSON, safeSetJSON } from '../utils/storageUtils'

export const REMINDER_HISTORY_KEY = 'reminderHistory'
export const SENT_REMINDER_LOG_KEY = 'sentReminderLog'
export const REMINDER_EVENT = 'fitness-reminders-updated'

let reminderIntervalId = null
let reminderSubscriberCount = 0

export function initializeReminders() {
  reminderSubscriberCount += 1
  checkReminders()

  if (typeof window !== 'undefined' && reminderIntervalId === null) {
    reminderIntervalId = window.setInterval(checkReminders, 60000)
  }

  return () => {
    reminderSubscriberCount = Math.max(0, reminderSubscriberCount - 1)
    if (
      typeof window !== 'undefined' &&
      reminderSubscriberCount === 0 &&
      reminderIntervalId !== null
    ) {
      window.clearInterval(reminderIntervalId)
      reminderIntervalId = null
    }
  }
}

export function checkReminders() {
  const dueReminders = getInAppReminders()
  if (dueReminders.length === 0) {
    return []
  }

  const sentLog = getSentReminderLog()
  const sent = []

  for (const reminder of dueReminders) {
    if (reminder.logKey && sentLog[reminder.logKey]) {
      continue
    }

    const saved = sendReminder(reminder.type, reminder.title, reminder.message, {
      tag: reminder.logKey,
    })

    if (reminder.logKey) {
      sentLog[reminder.logKey] = true
    }

    sent.push(saved)
  }

  saveSentReminderLog(sentLog)
  return sent
}

export function sendReminder(type, title, message, options = {}) {
  const now = new Date()
  const item = {
    id: createReminderId(type, now),
    type: toText(type, 'system'),
    title: toText(title, 'Reminder'),
    message: toText(message, ''),
    createdAt: now.toISOString(),
    seen: false,
    dismissed: false,
  }

  const nextHistory = [item, ...getReminderHistory()].slice(0, 100)
  writeReminderHistory(nextHistory)

  const settings = getReminderSettings()
  if (settings.notificationsEnabled) {
    showBrowserNotification(item.title, {
      body: item.message,
      tag: options.tag ?? item.type,
      renotify: false,
    })
  }

  notifyReminderSubscribers()
  return item
}

export function markReminderSeen(id) {
  const next = getReminderHistory().map((item) =>
    item.id === id ? { ...item, seen: true } : item,
  )
  writeReminderHistory(next)
  notifyReminderSubscribers()
  return next
}

export function dismissReminder(id) {
  const next = getReminderHistory().map((item) =>
    item.id === id ? { ...item, dismissed: true, seen: true } : item,
  )
  writeReminderHistory(next)
  notifyReminderSubscribers()
  return next
}

export function getReminderHistory() {
  if (typeof window === 'undefined') {
    return []
  }

  const parsed = safeGetJSON(REMINDER_HISTORY_KEY, [])
  return Array.isArray(parsed)
    ? parsed
        .map(normalizeReminderHistoryItem)
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : []
}

function writeReminderHistory(history) {
  if (typeof window === 'undefined') {
    return
  }

  safeSetJSON(REMINDER_HISTORY_KEY, history.slice(0, 100))
}

function getSentReminderLog() {
  if (typeof window === 'undefined') {
    return {}
  }

  const parsed = safeGetJSON(SENT_REMINDER_LOG_KEY, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed
    : {}
}

function saveSentReminderLog(log) {
  if (typeof window === 'undefined') {
    return
  }

  safeSetJSON(SENT_REMINDER_LOG_KEY, log)
}

function normalizeReminderHistoryItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const parsedCreatedAt =
    typeof item.createdAt === 'string' ? new Date(item.createdAt) : null
  const createdAt =
    parsedCreatedAt && !Number.isNaN(parsedCreatedAt.getTime())
      ? item.createdAt
      : new Date().toISOString()

  return {
    id: toText(item.id, createReminderId(item.type, new Date(createdAt))),
    type: toText(item.type, 'system'),
    title: toText(item.title, 'Reminder'),
    message: toText(item.message, ''),
    createdAt,
    seen: item.seen === true,
    dismissed: item.dismissed === true,
  }
}

function notifyReminderSubscribers() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(REMINDER_EVENT))
}

function createReminderId(type, date) {
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${date.getTime()}-${Math.random().toString(16).slice(2)}`

  return `${toText(type, 'reminder')}-${suffix}`
}

function toText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}
