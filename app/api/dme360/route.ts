import { NextResponse } from "next/server"
import { z } from "zod"
import { DME360_DIMENSOES, DME360_VERSAO } from "@/content/dme360"
import { calcularPontuacao } from "@/lib/dme360-score"
import { montarEmailResumo } from "@/lib/dme360-email"

export const maxDuration = 10

const chavesQuestoes = DME360_DIMENSOES.flatMap((d) => d.questoes.map((q) => `${d.id}:${q.codigo}`))

const respostasShape = z.object(
  Object.fromEntries(chavesQuestoes.map((c) => [c, z.number().int().min(1).max(5)])),
)

const corpoSchema = z.object({
  lead: z.object({
    nome: z.string().trim().min(2).max(200),
    empresa: z.string().trim().min(2).max(200),
    cargo: z.string().trim().max(200).optional(),
    email: z.string().trim().email().max(200),
    whatsapp: z.string().trim().min(10).max(30),
    consentimento: z.literal(true),
  }),
  respostas: respostasShape,
  duracaoSegundos: z.number().int().nonnegative().optional(),
  origem: z.string().trim().max(50).optional(),
})

export async function POST(request: Request) {
  const env = {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendKey: process.env.RESEND_API_KEY,
    emailTo: process.env.DME360_EMAIL_TO,
    emailFrom: process.env.DME360_EMAIL_FROM ?? "DME 360 <onboarding@resend.dev>",
  }
  if (!env.url || !env.serviceKey) {
    return NextResponse.json({ ok: false, erro: "Configuração do banco pendente." }, { status: 503 })
  }

  let corpo
  try {
    corpo = corpoSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ ok: false, erro: "Dados inválidos." }, { status: 400 })
  }

  const pontuacao = calcularPontuacao(corpo.respostas)

  const registro = {
    nome: corpo.lead.nome,
    empresa: corpo.lead.empresa,
    cargo: corpo.lead.cargo ?? null,
    email: corpo.lead.email,
    whatsapp: corpo.lead.whatsapp,
    consentimento: corpo.lead.consentimento,
    respostas: corpo.respostas,
    pontuacao,
    ime: Number(pontuacao.ime.toFixed(2)),
    classificacao: pontuacao.classificacao,
    questionario_versao: DME360_VERSAO,
    duracao_segundos: corpo.duracaoSegundos ?? null,
    origem: corpo.origem ?? "link",
    email_enviado: false,
  }

  // 1) Grava primeiro — o dado nunca depende do e-mail.
  const insercao = await fetch(`${env.url}/rest/v1/dme_submissions`, {
    method: "POST",
    headers: {
      apikey: env.serviceKey,
      Authorization: `Bearer ${env.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(registro),
  })
  if (!insercao.ok) {
    console.error("dme360: falha ao gravar no Supabase", insercao.status, await insercao.text())
    return NextResponse.json({ ok: false, erro: "Falha ao gravar. Tente novamente." }, { status: 502 })
  }
  const [linha] = (await insercao.json()) as { id: string }[]

  // 2) E-mail best-effort.
  if (env.resendKey && env.emailTo) {
    try {
      const { assunto, html } = montarEmailResumo(corpo.lead, pontuacao, DME360_VERSAO, corpo.duracaoSegundos)
      const envio = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.emailFrom, to: [env.emailTo], subject: assunto, html }),
        signal: AbortSignal.timeout(5000),
      })
      if (envio.ok && linha) {
        await fetch(`${env.url}/rest/v1/dme_submissions?id=eq.${linha.id}`, {
          method: "PATCH",
          headers: {
            apikey: env.serviceKey,
            Authorization: `Bearer ${env.serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_enviado: true }),
          signal: AbortSignal.timeout(5000),
        })
      } else if (!envio.ok) {
        console.error("dme360: falha no e-mail", envio.status, await envio.text())
      }
    } catch (e) {
      console.error("dme360: erro no envio de e-mail", e)
    }
  }

  return NextResponse.json({
    ok: true,
    ime: Number(pontuacao.ime.toFixed(2)),
    classificacao: pontuacao.classificacao,
  })
}
