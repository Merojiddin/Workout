import { t } from '../i18n'
export function PrintableBodyProgress({ checkIns }) {
  const sorted = [...safeArray(checkIns)].sort((a, b) =>
    String(b?.date ?? '').localeCompare(String(a?.date ?? '')),
  )
  const latest = sorted[0]

  return (
    <article className="print-page">
      <h1>{t('print.body.title')}</h1>
      {latest ? (
        <>
          <h2>{t('print.body.latest')}</h2>
          <div className="print-summary-grid">
            <Summary label="Date" value={latest.date} />
            <Summary label="Body weight" value={formatUnit(latest.bodyWeightKg, t('unit.kg'))} />
            <Summary label="Waist" value={formatUnit(latest.waistCm, t('unit.cm'))} />
            <Summary label="Chest" value={formatUnit(latest.chestCm, t('unit.cm'))} />
            <Summary label="Shoulders" value={formatUnit(latest.shouldersCm, t('unit.cm'))} />
            <Summary label="Abs rating" value={formatUnit(latest.absVisibilityRating, t('measure.ratingUnit'))} />
            <Summary label="Posture rating" value={formatUnit(latest.postureRating, t('measure.ratingUnit'))} />
            <Summary label="Energy" value={formatUnit(latest.energyLevel, t('measure.ratingUnit'))} />
          </div>

          <h2>{t('print.body.history')}</h2>
          <table>
            <thead>
              <tr>
                <th>{t('csv.date')}</th>
                <th>{t('profile.weight')}</th>
                <th>{t('measure.waistCm')}</th>
                <th>{t('measure.bellyCm')}</th>
                <th>{t('measure.chestCm')}</th>
                <th>{t('measure.shouldersCm')}</th>
                <th>{t('measure.leftArmCm')}</th>
                <th>{t('measure.rightArmCm')}</th>
                <th>{t('measure.hipsCm')}</th>
                <th>{t('print.notes')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((checkIn) => (
                <tr key={checkIn.id}>
                  <td>{checkIn.date}</td>
                  <td>{formatUnit(checkIn.bodyWeightKg, t('unit.kg'))}</td>
                  <td>{formatUnit(checkIn.waistCm, t('unit.cm'))}</td>
                  <td>{formatUnit(checkIn.bellyCm, t('unit.cm'))}</td>
                  <td>{formatUnit(checkIn.chestCm, t('unit.cm'))}</td>
                  <td>{formatUnit(checkIn.shouldersCm, t('unit.cm'))}</td>
                  <td>{formatUnit(checkIn.leftArmCm, t('unit.cm'))}</td>
                  <td>{formatUnit(checkIn.rightArmCm, t('unit.cm'))}</td>
                  <td>{formatUnit(checkIn.hipsCm, t('unit.cm'))}</td>
                  <td>{checkIn.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>{t('print.body.photos')}</h2>
          {hasPhotos(latest) ? (
            <div className="print-photo-grid">
              <Photo label="Front" src={photoSrc(latest, 'front')} />
              <Photo label="Side" src={photoSrc(latest, 'side')} />
              <Photo label="Back" src={photoSrc(latest, 'back')} />
            </div>
          ) : (
            <p className="print-empty">{t('print.body.noPhotos')}</p>
          )}
        </>
      ) : (
        <p className="print-empty">{t('print.body.noData')}</p>
      )}
    </article>
  )
}

function Summary({ label, value }) {
  return (
    <div className="print-summary-box">
      <span className="print-label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Photo({ label, src }) {
  if (!src) {
    return null
  }

  return (
    <figure>
      <img alt={`${label} progress`} src={src} />
      <figcaption>{label}</figcaption>
    </figure>
  )
}

// Prefer a resolved/base64 image src for print; cloud-only photos may be blank.
function photoSrc(checkIn, slot) {
  return checkIn?.[`${slot}PhotoUrl`] || checkIn?.[`${slot}Photo`] || null
}

function hasPhotos(checkIn) {
  return Boolean(
    photoSrc(checkIn, 'front') ||
      photoSrc(checkIn, 'side') ||
      photoSrc(checkIn, 'back'),
  )
}

function formatUnit(value, unit) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value} ${unit}` : '-'
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}
