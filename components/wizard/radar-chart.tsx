type Eixo = { rotulo: string; valor: number | null }

type Props = {
  eixos: Eixo[]
  notaMaxima: number
}

const TAMANHO = 300
const CENTRO = TAMANHO / 2
const RAIO_MAX = 100

function pontoEixo(indice: number, total: number, raio: number): [number, number] {
  const angulo = -Math.PI / 2 + indice * ((2 * Math.PI) / total)
  return [CENTRO + raio * Math.cos(angulo), CENTRO + raio * Math.sin(angulo)]
}

export function RadarChart({ eixos, notaMaxima }: Props) {
  const total = eixos.length
  const aneis = [0.33, 0.66, 1]

  const pontosDado = eixos.map((eixo, i) => {
    const fracao = Math.max(0, Math.min(1, (eixo.valor ?? 0) / notaMaxima))
    return pontoEixo(i, total, RAIO_MAX * fracao)
  })
  const pathDado = pontosDado.map((p) => p.join(",")).join(" ")

  return (
    <svg viewBox={`0 0 ${TAMANHO} ${TAMANHO}`} className="mx-auto w-full max-w-[320px]">
      {aneis.map((fracao) => {
        const pontos = eixos.map((_, i) => pontoEixo(i, total, RAIO_MAX * fracao).join(",")).join(" ")
        return <polygon key={fracao} points={pontos} fill="none" stroke="var(--color-line)" strokeWidth={1} />
      })}
      {eixos.map((_, i) => {
        const [x, y] = pontoEixo(i, total, RAIO_MAX)
        return <line key={i} x1={CENTRO} y1={CENTRO} x2={x} y2={y} stroke="var(--color-line)" strokeWidth={1} />
      })}
      <polygon points={pathDado} fill="var(--color-gold)" fillOpacity={0.28} stroke="var(--color-gold)" strokeWidth={2} />
      {pontosDado.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="var(--color-gold-bright)" />
      ))}
      {eixos.map((eixo, i) => {
        const [x, y] = pontoEixo(i, total, RAIO_MAX + 26)
        const anchor = x < CENTRO - 5 ? "end" : x > CENTRO + 5 ? "start" : "middle"
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--color-text-muted)"
          >
            {eixo.rotulo}
          </text>
        )
      })}
    </svg>
  )
}
