"use client"

import type { Campo } from "@/lib/wizard-types"

type Props = {
  campo: Campo
  valor: string | number | undefined
  onChange: (valor: string | number) => void
}

export function CampoInput({ campo, valor, onChange }: Props) {
  if (campo.tipo === "escala" || campo.tipo === "opcoes") {
    const escala = campo.tipo === "escala"
    const opcoes = campo.opcoes ?? []
    return (
      <div
        role="group"
        aria-label={campo.rotulo}
        className={escala ? "grid grid-cols-5 gap-2" : "flex flex-wrap gap-2"}
      >
        {opcoes.map((opcao) => {
          const ativa = valor === opcao.valor
          return (
            <button
              key={String(opcao.valor)}
              type="button"
              title={opcao.descricao}
              onClick={() => onChange(opcao.valor)}
              aria-pressed={ativa}
              className={`wz-opt ${escala ? "wz-opt-escala" : ""} ${ativa ? "wz-opt-ativa" : ""}`}
            >
              <span className={escala ? "font-display text-lg font-semibold" : ""}>{opcao.rotulo}</span>
              {opcao.legenda && <span className="hidden text-[10px] sm:block">{opcao.legenda}</span>}
            </button>
          )
        })}
      </div>
    )
  }

  if (campo.tipo === "texto-longo") {
    return (
      <textarea
        id={campo.chave}
        className="wz-input"
        rows={3}
        value={String(valor ?? "")}
        placeholder={campo.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  return (
    <input
      id={campo.chave}
      type={campo.tipo === "numero" ? "number" : "text"}
      className="wz-input"
      value={String(valor ?? "")}
      placeholder={campo.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
