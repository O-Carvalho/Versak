import { DME360_DIMENSOES, DME360_ESCALA } from "@/content/dme360"
import type { DmePontuacao, DmeRespostas } from "./dme360-score"

type Lead = { nome: string; empresa: string; cargo?: string; email: string; whatsapp: string }

const ROTULO_NOTA = new Map(DME360_ESCALA.map((item) => [item.nota, item.rotulo]))

export function montarEmailResumo(
  lead: Lead,
  pontuacao: DmePontuacao,
  versao: string,
  respostas: DmeRespostas,
  duracaoSegundos?: number,
): { assunto: string; html: string } {
  const f = (n: number) => n.toFixed(2).replace(".", ",")
  const esc = (s: string) => s.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  const linhasResumo = pontuacao.porDimensao
    .map(
      (d) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${esc(d.nome)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${f(d.media)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${d.classificacao}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${d.prioridade}</td>
      </tr>`,
    )
    .join("")

  // Detalhe item a item, agrupado por dimensão e subdimensão — a mesma ordem em que
  // o respondente viu as perguntas, para o Victor conferir nota a nota na conversa.
  const detalheDimensoes = DME360_DIMENSOES.map((dim) => {
    const resumoDim = pontuacao.porDimensao.find((d) => d.id === dim.id)
    const linhasQuestoes = dim.questoes
      .map((q) => {
        const chave = `${dim.id}:${q.codigo}`
        const nota = respostas[chave]
        const rotuloNota = nota !== undefined ? (ROTULO_NOTA.get(nota) ?? "") : ""
        return `<tr>
          <td style="padding:4px 10px;border-bottom:1px solid #eee;color:#888;white-space:nowrap">${esc(q.subdimensao)}</td>
          <td style="padding:4px 10px;border-bottom:1px solid #eee">${esc(q.pergunta)}</td>
          <td style="padding:4px 10px;border-bottom:1px solid #eee;text-align:center;white-space:nowrap">${nota ?? "—"} ${esc(rotuloNota)}</td>
        </tr>`
      })
      .join("")
    return `
    <h4 style="margin:20px 0 4px">${esc(dim.nome)} — média ${resumoDim ? f(resumoDim.media) : "—"} (${resumoDim?.classificacao ?? "—"})</h4>
    <table style="border-collapse:collapse;width:100%;font-size:13px">
      <tr>
        <th style="padding:4px 10px;text-align:left;border-bottom:2px solid #333">Subdimensão</th>
        <th style="padding:4px 10px;text-align:left;border-bottom:2px solid #333">Pergunta</th>
        <th style="padding:4px 10px;border-bottom:2px solid #333">Nota</th>
      </tr>
      ${linhasQuestoes}
    </table>`
  }).join("")

  const duracao = duracaoSegundos ? `${Math.round(duracaoSegundos / 60)} min` : "—"
  const assunto = `DME 360 — ${lead.empresa} (${lead.nome}) — IME ${f(pontuacao.ime)} ${pontuacao.classificacao}`
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:720px">
    <h2 style="margin:0 0 4px">Novo diagnóstico DME 360</h2>
    <p style="margin:0 0 16px;color:#666">Versão ${esc(versao)} · duração ${duracao}</p>
    <table style="border-collapse:collapse;margin-bottom:16px">
      <tr><td style="padding:2px 10px 2px 0"><b>Nome</b></td><td>${esc(lead.nome)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>Empresa</b></td><td>${esc(lead.empresa)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>Cargo</b></td><td>${lead.cargo ? esc(lead.cargo) : "—"}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>E-mail</b></td><td>${esc(lead.email)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>WhatsApp</b></td><td>${esc(lead.whatsapp)}</td></tr>
    </table>
    <h3 style="margin:0 0 8px">IME 360: ${f(pontuacao.ime)} — ${pontuacao.classificacao}</h3>
    <table style="border-collapse:collapse;width:100%">
      <tr>
        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #333">Dimensão</th>
        <th style="padding:6px 10px;border-bottom:2px solid #333">Média</th>
        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #333">Classificação</th>
        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #333">Prioridade</th>
      </tr>
      ${linhasResumo}
    </table>
    <h3 style="margin:28px 0 4px">Respostas item a item</h3>
    ${detalheDimensoes}
    <p style="color:#666;margin-top:16px">Respostas completas também gravadas no Supabase (tabela dme_submissions).</p>
  </div>`
  return { assunto, html }
}
