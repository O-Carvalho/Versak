import {
  VBS_BLOCOS,
  VBS_CODIGO_EVENTO,
  VBS_CONSENTIMENTO_TEXTO,
  VBS_CONSENTIMENTOS_EXTRAS,
  VBS_VERSAO,
} from "../content/vbs"
import type { Campo, Etapa, Questionario } from "./wizard-types"

export const VBS_QUESTIONARIO: Questionario = {
  id: "vbs",
  versao: VBS_VERSAO,
  rotuloEtapa: "Bloco",
  generoEtapa: "m",
  tempoEstimado: "5 a 10 minutos",
  consentimentoTexto: VBS_CONSENTIMENTO_TEXTO,
  consentimentosExtras: VBS_CONSENTIMENTOS_EXTRAS,
  codigoEvento: VBS_CODIGO_EVENTO,
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
          placeholder: campo.placeholder,
        }),
      ),
    }),
  ),
}
