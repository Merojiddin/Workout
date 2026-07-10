export function NextWeekFocusCard({ items }) {
  return (
    <article className="dashboard-card focus-card">
      <div>
        <p className="eyebrow">Next Week Focus</p>
        <h2>Coach actions</h2>
      </div>
      <ol className="focus-list">
        {(items ?? []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </article>
  )
}
