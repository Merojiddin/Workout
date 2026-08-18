import {
  Brain,
  Cloud,
  Database,
  Download,
  Goal,
  LogIn,
  LogOut,
  MonitorPlay,
  Pencil,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Upload,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { CloudHealthPanel } from '../components/CloudHealthPanel'
import { CloudSyncPanel } from '../components/CloudSyncPanel'
import { ImageUploadPreview } from '../components/ImageUploadPreview'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { WorkoutProgramManager } from '../components/WorkoutProgramManager'
import { useAuth } from '../context/AuthContext'
import { profileInitials } from '../hooks/useProfileIdentity'
import type { WorkoutDay } from '../data/workoutPlan'
import * as settingsService from '../services/settingsService'
import { fileToBase64, resizeImageFile } from '../utils/imageUtils'
import {
  clearAllData,
  equipmentSettingsOptions,
  exportAllData,
  getCustomWorkoutPlan,
  getUserProfileSettings,
  importAllData,
  resetUserProfileSettings,
} from '../utils/settingsUtils'
import type { PageId } from '../types/navigation'
import { SHOW_DEV_PAGES } from '../utils/devFlags'

type SettingsTab =
  | 'profile'
  | 'program'
  | 'goals'
  | 'equipment'
  | 'workout-display'
  | 'coach'
  | 'cloud'
  | 'backup'

interface SettingsProps {
  onNavigate: (page: PageId) => void
  /** Lets App re-ask whether a program is still installed after a wipe. */
  onDataCleared?: () => void
}

const tabs: Array<{
  id: SettingsTab
  icon: typeof UserRound
  label: string
}> = [
  { id: 'profile', icon: UserRound, label: 'Profile' },
  { id: 'program', icon: SlidersHorizontal, label: 'Program' },
  { id: 'goals', icon: Goal, label: 'Goals' },
  { id: 'equipment', icon: Wrench, label: 'Equipment' },
  { id: 'workout-display', icon: MonitorPlay, label: 'Workout Display' },
  { id: 'coach', icon: Brain, label: 'Coach' },
  { id: 'cloud', icon: Cloud, label: 'Cloud Sync' },
  { id: 'backup', icon: Database, label: 'Backup' },
]

const coachStyleOptions = ['Direct', 'Balanced', 'Detailed'] as const
const warningSensitivityOptions = ['Low', 'Normal', 'High'] as const

const goalFields = [
  ['primaryGoal', 'Primary goal'],
  ['secondaryGoal', 'Secondary goal'],
  ['bodyGoal', 'Body goal'],
  ['weakPoint', 'Weak point'],
  ['cardioPreference', 'Cardio preference'],
  ['injuryLimitation', 'Injury limitation'],
] as const

export function Settings({ onDataCleared, onNavigate }: SettingsProps) {
  const { isSupabaseConfigured, signOut, user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    getInitialSettingsTab(),
  )
  const [settings, setSettings] = useState(() => getUserProfileSettings())
  const [plan, setPlan] = useState<WorkoutDay[]>(
    () => getCustomWorkoutPlan() as WorkoutDay[],
  )
  const [notice, setNotice] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  // The profile reads as a summary card; the inputs only appear once you ask
  // to edit. profileDraft is the snapshot Cancel restores.
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState<any>(null)
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

  function startEditingProfile() {
    setProfileDraft(settings.profile)
    setEditingProfile(true)
  }

  function cancelEditingProfile() {
    if (profileDraft) {
      setSettings((current: any) => ({ ...current, profile: profileDraft }))
    }
    setProfileDraft(null)
    setEditingProfile(false)
  }

  async function saveProfile() {
    await saveSettings('Profile saved.')
    setProfileDraft(null)
    setEditingProfile(false)
  }

  /**
   * Profile photos are stored inline in the settings document, so they are
   * downscaled hard first: 256px wide is all the avatar ever renders at, and
   * it keeps the JSON small enough for localStorage and cloud sync.
   */
  async function handleAvatarSelect(file: File, previewUrl: string | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    try {
      const square: File = await resizeImageFile(file, 256, 0.82)
      const dataUrl: string = await fileToBase64(square)
      updateProfile('avatarDataUrl', dataUrl)
    } catch {
      setNotice('Could not read that photo. Try another one.')
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    const result = await signOut()
    setSigningOut(false)
    if (result && result.error) {
      setNotice('Could not sign out. Try again.')
    }
  }

  function resetProfile() {
    const next = resetUserProfileSettings()
    setSettings(next)
    setProfileDraft(null)
    setEditingProfile(false)
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
    // The installed program went with it, so hand control back to App: it
    // re-checks for a program and sends the user to the setup screen.
    onDataCleared?.()
  }

  return (
    <section className="settings-page">
      <header className="progress-hero settings-hero">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Settings + data</h1>
          <p>
            Edit your training profile, goals, equipment, and local backup
            files.
          </p>
        </div>
      </header>

      <div className="settings-tabs-bar">
        <div
          className="settings-tabs"
          role="tablist"
          aria-label="Settings sections"
        >
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

          {editingProfile ? (
            <>
              <div className="settings-avatar-upload">
                <ImageUploadPreview
                  label="Profile photo"
                  onRemove={() => updateProfile('avatarDataUrl', '')}
                  onSelect={handleAvatarSelect}
                  previewSrc={settings.profile.avatarDataUrl || null}
                />
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
                    value={settings.profile.heightCm ?? ''}
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
                    value={settings.profile.currentWeightKg ?? ''}
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
                    value={settings.profile.goalWeightMinKg ?? ''}
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
                    value={settings.profile.goalWeightMaxKg ?? ''}
                  />
                </label>
                <label className="settings-field settings-field--wide">
                  Training goal
                  <textarea
                    className="settings-input settings-textarea"
                    onChange={(event) =>
                      updateProfile('trainingGoal', event.target.value)
                    }
                    rows={2}
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
                  onClick={saveProfile}
                  type="button"
                >
                  <Save size={19} strokeWidth={2.4} aria-hidden="true" />
                  Save Profile
                </button>
                <button
                  className="workout-secondary-button"
                  onClick={cancelEditingProfile}
                  type="button"
                >
                  <X size={19} strokeWidth={2.4} aria-hidden="true" />
                  Cancel
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
            </>
          ) : (
            <>
              <div className="settings-identity">
                <ProfileAvatar
                  avatarDataUrl={settings.profile.avatarDataUrl}
                  initials={profileInitials(settings.profile.name)}
                  size={62}
                />
                <div className="settings-identity__text">
                  <strong>{settings.profile.name || 'Your profile'}</strong>
                  <span>
                    {settings.profile.experienceLevel || 'Tap Edit to add your details'}
                  </span>
                </div>
                <button
                  className="settings-edit-button"
                  onClick={startEditingProfile}
                  type="button"
                >
                  <Pencil size={16} strokeWidth={2.4} aria-hidden="true" />
                  Edit
                </button>
              </div>

              <dl className="settings-info-grid">
                {buildProfileFacts(settings.profile).map((fact) => (
                  <div
                    className={
                      fact.wide
                        ? 'settings-info settings-info--wide'
                        : 'settings-info'
                    }
                    key={fact.label}
                  >
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
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
              {/* Free text, not a preset list: a fixed menu of goals only ever
                  fits the person it was written for. */}
              <input
                className="settings-input"
                onChange={(event) =>
                  updateCoach('mainPriority', event.target.value)
                }
                placeholder="What are you training for?"
                type="text"
                value={settings.coach.mainPriority}
              />
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

      {/* The program manager (including "paste a program") used to live on the
          Plan Editor page. That page is gone, so it is hosted here. */}
      {activeTab === 'program' ? (
        <WorkoutProgramManager
          hasUnsavedPlanChanges={false}
          onPlanChanged={() => setPlan(getCustomWorkoutPlan() as WorkoutDay[])}
          plan={plan}
        />
      ) : null}

      {activeTab === 'cloud' ? (
        <>
          <CloudSyncPanel />
          <CloudHealthPanel />
        </>
      ) : null}

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

      {/* Account action, not a settings section: it sits at the very bottom
          where sign-out lives in most apps, not among the tabs. */}
      {isSupabaseConfigured ? (
        <div className="settings-account-actions">
          {user ? (
            <button
              className="settings-auth-button"
              disabled={signingOut}
              onClick={handleSignOut}
              type="button"
            >
              <LogOut size={17} strokeWidth={2.4} aria-hidden="true" />
              {signingOut ? 'Signing out...' : 'Logout'}
            </button>
          ) : (
            <button
              className="settings-auth-button"
              onClick={() => window.location.reload()}
              type="button"
            >
              <LogIn size={17} strokeWidth={2.4} aria-hidden="true" />
              Login
            </button>
          )}
        </div>
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
        {SHOW_DEV_PAGES ? (
          <button
            className="settings-footer-link"
            onClick={() => onNavigate('pre-deploy-checklist')}
            type="button"
          >
            Pre-Deploy Checklist
          </button>
        ) : null}
      </footer>
    </section>
  )
}

interface ProfileFact {
  label: string
  value: string
  /** Long free-text answers get a full-width row instead of a tile. */
  wide?: boolean
}

/** A measurement with its unit, or 'Not set' when the user has not entered it. */
function measurement(value: number | null, unit: string): string {
  return value ? `${value} ${unit}` : 'Not set'
}

/** The read-only view of the profile: every stored field, nothing editable. */
function buildProfileFacts(profile: any): ProfileFact[] {
  const { goalWeightMinKg: min, goalWeightMaxKg: max } = profile
  const goalWeight =
    min && max ? `${min}-${max} kg` : measurement(min || max, 'kg')

  return [
    { label: 'Height', value: measurement(profile.heightCm, 'cm') },
    {
      label: 'Current weight',
      value: measurement(profile.currentWeightKg, 'kg'),
    },
    { label: 'Goal weight', value: goalWeight },
    { label: 'Training time', value: profile.trainingTimePerDay || 'Not set' },
    { label: 'Main focus', value: profile.mainFocus || 'Not set', wide: true },
    {
      label: 'Training goal',
      value: profile.trainingGoal || 'Not set',
      wide: true,
    },
  ]
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
