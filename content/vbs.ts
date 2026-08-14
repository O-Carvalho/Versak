// GERADO por scripts/import-vbs.mjs — não editar à mão. Fonte: VBS_Versak_Ficha Cadastral (1).xlsx
export type VbsTipoCampo = "texto" | "texto-longo" | "numero" | "opcoes"
export type VbsCampo = {
  id: string
  rotulo: string
  tipo: VbsTipoCampo
  opcoes?: string[]
  obrigatorio: boolean
}
export type VbsBloco = { id: string; nome: string; campos: VbsCampo[] }

export const VBS_VERSAO = "vbs-r1"
export const VBS_BLOCOS: VbsBloco[] = [
  {
    "id": "identificacao",
    "nome": "Identificação da empresa",
    "campos": [
      {
        "id": "razao-social",
        "rotulo": "Razão social",
        "tipo": "texto",
        "obrigatorio": true
      },
      {
        "id": "nome-fantasia",
        "rotulo": "Nome fantasia",
        "tipo": "texto",
        "obrigatorio": false
      },
      {
        "id": "cnpj",
        "rotulo": "CNPJ",
        "tipo": "texto",
        "obrigatorio": false
      },
      {
        "id": "cidade-estado",
        "rotulo": "Cidade / Estado",
        "tipo": "texto",
        "obrigatorio": true
      },
      {
        "id": "site",
        "rotulo": "Site / rede social",
        "tipo": "texto",
        "obrigatorio": false
      },
      {
        "id": "cargo",
        "rotulo": "Cargo / função",
        "tipo": "texto",
        "obrigatorio": false
      }
    ]
  },
  {
    "id": "perfil",
    "nome": "Perfil do negócio",
    "campos": [
      {
        "id": "segmento",
        "rotulo": "Segmento principal",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Indústria Seriada",
          "Indústria Engenharia e Projetos",
          "Agronegócio",
          "Construção Civil",
          "Logística e Transporte",
          "Comércio",
          "Saúde",
          "Serviços",
          "Tecnologia",
          "2 ou mais segmentos"
        ]
      },
      {
        "id": "produtos-servicos",
        "rotulo": "Principais produtos ou serviços",
        "tipo": "texto-longo",
        "obrigatorio": false
      },
      {
        "id": "faturamento",
        "rotulo": "Porte de Faturamento Anual - mais recente",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "0 a 250 mil anual",
          "250 a 400 mil anual",
          "400 a 700 mil anual",
          "700 a 1 Milhão anual",
          "1 a 2 Milhões anuais",
          "2 a 5 Milhões anuais",
          "5 a 10 Milhões anuais",
          "10 a 20 Milhões anuais",
          "20 a 50 Milhões anuais",
          "50 a 100 Milhoes anuais",
          "Acima de 100 Milhões anuais"
        ]
      },
      {
        "id": "funcionarios",
        "rotulo": "Número aproximado de funcionários",
        "tipo": "numero",
        "obrigatorio": false
      },
      {
        "id": "clientes-ativos",
        "rotulo": "Número aproximado de clientes ativos",
        "tipo": "numero",
        "obrigatorio": false
      },
      {
        "id": "mercado",
        "rotulo": "Mercado de atuação",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Local",
          "Regional",
          "Estadual",
          "Nacional",
          "Internacional"
        ]
      },
      {
        "id": "tipo-cliente",
        "rotulo": "Tipo predominante de cliente",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "B2B",
          "B2C",
          "B2B e B2C",
          "Governo",
          "Misto"
        ]
      },
      {
        "id": "tempo-atuacao",
        "rotulo": "Tempo de atuação da empresa (anos)",
        "tipo": "numero",
        "obrigatorio": false
      },
      {
        "id": "tendencia",
        "rotulo": "Tendência atual do negócio",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Queda",
          "Estável",
          "Crescimento moderado",
          "Crescimento acelerado"
        ]
      }
    ]
  },
  {
    "id": "panorama",
    "nome": "Panorama empresarial",
    "campos": [
      {
        "id": "panorama-01",
        "rotulo": "A empresa possui missão, visão e valores definidos?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-02",
        "rotulo": "Existe planejamento estratégico formal?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-03",
        "rotulo": "Existem metas empresariais claras e acompanhadas?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-04",
        "rotulo": "Os papéis e responsabilidades estão claramente definidos?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-05",
        "rotulo": "Os principais processos estão documentados?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-06",
        "rotulo": "A empresa utiliza indicadores de desempenho?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-07",
        "rotulo": "Há reuniões periódicas de acompanhamento dos resultados?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-08",
        "rotulo": "Existe um sistema de gestão integrado (ERP ou equivalente)?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-09",
        "rotulo": "A empresa utiliza CRM ou ferramenta de gestão comercial?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-10",
        "rotulo": "A margem de lucro é conhecida?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-11",
        "rotulo": "A empresa conhece seus custos?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-12",
        "rotulo": "A empresa conhece o custo por produto?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-13",
        "rotulo": "A empresa conhece o custo por cliente?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-14",
        "rotulo": "Existe previsão de fluxo de caixa?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-15",
        "rotulo": "A empresa conhece o ponto de equilíbrio financeiro?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-16",
        "rotulo": "A capacidade operacional é conhecida e acompanhada?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-17",
        "rotulo": "Os principais gargalos e desperdícios são conhecidos?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-18",
        "rotulo": "Existe rotina formal de melhoria contínua?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-19",
        "rotulo": "A satisfação dos clientes é medida?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-20",
        "rotulo": "Existem padrões definidos para atendimento e entrega?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-21",
        "rotulo": "A empresa possui processo estruturado de contratação e integração?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      },
      {
        "id": "panorama-22",
        "rotulo": "Há acompanhamento de produtividade e desempenho das equipes?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sim",
          "Parcialmente",
          "Não",
          "Não se aplica"
        ]
      }
    ]
  },
  {
    "id": "objetivos",
    "nome": "Objetivos e prioridades",
    "campos": [
      {
        "id": "objetivo-1",
        "rotulo": "Principal objetivo para os próximos 12 meses",
        "tipo": "texto-longo",
        "obrigatorio": true
      },
      {
        "id": "objetivo-2",
        "rotulo": "Segundo objetivo prioritário",
        "tipo": "texto-longo",
        "obrigatorio": false
      },
      {
        "id": "maior-dificuldade",
        "rotulo": "Maior dificuldade atual da empresa",
        "tipo": "texto-longo",
        "obrigatorio": true
      },
      {
        "id": "area-melhoria",
        "rotulo": "Área que mais precisa de melhoria",
        "tipo": "texto",
        "obrigatorio": false
      },
      {
        "id": "impacto-esperado",
        "rotulo": "Impacto esperado com uma consultoria",
        "tipo": "texto-longo",
        "obrigatorio": false
      },
      {
        "id": "prioridade",
        "rotulo": "Prioridade percebida",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Baixa",
          "Média",
          "Alta",
          "Crítica"
        ]
      },
      {
        "id": "horizonte",
        "rotulo": "Tempo desejado para alcançar resultados",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Até 3 meses",
          "3 a 6 meses",
          "6 a 12 meses",
          "1 a 3 anos",
          "Acima de 3 anos"
        ]
      },
      {
        "id": "observacao-final",
        "rotulo": "Observação final do respondente",
        "tipo": "texto-longo",
        "obrigatorio": false
      }
    ]
  }
]
