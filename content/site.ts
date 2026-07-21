export const site = {
  nome: "Versak",
  tagline: "Ajudando empresas a escrever um novo capítulo de sucesso",
  descricaoSeo:
    "Diagnóstico empresarial 360º e consultoria de gestão para empresas que querem lucrar mais com processos mais eficientes.",
  url: "https://versak.com.br",
  whatsapp: {
    numero: "5515997260026",
    mensagemPadrao: "Olá, quero alavancar minha empresa e gostaria de saber mais sobre os serviços da Versak",
  },
  email: "comercial@versak.com.br",
  linkedin: "https://linkedin.com/in/victorhbsaura",
  nav: [
    { label: "Quem somos", href: "#quem-somos" },
    { label: "Diagnóstico", href: "#diagnostico" },
    { label: "Mercados", href: "#mercados" },
    { label: "Fundador", href: "#fundador" },
  ],
} as const

export function linkWhatsapp(mensagem = site.whatsapp.mensagemPadrao) {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`
}
