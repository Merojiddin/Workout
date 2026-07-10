export function WarningsCard({ warnings }) {
  if (!warnings?.length) {
    return null
  }

  return (
    <article className="dashboard-card warnings-card">
      <div>
        <p className="eyebrow">Warnings</p>
        <h2>Fix these first</h2>
      </div>
      <div className="warnings-list">
        {warnings.map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </div>
    </article>
  )
}
