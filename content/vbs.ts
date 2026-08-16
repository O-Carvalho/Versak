// GERADO por scripts/import-vbs.mjs — não editar à mão. Fonte: BANCO DE PERGUNTAS — VBS REV. 2.0 (1).xlsx
export type VbsTipoCampo = "texto" | "texto-longo" | "numero" | "opcoes" | "escala" | "multipla-escolha"
export type VbsCampo = {
  id: string
  rotulo: string
  tipo: VbsTipoCampo
  opcoes?: string[]
  obrigatorio: boolean
  placeholder?: string
}
export type VbsBloco = { id: string; nome: string; campos: VbsCampo[] }
export type VbsConsentimentoExtra = { chave: "anonimo" | "contato"; texto: string; obrigatorio: boolean }

export const VBS_VERSAO = "vbs-r2"
export const VBS_CODIGO_EVENTO = "salto_2026_08_17"
export const VBS_CONSENTIMENTO_TEXTO = "Li a Política de Privacidade e concordo com o tratamento dos dados para gerar e entregar minha fotografia empresarial."
export const VBS_CONSENTIMENTOS_EXTRAS: VbsConsentimentoExtra[] = [
  {
    "chave": "anonimo",
    "texto": "Autorizo o uso em anônimo, das respostas em análises agregadas sobre o ambiente empresarial local.",
    "obrigatorio": true
  },
  {
    "chave": "contato",
    "texto": "Autorizo a Versak a entrar em contato para conversar sobre meu resultado e possíveis formas de apoio.",
    "obrigatorio": true
  }
]
export const VBS_BLOCOS: VbsBloco[] = [
  {
    "id": "identificacao",
    "nome": "Identificação",
    "campos": [
      {
        "id": "cargo",
        "rotulo": "Qual é seu cargo ou papel na empresa?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sócio(a)/Proprietário(a)",
          "Diretor(a)",
          "Gerente/Coordenador(a)",
          "Administrativo",
          "Outro"
        ]
      }
    ]
  },
  {
    "id": "empresa",
    "nome": "Empresa",
    "campos": [
      {
        "id": "cnpj",
        "rotulo": "CNPJ",
        "tipo": "texto",
        "obrigatorio": false
      }
    ]
  },
  {
    "id": "perfil",
    "nome": "Perfil",
    "campos": [
      {
        "id": "municipio",
        "rotulo": "Em qual município a empresa está localizada?",
        "tipo": "texto",
        "obrigatorio": false
      },
      {
        "id": "segmento",
        "rotulo": "Qual é o principal segmento de atuação?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Indústria",
          "Comércio",
          "Serviços",
          "Construção",
          "Agro",
          "Logística",
          "Saúde",
          "Tecnologia",
          "Outro"
        ]
      },
      {
        "id": "funcionarios",
        "rotulo": "Quantas pessoas trabalham atualmente na empresa?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "1",
          "2–5",
          "6–10",
          "11–20",
          "21–50",
          "51–100",
          "Mais de 100"
        ]
      },
      {
        "id": "faturamento",
        "rotulo": "Qual é a faixa aproximada de faturamento anual?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Até R$ 360 mil",
          "R$ 360 mil–1 mi",
          "R$ 1–4,8 mi",
          "R$ 4,8–20 mi",
          "R$ 20–100 mi",
          "Acima de R$ 100 mi",
          "Prefiro não informar"
        ]
      },
      {
        "id": "tempo-atuacao",
        "rotulo": "Há quanto tempo a empresa atua?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Menos de 1 ano",
          "1–3 anos",
          "4–7 anos",
          "8–15 anos",
          "Mais de 15 anos"
        ]
      },
      {
        "id": "cliente-predominante",
        "rotulo": "Quem é o cliente predominante?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Empresas (B2B)",
          "Consumidor final (B2C)",
          "Governo",
          "B2B e B2C",
          "Misto"
        ]
      },
      {
        "id": "momento-atual",
        "rotulo": "Como você descreve o momento atual do negócio?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Queda",
          "Estabilidade",
          "Crescimento moderado",
          "Crescimento acelerado"
        ]
      },
      {
        "id": "contratacao",
        "rotulo": "A empresa pretende contratar nos próximos 12 meses?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Não prevê",
          "1–2 pessoas",
          "3–5 pessoas",
          "6–10 pessoas",
          "Mais de 10",
          "Ainda não sabe"
        ]
      }
    ]
  },
  {
    "id": "autopercepcao",
    "nome": "Autopercepção",
    "campos": [
      {
        "id": "conhecimento",
        "rotulo": "De 0 a 10, quanto você considera que conhece os números e os processos da sua empresa?",
        "tipo": "escala",
        "obrigatorio": true,
        "opcoes": [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10"
        ]
      }
    ]
  },
  {
    "id": "custos",
    "nome": "1. Custos",
    "campos": [
      {
        "id": "custo-mensal",
        "rotulo": "Consigo informar, com razoável segurança, quanto custa manter a empresa funcionando por mês.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      },
      {
        "id": "faturamento-minimo",
        "rotulo": "Conheço o faturamento mínimo necessário para cobrir os custos e começar a gerar resultado.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      }
    ]
  },
  {
    "id": "margem",
    "nome": "2. Margem",
    "campos": [
      {
        "id": "produtos-lucrativos",
        "rotulo": "Sei quais produtos, serviços ou clientes mais contribuem para o lucro da empresa.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      },
      {
        "id": "impacto-desconto",
        "rotulo": "Antes de conceder descontos ou aumentar volume, consigo estimar o impacto sobre a margem.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      }
    ]
  },
  {
    "id": "cliente",
    "nome": "3. Cliente",
    "campos": [
      {
        "id": "motivo-escolha",
        "rotulo": "Sei por que os clientes escolhem a empresa e possuo evidências recentes disso.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      },
      {
        "id": "sinais-satisfacao",
        "rotulo": "Acompanho sinais como satisfação, reclamações, recompra ou perda de clientes.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      }
    ]
  },
  {
    "id": "eficiencia",
    "nome": "4. Eficiência",
    "campos": [
      {
        "id": "gargalos",
        "rotulo": "Sei onde ocorrem as principais esperas, falhas, retrabalhos ou desperdícios da operação.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      },
      {
        "id": "capacidade",
        "rotulo": "Conheço a capacidade da operação e os gargalos que limitam vendas, produção ou entregas.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      }
    ]
  },
  {
    "id": "dados",
    "nome": "5. Dados",
    "campos": [
      {
        "id": "numeros-atualizados",
        "rotulo": "Tenho um conjunto curto de números atualizado para decidir sobre o negócio.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      },
      {
        "id": "rotina-decisao",
        "rotulo": "Uso esses números em uma rotina periódica para definir ações e acompanhar resultados.",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Sei e acompanho com dados",
          "Sei aproximadamente / acompanho parcialmente",
          "Tenho percepção, mas não dados confiáveis",
          "Não sei / não acompanho",
          "Não se aplica"
        ]
      }
    ]
  },
  {
    "id": "prioridades",
    "nome": "Prioridades",
    "campos": [
      {
        "id": "barreiras",
        "rotulo": "Quais são hoje as maiores barreiras para a empresa avançar?",
        "tipo": "multipla-escolha",
        "obrigatorio": true,
        "opcoes": [
          "Financeiro/caixa",
          "Vendas",
          "Clientes/marketing",
          "Pessoas",
          "Processos/produtividade",
          "Tecnologia",
          "Estratégia",
          "Acesso a crédito",
          "Regulação/infraestrutura",
          "Outro"
        ]
      },
      {
        "id": "problema-90-dias",
        "rotulo": "Se pudesse resolver um único problema nos próximos 90 dias, qual seria?",
        "tipo": "texto-longo",
        "obrigatorio": true,
        "placeholder": "Até 400 caracteres"
      },
      {
        "id": "resultados-desejados",
        "rotulo": "Quais resultados você mais deseja alcançar nos próximos 12 meses?",
        "tipo": "multipla-escolha",
        "obrigatorio": true,
        "opcoes": [
          "Aumentar margem",
          "Crescer vendas",
          "Melhorar caixa",
          "Reduzir custos",
          "Ganhar produtividade",
          "Organizar gestão",
          "Desenvolver equipe",
          "Digitalizar",
          "Contratar",
          "Expandir mercado"
        ]
      },
      {
        "id": "prazo",
        "rotulo": "Em quanto tempo esse tema precisa começar a produzir resultado?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Até 3 meses",
          "3–6 meses",
          "6–12 meses",
          "Sem prazo definido"
        ]
      },
      {
        "id": "impacto",
        "rotulo": "Se nada mudar, qual tende a ser o impacto para a empresa?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Baixo",
          "Moderado",
          "Alto",
          "Crítico"
        ]
      },
      {
        "id": "disponibilidade",
        "rotulo": "Qual opção melhor descreve a disponibilidade da empresa para agir?",
        "tipo": "opcoes",
        "obrigatorio": true,
        "opcoes": [
          "Quero entender melhor",
          "Posso dedicar tempo da liderança",
          "Tenho equipe para executar",
          "Já prevejo orçamento",
          "Quero apoio imediato"
        ]
      },
      {
        "id": "apoio",
        "rotulo": "Que tipo de apoio faria mais sentido?",
        "tipo": "multipla-escolha",
        "obrigatorio": true,
        "opcoes": [
          "Relatório/conteúdo",
          "Curso",
          "Workshop prático",
          "Networking",
          "Mentoria",
          "Diagnóstico empresarial",
          "Consultoria",
          "Acesso a crédito/mercado",
          "Tecnologia"
        ]
      }
    ]
  }
]
