import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  REMINDER_EVENT,
  checkReminders,
  dismissReminder as dismissReminderItem,
  getReminderHistory,
  initializeReminders,
  markReminderSeen as markReminderItemSeen,
} from '../services/reminderService'
import {
  REMINDER_SETTINGS_EVENT,
  getNotificationPermissionStatus,
  getReminderSettings,
  requestNotificationPermission,
  saveReminderSettings,
} from '../utils/reminderUtils'
import { useOnlineStatus } from './useOnlineStatus'

export function useReminders() {
  const { isOnline } = useOnlineStatus()
  const [settings, setSettings] = useState(() => getReminderSettings())
  const [history, setHistory] = useState(() => getReminderHistory())
  const [notificationPermission, setNotificationPermission] = useState(() =>
    getNotificationPermissionStatus(),
  )

  const reminders = useMemo(
    () => history.filter((reminder) => !reminder.dismissed),
    [history],
  )
  const reminderCount = reminders.length

  const refresh = useCallback(() => {
    setSettings(getReminderSettings())
    setHistory(getReminderHistory())
    setNotificationPermission(getNotificationPermissionStatus())
  }, [])

  useEffect(() => {
    const stopReminders = initializeReminders()
    refresh()

    function handleReminderUpdate() {
      refresh()
    }

    window.addEventListener(REMINDER_EVENT, handleReminderUpdate)
    window.addEventListener(REMINDER_SETTINGS_EVENT, handleReminderUpdate)
    window.addEventListener('storage', handleReminderUpdate)

    return () => {
      stopReminders?.()
      window.removeEventListener(REMINDER_EVENT, handleReminderUpdate)
      window.removeEventListener(REMINDER_SETTINGS_EVENT, handleReminderUpdate)
      window.removeEventListener('storage', handleReminderUpdate)
    }
  }, [refresh, isOnline])

  const updateSettings = useCallback(
    (nextSettings) => {
      const current = getReminderSettings()
      const next =
        typeof nextSettings === 'function'
          ? nextSettings(current)
          : { ...current, ...nextSettings }
      const saved = saveReminderSettings(next)
      setSettings(saved)
      refresh()
      return saved
    },
    [refresh],
  )

  const requestPermission = useCallback(async () => {
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)

    if (permission === 'granted') {
      const saved = saveReminderSettings({
        ...getReminderSettings(),
        notificationsEnabled: true,
      })
      setSettings(saved)
      checkReminders()
    }

    refresh()
    return permission
  }, [refresh])

  const dismissReminder = useCallback(
    (id) => {
      dismissReminderItem(id)
      refresh()
    },
    [refresh],
  )

  const markReminderSeen = useCallback(
    (id) => {
      markReminderItemSeen(id)
      refresh()
    },
    [refresh],
  )

  return {
    reminders,
    reminderCount,
    settings,
    updateSettings,
    requestPermission,
    dismissReminder,
    markReminderSeen,
    notificationPermission,
  }
}
