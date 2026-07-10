interface PlaceholderPageProps {
  subtitle?: string
  title: string
}

export function PlaceholderPage({
  subtitle = 'Coming next.',
  title,
}: PlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      <p className="eyebrow">Workout OS</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  )
}
