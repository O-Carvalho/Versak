import { VBS_BLOCOS, VBS_VERSAO } from "../content/vbs"
import type { Campo, Etapa, Questionario } from "./wizard-types"

export const VBS_QUESTIONARIO: Questionario = {
  id: "vbs",
  versao: VBS_VERSAO,
  rotuloEtapa: "Bloco",
  tempoEstimado: "5 a 10 minutos",
  etapas: VBS_BLOCOS.map(
    (bloco): Etapa => ({
      id: bloco.id,
      nome: bloco.nome,
      descricao: null,
      campos: bloco.campos.map(
        (campo): Campo => ({
          chave: `${bloco.id}:${campo.id}`,
          rotulo: campo.rotulo,
          tipo: campo.tipo,
          opcoes: campo.opcoes?.map((o) => ({ valor: o, rotulo: o })),
          obrigatorio: campo.obrigatorio,
        }),
      ),
    }),
  ),
}
