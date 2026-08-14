import type { Questionario, Respostas, WizardLead } from "./wizard-types"

const esc = (s: string) => s.replaceAll("<", "&lt;").replaceAll(">", "&gt;")

export function montarEmailVbs(
  lead: WizardLead,
  questionario: Questionario,
  respostas: Respostas,
  duracaoSegundos?: number,
): { assunto: string; html: string } {
  const duracao = duracaoSegundos ? `${Math.max(1, Math.round(duracaoSegundos / 60))} min` : "—"
  const assunto = `VBS — ${lead.empresa} (${lead.nome})`

  const blocos = questionario.etapas
    .map((etapa) => {
      const linhas = etapa.campos
        .map((campo) => {
          const valor = respostas[campo.chave]
          const texto = valor === undefined || valor === "" ? "—" : esc(String(valor))
          return `<tr>
            <td style="padding:6px 10px;border-bottom:1px solid #eee;width:48%;color:#555">${esc(campo.rotulo)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #eee"><b>${texto}</b></td>
          </tr>`
        })
        .join("")
      return `<h3 style="margin:22px 0 6px">${esc(etapa.nome)}</h3>
        <table style="border-collapse:collapse;width:100%">${linhas}</table>`
    })
    .join("")

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:680px">
    <h2 style="margin:0 0 4px">Nova ficha VBS</h2>
    <p style="margin:0 0 16px;color:#666">Versão ${esc(questionario.versao)} · duração ${duracao}</p>
    <table style="border-collapse:collapse;margin-bottom:8px">
      <tr><td style="padding:2px 10px 2px 0"><b>Nome</b></td><td>${esc(lead.nome)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>Empresa</b></td><td>${esc(lead.empresa)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>E-mail</b></td><td>${esc(lead.email)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>WhatsApp</b></td><td>${esc(lead.whatsapp)}</td></tr>
    </table>
    ${blocos}
    <p style="color:#666;margin-top:20px">Ficha completa gravada no Supabase (tabela vbs_submissions).</p>
  </div>`

  return { assunto, html }
}
