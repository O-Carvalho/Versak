import { NextResponse } from "next/server"
import { z } from "zod"
import { montarEmailVbs } from "@/lib/vbs-email"
import { VBS_QUESTIONARIO } from "@/lib/vbs-questionario"
import type { Respostas } from "@/lib/wizard-types"

export const maxDuration = 10

// O gabarito de respostas vem do próprio questionário: campo obrigatório é
// exigido; campo de opções só aceita um dos valores da sua lista.
const respostasShape: Record<string, z.ZodTypeAny> = {}
for (const etapa of VBS_QUESTIONARIO.etapas) {
  for (const campo of etapa.campos) {
    let esquema: z.ZodTypeAny
    if (campo.opcoes && campo.opcoes.length > 0) {
      const validos = campo.opcoes.map((o) => String(o.valor))
      esquema = z.string().refine((v) => validos.includes(v), { message: `Opção inválida em ${campo.chave}` })
    } else {
      esquema = z.string().trim().min(1).max(2000)
    }
    respostasShape[campo.chave] = campo.obrigatorio ? esquema : esquema.optional()
  }
}

const corpoSchema = z.object({
  lead: z.object({
    nome: z.string().trim().min(2).max(200),
    empresa: z.string().trim().min(2).max(200),
    email: z.string().trim().email().max(200),
    whatsapp: z.string().trim().min(10).max(30),
    consentimento: z.literal(true),
  }),
  respostas: z.object(respostasShape),
  duracaoSegundos: z.number().int().nonnegative().optional(),
  origem: z.string().trim().max(50).optional(),
})

export async function POST(request: Request) {
  const env = {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendKey: process.env.RESEND_API_KEY,
    emailTo: process.env.DME360_EMAIL_TO,
    emailFrom: process.env.DME360_EMAIL_FROM ?? "Versak <onboarding@resend.dev>",
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

  const registro = {
    nome: corpo.lead.nome,
    empresa: corpo.lead.empresa,
    email: corpo.lead.email,
    whatsapp: corpo.lead.whatsapp,
    consentimento: corpo.lead.consentimento,
    respostas: corpo.respostas,
    questionario_versao: VBS_QUESTIONARIO.versao,
    duracao_segundos: corpo.duracaoSegundos ?? null,
    origem: corpo.origem ?? "link",
    email_enviado: false,
  }

  // 1) Grava primeiro — o dado nunca depende do e-mail.
  const insercao = await fetch(`${env.url}/rest/v1/vbs_submissions`, {
    method: "POST",
    headers: {
      apikey: env.serviceKey,
      Authorization: `Bearer ${env.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(registro),
    signal: AbortSignal.timeout(5000),
  })
  if (!insercao.ok) {
    console.error("vbs: falha ao gravar no Supabase", insercao.status, await insercao.text())
    return NextResponse.json({ ok: false, erro: "Falha ao gravar. Tente novamente." }, { status: 502 })
  }
  const [linha] = (await insercao.json()) as { id: string }[]

  // 2) E-mail best-effort.
  if (env.resendKey && env.emailTo) {
    try {
      const { assunto, html } = montarEmailVbs(
        corpo.lead,
        VBS_QUESTIONARIO,
        corpo.respostas as Respostas,
        corpo.duracaoSegundos,
      )
      const envio = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.emailFrom, to: [env.emailTo], subject: assunto, html }),
        signal: AbortSignal.timeout(5000),
      })
      if (envio.ok && linha) {
        await fetch(`${env.url}/rest/v1/vbs_submissions?id=eq.${linha.id}`, {
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
        console.error("vbs: falha no e-mail", envio.status, await envio.text())
      }
    } catch (e) {
      console.error("vbs: erro no envio de e-mail", e)
    }
  }

  return NextResponse.json({ ok: true })
}
