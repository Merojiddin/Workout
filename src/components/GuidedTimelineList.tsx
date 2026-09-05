import { Coffee, Dumbbell, Timer } from 'lucide-react'
import { useT } from '../i18n'
import {
  formatGuidedClock,
  translateGuidedText,
  type GuidedTimeline,
  type GuidedTimelineStep,
} from '../utils/guidedWorkoutUtils'

interface GuidedTimelineListProps {
  timeline: GuidedTimeline
  /** Marks the step being run, and scrolls it into view. */
  activeIndex?: number
  /** Present on the player's list: jumping straight to a step. */
  onSelect?: (index: number) => void
}

/**
 * The whole session as one list, which is what "runs as a timeline" means in
 * practice: work and rest are the same kind of row, differing only in colour
 * and label, so you can see the shape of the session before starting it and
 * find your place in it while it runs.
 */
export function GuidedTimelineList({
  activeIndex,
  onSelect,
  timeline,
}: GuidedTimelineListProps) {
  const t = useT()

  return (
    <ol className="guided-timeline">
      {timeline.steps.map((step, index) => {
        const active = index === activeIndex
        const done = activeIndex !== undefined && index < activeIndex
        const classes = [
          'guided-timeline__row',
          `guided-timeline__row--${step.kind}`,
          active ? 'guided-timeline__row--active' : '',
          done ? 'guided-timeline__row--done' : '',
        ]
          .filter(Boolean)
          .join(' ')

        const content = (
          <>
            <span className="guided-timeline__icon" aria-hidden="true">
              {stepIcon(step)}
            </span>
            <span className="guided-timeline__text">
              <strong>{stepLabel(step, t)}</strong>
              <small>{stepDetail(step, t)}</small>
            </span>
            <span className="guided-timeline__time">
              {formatGuidedClock(step.seconds)}
            </span>
          </>
        )

        return (
          <li key={step.key}>
            {onSelect ? (
              <button
                aria-current={active ? 'step' : undefined}
                className={`${classes} guided-timeline__row--button`}
                onClick={() => onSelect(index)}
                ref={active ? scrollIntoView : undefined}
                type="button"
              >
                {content}
              </button>
            ) : (
              <div aria-current={active ? 'step' : undefined} className={classes}>
                {content}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Keeps the step being run visible when the list is opened mid-workout. */
function scrollIntoView(element: HTMLButtonElement | null) {
  element?.scrollIntoView({ block: 'nearest' })
}

function stepIcon(step: GuidedTimelineStep) {
  if (step.kind === 'work') {
    return <Dumbbell size={15} strokeWidth={2.4} />
  }
  if (step.kind === 'prepare') {
    return <Timer size={15} strokeWidth={2.4} />
  }
  return <Coffee size={15} strokeWidth={2.4} />
}

type Translate = ReturnType<typeof useT>

function stepLabel(step: GuidedTimelineStep, t: Translate): string {
  if (step.kind === 'work' && step.exercise) {
    return translateGuidedText(step.exercise.name)
  }
  if (step.kind === 'prepare') {
    return t('guided.stepPrepare')
  }
  if (step.kind === 'round-rest') {
    return t('guided.stepRoundRest')
  }
  return t('guided.stepRest')
}

function stepDetail(step: GuidedTimelineStep, t: Translate): string {
  if (step.kind === 'work') {
    return step.exercise?.perSide ? t('guided.perSide') : t('guided.stepWork')
  }
  return step.next
    ? `${t('guided.player.nextUp')}: ${translateGuidedText(step.next.name)}`
    : t('guided.stepRest')
}
