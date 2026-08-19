import type { MessageKey } from '../../catalog'
import type { Catalog } from '../../types'
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
 * The Vietnamese catalog.
 *
 * Typed as a complete `Catalog`, so adding an English key without its
 * Vietnamese wording fails the build rather than leaking English into a
 * Vietnamese screen.
 */
export const vi: Catalog<MessageKey> = {
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
}
