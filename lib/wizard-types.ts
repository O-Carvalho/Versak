// Modelo único que descreve qualquer questionário da Versak (VBS, DME 360).
// A casca do wizard só conhece estes tipos — nunca o conteúdo específico.

export type CampoOpcao = {
  valor: string | number
  rotulo: string // texto principal do botão (número, na escala)
  legenda?: string // texto pequeno sob o rótulo (rótulo de maturidade, na escala)
  descricao?: string // tooltip
}

export type CampoTipo = "texto" | "texto-longo" | "numero" | "opcoes" | "escala"

export type Campo = {
  chave: string // "<etapaId>:<campoId>"
  rotulo: string
  tipo: CampoTipo
  opcoes?: CampoOpcao[] // obrigatório quando tipo é "opcoes" ou "escala"
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

export type Questionario = {
  id: string // "vbs" | "dme360"
  versao: string
  rotuloEtapa: string // "Bloco" | "Dimensão"
  rotuloEtapaPlural?: string // plural correto, quando o "s" naive não serve (ex.: "Dimensões")
  tempoEstimado: string // "5 a 10 minutos"
  etapas: Etapa[]
}

export type Respostas = Record<string, string | number>

export type WizardLead = {
  nome: string
  empresa: string
  email: string
  whatsapp: string
  consentimento: boolean
}
