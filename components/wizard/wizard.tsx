"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { CampoInput } from "./campo-input"
import { EtapaDropdown } from "./etapa-dropdown"
import { useWizardDraft, type WizardTela } from "./use-wizard-draft"
import { WizardRail } from "./wizard-rail"
import { etapaCompleta, faltamNaEtapa, gruposDaEtapa, progressoObrigatorio } from "@/lib/wizard-progress"
import type { Questionario, Respostas, WizardLead } from "@/lib/wizard-types"

export type WizardEnvioDados = {
  lead: WizardLead
  respostas: Respostas
  duracaoSegundos: number
  origem: string
}

export type WizardProps<TResultado> = {
  questionario: Questionario
  titulo: string
  aberturaTitulo: string
  aberturaTexto: string
  onEnviar: (dados: WizardEnvioDados) => Promise<TResultado>
  telaFinal: (resultado: TResultado) => ReactNode
}

const LEAD_VAZIO: WizardLead = { nome: "", empresa: "", email: "", whatsapp: "", consentimento: false }

export function Wizard<TResultado>({
  questionario,
  titulo,
  aberturaTitulo,
  aberturaTexto,
  onEnviar,
  telaFinal,
}: WizardProps<TResultado>) {
  const { pronto, inicial, salvar, limpar } = useWizardDraft(questionario.id, questionario.versao)

  const [tela, setTela] = useState<WizardTela>("abertura")
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [lead, setLead] = useState<WizardLead>(LEAD_VAZIO)
  const [respostas, setRespostas] = useState<Respostas>({})
  const [iniciadoEm, setIniciadoEm] = useState(() => Date.now())
  const [retomado, setRetomado] = useState(false)
  const [restaurado, setRestaurado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [resultado, setResultado] = useState<TResultado | null>(null)
  const origemRef = useRef("link")

  // Carrega rascunho e origem uma única vez.
  useEffect(() => {
    if (!pronto) return
    if (inicial) {
      setTela(inicial.tela === "concluido" ? "questionario" : inicial.tela)
      setEtapaAtual(inicial.etapaAtual)
      setLead(inicial.lead)
      setRespostas(inicial.respostas)
      setIniciadoEm(inicial.iniciadoEm)
      if (Object.keys(inicial.respostas).length > 0) setRetomado(true)
    }
    const origem = new URLSearchParams(window.location.search).get("o")
    if (origem) origemRef.current = origem.slice(0, 50)
    setRestaurado(true)
  }, [pronto, inicial])

  // Autosave a cada mudança relevante (não persiste a tela final).
  useEffect(() => {
    if (!pronto || !restaurado || resultado) return
    salvar({ versao: questionario.versao, tela, etapaAtual, lead, respostas, iniciadoEm })
  }, [pronto, restaurado, resultado, salvar, questionario.versao, tela, etapaAtual, lead, respostas, iniciadoEm])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [etapaAtual, tela])

  const progresso = useMemo(() => progressoObrigatorio(questionario, respostas), [questionario, respostas])
  const etapa = questionario.etapas[etapaAtual]
  const faltam = etapa ? faltamNaEtapa(etapa, respostas) : 0
  const ultimaEtapa = etapaAtual === questionario.etapas.length - 1
  const tudoCompleto = questionario.etapas.every((e) => etapaCompleta(e, respostas))

  const leadValido =
    lead.nome.trim().length >= 2 &&
    lead.empresa.trim().length >= 2 &&
    /.+@.+\..+/.test(lead.email) &&
    lead.whatsapp.replace(/\D/g, "").length >= 10 &&
    lead.consentimento

  const responder = useCallback((chave: string, valor: string | number) => {
    setRespostas((r) => ({ ...r, [chave]: valor }))
  }, [])

  async function enviar() {
    setEnviando(true)
    setErroEnvio(null)
    try {
      // Campos de texto opcionais vazios não são enviados.
      const limpas: Respostas = {}
      for (const [chave, valor] of Object.entries(respostas)) {
        if (typeof valor === "string" && valor.trim() === "") continue
        limpas[chave] = typeof valor === "string" ? valor.trim() : valor
      }
      const res = await onEnviar({
        lead: {
          nome: lead.nome.trim(),
          empresa: lead.empresa.trim(),
          email: lead.email.trim(),
          whatsapp: lead.whatsapp.trim(),
          consentimento: true,
        },
        respostas: limpas,
        duracaoSegundos: Math.max(0, Math.round((Date.now() - iniciadoEm) / 1000)),
        origem: origemRef.current,
      })
      limpar()
      setResultado(res)
      setTela("concluido")
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : "Falha no envio. Verifique sua conexão.")
    } finally {
      setEnviando(false)
    }
  }

  if (!pronto) return null

  // ---------- Abertura ----------
  if (tela === "abertura") {
    const campos = [
      ["nome", "Seu nome", "text", "Como podemos te chamar"],
      ["empresa", "Empresa", "text", "Nome da empresa avaliada"],
      ["email", "E-mail", "email", "voce@empresa.com.br"],
      ["whatsapp", "WhatsApp", "tel", "(00) 00000-0000"],
    ] as const
    return (
      <div className="wz-ambient flex min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="wz-ghost-ring hidden sm:block" />
        <div className="relative z-10 w-full max-w-[520px]">
          <div className="wz-card !p-7 sm:!p-11">
            <p className="wz-eyebrow mb-3.5">{titulo}</p>
            <h1 className="mb-4 text-[26px] font-semibold italic leading-tight sm:text-[28px]">{aberturaTitulo}</h1>
            <p className="mb-5 text-[14.5px] leading-relaxed text-text-muted">{aberturaTexto}</p>

            <div className="mb-7 grid grid-cols-2 overflow-hidden rounded-sm border border-line sm:grid-cols-3">
              {[
                [String(progresso.total), "Campos"],
                [String(questionario.etapas.length), questionario.rotuloEtapaPlural ?? `${questionario.rotuloEtapa}s`],
                [questionario.tempoEstimado, "Tempo estimado"],
              ].map(([n, l]) => (
                <div key={l} className="border-line bg-panel-raised px-3 py-4 text-center [&+&]:border-l">
                  <p className="font-display text-lg font-semibold text-gold">{n}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.06em] text-text-muted">{l}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {campos.map(([campo, rotulo, tipo, placeholder]) => (
                <label key={campo} className="flex flex-col gap-1.5">
                  <span className="font-display text-[10.5px] uppercase tracking-[0.12em] text-text-muted">
                    {rotulo}*
                  </span>
                  <input
                    type={tipo}
                    className="wz-input"
                    placeholder={placeholder}
                    value={lead[campo]}
                    onChange={(e) => setLead((l) => ({ ...l, [campo]: e.target.value }))}
                  />
                </label>
              ))}
            </div>

            <label className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-text-dim">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={lead.consentimento}
                onChange={(e) => setLead((l) => ({ ...l, consentimento: e.target.checked }))}
              />
              Autorizo a Versak a usar estes dados para me apresentar o resultado e entrar em contato.*
            </label>

            <p className="mt-4 text-xs leading-relaxed text-text-dim">
              Seu progresso é salvo automaticamente. Se fechar a aba, retoma exatamente de onde parou, neste mesmo
              navegador.
            </p>

            <button
              type="button"
              className="wz-btn-gold mt-6 w-full"
              disabled={!leadValido}
              onClick={() => setTela("questionario")}
            >
              {retomado ? "Continuar de onde parei" : "Iniciar"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Pausa ----------
  if (tela === "pausa") {
    const faltamTotal = progresso.total - progresso.respondidos
    const primeiroNome = lead.nome.trim().split(" ")[0]
    return (
      <div className="wz-ambient flex min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="wz-ghost-ring hidden sm:block" />
        <div className="relative z-10 w-full max-w-[520px]">
          <div className="wz-card !p-7 sm:!p-11">
            <p className="wz-eyebrow mb-3.5">Progresso salvo</p>
            <h1 className="mb-4 text-[26px] font-semibold italic">
              {primeiroNome ? `Até já, ${primeiroNome}!` : "Até já!"}
            </h1>
            <p className="text-[14.5px] leading-relaxed text-text-muted">
              {faltamTotal > 0
                ? `Você já respondeu ${progresso.respondidos} campos. O restante fica te esperando, sem pressa.`
                : "Você já respondeu tudo — pode voltar quando quiser para revisar antes de concluir."}
            </p>

            <div className="my-7 grid grid-cols-3 overflow-hidden rounded-sm border border-line">
              {[
                [String(progresso.respondidos), "Respondidas"],
                [String(faltamTotal), "Faltam"],
                [`${progresso.pct}%`, "Concluído"],
              ].map(([n, l]) => (
                <div key={l} className="border-line bg-panel-raised px-3 py-4 text-center [&+&]:border-l">
                  <p className="font-display text-xl font-semibold text-gold">{n}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.06em] text-text-muted">{l}</p>
                </div>
              ))}
            </div>

            <p className="mb-6 text-xs leading-relaxed text-text-dim">
              Pode fechar esta aba com tranquilidade. Quando quiser continuar, volte a este mesmo link, neste mesmo
              navegador, e retomamos exatamente de onde você parou.
            </p>
            <button type="button" className="wz-btn-gold w-full" onClick={() => setTela("questionario")}>
              Voltar a responder
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Concluído ----------
  if (tela === "concluido" && resultado !== null) {
    return (
      <div className="wz-ambient flex min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="wz-ghost-ring hidden sm:block" />
        <div className="relative z-10 w-full max-w-[560px]">
          <div className="wz-card !p-7 sm:!p-11">{telaFinal(resultado)}</div>
        </div>
      </div>
    )
  }

  // ---------- Questionário ----------
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <WizardRail
        questionario={questionario}
        etapaAtual={etapaAtual}
        respostas={respostas}
        pct={progresso.pct}
        onSelecionarEtapa={setEtapaAtual}
        onSalvarESair={() => setTela("pausa")}
      />

      <main className="min-w-0 flex-1 px-5 pb-24 pt-8 sm:px-8 lg:max-w-[840px] lg:px-16 lg:pt-14">
        <div className="mb-5 lg:hidden">
          <EtapaDropdown
            questionario={questionario}
            etapaAtual={etapaAtual}
            respostas={respostas}
            onSelecionar={setEtapaAtual}
          />
        </div>

        <p className="mb-8 font-display text-[11.5px] uppercase tracking-[0.1em] text-text-dim">
          {etapa?.nome} — {etapa?.campos.length} {etapa?.campos.length === 1 ? "campo" : "campos"}
        </p>

        {etapa?.descricao && (
          <p className="mb-8 text-sm italic leading-relaxed text-text-muted">{etapa.descricao}</p>
        )}

        {retomado && (
          <p className="mb-8 rounded border border-gold-dim bg-panel px-4 py-2.5 text-center text-sm text-gold-bright">
            Retomamos de onde você parou.
          </p>
        )}

        {etapa &&
          gruposDaEtapa(etapa).map((bloco, i) => (
            <section key={bloco.grupo ?? `grupo-${i}`}>
              {bloco.grupo && (
                <h2 className="mb-3 mt-8 font-display text-xs uppercase tracking-[0.18em] text-text-dim">
                  {bloco.grupo}
                </h2>
              )}
              {bloco.campos.map((campo) => (
                <div key={campo.chave} className="wz-qcard">
                  <p className="mb-5 max-w-[560px] text-[16px] font-medium leading-relaxed sm:text-[18px]">
                    {campo.rotulo}
                    {!campo.obrigatorio && <span className="ml-2 text-xs text-text-dim">(opcional)</span>}
                  </p>
                  <CampoInput
                    campo={campo}
                    valor={respostas[campo.chave]}
                    onChange={(valor) => responder(campo.chave, valor)}
                  />
                </div>
              ))}
            </section>
          ))}

        <div className="mt-9 flex max-w-[560px] items-center justify-between gap-4 border-t border-line pt-7">
          <button
            type="button"
            className="wz-btn-ghost"
            disabled={etapaAtual === 0}
            onClick={() => setEtapaAtual((i) => Math.max(0, i - 1))}
          >
            Voltar
          </button>
          <span className="hidden font-display text-[11.5px] tracking-wide text-text-dim sm:block">
            {progresso.respondidos} de {progresso.total}
          </span>
          {ultimaEtapa ? (
            <button
              type="button"
              className="wz-btn-gold"
              disabled={!tudoCompleto || enviando}
              onClick={enviar}
            >
              {enviando ? "Enviando..." : faltam > 0 ? `Faltam ${faltam}` : "Concluir"}
            </button>
          ) : (
            <button
              type="button"
              className="wz-btn-gold"
              disabled={faltam > 0}
              onClick={() => setEtapaAtual((i) => i + 1)}
            >
              {faltam > 0 ? `Faltam ${faltam}` : `Próximo ${questionario.rotuloEtapa.toLowerCase()}`}
            </button>
          )}
        </div>

        {erroEnvio && (
          <p className="wz-erro mt-5 max-w-[560px] text-center">
            {erroEnvio} — seus dados continuam salvos neste navegador.
          </p>
        )}
      </main>
    </div>
  )
}
