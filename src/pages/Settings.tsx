import {
  Brain,
  Cloud,
  Database,
  Download,
  Goal,
  Languages,
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
import { LanguageToggle } from '../components/LanguageToggle'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { WorkoutProgramManager } from '../components/WorkoutProgramManager'
import { useAuth } from '../context/AuthContext'
import { buildProfileIdentity } from '../hooks/useProfileIdentity'
import { useT, type MessageKey, type TranslateFn } from '../i18n'
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
  | 'language'
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
  labelKey: MessageKey
}> = [
  { id: 'profile', icon: UserRound, labelKey: 'settings.tab.profile' },
  { id: 'program', icon: SlidersHorizontal, labelKey: 'settings.tab.program' },
  { id: 'goals', icon: Goal, labelKey: 'settings.tab.goals' },
  { id: 'equipment', icon: Wrench, labelKey: 'settings.tab.equipment' },
  {
    id: 'workout-display',
    icon: MonitorPlay,
    labelKey: 'settings.tab.workoutDisplay',
  },
  { id: 'coach', icon: Brain, labelKey: 'settings.tab.coach' },
  { id: 'language', icon: Languages, labelKey: 'settings.tab.language' },
  { id: 'cloud', icon: Cloud, labelKey: 'settings.tab.cloud' },
  { id: 'backup', icon: Database, labelKey: 'settings.tab.backup' },
]

// The stored values, not the labels: these are written into the profile and
// synced, so they stay in English and only their display text is translated.
const coachStyleOptions = ['Direct', 'Balanced', 'Detailed'] as const
const warningSensitivityOptions = ['Low', 'Normal', 'High'] as const

const goalFields = [
  ['primaryGoal', 'settings.goal.primaryGoal'],
  ['secondaryGoal', 'settings.goal.secondaryGoal'],
  ['bodyGoal', 'settings.goal.bodyGoal'],
  ['weakPoint', 'settings.goal.weakPoint'],
  ['cardioPreference', 'settings.goal.cardioPreference'],
  ['injuryLimitation', 'settings.goal.injuryLimitation'],
] as const satisfies ReadonlyArray<readonly [string, MessageKey]>

/**
 * Equipment is stored by its English name, so the checkbox list maps each
 * stored value to a label rather than translating the value itself.
 */
const equipmentLabelKeys: Record<string, MessageKey> = {
  'Pull-up bar': 'settings.equipment.pullUpBar',
  'Dips station': 'settings.equipment.dipsStation',
  Dumbbells: 'settings.equipment.dumbbells',
  Barbell: 'settings.equipment.barbell',
  Bench: 'settings.equipment.bench',
  Treadmill: 'settings.equipment.treadmill',
  'Skipping rope': 'settings.equipment.skippingRope',
  'Backpack with books': 'settings.equipment.backpack',
  'VR Quest 2': 'settings.equipment.vrQuest',
}

