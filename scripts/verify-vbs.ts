import { VBS_QUESTIONARIO } from "../lib/vbs-questionario"
import { etapaCompleta, faltamNaEtapa, progressoObrigatorio, respondido } from "../lib/wizard-progress"
import type { Respostas } from "../lib/wizard-types"

let falhas = 0
function espera(nome: string, cond: boolean, detalhe = "") {
  if (cond) console.log(`OK  ${nome}`)
  else {
    falhas++
    console.error(`ERRO ${nome} ${detalhe}`)
  }
}

const q = VBS_QUESTIONARIO
const todosCampos = q.etapas.flatMap((e) => e.campos)

espera("10 etapas", q.etapas.length === 10, String(q.etapas.length))
espera("28 campos", todosCampos.length === 28, String(todosCampos.length))
espera("versao vbs-r2", q.versao === "vbs-r2", q.versao)
espera("codigo do evento definido", Boolean(q.codigoEvento), String(q.codigoEvento))
espera("consentimento principal definido", Boolean(q.consentimentoTexto))
espera(
  "2 consentimentos extras (anonimo + contato)",
  q.consentimentosExtras?.length === 2 &&
    q.consentimentosExtras.some((c) => c.chave === "anonimo") &&
    q.consentimentosExtras.some((c) => c.chave === "contato"),
)

const custos = q.etapas.find((e) => e.id === "custos")
espera("bloco custos existe", custos !== undefined)
espera("custos tem 2 campos, obrigatórios, 5 opções cada", custos?.campos.every((c) => c.obrigatorio && c.tipo === "opcoes" && c.opcoes?.length === 5) ?? false)

const autopercepcao = q.etapas.find((e) => e.id === "autopercepcao")
const campoAutopercepcao = autopercepcao?.campos[0]
espera(
  "autopercepção tem escala 0-10 (11 opções)",
  campoAutopercepcao?.opcoes?.length === 11 &&
    campoAutopercepcao.opcoes[0]?.valor === "0" &&
    campoAutopercepcao.opcoes[10]?.valor === "10",
)

const prioridades = q.etapas.find((e) => e.id === "prioridades")
const camposMultiplaEscolha = prioridades?.campos.filter((c) => c.tipo === "multipla-escolha") ?? []
espera("prioridades tem 3 campos de múltipla escolha", camposMultiplaEscolha.length === 3)
espera(
  "campos de múltipla escolha têm opções",
  camposMultiplaEscolha.every((c) => (c.opcoes?.length ?? 0) > 0),
)

espera(
  "todo campo de opções/múltipla escolha tem opções não vazias",
  todosCampos
    .filter((c) => c.tipo === "opcoes" || c.tipo === "multipla-escolha")
    .every((c) => (c.opcoes?.length ?? 0) > 0),
)
espera(
  "nenhum campo de texto tem opções",
  todosCampos
    .filter((c) => c.tipo !== "opcoes" && c.tipo !== "escala" && c.tipo !== "multipla-escolha")
    .every((c) => c.opcoes === undefined),
)

const chaves = new Set(todosCampos.map((c) => c.chave))
espera("chaves únicas", chaves.size === todosCampos.length, `${chaves.size} de ${todosCampos.length}`)
espera(
  "toda chave no formato etapa:campo",
  todosCampos.every((c) => /^[a-z0-9-]+:[a-z0-9-]+$/.test(c.chave)),
)

// 28 campos - 2 opcionais (município, CNPJ) = 26
const obrigatorios = todosCampos.filter((c) => c.obrigatorio)
espera("26 campos obrigatórios", obrigatorios.length === 26, String(obrigatorios.length))

// respondido()
espera("respondido('') = false", respondido("") === false)
espera("respondido('  ') = false", respondido("  ") === false)
espera("respondido(undefined) = false", respondido(undefined) === false)
espera("respondido(0) = true", respondido(0) === true)
espera("respondido('Sim') = true", respondido("Sim") === true)
espera("respondido([]) = false (múltipla escolha vazia)", respondido([]) === false)
espera("respondido(['a']) = true (múltipla escolha preenchida)", respondido(["a"]) === true)

// Progresso: vazio -> 0%, tudo preenchido -> 100%
const vazio: Respostas = {}
const p0 = progressoObrigatorio(q, vazio)
espera("progresso vazio = 0%", p0.pct === 0 && p0.respondidos === 0, JSON.stringify(p0))
espera("total do progresso = nº de obrigatórios", p0.total === obrigatorios.length, String(p0.total))

const cheio: Respostas = {}
for (const c of obrigatorios) {
  cheio[c.chave] = c.tipo === "multipla-escolha" ? [String(c.opcoes?.[0]?.valor ?? "x")] : (c.opcoes?.[0]?.valor ?? "preenchido")
}
const p1 = progressoObrigatorio(q, cheio)
espera("progresso cheio = 100%", p1.pct === 100, JSON.stringify(p1))
espera(
  "todas as etapas completas com obrigatórios preenchidos",
  q.etapas.every((e) => etapaCompleta(e, cheio)),
)

// Uma etapa fica incompleta ao remover um obrigatório
const primeiraObrigatoria = obrigatorios[0]
if (primeiraObrigatoria) {
  const parcial: Respostas = { ...cheio }
  delete parcial[primeiraObrigatoria.chave]
  const etapaDoCampo = q.etapas.find((e) => e.campos.some((c) => c.chave === primeiraObrigatoria.chave))
  espera(
    "remover 1 obrigatório deixa a etapa incompleta",
    etapaDoCampo !== undefined && faltamNaEtapa(etapaDoCampo, parcial) === 1,
  )
}

if (falhas > 0) {
  console.error(`\n${falhas} verificação(ões) falharam`)
  process.exit(1)
}
console.log("\nQuestionário VBS verificado.")
