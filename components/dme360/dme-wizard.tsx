"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DME360_DIMENSOES, DME360_ESCALA, DME360_VERSAO } from "@/content/dme360"
import { linkWhatsapp } from "@/content/site"

type Lead = { nome: string; empresa: string; cargo: string; email: string; whatsapp: string; consentimento: boolean }
type Draft = { versao: string; passo: number; lead: Lead; respostas: Record<string, number>; iniciadoEm: number }

const CHAVE_DRAFT = "dme360-draft-v1"
const LEAD_VAZIO: Lead = { nome: "", empresa: "", cargo: "", email: "", whatsapp: "", consentimento: false }
const TOTAL_QUESTOES = DME360_DIMENSOES.reduce((a, d) => a + d.questoes.length, 0)

const DESCRICAO_FAIXA: Record<string, string> = {
  "Caótico": "Ausência de padrões, controles e previsibilidade; gestão reativa e dependente de pessoas-chave.",
  "Consciente": "Reconhecimento dos problemas e existência de iniciativas isoladas, ainda sem consistência.",
  "Definido": "Processos, práticas e responsabilidades formalizados; gestão parcialmente estruturada.",
  "Gerenciado": "Gestão sistemática baseada em indicadores, rituais e acompanhamento recorrente.",
  "Otimizado": "Melhoria contínua, inovação, aprendizado organizacional e alta performance sustentada.",
}

function carregarDraft(): Draft | null {
  try {
    const bruto = localStorage.getItem(CHAVE_DRAFT)
    if (!bruto) return null
    const draft = JSON.parse(bruto) as Draft
    return draft.versao === DME360_VERSAO ? draft : null
  } catch {
    return null
  }
}

