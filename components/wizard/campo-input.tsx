"use client"

import type { Campo } from "@/lib/wizard-types"

type Props = {
  campo: Campo
  valor: string | number | string[] | undefined
  onChange: (valor: string | number | string[]) => void
}

export function CampoInput({ campo, valor, onChange }: Props) {
  if (campo.tipo === "escala" || campo.tipo === "opcoes") {
    const escala = campo.tipo === "escala"
    const opcoes = campo.opcoes ?? []
    return (
      <div
        role="group"
        aria-label={campo.rotulo}
        className={escala ? "grid gap-2" : "flex flex-wrap gap-2"}
        style={escala ? { gridTemplateColumns: "repeat(auto-fit, minmax(48px, 1fr))" } : undefined}
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

  if (campo.tipo === "multipla-escolha") {
    const opcoes = campo.opcoes ?? []
    const selecionadas = Array.isArray(valor) ? valor : []
    return (
      <div role="group" aria-label={campo.rotulo} className="flex flex-wrap gap-2">
        {opcoes.map((opcao) => {
          const chaveOpcao = String(opcao.valor)
          const ativa = selecionadas.includes(chaveOpcao)
          return (
            <button
              key={chaveOpcao}
              type="button"
              title={opcao.descricao}
              aria-pressed={ativa}
              onClick={() =>
                onChange(
                  ativa ? selecionadas.filter((v) => v !== chaveOpcao) : [...selecionadas, chaveOpcao],
                )
              }
              className={`wz-opt ${ativa ? "wz-opt-ativa" : ""}`}
            >
              <span>{opcao.rotulo}</span>
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
        value={typeof valor === "string" ? valor : ""}
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
      value={typeof valor === "string" || typeof valor === "number" ? String(valor) : ""}
      placeholder={campo.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
