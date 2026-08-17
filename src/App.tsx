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
import { More } from './pages/More'
import { Nutrition } from './pages/Nutrition'
import { TodayWorkout } from './pages/TodayWorkout'
import { syncCloudToLocal } from './services/syncService'
import type { PageId } from './types/navigation'

// Today's Workout and Nutrition are the two screens the app is for, so they
// stay eager and never wait on a chunk download. The More pages are all
// code-split; Body Check-in is the last page pulling in recharts, the largest
// dependency, and must not reach the entry bundle.
const WeeklyPlan = lazy(() =>
  import('./pages/WeeklyPlan').then((m) => ({ default: m.WeeklyPlan })),
)
const BodyCheckIn = lazy(() =>
  import('./pages/BodyCheckIn').then((m) => ({ default: m.BodyCheckIn })),
)
const ExerciseLibrary = lazy(() =>
  import('./pages/ExerciseLibrary').then((m) => ({ default: m.ExerciseLibrary })),
)
const WeeklyReview = lazy(() =>
  import('./pages/WeeklyReview').then((m) => ({ default: m.WeeklyReview })),
)
const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings })),
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

const HOME_PAGE: PageId = 'today-workout'

interface NavigationState {
  activePage: PageId
  history: PageId[]
}

type NavigationAction =
  | { type: 'navigate'; page: PageId }
  | { type: 'back' }
  | { type: 'reset'; page: PageId }

const initialNavigationState: NavigationState = {
  activePage: HOME_PAGE,
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
      case 'nutrition':
        return <Nutrition />
      case 'more':
        return <More onNavigate={handleNavigate} />
      case 'weekly-plan':
        return <WeeklyPlan onNavigate={handleNavigate} />
      case 'body-check-in':
        return <BodyCheckIn />
      case 'exercise-library':
        return <ExerciseLibrary />
      case 'weekly-review':
        return <WeeklyReview />
      case 'settings':
        return <Settings onNavigate={handleNavigate} />
      case 'privacy':
        return <Privacy />
      case 'disclaimer':
        return <Disclaimer />
      case 'pre-deploy-checklist':
        return <PreDeployChecklist />
      case 'today-workout':
      default:
        return <TodayWorkout onNavigate={handleNavigate} />
    }
  }

  return (
    <ErrorBoundary
      onGoHome={() => dispatchNavigation({ type: 'reset', page: HOME_PAGE })}
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
              key: `${activePage}-${userId ?? 'local'}-${dataVersion}`,
            })}
          </Suspense>
        </LazyPageBoundary>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
