import { authMessages } from './auth'
import { checkinMessages } from './checkin'
import { coachMessages } from './coach'
import { commonMessages } from './common'
import { navMessages } from './nav'
import { nutritionMessages } from './nutrition'
import { legalMessages } from './legal'
import { libraryMessages } from './library'
import { onboardingMessages } from './onboarding'
import { planMessages } from './plan'
import { printMessages } from './print'
import { programMessages } from './program'
import { progressMessages } from './progress'
import { reviewMessages } from './review'
import { serviceMessages } from './services'
import { settingsMessages } from './settings'
import { systemMessages } from './system'
import { workoutMessages } from './workout'

/**
 * The English catalog, and with it the app's set of message keys.
 *
 * Split by domain so each file stays reviewable; every module owns its own key
 * prefix, so the merge never has two modules fighting over a key.
 */
export const en = {
  ...authMessages,
  ...checkinMessages,
  ...coachMessages,
  ...commonMessages,
  ...navMessages,
  ...legalMessages,
  ...libraryMessages,
  ...nutritionMessages,
  ...onboardingMessages,
  ...planMessages,
  ...printMessages,
  ...programMessages,
  ...progressMessages,
  ...reviewMessages,
  ...serviceMessages,
  ...settingsMessages,
  ...systemMessages,
  ...workoutMessages,
} as const
