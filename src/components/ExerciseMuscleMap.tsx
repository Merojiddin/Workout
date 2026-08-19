import Body, { type ExtendedBodyPart } from 'react-muscle-highlighter'
import { useMemo } from 'react'
import { hasDiagrammableMuscles, musclesToRegions } from '../data/muscleMap'
import { useT } from '../i18n'

interface ExerciseMuscleMapProps {
  primaryMuscles: readonly string[]
  secondaryMuscles: readonly string[]
}

// Primary uses the app accent; secondary is a dimmer wash so the two read as
// "worked hard" vs "assisting" without needing a colour legend to decode.
const PRIMARY_FILL = '#1bd2dc'
const SECONDARY_FILL = 'rgba(27, 210, 220, 0.32)'

/**
 * Front and back body diagrams with the worked muscles shaded.
 *
 * Renders nothing when no muscle maps onto a body region - cardio and skill
 * entries ("Heart & Lungs", "Boxing Skill") would otherwise show an unshaded
 * body that reads as a rendering bug.
 */
export function ExerciseMuscleMap({
  primaryMuscles,
  secondaryMuscles,
}: ExerciseMuscleMapProps) {
  const t = useT()
  const data = useMemo<ExtendedBodyPart[]>(() => {
    const primary = musclesToRegions(primaryMuscles)
    // A muscle listed as both never gets the dimmer treatment.
    const secondary = musclesToRegions(secondaryMuscles).filter(
      (region) => !primary.includes(region),
    )

    return [
      ...primary.map((slug) => ({ slug, color: PRIMARY_FILL })),
      ...secondary.map((slug) => ({ slug, color: SECONDARY_FILL })),
    ]
  }, [primaryMuscles, secondaryMuscles])

  if (!hasDiagrammableMuscles(primaryMuscles, secondaryMuscles)) {
    return null
  }

  return (
    <section className="muscle-map" aria-label={t('muscleMap.aria')}>
      <div className="muscle-map__views">
        <figure className="muscle-map__view">
          <Body data={data} side="front" gender="male" scale={1} border="none" />
          <figcaption>{t('muscleMap.front')}</figcaption>
        </figure>
        <figure className="muscle-map__view">
          <Body data={data} side="back" gender="male" scale={1} border="none" />
          <figcaption>{t('muscleMap.back')}</figcaption>
        </figure>
      </div>

      <ul className="muscle-map__legend">
        <li>
          <span
            className="muscle-map__swatch"
            style={{ background: PRIMARY_FILL }}
            aria-hidden="true"
          />
          {t('muscleMap.primary')}
        </li>
        <li>
          <span
            className="muscle-map__swatch"
            style={{ background: SECONDARY_FILL }}
            aria-hidden="true"
          />
          {t('muscleMap.secondary')}
        </li>
      </ul>
    </section>
  )
}
