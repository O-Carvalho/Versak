import { DME360_DIMENSOES, DME360_ESCALA, DME360_VERSAO } from "../content/dme360"
import type { Campo, CampoOpcao, Etapa, Questionario } from "./wizard-types"

const OPCOES_ESCALA: CampoOpcao[] = DME360_ESCALA.map((item) => ({
  valor: item.nota,
  rotulo: String(item.nota),
  legenda: item.rotulo,
  descricao: item.descricao,
}))

export const DME360_QUESTIONARIO: Questionario = {
  id: "dme360",
  versao: DME360_VERSAO,
  rotuloEtapa: "Dimensão",
  rotuloEtapaPlural: "Dimensões",
  tempoEstimado: "35 a 45 minutos",
  etapas: DME360_DIMENSOES.map(
    (dim): Etapa => ({
      id: dim.id,
      nome: dim.nome,
      descricao: dim.descricao,
      campos: dim.questoes.map(
        (q): Campo => ({
          chave: `${dim.id}:${q.codigo}`,
          rotulo: q.pergunta,
          tipo: "escala",
          opcoes: OPCOES_ESCALA,
          obrigatorio: true,
          grupo: q.subdimensao,
        }),
      ),
    }),
  ),
}