export function DmeWizard() {
  const [pronto, setPronto] = useState(false)
  const [retomado, setRetomado] = useState(false)
  const [passo, setPasso] = useState(0)
  const [lead, setLead] = useState<Lead>(LEAD_VAZIO)
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [iniciadoEm, setIniciadoEm] = useState<number>(() => Date.now())
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ ime: number; classificacao: string } | null>(null)
  const origemRef = useRef("link")

  useEffect(() => {
    const draft = carregarDraft()
    if (draft) {
      setPasso(draft.passo)
      setLead(draft.lead)
      setRespostas(draft.respostas)
      setIniciadoEm(draft.iniciadoEm)
      if (Object.keys(draft.respostas).length > 0) setRetomado(true)
    }
    const origem = new URLSearchParams(window.location.search).get("o")
    if (origem) origemRef.current = origem.slice(0, 50)
    setPronto(true)
  }, [])

  useEffect(() => {
    if (!pronto || resultado) return
    const draft: Draft = { versao: DME360_VERSAO, passo, lead, respostas, iniciadoEm }
    localStorage.setItem(CHAVE_DRAFT, JSON.stringify(draft))
  }, [pronto, passo, lead, respostas, iniciadoEm, resultado])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [passo])

  const totalRespondidas = Object.keys(respostas).length
  const dimensaoAtual = passo >= 1 && passo <= 7 ? DME360_DIMENSOES[passo - 1] : undefined
  const faltamNaDimensao = useMemo(() => {
    if (!dimensaoAtual) return 0
    return dimensaoAtual.questoes.filter((q) => respostas[`${dimensaoAtual.id}:${q.codigo}`] === undefined).length
  }, [dimensaoAtual, respostas])

  const leadValido =
    lead.nome.trim().length >= 2 &&
    lead.empresa.trim().length >= 2 &&
    /.+@.+\..+/.test(lead.email) &&
    lead.whatsapp.replace(/\D/g, "").length >= 10 &&
    lead.consentimento

  async function enviar() {
    setEnviando(true)
    setErroEnvio(null)
    try {
      const resposta = await fetch("/api/dme360", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            nome: lead.nome.trim(),
            empresa: lead.empresa.trim(),
            cargo: lead.cargo.trim() || undefined,
            email: lead.email.trim(),
            whatsapp: lead.whatsapp.trim(),
            consentimento: true,
          },
          respostas,
          duracaoSegundos: Math.round((Date.now() - iniciadoEm) / 1000),
          origem: origemRef.current,
        }),
      })
      const json = (await resposta.json()) as { ok: boolean; ime?: number; classificacao?: string; erro?: string }
      if (!resposta.ok || !json.ok || json.ime === undefined || !json.classificacao) {
        throw new Error(json.erro ?? "Falha no envio.")
      }
      localStorage.removeItem(CHAVE_DRAFT)
      setResultado({ ime: json.ime, classificacao: json.classificacao })
      setPasso(8)
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : "Falha no envio. Verifique sua conexão.")
    } finally {
      setEnviando(false)
    }
  }

  if (!pronto) return null

  return (
    <div className="mx-auto w-full max-w-3xl px-5">
      <header className="mb-8 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold">Versak</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">
          DME 360 — Diagnóstico de Maturidade Empresarial
        </h1>
        {passo >= 1 && passo <= 7 && (
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-text-dim">
              <span>Dimensão {passo} de 7</span>
              <span>{totalRespondidas}/{TOTAL_QUESTOES} respondidas</span>
            </div>
            <div className="dme-progress">
              <div className="dme-progress-fill" style={{ width: `${(totalRespondidas / TOTAL_QUESTOES) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      {retomado && passo < 8 && (
        <p className="mb-6 rounded-md border border-gold-dim bg-panel px-4 py-2 text-center text-sm text-gold-bright">
          Retomamos de onde você parou.
        </p>
      )}

      {passo === 0 && (
        <section className="dme-card">
          <p className="text-sm leading-relaxed text-text-muted">
            Avalie a maturidade da gestão da sua empresa em 7 dimensões. São {TOTAL_QUESTOES} perguntas rápidas
            (35–45 minutos). Seu progresso fica salvo neste navegador — você pode pausar e voltar quando quiser.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["nome", "Nome*", "text"],
                ["empresa", "Empresa*", "text"],
                ["cargo", "Cargo", "text"],
                ["email", "E-mail*", "email"],
                ["whatsapp", "WhatsApp*", "tel"],
              ] as const
            ).map(([campo, rotulo, tipo]) => (
              <label key={campo} className="flex flex-col gap-1 text-sm text-text-muted">
                {rotulo}
                <input
                  type={tipo}
                  value={lead[campo]}
                  onChange={(e) => setLead((l) => ({ ...l, [campo]: e.target.value }))}
                  className="rounded-md border border-line bg-panel px-3 py-2 text-text outline-none focus:border-gold-dim"
                />
              </label>
            ))}
          </div>
          <label className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-text-dim">
            <input
              type="checkbox"
              checked={lead.consentimento}
              onChange={(e) => setLead((l) => ({ ...l, consentimento: e.target.checked }))}
              className="mt-0.5"
            />
            Autorizo a Versak a usar estes dados para me apresentar o resultado do diagnóstico e entrar em contato.*
          </label>
          <button
            type="button"
            disabled={!leadValido}
            onClick={() => setPasso(1)}
            className="mt-6 w-full rounded-sm bg-gold px-6 py-3 font-display text-sm font-semibold tracking-wide text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
          >
            Começar o diagnóstico
          </button>
        </section>
      )}

      {dimensaoAtual && (
        <section>
          <div className="dme-card mb-6">
            <h2 className="font-display text-xl font-semibold text-gold">{dimensaoAtual.nome}</h2>
            {dimensaoAtual.descricao && (
              <p className="mt-2 text-sm italic leading-relaxed text-text-muted">{dimensaoAtual.descricao}</p>
            )}
            <p className="mt-3 text-xs text-text-dim">
              Para cada pergunta, escolha de 1 ({DME360_ESCALA[0]?.rotulo}) a 5 ({DME360_ESCALA[4]?.rotulo}).
            </p>
          </div>

          {[...new Set(dimensaoAtual.questoes.map((q) => q.subdimensao))].map((sub) => (
            <div key={sub} className="mb-6">
              <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-text-dim">
                {sub}
              </h3>
              <div className="flex flex-col gap-3">
                {dimensaoAtual.questoes
                  .filter((q) => q.subdimensao === sub)
                  .map((q) => {
                    const chave = `${dimensaoAtual.id}:${q.codigo}`
                    const valor = respostas[chave]
                    return (
                      <div key={chave} className="dme-card">
                        <p className="text-sm leading-relaxed text-text">{q.pergunta}</p>
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {DME360_ESCALA.map((item) => (
                            <button
                              key={item.nota}
                              type="button"
                              title={item.descricao}
                              onClick={() => setRespostas((r) => ({ ...r, [chave]: item.nota }))}
                              className={`dme-option ${valor === item.nota ? "dme-option-ativa" : ""}`}
                            >
                              <span className="font-display text-base font-bold">{item.nota}</span>
                              <span className="hidden text-[10px] sm:block">{item.rotulo}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setPasso((p) => p - 1)}
              className="rounded-sm border border-line px-5 py-3 font-display text-sm text-text-muted transition-colors hover:border-gold-dim hover:text-text"
            >
              Voltar
            </button>
            {passo < 7 ? (
              <button
                type="button"
                disabled={faltamNaDimensao > 0}
                onClick={() => setPasso((p) => p + 1)}
                className="rounded-sm bg-gold px-6 py-3 font-display text-sm font-semibold text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
              >
                {faltamNaDimensao > 0 ? `Faltam ${faltamNaDimensao}` : "Próxima dimensão"}
              </button>
            ) : (
              <button
                type="button"
                disabled={faltamNaDimensao > 0 || enviando}
                onClick={enviar}
                className="rounded-sm bg-gold px-6 py-3 font-display text-sm font-semibold text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enviando ? "Enviando..." : faltamNaDimensao > 0 ? `Faltam ${faltamNaDimensao}` : "Concluir e enviar"}
              </button>
            )}
          </div>
          {erroEnvio && (
            <p className="mt-4 text-center text-sm text-gold-bright">
              {erroEnvio} — seus dados continuam salvos neste navegador.
            </p>
          )}
        </section>
      )}

      {passo === 8 && resultado && (
        <section className="dme-card text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-text-dim">Seu IME 360</p>
          <p className="mt-2 font-display text-6xl font-bold text-gold">{resultado.ime.toFixed(2).replace(".", ",")}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-text">{resultado.classificacao}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            {DESCRICAO_FAIXA[resultado.classificacao] ?? ""}
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-text-muted">
            O relatório completo, dimensão por dimensão, será apresentado pela equipe Versak.
          </p>
          <a
            href={linkWhatsapp("Olá! Acabei de concluir o DME 360 e gostaria de conversar sobre o meu resultado.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-sm bg-gold px-6 py-3 font-display text-sm font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            Falar com a Versak no WhatsApp
          </a>
        </section>
      )}
    </div>
  )
}
