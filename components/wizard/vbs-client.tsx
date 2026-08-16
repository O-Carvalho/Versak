"use client"

import { RadarChart } from "./radar-chart"
import { Wizard, type WizardEnvioDados } from "./wizard"
import { VBS_QUESTIONARIO } from "@/lib/vbs-questionario"
import type { VbsPontuacao } from "@/lib/vbs-score"
import { linkWhatsapp } from "@/content/site"

async function enviarVbs(dados: WizardEnvioDados): Promise<VbsPontuacao> {
  const resposta = await fetch("/api/vbs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })
  const json = (await resposta.json()) as { ok: boolean; erro?: string; pontuacao?: VbsPontuacao }
  if (!resposta.ok || !json.ok || !json.pontuacao) throw new Error(json.erro ?? "Falha no envio.")
  return json.pontuacao
}

export function VbsClient() {
  return (
    <Wizard<VbsPontuacao>
      questionario={VBS_QUESTIONARIO}
      titulo="Versak Business Snapshot"
      aberturaTitulo="Vamos mapear a sua empresa."
      aberturaTexto="Um retrato rápido do contexto do seu negócio: identificação, perfil, panorama de gestão e prioridades. Não existe resposta certa — quanto mais honesto, mais útil é a conversa que vem depois."
      onEnviar={enviarVbs}
      telaFinal={(pontuacao) => (
        <div className="text-center">
          <p className="wz-eyebrow justify-center">Ficha recebida</p>
          <h1 className="mt-4 text-[26px] font-semibold italic">Obrigado! Recebemos o seu snapshot.</h1>

          <RadarChart
            eixos={pontuacao.dimensoes.map((d) => ({ rotulo: d.nome, valor: d.media }))}
            notaMaxima={pontuacao.notaMaxima}
          />
          <p className="mx-auto -mt-2 max-w-md text-xs leading-relaxed text-text-dim">
            Leitura rápida e informal a partir das suas respostas — não substitui a análise completa que a equipe
            Versak vai te trazer.
          </p>

          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-text-muted">
            A equipe Versak vai analisar as respostas e, em até <strong className="text-text">3 dias úteis</strong>,
            entrar em contato por e-mail e WhatsApp com uma avaliação gratuita do cenário da sua empresa e sugestões
            de próximos passos.
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
