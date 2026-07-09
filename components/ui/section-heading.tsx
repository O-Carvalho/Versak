export function SectionHeading({
  eyebrow,
  titulo,
  subtitulo,
  align = "left",
}: {
  eyebrow: string
  titulo: string
  subtitulo?: string
  align?: "left" | "center"
}) {
  const alignClass = align === "center" ? "items-center text-center mx-auto" : "items-start text-left"

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignClass}`}>
      <span className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-semibold text-text sm:text-4xl">{titulo}</h2>
      {subtitulo && <p className="text-text-muted">{subtitulo}</p>}
    </div>
  )
}
