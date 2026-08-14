"use client"

import { Wizard, type WizardEnvioDados } from "@/components/wizard/wizard"
import { DME360_QUESTIONARIO } from "@/lib/dme360-questionario"
import { DME360_ESCALA } from "@/content/dme360"
import { linkWhatsapp } from "@/content/site"

type ResultadoDme = { ime: number; classificacao: string }

async function enviarDme360(dados: WizardEnvioDados): Promise<ResultadoDme> {
  const resposta = await fetch("/api/dme360", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })
  const json = (await resposta.json()) as {
    ok: boolean
    ime?: number
    classificacao?: string
    erro?: string
  }
  if (!resposta.ok || !json.ok || json.ime === undefined || !json.classificacao) {
    throw new Error(json.erro ?? "Falha no envio.")
  }
  return { ime: json.ime, classificacao: json.classificacao }
}

export function Dme360Client() {
  return (
    <Wizard<ResultadoDme>
      questionario={DME360_QUESTIONARIO}
      titulo="Diagnóstico 360º"
      aberturaTitulo="Vamos mapear a maturidade da sua gestão."
      aberturaTexto="Você vai avaliar a sua empresa em 7 dimensões, numa escala de 1 a 5. Não existe resposta certa — quanto mais honesto, mais preciso é o diagnóstico."
      onEnviar={enviarDme360}
      telaFinal={(resultado) => (
        <div className="text-center">
          <p className="wz-eyebrow justify-center">Seu IME 360</p>
          <p className="mt-4 font-display text-6xl font-bold text-gold">
            {resultado.ime.toFixed(2).replace(".", ",")}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold">{resultado.classificacao}</p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
            {DME360_ESCALA.find((e) => e.rotulo === resultado.classificacao)?.descricao ?? ""}
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-text-muted">
            O relatório completo, dimensão por dimensão, será apresentado pela equipe Versak.
          </p>
          <a
            href={linkWhatsapp("Olá! Acabei de concluir o DME 360 e gostaria de conversar sobre o meu resultado.")}
            target="_blank"
            rel="noopener noreferrer"
            className="wz-btn-gold mt-7 inline-block"
          >
            Falar com a Versak no WhatsApp
          </a>
        </div>
      )}
    />
  )
}
