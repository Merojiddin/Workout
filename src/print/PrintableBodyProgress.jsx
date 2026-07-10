export function PrintableBodyProgress({ checkIns }) {
  const sorted = [...safeArray(checkIns)].sort((a, b) =>
    String(b?.date ?? '').localeCompare(String(a?.date ?? '')),
  )
  const latest = sorted[0]

  return (
    <article className="print-page">
      <h1>Body Progress Report</h1>
      {latest ? (
        <>
          <h2>Latest Body Check-in</h2>
          <div className="print-summary-grid">
            <Summary label="Date" value={latest.date} />
            <Summary label="Body weight" value={formatUnit(latest.bodyWeightKg, 'kg')} />
            <Summary label="Waist" value={formatUnit(latest.waistCm, 'cm')} />
            <Summary label="Chest" value={formatUnit(latest.chestCm, 'cm')} />
            <Summary label="Shoulders" value={formatUnit(latest.shouldersCm, 'cm')} />
            <Summary label="Abs rating" value={formatUnit(latest.absVisibilityRating, '/10')} />
            <Summary label="Posture rating" value={formatUnit(latest.postureRating, '/10')} />
            <Summary label="Energy" value={formatUnit(latest.energyLevel, '/10')} />
          </div>

          <h2>Measurement History</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Waist</th>
                <th>Belly</th>
                <th>Chest</th>
                <th>Shoulders</th>
                <th>Left arm</th>
                <th>Right arm</th>
                <th>Hips</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((checkIn) => (
                <tr key={checkIn.id}>
                  <td>{checkIn.date}</td>
                  <td>{formatUnit(checkIn.bodyWeightKg, 'kg')}</td>
                  <td>{formatUnit(checkIn.waistCm, 'cm')}</td>
                  <td>{formatUnit(checkIn.bellyCm, 'cm')}</td>
                  <td>{formatUnit(checkIn.chestCm, 'cm')}</td>
                  <td>{formatUnit(checkIn.shouldersCm, 'cm')}</td>
                  <td>{formatUnit(checkIn.leftArmCm, 'cm')}</td>
                  <td>{formatUnit(checkIn.rightArmCm, 'cm')}</td>
                  <td>{formatUnit(checkIn.hipsCm, 'cm')}</td>
                  <td>{checkIn.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Photo Thumbnails</h2>
          {hasPhotos(latest) ? (
            <div className="print-photo-grid">
              <Photo label="Front" src={photoSrc(latest, 'front')} />
              <Photo label="Side" src={photoSrc(latest, 'side')} />
              <Photo label="Back" src={photoSrc(latest, 'back')} />
            </div>
          ) : (
            <p className="print-empty">No photos saved for the latest check-in.</p>
          )}
        </>
      ) : (
        <p className="print-empty">No data yet. Complete logs first.</p>
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
