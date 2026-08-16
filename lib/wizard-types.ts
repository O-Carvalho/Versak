// Modelo único que descreve qualquer questionário da Versak (VBS, DME 360).
// A casca do wizard só conhece estes tipos — nunca o conteúdo específico.

export type CampoOpcao = {
  valor: string | number
  rotulo: string // texto principal do botão (número, na escala)
  legenda?: string // texto pequeno sob o rótulo (rótulo de maturidade, na escala)
  descricao?: string // tooltip
}

export type CampoTipo = "texto" | "texto-longo" | "numero" | "opcoes" | "escala" | "multipla-escolha"

export type Campo = {
  chave: string // "<etapaId>:<campoId>"
  rotulo: string
  tipo: CampoTipo
  opcoes?: CampoOpcao[] // obrigatório quando tipo é "opcoes", "escala" ou "multipla-escolha"
  obrigatorio: boolean
  grupo?: string // subdivisão dentro da etapa (subdimensão, no DME 360)
  placeholder?: string
}

export type Etapa = {
  id: string
  nome: string
  descricao?: string | null
  campos: Campo[]
}

export type ConsentimentoExtra = {
  chave: "anonimo" | "contato"
  texto: string
  obrigatorio: boolean
}

export type Questionario = {
  id: string // "vbs" | "dme360"
  versao: string
  rotuloEtapa: string // "Bloco" | "Dimensão"
  rotuloEtapaPlural?: string // plural correto, quando o "s" naive não serve (ex.: "Dimensões")
  generoEtapa: "m" | "f" // gênero gramatical de rotuloEtapa, para concordância ("Próximo"/"Próxima", "um"/"uma")
  tempoEstimado: string // "5 a 10 minutos"
  capturarCargoNaAbertura?: boolean // pede "Cargo / função" na tela de abertura (quando o questionário não já pergunta isso em algum bloco)
  consentimentoTexto?: string // texto do consentimento principal; se ausente, usa o texto genérico padrão
  consentimentosExtras?: ConsentimentoExtra[] // consentimentos adicionais além do principal (ex.: uso anônimo, contato)
  codigoEvento?: string // valor padrão do campo oculto "código do evento", quando o questionário representa um evento único
  etapas: Etapa[]
}

export type Respostas = Record<string, string | number | string[]>

export type WizardLead = {
  nome: string
  empresa: string
  cargo?: string
  email: string
  whatsapp: string
  consentimento: boolean
  consentimentoAnonimo?: boolean
  consentimentoContato?: boolean
}