export function Settings({ onDataCleared, onNavigate }: SettingsProps) {
  const { isSupabaseConfigured, signOut, user } = useAuth()
  const t = useT()
  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    getInitialSettingsTab(),
  )
  const [settings, setSettings] = useState(() => getUserProfileSettings())
  // Skipping the name step leaves the profile nameless, so the account's email
  // stands in as the nickname here and in the nav until a name is entered.
  const identity = buildProfileIdentity(
    String(settings.profile.name ?? '').trim(),
    String(settings.profile.avatarDataUrl ?? ''),
    user?.email,
  )
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
      setNotice(t('settings.notice.savedLocally'))
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
    await saveSettings(t('settings.notice.profileSaved'))
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
      setNotice(t('settings.notice.photoFailed'))
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    const result = await signOut()
    setSigningOut(false)
    if (result && result.error) {
      setNotice(t('settings.notice.signOutFailed'))
    }
  }

  function resetProfile() {
    const next = resetUserProfileSettings()
    setSettings(next)
    setProfileDraft(null)
    setEditingProfile(false)
    setNotice(t('settings.notice.profileReset'))
  }

  function handleExport() {
    exportAllData()
    setNotice(t('settings.notice.exported'))
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
    reader.onerror = () => setNotice(t('settings.notice.fileFailed'))
    reader.readAsText(file)
  }

  function handleClearAllData() {
    const confirmed = window.confirm(t('settings.clearConfirm'))
    if (!confirmed) {
      return
    }

    clearAllData()
    setSettings(getUserProfileSettings())
    setNotice(t('settings.notice.cleared'))
    // The installed program went with it, so hand control back to App: it
    // re-checks for a program and sends the user to the setup screen.
    onDataCleared?.()
  }

  return (
    <section className="settings-page">
      <header className="progress-hero settings-hero">
        <div>
          <p className="eyebrow">{t('settings.eyebrow')}</p>
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
        </div>
      </header>

      <div className="settings-tabs-bar">
        <div
          className="settings-tabs"
          role="tablist"
          aria-label={t('settings.sectionsAria')}
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
                {t(tab.labelKey)}
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
              <p className="eyebrow">{t('settings.profileEyebrow')}</p>
              <h2>{t('settings.profileTitle')}</h2>
            </div>
            <UserRound size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          {editingProfile ? (
            <>
              <div className="settings-avatar-upload">
                <ImageUploadPreview
                  label={t('settings.photoLabel')}
                  onRemove={() => updateProfile('avatarDataUrl', '')}
                  onSelect={handleAvatarSelect}
                  previewSrc={settings.profile.avatarDataUrl || null}
                />
              </div>

              <div className="settings-form-grid">
                <label className="settings-field">
                  {t('settings.name')}
                  <input
                    className="settings-input"
                    onChange={(event) => updateProfile('name', event.target.value)}
                    type="text"
                    value={settings.profile.name}
                  />
                </label>
                <label className="settings-field">
                  {t('settings.heightCm')}
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
                  {t('settings.currentWeightKg')}
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
                  {t('settings.goalWeightMinKg')}
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
                  {t('settings.goalWeightMaxKg')}
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
                  {t('settings.trainingGoal')}
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
                  {t('settings.mainFocus')}
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
                  {t('settings.trainingTimePerDay')}
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
                  {t('settings.experienceLevel')}
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
                  {t('settings.saveProfile')}
                </button>
                <button
                  className="workout-secondary-button"
                  onClick={cancelEditingProfile}
                  type="button"
                >
                  <X size={19} strokeWidth={2.4} aria-hidden="true" />
                  {t('action.cancel')}
                </button>
                <button
                  className="workout-secondary-button"
                  onClick={resetProfile}
                  type="button"
                >
                  <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
                  {t('settings.resetProfile')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="settings-identity">
                <ProfileAvatar
                  avatarDataUrl={identity.avatarDataUrl}
                  initials={identity.initials}
                  size={62}
                />
                <div className="settings-identity__text">
                  <strong>{identity.name || t('settings.yourProfile')}</strong>
                  <span>
                    {settings.profile.experienceLevel ||
                      (identity.isFallbackName
                        ? t('settings.usingEmail')
                        : t('settings.tapEdit'))}
                  </span>
                </div>
                <button
                  className="settings-edit-button"
                  onClick={startEditingProfile}
                  type="button"
                >
                  <Pencil size={16} strokeWidth={2.4} aria-hidden="true" />
                  {t('action.edit')}
                </button>
              </div>

              <dl className="settings-info-grid">
                {buildProfileFacts(settings.profile, t).map((fact) => (
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
              <p className="eyebrow">{t('settings.goalsEyebrow')}</p>
              <h2>{t('settings.goalsTitle')}</h2>
            </div>
            <Goal size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="settings-form-grid">
            {goalFields.map(([field, labelKey]) => (
              <label className="settings-field" key={field}>
                {t(labelKey)}
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
              onClick={() => saveSettings(t('settings.notice.goalsSaved'))}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              {t('settings.saveGoals')}
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'equipment' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{t('settings.equipmentEyebrow')}</p>
              <h2>{t('settings.equipmentTitle')}</h2>
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
                <span>
                  {equipmentLabelKeys[item] ? t(equipmentLabelKeys[item]) : item}
                </span>
              </label>
            ))}
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings(t('settings.notice.equipmentSaved'))}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              {t('settings.saveEquipment')}
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'workout-display' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{t('settings.displayEyebrow')}</p>
              <h2>{t('settings.displayTitle')}</h2>
            </div>
            <MonitorPlay size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <p className="settings-help-copy">{t('settings.displayHelp')}</p>

          <div className="settings-check-grid settings-check-grid--stacked">
            <label className="settings-check">
              <input
                checked={settings.workoutDisplay.showExerciseImages}
                onChange={(event) =>
                  updateWorkoutDisplay('showExerciseImages', event.target.checked)
                }
                type="checkbox"
              />
              <span>{t('settings.display.showImages')}</span>
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
              <span>{t('settings.display.videosCollapsed')}</span>
            </label>
            <label className="settings-check">
              <input
                checked={settings.workoutDisplay.autoOpenVideo}
                onChange={(event) =>
                  updateWorkoutDisplay('autoOpenVideo', event.target.checked)
                }
                type="checkbox"
              />
              <span>{t('settings.display.autoOpenVideo')}</span>
            </label>
            <label className="settings-check">
              <input
                checked={settings.workoutDisplay.preferCompactView}
                onChange={(event) =>
                  updateWorkoutDisplay('preferCompactView', event.target.checked)
                }
                type="checkbox"
              />
              <span>{t('settings.display.compactView')}</span>
            </label>
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings(t('settings.notice.displaySaved'))}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              {t('settings.saveDisplay')}
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'coach' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{t('settings.coachEyebrow')}</p>
              <h2>{t('settings.coachTitle')}</h2>
            </div>
            <Brain size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="settings-form-grid">
            <label className="settings-field">
              {t('settings.coachingStyle')}
              <select
                className="settings-input"
                onChange={(event) =>
                  updateCoach('coachingStyle', event.target.value)
                }
                value={settings.coach.coachingStyle}
              >
                {coachStyleOptions.map((option) => (
                  <option key={option} value={option}>
                    {t(`settings.coachStyle.${option}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              {t('settings.mainPriority')}
              {/* Free text, not a preset list: a fixed menu of goals only ever
                  fits the person it was written for. */}
              <input
                className="settings-input"
                onChange={(event) =>
                  updateCoach('mainPriority', event.target.value)
                }
                placeholder={t('settings.mainPriorityPlaceholder')}
                type="text"
                value={settings.coach.mainPriority}
              />
            </label>
            <label className="settings-field">
              {t('settings.warningSensitivity')}
              <select
                className="settings-input"
                onChange={(event) =>
                  updateCoach('warningSensitivity', event.target.value)
                }
                value={settings.coach.warningSensitivity}
              >
                {warningSensitivityOptions.map((option) => (
                  <option key={option} value={option}>
                    {t(`settings.sensitivity.${option}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="settings-actions">
            <button
              className="workout-primary-button"
              onClick={() => saveSettings(t('settings.notice.coachSaved'))}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              {t('settings.saveCoach')}
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

      {activeTab === 'language' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{t('settings.languageEyebrow')}</p>
              <h2>{t('settings.languageTitle')}</h2>
            </div>
            <Languages size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <p className="settings-help-copy">{t('language.description')}</p>

          {/* No Save button: the choice applies the moment it is made, the
              way it does in the top bar. */}
          <LanguageToggle variant="segmented" />
        </article>
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
              <p className="eyebrow">{t('settings.backupEyebrow')}</p>
              <h2>{t('settings.backupTitle')}</h2>
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
              {t('settings.exportAll')}
            </button>
            <button
              className="workout-secondary-button"
              onClick={() => importInputRef.current?.click()}
              type="button"
            >
              <Upload size={19} strokeWidth={2.4} aria-hidden="true" />
              {t('settings.import')}
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
              {t('settings.clearAll')}
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
              {signingOut ? t('settings.signingOut') : t('settings.logout')}
            </button>
          ) : (
            <button
              className="settings-auth-button"
              onClick={() => window.location.reload()}
              type="button"
            >
              <LogIn size={17} strokeWidth={2.4} aria-hidden="true" />
              {t('settings.login')}
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
          {t('settings.privacyLink')}
        </button>
        <button
          className="settings-footer-link"
          onClick={() => onNavigate('disclaimer')}
          type="button"
        >
          {t('settings.disclaimerLink')}
        </button>
        {SHOW_DEV_PAGES ? (
          <button
            className="settings-footer-link"
            onClick={() => onNavigate('pre-deploy-checklist')}
            type="button"
          >
            {t('settings.checklistLink')}
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
function measurement(
  value: number | null,
  unit: string,
  t: TranslateFn,
): string {
  return value
    ? t('settings.measurementWithUnit', { value, unit })
    : t('state.notSet')
}

/** The read-only view of the profile: every stored field, nothing editable. */
function buildProfileFacts(profile: any, t: TranslateFn): ProfileFact[] {
  const { goalWeightMinKg: min, goalWeightMaxKg: max } = profile
  const kg = t('unit.kg')
  const notSet = t('state.notSet')
  const goalWeight =
    min && max
      ? t('settings.fact.goalWeightRange', { min, max })
      : measurement(min || max, kg, t)

  return [
    {
      label: t('settings.fact.height'),
      value: measurement(profile.heightCm, t('unit.cm'), t),
    },
    {
      label: t('settings.fact.currentWeight'),
      value: measurement(profile.currentWeightKg, kg, t),
    },
    { label: t('settings.fact.goalWeight'), value: goalWeight },
    {
      label: t('settings.fact.trainingTime'),
      value: profile.trainingTimePerDay || notSet,
    },
    {
      label: t('settings.fact.mainFocus'),
      value: profile.mainFocus || notSet,
      wide: true,
    },
    {
      label: t('settings.fact.trainingGoal'),
      value: profile.trainingGoal || notSet,
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
