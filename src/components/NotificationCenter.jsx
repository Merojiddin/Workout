import { Bell, CheckCheck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useReminders } from '../hooks/useReminders'
import { canUseNotifications } from '../utils/reminderUtils'

export function NotificationCenter() {
  const {
    dismissReminder,
    markReminderSeen,
    notificationPermission,
    reminderCount,
    reminders,
    settings,
  } = useReminders()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    reminders
      .filter((reminder) => !reminder.seen)
      .forEach((reminder) => markReminderSeen(reminder.id))

    function handlePointerDown(event) {
      const target = event.target
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }

      setIsOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen, markReminderSeen, reminders])

  const notificationStatus = getNotificationStatus({
    notificationPermission,
    notificationsEnabled: settings.notificationsEnabled,
  })

  return (
    <div className="notification-center">
      <button
        aria-expanded={isOpen}
        aria-label="Open reminders"
        className="notification-bell"
        onClick={() => setIsOpen((open) => !open)}
        ref={buttonRef}
        title="Reminders"
        type="button"
      >
        <Bell size={17} strokeWidth={2.5} aria-hidden="true" />
        {reminderCount > 0 ? (
          <span className="notification-bell__badge">{reminderCount}</span>
        ) : null}
      </button>

      {isOpen ? (
        <section
          aria-label="Reminder list"
          className="notification-panel"
          ref={panelRef}
        >
          <div className="notification-panel__header">
            <div>
              <p className="eyebrow">Reminders</p>
              <h2>{reminderCount} active</h2>
            </div>
            <span className={`notification-status notification-status--${notificationStatus.tone}`}>
              {notificationStatus.label}
            </span>
          </div>

          {reminders.length > 0 ? (
            <div className="notification-list">
              {reminders.map((reminder) => (
                <article className="notification-item" key={reminder.id}>
                  <div className="notification-item__meta">
                    <span
                      className={`reminder-badge reminder-badge--${getReminderCategory(
                        reminder.type,
                      ).toLowerCase()}`}
                    >
                      {getReminderCategory(reminder.type)}
                    </span>
                    <time dateTime={reminder.createdAt}>
                      {formatReminderTime(reminder.createdAt)}
                    </time>
                  </div>
                  <h3>{reminder.title}</h3>
                  <p>{reminder.message}</p>
                  <button
                    className="notification-dismiss-button"
                    onClick={() => dismissReminder(reminder.id)}
                    type="button"
                  >
                    <X size={15} strokeWidth={2.5} aria-hidden="true" />
                    Dismiss
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="notification-empty">
              <CheckCheck size={22} strokeWidth={2.5} aria-hidden="true" />
              <strong>No active reminders</strong>
              <p>{notificationStatus.emptyMessage}</p>
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}

function getNotificationStatus({ notificationPermission, notificationsEnabled }) {
  if (!canUseNotifications()) {
    return {
      emptyMessage: 'Browser notifications are not supported here. In-app reminders still work.',
      label: 'In-app only',
      tone: 'neutral',
    }
  }

  if (notificationPermission === 'granted' && notificationsEnabled) {
    return {
      emptyMessage: 'Browser notifications are enabled.',
      label: 'Browser on',
      tone: 'good',
    }
  }

  if (notificationPermission === 'denied') {
    return {
      emptyMessage: 'Notifications are blocked in browser settings.',
      label: 'Blocked',
      tone: 'warn',
    }
  }

  return {
    emptyMessage: 'Enable browser notifications from Reminder Settings.',
    label: 'In-app only',
    tone: 'neutral',
  }
}

function getReminderCategory(type) {
  switch (type) {
    case 'workout':
    case 'weekly-review':
      return 'Workout'
    case 'creatine':
      return 'Supplement'
    case 'protein':
    case 'water':
      return 'Nutrition'
    case 'body-check-in':
      return 'Body'
    case 'unfinished-workout':
    case 'rest-timer':
      return 'Safety'
    default:
      return 'System'
  }
}

function formatReminderTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Just now'
  }

  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
