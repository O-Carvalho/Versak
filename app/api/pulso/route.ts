import { NextResponse } from "next/server"
import { z } from "zod"
import { montarEmailPulso } from "@/lib/pulso-email"

export const maxDuration = 10

const corpoSchema = z.object({
  tipo: z.enum(["entrada", "saida"]),
  nome: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(200),
  nota: z.number().int().min(0).max(10),
  codigoEvento: z.string().trim().max(50).optional(),
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
    tipo: corpo.tipo,
    nome: corpo.nome,
    email: corpo.email,
    nota: corpo.nota,
    codigo_evento: corpo.codigoEvento ?? null,
    origem: corpo.origem ?? "link",
    email_enviado: false,
  }

  const insercao = await fetch(`${env.url}/rest/v1/pulso_submissions`, {
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
    console.error("pulso: falha ao gravar no Supabase", insercao.status, await insercao.text())
    return NextResponse.json({ ok: false, erro: "Falha ao gravar. Tente novamente." }, { status: 502 })
  }
  const [linha] = (await insercao.json()) as { id: string }[]

  if (env.resendKey && env.emailTo) {
    try {
      const { assunto, html } = montarEmailPulso(corpo.tipo, corpo.nome, corpo.email, corpo.nota)
      const envio = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.emailFrom, to: [env.emailTo], subject: assunto, html }),
        signal: AbortSignal.timeout(5000),
      })
      if (envio.ok && linha) {
        await fetch(`${env.url}/rest/v1/pulso_submissions?id=eq.${linha.id}`, {
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
        console.error("pulso: falha no e-mail", envio.status, await envio.text())
      }
    } catch (e) {
      console.error("pulso: erro no envio de e-mail", e)
    }
  }

  return NextResponse.json({ ok: true })
}
