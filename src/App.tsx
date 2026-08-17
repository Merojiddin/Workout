import {
  cloneElement,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react'
import './App.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalErrorToast } from './components/GlobalErrorToast'
import { Layout } from './components/Layout'
import { LazyPageBoundary } from './components/LazyPageBoundary'
import { LoadingState } from './components/LoadingState'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { useAutoSync } from './hooks/useAutoSync'
import { Dashboard } from './pages/Dashboard'
import { TodayWorkout } from './pages/TodayWorkout'
import { WeeklyPlan } from './pages/WeeklyPlan'
import { syncCloudToLocal } from './services/syncService'
import type { PageId } from './types/navigation'

// Step 20: heavier pages are code-split so the initial bundle stays small.
// Dashboard/TodayWorkout/WeeklyPlan stay eager so starting or logging a
// workout never waits on a chunk download. BodyCheckIn and Nutrition are
// lazy because they pull in recharts, the largest dependency.
const Progress = lazy(() =>
  import('./pages/Progress').then((m) => ({ default: m.Progress })),
)
const BodyCheckIn = lazy(() =>
  import('./pages/BodyCheckIn').then((m) => ({ default: m.BodyCheckIn })),
)
const Nutrition = lazy(() =>
  import('./pages/Nutrition').then((m) => ({ default: m.Nutrition })),
)
const ExerciseLibrary = lazy(() =>
  import('./pages/ExerciseLibrary').then((m) => ({ default: m.ExerciseLibrary })),
)
const WeeklyReview = lazy(() =>
  import('./pages/WeeklyReview').then((m) => ({ default: m.WeeklyReview })),
)
const PlanEditor = lazy(() =>
  import('./pages/PlanEditor').then((m) => ({ default: m.PlanEditor })),
)
const Coach = lazy(() => import('./pages/Coach').then((m) => ({ default: m.Coach })))
const DataHealth = lazy(() =>
  import('./pages/DataHealth').then((m) => ({ default: m.DataHealth })),
)
const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings })),
)
const ExportPrint = lazy(() =>
  import('./pages/ExportPrint').then((m) => ({ default: m.ExportPrint })),
)
const Privacy = lazy(() =>
  import('./pages/Privacy').then((m) => ({ default: m.Privacy })),
)
const Disclaimer = lazy(() =>
  import('./pages/Disclaimer').then((m) => ({ default: m.Disclaimer })),
)
const PreDeployChecklist = lazy(() =>
  import('./pages/PreDeployChecklist').then((m) => ({
    default: m.PreDeployChecklist,
  })),
)

interface NavigationState {
  activePage: PageId
  history: PageId[]
}

type NavigationAction =
  | { type: 'navigate'; page: PageId }
  | { type: 'back' }
  | { type: 'reset'; page: PageId }

const initialNavigationState: NavigationState = {
  activePage: 'dashboard',
  history: [],
}

function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case 'navigate':
      if (action.page === state.activePage) {
        return state
      }

      return {
        activePage: action.page,
        history: [...state.history, state.activePage],
      }
    case 'back': {
      const previousPage = state.history[state.history.length - 1]
      if (!previousPage) {
        return state
      }

      return {
        activePage: previousPage,
        history: state.history.slice(0, -1),
      }
    }
    case 'reset':
      return {
        activePage: action.page,
        history: [],
      }
  }
}

function App() {
  return (
    <>
      <GlobalErrorToast />
      <ProtectedRoute>
        <AuthedApp />
      </ProtectedRoute>
    </>
  )
}

function AuthedApp() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [navigation, dispatchNavigation] = useReducer(
    navigationReducer,
    initialNavigationState,
  )
  const { activePage } = navigation
  // Bumped after cloud->local hydration so pages re-read the refreshed mirror.
  const [dataVersion, setDataVersion] = useState(0)
  const handleNavigate = useCallback((page: PageId) => {
    dispatchNavigation({ type: 'navigate', page })
  }, [])
  const handleBack = useCallback(() => {
    dispatchNavigation({ type: 'back' })
  }, [])
  const handlePendingSynced = useCallback(() => {
    setDataVersion((version) => version + 1)
  }, [])
  const autoSync = useAutoSync(user, { onSynced: handlePendingSynced })

  // On login (cloud mode) pull the user's cloud data into the local mirror so
  // the existing pages display it. Non-destructive: only overwrites keys that
  // have cloud rows, and backs up local values first (see syncService).
  useEffect(() => {
    if (!userId) {
      return
    }

    let active = true
    syncCloudToLocal(user)
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setDataVersion((version) => version + 1)
        }
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  function renderPage() {
    switch (activePage) {
      case 'today-workout':
        return <TodayWorkout onNavigate={handleNavigate} />
      case 'weekly-plan':
        return <WeeklyPlan onNavigate={handleNavigate} />
      case 'progress':
        return <Progress onNavigate={handleNavigate} />
      case 'body-check-in':
        return <BodyCheckIn />
      case 'nutrition':
        return <Nutrition />
      case 'exercise-library':
        return <ExerciseLibrary />
      case 'weekly-review':
        return <WeeklyReview />
      case 'plan-editor':
        return (
          <PlanEditor
            dataVersion={dataVersion}
            onDataChanged={handlePendingSynced}
          />
        )
      case 'coach':
        return <Coach />
      case 'data-health':
        return <DataHealth onNavigate={handleNavigate} />
      case 'settings':
        return <Settings onNavigate={handleNavigate} />
      case 'export-print':
        return <ExportPrint />
      case 'privacy':
        return <Privacy />
      case 'disclaimer':
        return <Disclaimer />
      case 'pre-deploy-checklist':
        return <PreDeployChecklist />
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <ErrorBoundary
      onGoDashboard={() =>
        dispatchNavigation({ type: 'reset', page: 'dashboard' })
      }
    >
      <Layout
        activePage={activePage}
        canGoBack={navigation.history.length > 0}
        onBack={handleBack}
        onNavigate={handleNavigate}
        syncMessage={autoSync.syncMessage}
        syncTone={autoSync.syncTone}
      >
        <LazyPageBoundary pageKey={activePage}>
          <Suspense fallback={<LoadingState />}>
            {cloneElement(renderPage(), {
              // userId is part of the key so switching accounts tears down any
              // page state still holding the previous user's data.
              key:
                activePage === 'plan-editor'
                  ? `${activePage}-${userId ?? 'local'}`
                  : `${activePage}-${userId ?? 'local'}-${dataVersion}`,
            })}
          </Suspense>
        </LazyPageBoundary>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
