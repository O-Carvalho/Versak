export const site = {
  nome: "Versak",
  tagline: "Ajudando empresas a escrever um novo capítulo de sucesso",
  descricaoSeo:
    "Diagnóstico empresarial 360º e consultoria de gestão para empresas que querem lucrar mais com processos que funcionam sozinhos.",
  url: "https://versak.com.br",
  whatsapp: {
    numero: "5515997260026",
    mensagemPadrao: "Olá! Quero saber mais sobre o diagnóstico da Versak.",
  },
  email: "adm@versak.onmicrosoft.com",
  linkedin: "https://linkedin.com/in/victorhbsaura",
  nav: [
    { label: "Quem somos", href: "#quem-somos" },
    { label: "Soluções", href: "#solucoes" },
    { label: "Mercados", href: "#mercados" },
    { label: "Fundador", href: "#fundador" },
  ],
} as const

export function linkWhatsapp(mensagem = site.whatsapp.mensagemPadrao) {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`
}
