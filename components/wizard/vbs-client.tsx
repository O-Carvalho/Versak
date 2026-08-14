"use client"

import { Wizard, type WizardEnvioDados } from "./wizard"
import { VBS_QUESTIONARIO } from "@/lib/vbs-questionario"
import { linkWhatsapp } from "@/content/site"

async function enviarVbs(dados: WizardEnvioDados): Promise<true> {
  const resposta = await fetch("/api/vbs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })
  const json = (await resposta.json()) as { ok: boolean; erro?: string }
  if (!resposta.ok || !json.ok) throw new Error(json.erro ?? "Falha no envio.")
  return true
}

export function VbsClient() {
  return (
    <Wizard<true>
      questionario={VBS_QUESTIONARIO}
      titulo="Versak Business Snapshot"
      aberturaTitulo="Vamos mapear a sua empresa."
      aberturaTexto="Um retrato rápido do contexto do seu negócio: identificação, perfil, panorama de gestão e prioridades. Não existe resposta certa — quanto mais honesto, mais útil é a conversa que vem depois."
      onEnviar={enviarVbs}
      telaFinal={() => (
        <div className="text-center">
          <p className="wz-eyebrow justify-center">Ficha recebida</p>
          <h1 className="mt-4 text-[26px] font-semibold italic">Obrigado! Recebemos o seu snapshot.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
            A equipe Versak vai analisar as respostas e entrar em contato para apresentar a leitura do cenário da sua
            empresa e os próximos passos.
          </p>
          <a
            href={linkWhatsapp("Olá! Acabei de enviar o VBS e gostaria de conversar sobre o resultado.")}
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
