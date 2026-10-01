"use client"

import { useState } from "react"

type Props = {
  tipo: "entrada" | "saida"
  pergunta: string
}

const NOTAS = Array.from({ length: 11 }, (_, n) => n)

export function PulsoClient({ tipo, pergunta }: Props) {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const identificacaoValida = nome.trim().length >= 2 && /.+@.+\..+/.test(email)

  async function responder(nota: number) {
    if (enviando || enviado || !identificacaoValida) return
    setEnviando(true)
    setErro(null)
    try {
      const params = new URLSearchParams(window.location.search)
      const origem = params.get("o") ?? "link"
      const codigoEvento = params.get("evento")?.slice(0, 50) || undefined
      const resposta = await fetch("/api/pulso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          nome: nome.trim(),
          email: email.trim(),
          nota,
          codigoEvento,
          origem: origem.slice(0, 50),
        }),
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
            <h1 className="text-[26px] font-semibold italic">Obrigado!</h1>
          ) : (
            <>
              <div className="mx-auto mb-6 grid max-w-sm gap-3 text-left sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="font-display text-[10.5px] uppercase tracking-[0.12em] text-text-muted">
                    Nome*
                  </span>
                  <input
                    type="text"
                    className="wz-input"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-display text-[10.5px] uppercase tracking-[0.12em] text-text-muted">
                    E-mail*
                  </span>
                  <input
                    type="email"
                    className="wz-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>

              <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-text">{pergunta}</p>

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
                    disabled={enviando || !identificacaoValida}
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
