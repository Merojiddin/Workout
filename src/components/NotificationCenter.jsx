import { Bell, CheckCheck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useReminders } from '../hooks/useReminders'
import { formatDate, t, useT } from '../i18n'
import { canUseNotifications } from '../utils/reminderUtils'

export function NotificationCenter() {
  const translate = useT()
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
        aria-label={translate('notify.open')}
        className="notification-bell"
        onClick={() => setIsOpen((open) => !open)}
        ref={buttonRef}
        title={translate('notify.title')}
        type="button"
      >
        <Bell size={17} strokeWidth={2.5} aria-hidden="true" />
        {reminderCount > 0 ? (
          <span className="notification-bell__badge">{reminderCount}</span>
        ) : null}
      </button>

      {isOpen ? (
        <section
          aria-label={translate('notify.listAria')}
          className="notification-panel"
          ref={panelRef}
        >
          <div className="notification-panel__header">
            <div>
              <p className="eyebrow">{translate('notify.title')}</p>
              <h2>{translate('notify.activeCount', { count: reminderCount })}</h2>
            </div>
            <span className={`notification-status notification-status--${notificationStatus.tone}`}>
              {translate(notificationStatus.labelKey)}
            </span>
          </div>

          {reminders.length > 0 ? (
            <div className="notification-list">
              {reminders.map((reminder) => (
                <article className="notification-item" key={reminder.id}>
                  <div className="notification-item__meta">
                    <span
                      className={`reminder-badge reminder-badge--${
                        getReminderCategory(reminder.type).slug
                      }`}
                    >
                      {translate(getReminderCategory(reminder.type).labelKey)}
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
                    {translate('action.dismiss')}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="notification-empty">
              <CheckCheck size={22} strokeWidth={2.5} aria-hidden="true" />
              <strong>{translate('notify.empty')}</strong>
              <p>{translate(notificationStatus.emptyKey)}</p>
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
      emptyKey: 'notify.empty.unsupported',
      labelKey: 'notify.status.inAppOnly',
      tone: 'neutral',
    }
  }

  if (notificationPermission === 'granted' && notificationsEnabled) {
    return {
      emptyKey: 'notify.empty.enabled',
      labelKey: 'notify.status.browserOn',
      tone: 'good',
    }
  }

  if (notificationPermission === 'denied') {
    return {
      emptyKey: 'notify.empty.blocked',
      labelKey: 'notify.status.blocked',
      tone: 'warn',
    }
  }

  return {
    emptyKey: 'notify.empty.disabled',
    labelKey: 'notify.status.inAppOnly',
    tone: 'neutral',
  }
}

/**
 * The badge's slug drives its colour and must not change with the language,
 * so the category returns both the stable slug and the label to print.
 */
function getReminderCategory(type) {
  switch (type) {
    case 'workout':
    case 'weekly-review':
      return { slug: 'workout', labelKey: 'notify.category.workout' }
    case 'creatine':
      return { slug: 'supplement', labelKey: 'notify.category.supplement' }
    case 'protein':
    case 'water':
      return { slug: 'nutrition', labelKey: 'notify.category.nutrition' }
    case 'body-check-in':
      return { slug: 'body', labelKey: 'notify.category.body' }
    case 'unfinished-workout':
    case 'rest-timer':
      return { slug: 'safety', labelKey: 'notify.category.safety' }
    default:
      return { slug: 'system', labelKey: 'notify.category.system' }
  }
}

function formatReminderTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return t('notify.justNow')
  }

  return formatDate(date, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
