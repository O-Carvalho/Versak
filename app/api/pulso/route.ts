import { NextResponse } from "next/server"
import { z } from "zod"

export const maxDuration = 10

const corpoSchema = z.object({
  tipo: z.enum(["entrada", "saida"]),
  nota: z.number().int().min(0).max(10),
  codigoEvento: z.string().trim().max(50).optional(),
  origem: z.string().trim().max(50).optional(),
})

export async function POST(request: Request) {
  const env = {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
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
    nota: corpo.nota,
    codigo_evento: corpo.codigoEvento ?? null,
    origem: corpo.origem ?? "link",
  }

  const insercao = await fetch(`${env.url}/rest/v1/pulso_submissions`, {
    method: "POST",
    headers: {
      apikey: env.serviceKey,
      Authorization: `Bearer ${env.serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registro),
    signal: AbortSignal.timeout(5000),
  })
  if (!insercao.ok) {
    console.error("pulso: falha ao gravar no Supabase", insercao.status, await insercao.text())
    return NextResponse.json({ ok: false, erro: "Falha ao gravar. Tente novamente." }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
