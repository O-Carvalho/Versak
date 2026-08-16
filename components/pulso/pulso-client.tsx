"use client"

import { useState } from "react"
import { VBS_CODIGO_EVENTO } from "@/content/vbs"

type Props = {
  tipo: "entrada" | "saida"
  eyebrow: string
  titulo: string
  pergunta: string
  legenda: string
}

const NOTAS = Array.from({ length: 11 }, (_, n) => n)

export function PulsoClient({ tipo, eyebrow, titulo, pergunta, legenda }: Props) {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function responder(nota: number) {
    if (enviando || enviado) return
    setEnviando(true)
    setErro(null)
    try {
      const origem = new URLSearchParams(window.location.search).get("o") ?? "link"
      const resposta = await fetch("/api/pulso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, nota, codigoEvento: VBS_CODIGO_EVENTO, origem: origem.slice(0, 50) }),
      })
      const json = (await resposta.json()) as { ok: boolean; erro?: string }
      if (!resposta.ok || !json.ok) throw new Error(json.erro ?? "Falha no envio.")
      setEnviado(true)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha no envio. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="wz-ambient flex min-h-screen items-center justify-center p-6 sm:p-8">
      <div className="wz-ghost-ring hidden sm:block" />
      <div className="relative z-10 w-full max-w-[560px]">
        <div className="wz-card !p-7 text-center sm:!p-11">
          {enviado ? (
            <>
              <p className="wz-eyebrow justify-center">Obrigado</p>
              <h1 className="mt-4 text-[26px] font-semibold italic">Resposta registrada!</h1>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
                Sua resposta ajuda a gente a entender melhor o momento do grupo. Pode voltar pra masterclass.
              </p>
            </>
          ) : (
            <>
              <p className="wz-eyebrow justify-center">{eyebrow}</p>
              <h1 className="mt-4 text-[22px] font-semibold italic leading-tight sm:text-[26px]">{titulo}</h1>
              <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-text">{pergunta}</p>
              <p className="mt-3 text-xs text-text-dim">{legenda}</p>

              <div
                role="group"
                aria-label={pergunta}
                className="mx-auto mt-7 grid max-w-[480px] gap-2"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(38px, 1fr))" }}
              >
                {NOTAS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={enviando}
                    aria-pressed={false}
                    onClick={() => responder(n)}
                    className="wz-opt wz-opt-escala"
                  >
                    <span className="font-display text-lg font-semibold">{n}</span>
                  </button>
                ))}
              </div>

              {erro && <p className="wz-erro mt-5">{erro}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
