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

espera("4 etapas", q.etapas.length === 4, String(q.etapas.length))
espera("45 campos", todosCampos.length === 45, String(todosCampos.length))
espera("versao vbs-r1", q.versao === "vbs-r1", q.versao)

const panorama = q.etapas.find((e) => e.id === "panorama")
espera("panorama existe", panorama !== undefined)
espera("panorama tem 22 campos", panorama?.campos.length === 22, String(panorama?.campos.length))
espera(
  "panorama todo obrigatório com 4 opções",
  panorama !== undefined &&
    panorama.campos.every((c) => c.obrigatorio && c.tipo === "opcoes" && c.opcoes?.length === 4),
)

espera(
  "todo campo de opções tem opções não vazias",
  todosCampos.filter((c) => c.tipo === "opcoes").every((c) => (c.opcoes?.length ?? 0) > 0),
)
espera(
  "nenhum campo de texto tem opções",
  todosCampos.filter((c) => c.tipo !== "opcoes" && c.tipo !== "escala").every((c) => c.opcoes === undefined),
)

const chaves = new Set(todosCampos.map((c) => c.chave))
espera("chaves únicas", chaves.size === todosCampos.length, `${chaves.size} de ${todosCampos.length}`)
espera(
  "toda chave no formato etapa:campo",
  todosCampos.every((c) => /^[a-z0-9-]+:[a-z0-9-]+$/.test(c.chave)),
)

// 2 (bloco 1) + 5 (bloco 2) + 22 (bloco 3) + 4 (bloco 4) = 33
const obrigatorios = todosCampos.filter((c) => c.obrigatorio)
espera("33 campos obrigatórios", obrigatorios.length === 33, String(obrigatorios.length))

// respondido()
espera("respondido('') = false", respondido("") === false)
espera("respondido('  ') = false", respondido("  ") === false)
espera("respondido(undefined) = false", respondido(undefined) === false)
espera("respondido(0) = true", respondido(0) === true)
espera("respondido('Sim') = true", respondido("Sim") === true)

// Progresso: vazio -> 0%, tudo preenchido -> 100%
const vazio: Respostas = {}
const p0 = progressoObrigatorio(q, vazio)
espera("progresso vazio = 0%", p0.pct === 0 && p0.respondidos === 0, JSON.stringify(p0))
espera("total do progresso = nº de obrigatórios", p0.total === obrigatorios.length, String(p0.total))

const cheio: Respostas = {}
for (const c of obrigatorios) cheio[c.chave] = c.opcoes?.[0]?.valor ?? "preenchido"
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
