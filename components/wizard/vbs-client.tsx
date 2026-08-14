"use client"

import { Wizard } from "./wizard"
import { VBS_QUESTIONARIO } from "@/lib/vbs-questionario"

export function VbsClient() {
  return (
    <Wizard<null>
      questionario={VBS_QUESTIONARIO}
      titulo="Versak Business Snapshot"
      aberturaTitulo="Vamos mapear a sua empresa."
      aberturaTexto="Um retrato rápido do contexto do seu negócio: identificação, perfil, panorama de gestão e prioridades. Não existe resposta certa — quanto mais honesto, mais útil é a conversa que vem depois."
      onEnviar={async () => null}
      telaFinal={() => <p>Envio ainda não implementado.</p>}
    />
  )
}
