const esc = (s: string) => s.replaceAll("<", "&lt;").replaceAll(">", "&gt;")

export function montarEmailPulso(
  tipo: "entrada" | "saida",
  nome: string,
  email: string,
  nota: number,
): { assunto: string; html: string } {
  const rotuloTipo = tipo === "entrada" ? "Entrada" : "Saída"
  const assunto = `Pulso ${rotuloTipo} — ${nome} (nota ${nota})`
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px">
    <h2 style="margin:0 0 16px">Pulso de ${rotuloTipo}</h2>
    <table style="border-collapse:collapse">
      <tr><td style="padding:2px 10px 2px 0"><b>Nome</b></td><td>${esc(nome)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>E-mail</b></td><td>${esc(email)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0"><b>Nota</b></td><td>${nota}</td></tr>
    </table>
  </div>`
  return { assunto, html }
}
