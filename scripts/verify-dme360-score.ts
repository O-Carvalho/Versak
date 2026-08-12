import { DME360_DIMENSOES } from "../content/dme360"
import { calcularPontuacao, classificar } from "../lib/dme360-score"

let falhas = 0
function espera(nome: string, cond: boolean, detalhe = "") {
  if (cond) console.log(`OK  ${nome}`)
  else { falhas++; console.error(`ERRO ${nome} ${detalhe}`) }
}
const aprox = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol

// Caso 1: todas as notas = 3 -> tudo 3, IME 3.00, "Definido"
const todas3: Record<string, number> = {}
for (const d of DME360_DIMENSOES) for (const q of d.questoes) todas3[`${d.id}:${q.codigo}`] = 3
const p1 = calcularPontuacao(todas3)
espera("caso1 ime=3", aprox(p1.ime, 3), String(p1.ime))
espera("caso1 classificacao", p1.classificacao === "Definido", p1.classificacao)
espera("caso1 todas dimensões=3", p1.porDimensao.every((d) => aprox(d.media, 3)))

// Caso 2 (pega o bug de média errada): Governança ESTRUTURA=5, resto tudo 1.
// Governança tem 7 subdimensões -> média = (5 + 1*6)/7 = 11/7 ≈ 1.5714286
// (média direta das 34 perguntas seria 58/34 ≈ 1.7059 — NÃO é isso que o Excel faz)
const caso2: Record<string, number> = {}
for (const d of DME360_DIMENSOES) for (const q of d.questoes) {
  caso2[`${d.id}:${q.codigo}`] = d.id === "governanca" && q.subdimensao === "ESTRUTURA" ? 5 : 1
}
const p2 = calcularPontuacao(caso2)
const gov = p2.porDimensao.find((d) => d.id === "governanca")
espera("caso2 governanca=11/7", gov !== undefined && aprox(gov.media, 11 / 7), String(gov?.media))
const imeEsperado = 0.15 * (11 / 7) + 0.15 * 5 * 1 + 0.1 * 1
espera("caso2 ime ponderado", aprox(p2.ime, imeEsperado), `${p2.ime} vs ${imeEsperado}`)
espera("caso2 classificacao Caótico", p2.classificacao === "Caótico", p2.classificacao)

// Caso 3: faixas de classificação nos limites
espera("classificar(1.99)", classificar(1.99) === "Caótico")
espera("classificar(2)", classificar(2) === "Consciente")
espera("classificar(3.999)", classificar(3.999) === "Definido")
espera("classificar(4)", classificar(4) === "Gerenciado")
espera("classificar(4.5)", classificar(4.5) === "Otimizado")

// Caso 4: resposta faltando -> erro
let lancou = false
try { calcularPontuacao({}) } catch { lancou = true }
espera("caso4 falta resposta lança erro", lancou)

if (falhas > 0) { console.error(`\n${falhas} verificação(ões) falharam`); process.exit(1) }
console.log("\nMotor de pontuação verificado.")
