import {
  BellRing,
  Brain,
  Cloud,
  Database,
  Download,
  FileDown,
  Plus,
  Goal,
  MonitorPlay,
  PackageCheck,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserRound,
  Wrench,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { CloudHealthPanel } from '../components/CloudHealthPanel'
import { CloudSyncPanel } from '../components/CloudSyncPanel'
import { OfflineSyncPanel } from '../components/OfflineSyncPanel'
import { useAuth } from '../context/AuthContext'
import * as settingsService from '../services/settingsService'
import {
  clearAllData,
  equipmentSettingsOptions,
  exportAllData,
  getUserProfileSettings,
  importAllData,
  resetUserProfileSettings,
} from '../utils/settingsUtils'
import {
  canUseNotifications,
  getDayNames,
  getNotificationPermissionStatus,
  getReminderSettings,
  requestNotificationPermission,
  resetReminderSettings,
  saveReminderSettings,
} from '../utils/reminderUtils'
import type { PageId } from '../types/navigation'

type SettingsTab =
  | 'profile'
  | 'goals'
  | 'equipment'
  | 'supplements'
  | 'reminders'
  | 'workout-display'
  | 'coach'
  | 'cloud'
  | 'offline'
  | 'backup'

interface SettingsProps {
  onNavigate: (page: PageId) => void
}

const tabs: Array<{
  id: SettingsTab
  icon: typeof UserRound
  label: string
}> = [
  { id: 'profile', icon: UserRound, label: 'Profile' },
  { id: 'goals', icon: Goal, label: 'Goals' },
  { id: 'equipment', icon: Wrench, label: 'Equipment' },
  { id: 'supplements', icon: PackageCheck, label: 'Supplements' },
  { id: 'reminders', icon: BellRing, label: 'Reminders' },
  { id: 'workout-display', icon: MonitorPlay, label: 'Workout Display' },
  { id: 'coach', icon: Brain, label: 'Coach' },
  { id: 'cloud', icon: Cloud, label: 'Cloud Sync' },
  { id: 'offline', icon: Database, label: 'Offline & Sync' },
  { id: 'backup', icon: Database, label: 'Backup' },
]

const coachStyleOptions = ['Direct', 'Balanced', 'Detailed'] as const
const coachPriorityOptions = [
  'Bigger chest + visible abs',
  'Bigger chest',
  'Visible abs',
  'Lean muscle gain',
  'Posture correction',
] as const
const warningSensitivityOptions = ['Low', 'Normal', 'High'] as const
const reminderDayOptions = getDayNames()

const goalFields = [
  ['primaryGoal', 'Primary goal'],
  ['secondaryGoal', 'Secondary goal'],
  ['bodyGoal', 'Body goal'],
  ['weakPoint', 'Weak point'],
  ['cardioPreference', 'Cardio preference'],
  ['injuryLimitation', 'Injury limitation'],
] as const

export function Settings({ onNavigate }: SettingsProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    getInitialSettingsTab(),
  )
  const [settings, setSettings] = useState(() => getUserProfileSettings())
  const [reminderSettings, setReminderSettings] = useState(() =>
    getReminderSettings(),
  )
  const [notificationPermission, setNotificationPermission] = useState(() =>
    getNotificationPermissionStatus(),
  )
  const [notice, setNotice] = useState('')
  const importInputRef = useRef<HTMLInputElement | null>(null)

  function updateProfile(field: string, value: string | number) {
    setSettings((current: any) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }))
  }

  function updateGoals(field: string, value: string) {
    setSettings((current: any) => ({
      ...current,
      goals: { ...current.goals, [field]: value },
    }))
  }

  function updateSupplements(field: string, value: boolean | number) {
    setSettings((current: any) => ({
      ...current,
      supplements: { ...current.supplements, [field]: value },
    }))
  }

  function updateCoach(field: string, value: string) {
    setSettings((current: any) => ({
      ...current,
      coach: { ...current.coach, [field]: value },
    }))
  }

  function updateWorkoutDisplay(field: string, value: boolean) {
    setSettings((current: any) => ({
      ...current,
      workoutDisplay: { ...current.workoutDisplay, [field]: value },
    }))
  }

  function updateReminder(field: string, value: boolean | number | string | string[]) {
    setReminderSettings((current: any) => ({ ...current, [field]: value }))
  }

  function updateWaterReminderTime(index: number, value: string) {
    setReminderSettings((current: any) => {
      const nextTimes = [...current.waterReminderTimes]
      nextTimes[index] = value
      return { ...current, waterReminderTimes: nextTimes }
    })
  }

  function addWaterReminderTime() {
    setReminderSettings((current: any) => ({
      ...current,
      waterReminderTimes: [...current.waterReminderTimes, '12:00'],
    }))
  }

  function removeWaterReminderTime(index: number) {
    setReminderSettings((current: any) => {
      const nextTimes = current.waterReminderTimes.filter(
        (_time: string, timeIndex: number) => timeIndex !== index,
      )
      return {
        ...current,
        waterReminderTimes: nextTimes.length > 0 ? nextTimes : ['11:00'],
      }
    })
  }

  function toggleEquipment(item: string) {
    setSettings((current: any) => {
      const selected = new Set(current.equipment)
      if (selected.has(item)) {
        selected.delete(item)
      } else {
        selected.add(item)
      }

      return { ...current, equipment: Array.from(selected) }
    })
  }

  async function saveSettings(message: string) {
    try {
      const saved = await settingsService.saveUserSettings(user, settings)
      setSettings(saved)
      setNotice(message)
    } catch {
      setSettings(getUserProfileSettings())
      setNotice('Saved locally. Cloud sync failed.')
    }
  }

  async function handleEnableNotifications() {
    if (!canUseNotifications()) {
      setNotificationPermission('unsupported')
      setNotice('Browser notifications are not supported here.')
      return
    }

    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)

    if (permission === 'granted') {
      const saved = saveReminderSettings({
        ...reminderSettings,
        notificationsEnabled: true,
      })
      setReminderSettings(saved)
      setNotice('Browser notifications enabled.')
      return
    }

    if (permission === 'denied') {
      setNotice('Notifications are blocked. Enable them in browser settings.')
      return
    }

    setNotice('Notification permission was not enabled.')
  }

  function saveReminderPreferences() {
    const saved = saveReminderSettings(reminderSettings)
    setReminderSettings(saved)
    setNotificationPermission(getNotificationPermissionStatus())
    setNotice('Reminder settings saved.')
  }

  function resetReminderPreferences() {
    const defaults = resetReminderSettings()
    setReminderSettings(defaults)
    setNotificationPermission(getNotificationPermissionStatus())
    setNotice('Reminder settings reset.')
  }

  function resetProfile() {
    const next = resetUserProfileSettings()
    setSettings(next)
    setNotice('Profile settings reset.')
  }

  function handleExport() {
    exportAllData()
    setNotice('Backup exported.')
  }

  function handleImportFile(file: File | null) {
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = importAllData(String(reader.result ?? ''))
      if (result.success) {
        setSettings(getUserProfileSettings())
      }
      setNotice(result.message)
      if (importInputRef.current) {
        importInputRef.current.value = ''
      }
    }
    reader.onerror = () => setNotice('Could not read that file.')
    reader.readAsText(file)
  }

  function handleClearAllData() {
    const confirmed = window.confirm(
      'This will delete all workout, body, nutrition, and settings data from this browser.',
    )
    if (!confirmed) {
      return
    }

    clearAllData()
    setSettings(getUserProfileSettings())
    setNotice('All local app data cleared.')
  }

  return (
    <section className="settings-page">
      <header className="progress-hero settings-hero">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Settings + data</h1>
          <p>
            Edit your training profile, goals, equipment, supplement targets,
            and local backup files.
          </p>
        </div>
        <div className="settings-hero-actions">
          <button
            className="workout-secondary-button"
            onClick={() => onNavigate('plan-editor')}
            type="button"
          >
            <SlidersHorizontal size={19} strokeWidth={2.4} aria-hidden="true" />
            Plan Editor
          </button>
          <button
            className="workout-secondary-button"
            onClick={() => onNavigate('export-print')}
            type="button"
          >
            <FileDown size={19} strokeWidth={2.4} aria-hidden="true" />
            Export / Print
          </button>
          <button
            className="workout-secondary-button"
            onClick={() => onNavigate('data-health')}
            type="button"
          >
            <Database size={19} strokeWidth={2.4} aria-hidden="true" />
            Data Health
          </button>
        </div>
      </header>

      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              aria-selected={activeTab === tab.id}
              className="settings-tab"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              <Icon size={17} strokeWidth={2.4} aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {notice ? (
        <div className="settings-notice" role="status">
          <SettingsIcon size={18} strokeWidth={2.4} aria-hidden="true" />
          {notice}
        </div>
      ) : null}

      {activeTab === 'profile' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Profile Settings</p>
              <h2>Personal fitness profile</h2>
            </div>
            <UserRound size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="settings-form-grid">
            <label className="settings-field">
              Name
              <input
                className="settings-input"
                onChange={(event) => updateProfile('name', event.target.value)}
                type="text"
                value={settings.profile.name}
              />
            </label>
            <label className="settings-field">
              Height cm
              <input
                className="settings-input"
                min={0}
                onChange={(event) =>
                  updateProfile('heightCm', event.target.value)
                }
                type="number"
                value={settings.profile.heightCm}
              />
            </label>
            <label className="settings-field">
              Current weight kg
              <input
                className="settings-input"
                min={0}
                onChange={(event) =>
                  updateProfile('currentWeightKg', event.target.value)
                }
                step="0.1"
                type="number"
                value={settings.profile.currentWeightKg}
              />
            </label>
            <label className="settings-field">
              Goal weight min kg
              <input
                className="settings-input"
                min={0}
                onChange={(event) =>
                  updateProfile('goalWeightMinKg', event.target.value)
                }
                step="0.1"
                type="number"
                value={settings.profile.goalWeightMinKg}
              />
            </label>
            <label className="settings-field">
              Goal weight max kg
              <input
                className="settings-input"
                min={0}
                onChange={(event) =>
                  updateProfile('goalWeightMaxKg', event.target.value)
                }
                step="0.1"
                type="number"
                value={settings.profile.goalWeightMaxKg}
              />
            </label>
            <label className="settings-field settings-field--wide">
              Training goal
              <textarea
                className="settings-textarea"
                onChange={(event) =>
                  updateProfile('trainingGoal', event.target.value)
                }
                value={settings.profile.trainingGoal}
              />
            </label>
            <label className="settings-field settings-field--wide">
              Main focus
              <input
                className="settings-input"
                onChange={(event) =>
                  updateProfile('mainFocus', event.target.value)
                }
                type="text"
                value={settings.profile.mainFocus}
              />
            </label>
            <label className="settings-field">
              Training time per day
              <input
                className="settings-input"
                onChange={(event) =>
                  updateProfile('trainingTimePerDay', event.target.value)
                }
                type="text"
                value={settings.profile.trainingTimePerDay}
              />
            </label>
            <label className="settings-field">
              Experience level
              <input
                className="settings-input"
                onChange={(event) =>
                  updateProfile('experienceLevel', event.target.value)
                }
                type="text"
                value={settings.profile.experienceLevel}
              />
            </label>
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings('Profile saved.')}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              Save Profile
            </button>
            <button
              className="workout-secondary-button"
              onClick={resetProfile}
              type="button"
            >
              <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
              Reset Profile
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'goals' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Goal Settings</p>
              <h2>Training direction</h2>
            </div>
            <Goal size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="settings-form-grid">
            {goalFields.map(([field, label]) => (
              <label className="settings-field" key={field}>
                {label}
                <input
                  className="settings-input"
                  onChange={(event) => updateGoals(field, event.target.value)}
                  type="text"
                  value={(settings.goals as Record<string, string>)[field]}
                />
              </label>
            ))}
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings('Goals saved.')}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              Save Goals
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'equipment' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Equipment Settings</p>
              <h2>Available tools</h2>
            </div>
            <Wrench size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="settings-check-grid">
            {equipmentSettingsOptions.map((item) => (
              <label className="settings-check" key={item}>
                <input
                  checked={settings.equipment.includes(item)}
                  onChange={() => toggleEquipment(item)}
                  type="checkbox"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings('Equipment saved.')}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              Save Equipment
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'supplements' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Supplement Settings</p>
              <h2>Targets and checklist</h2>
            </div>
            <PackageCheck size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="settings-check-grid">
            <label className="settings-check">
              <input
                checked={settings.supplements.creatineMonohydrate}
                onChange={(event) =>
                  updateSupplements('creatineMonohydrate', event.target.checked)
                }
                type="checkbox"
              />
              <span>Creatine monohydrate</span>
            </label>
            <label className="settings-check">
              <input
                checked={settings.supplements.wheyProtein}
                onChange={(event) =>
                  updateSupplements('wheyProtein', event.target.checked)
                }
                type="checkbox"
              />
              <span>Whey protein</span>
            </label>
          </div>

          <div className="settings-form-grid">
            <label className="settings-field">
              Protein target min
              <input
                className="settings-input"
                min={0}
                onChange={(event) =>
                  updateSupplements('proteinTargetMin', Number(event.target.value))
                }
                type="number"
                value={settings.supplements.proteinTargetMin}
              />
            </label>
            <label className="settings-field">
              Protein target max
              <input
                className="settings-input"
                min={0}
                onChange={(event) =>
                  updateSupplements('proteinTargetMax', Number(event.target.value))
                }
                type="number"
                value={settings.supplements.proteinTargetMax}
              />
            </label>
            <label className="settings-field">
              Water target min
              <input
                className="settings-input"
                min={0}
                onChange={(event) =>
                  updateSupplements('waterTargetMin', Number(event.target.value))
                }
                step="0.1"
                type="number"
                value={settings.supplements.waterTargetMin}
              />
            </label>
            <label className="settings-field">
              Water target max
              <input
                className="settings-input"
                min={0}
                onChange={(event) =>
                  updateSupplements('waterTargetMax', Number(event.target.value))
                }
                step="0.1"
                type="number"
                value={settings.supplements.waterTargetMax}
              />
            </label>
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings('Supplements saved.')}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              Save Supplements
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'reminders' ? (
        <article className="dashboard-card settings-panel reminders-settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Reminder Settings</p>
              <h2>Notifications + reminders</h2>
            </div>
            <BellRing size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <p className="settings-help-copy">
            Browser reminders work while the app is open or active. Full
            background push notifications can be added later.
          </p>

          <section className="reminder-settings-section" aria-label="Notification permission">
            <div>
              <p className="eyebrow">Notification Permission</p>
              <div className="mini-stat-grid">
                <div className="mini-stat">
                  <span>Browser notification supported</span>
                  <strong>{canUseNotifications() ? 'Yes' : 'No'}</strong>
                </div>
                <div className="mini-stat">
                  <span>Permission status</span>
                  <strong>{notificationPermission}</strong>
                </div>
              </div>
            </div>

            {notificationPermission === 'denied' ? (
              <p className="settings-warning-copy">
                Notifications are blocked. Enable them in browser settings.
              </p>
            ) : null}

            <div className="settings-check-grid">
              <label className="settings-check">
                <input
                  checked={
                    reminderSettings.notificationsEnabled &&
                    notificationPermission === 'granted'
                  }
                  disabled={notificationPermission !== 'granted'}
                  onChange={(event) =>
                    updateReminder('notificationsEnabled', event.target.checked)
                  }
                  type="checkbox"
                />
                <span>Send browser notifications when permission is granted</span>
              </label>
            </div>

            <button
              className="workout-primary-button"
              disabled={!canUseNotifications()}
              onClick={handleEnableNotifications}
              type="button"
            >
              <BellRing size={19} strokeWidth={2.4} aria-hidden="true" />
              Enable Notifications
            </button>
          </section>

          <section className="reminder-settings-section" aria-label="Workout reminder">
            <p className="eyebrow">Workout Reminder</p>
            <div className="settings-check-grid">
              <label className="settings-check">
                <input
                  checked={reminderSettings.workoutReminderEnabled}
                  onChange={(event) =>
                    updateReminder('workoutReminderEnabled', event.target.checked)
                  }
                  type="checkbox"
                />
                <span>Daily workout reminder</span>
              </label>
            </div>
            <div className="settings-form-grid">
              <label className="settings-field">
                Workout reminder time
                <input
                  className="settings-input"
                  onChange={(event) =>
                    updateReminder('workoutReminderTime', event.target.value)
                  }
                  type="time"
                  value={reminderSettings.workoutReminderTime}
                />
              </label>
            </div>
          </section>

          <section className="reminder-settings-section" aria-label="Supplement reminders">
            <p className="eyebrow">Supplement Reminders</p>
            <div className="settings-check-grid">
              <label className="settings-check">
                <input
                  checked={reminderSettings.creatineReminderEnabled}
                  onChange={(event) =>
                    updateReminder('creatineReminderEnabled', event.target.checked)
                  }
                  type="checkbox"
                />
                <span>Creatine reminder</span>
              </label>
              <label className="settings-check">
                <input
                  checked={reminderSettings.proteinReminderEnabled}
                  onChange={(event) =>
                    updateReminder('proteinReminderEnabled', event.target.checked)
                  }
                  type="checkbox"
                />
                <span>Protein target reminder</span>
              </label>
              <label className="settings-check">
                <input
                  checked={reminderSettings.waterReminderEnabled}
                  onChange={(event) =>
                    updateReminder('waterReminderEnabled', event.target.checked)
                  }
                  type="checkbox"
                />
                <span>Water intake reminders</span>
              </label>
            </div>
            <div className="settings-form-grid">
              <label className="settings-field">
                Creatine time
                <input
                  className="settings-input"
                  onChange={(event) =>
                    updateReminder('creatineReminderTime', event.target.value)
                  }
                  type="time"
                  value={reminderSettings.creatineReminderTime}
                />
              </label>
              <label className="settings-field">
                Protein time
                <input
                  className="settings-input"
                  onChange={(event) =>
                    updateReminder('proteinReminderTime', event.target.value)
                  }
                  type="time"
                  value={reminderSettings.proteinReminderTime}
                />
              </label>
            </div>
            <div className="reminder-times-list" aria-label="Water reminder times">
              {reminderSettings.waterReminderTimes.map((time: string, index: number) => (
                <div className="reminder-time-row" key={`${time}-${index}`}>
                  <label className="settings-field">
                    Water time {index + 1}
                    <input
                      className="settings-input"
                      onChange={(event) =>
                        updateWaterReminderTime(index, event.target.value)
                      }
                      type="time"
                      value={time}
                    />
                  </label>
                  <button
                    aria-label={`Remove water reminder ${index + 1}`}
                    className="icon-control-button"
                    onClick={() => removeWaterReminderTime(index)}
                    type="button"
                  >
                    <Trash2 size={18} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button
                className="workout-secondary-button"
                onClick={addWaterReminderTime}
                type="button"
              >
                <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
                Add Water Time
              </button>
            </div>
          </section>

          <section className="reminder-settings-section" aria-label="Body tracking reminders">
            <p className="eyebrow">Body Tracking Reminders</p>
            <div className="settings-check-grid">
              <label className="settings-check">
                <input
                  checked={reminderSettings.bodyCheckInReminderEnabled}
                  onChange={(event) =>
                    updateReminder(
                      'bodyCheckInReminderEnabled',
                      event.target.checked,
                    )
                  }
                  type="checkbox"
                />
                <span>Weekly body check-in reminder</span>
              </label>
              <label className="settings-check">
                <input
                  checked={reminderSettings.weeklyReviewReminderEnabled}
                  onChange={(event) =>
                    updateReminder(
                      'weeklyReviewReminderEnabled',
                      event.target.checked,
                    )
                  }
                  type="checkbox"
                />
                <span>Weekly review reminder</span>
              </label>
            </div>
            <div className="settings-form-grid">
              <label className="settings-field">
                Body check-in day
                <select
                  className="settings-input"
                  onChange={(event) =>
                    updateReminder('bodyCheckInDay', event.target.value)
                  }
                  value={reminderSettings.bodyCheckInDay}
                >
                  {reminderDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="settings-field">
                Body check-in time
                <input
                  className="settings-input"
                  onChange={(event) =>
                    updateReminder('bodyCheckInTime', event.target.value)
                  }
                  type="time"
                  value={reminderSettings.bodyCheckInTime}
                />
              </label>
              <label className="settings-field">
                Weekly review day
                <select
                  className="settings-input"
                  onChange={(event) =>
                    updateReminder('weeklyReviewDay', event.target.value)
                  }
                  value={reminderSettings.weeklyReviewDay}
                >
                  {reminderDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="settings-field">
                Weekly review time
                <input
                  className="settings-input"
                  onChange={(event) =>
                    updateReminder('weeklyReviewTime', event.target.value)
                  }
                  type="time"
                  value={reminderSettings.weeklyReviewTime}
                />
              </label>
            </div>
          </section>

          <section className="reminder-settings-section" aria-label="Workout safety reminders">
            <p className="eyebrow">Workout Safety Reminders</p>
            <div className="settings-check-grid">
              <label className="settings-check">
                <input
                  checked={reminderSettings.unfinishedWorkoutReminderEnabled}
                  onChange={(event) =>
                    updateReminder(
                      'unfinishedWorkoutReminderEnabled',
                      event.target.checked,
                    )
                  }
                  type="checkbox"
                />
                <span>Unfinished workout reminder</span>
              </label>
              <label className="settings-check">
                <input
                  checked={reminderSettings.restTimerNotificationEnabled}
                  onChange={(event) =>
                    updateReminder(
                      'restTimerNotificationEnabled',
                      event.target.checked,
                    )
                  }
                  type="checkbox"
                />
                <span>Rest timer notification</span>
              </label>
            </div>
            <div className="settings-form-grid">
              <label className="settings-field">
                Unfinished workout delay minutes
                <input
                  className="settings-input"
                  min={5}
                  onChange={(event) =>
                    updateReminder(
                      'unfinishedWorkoutDelayMinutes',
                      Number(event.target.value),
                    )
                  }
                  type="number"
                  value={reminderSettings.unfinishedWorkoutDelayMinutes}
                />
              </label>
            </div>
          </section>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={saveReminderPreferences}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              Save Reminder Settings
            </button>
            <button
              className="workout-secondary-button"
              onClick={resetReminderPreferences}
              type="button"
            >
              <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
              Reset Reminder Settings
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'workout-display' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Workout Display Settings</p>
              <h2>Images + videos during workout</h2>
            </div>
            <MonitorPlay size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <p className="settings-help-copy">
            Control how exercise images and form videos appear in Today's
            Workout live mode. Videos always play inside the app.
          </p>

          <div className="settings-check-grid settings-check-grid--stacked">
            <label className="settings-check">
              <input
                checked={settings.workoutDisplay.showExerciseImages}
                onChange={(event) =>
                  updateWorkoutDisplay('showExerciseImages', event.target.checked)
                }
                type="checkbox"
              />
              <span>Show exercise images during workout</span>
            </label>
            <label className="settings-check">
              <input
                checked={settings.workoutDisplay.videosCollapsedByDefault}
                onChange={(event) =>
                  updateWorkoutDisplay(
                    'videosCollapsedByDefault',
                    event.target.checked,
                  )
                }
                type="checkbox"
              />
              <span>Show videos collapsed by default (tap Watch Video to open)</span>
            </label>
            <label className="settings-check">
              <input
                checked={settings.workoutDisplay.autoOpenVideo}
                onChange={(event) =>
                  updateWorkoutDisplay('autoOpenVideo', event.target.checked)
                }
                type="checkbox"
              />
              <span>Auto-open video when an exercise starts</span>
            </label>
            <label className="settings-check">
              <input
                checked={settings.workoutDisplay.preferCompactView}
                onChange={(event) =>
                  updateWorkoutDisplay('preferCompactView', event.target.checked)
                }
                type="checkbox"
              />
              <span>Prefer compact workout view (smaller media, less scrolling)</span>
            </label>
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings('Workout display settings saved.')}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              Save Display Settings
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'coach' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Coach Settings</p>
              <h2>Daily advice preferences</h2>
            </div>
            <Brain size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="settings-form-grid">
            <label className="settings-field">
              Coaching style
              <select
                className="settings-input"
                onChange={(event) =>
                  updateCoach('coachingStyle', event.target.value)
                }
                value={settings.coach.coachingStyle}
              >
                {coachStyleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              Main priority
              <select
                className="settings-input"
                onChange={(event) =>
                  updateCoach('mainPriority', event.target.value)
                }
                value={settings.coach.mainPriority}
              >
                {coachPriorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              Warning sensitivity
              <select
                className="settings-input"
                onChange={(event) =>
                  updateCoach('warningSensitivity', event.target.value)
                }
                value={settings.coach.warningSensitivity}
              >
                {warningSensitivityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings('Coach settings saved.')}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              Save Coach Settings
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'cloud' ? (
        <>
          <CloudSyncPanel />
          <CloudHealthPanel />
        </>
      ) : null}

      {activeTab === 'offline' ? <OfflineSyncPanel /> : null}

      {activeTab === 'backup' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Backup & Data</p>
              <h2>Export, import, or clear local data</h2>
            </div>
            <Database size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="backup-action-grid">
            <button
              className="workout-primary-button"
              onClick={handleExport}
              type="button"
            >
              <Download size={19} strokeWidth={2.4} aria-hidden="true" />
              Export All Data
            </button>
            <button
              className="workout-secondary-button"
              onClick={() => importInputRef.current?.click()}
              type="button"
            >
              <Upload size={19} strokeWidth={2.4} aria-hidden="true" />
              Import Data
            </button>
            <input
              accept="application/json"
              className="settings-file-input"
              onChange={(event) => handleImportFile(event.target.files?.[0] ?? null)}
              ref={importInputRef}
              type="file"
            />
            <button
              className="workout-secondary-button workout-secondary-button--danger"
              onClick={handleClearAllData}
              type="button"
            >
              <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
              Clear All Data
            </button>
          </div>
        </article>
      ) : null}

      <footer className="settings-footer">
        <button
          className="settings-footer-link"
          onClick={() => onNavigate('privacy')}
          type="button"
        >
          Privacy Notice
        </button>
        <button
          className="settings-footer-link"
          onClick={() => onNavigate('disclaimer')}
          type="button"
        >
          Disclaimer
        </button>
        <button
          className="settings-footer-link"
          onClick={() => onNavigate('pre-deploy-checklist')}
          type="button"
        >
          Pre-Deploy Checklist
        </button>
      </footer>
    </section>
  )
}

function getInitialSettingsTab(): SettingsTab {
  if (typeof window === 'undefined') {
    return 'profile'
  }

  try {
    const stored = window.sessionStorage.getItem('settingsActiveTab')
    if (stored && tabs.some((tab) => tab.id === stored)) {
      window.sessionStorage.removeItem('settingsActiveTab')
      return stored as SettingsTab
    }
  } catch {
    // Session storage is optional. Fall back to the first tab.
  }

  return 'profile'
}
