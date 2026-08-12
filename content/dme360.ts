// GERADO por scripts/import-dme360.mjs — não editar à mão. Fonte: DME360_7D HIGHLIGHTS_VERSAK.xlsx
export type DmeQuestao = { codigo: string; subdimensao: string; pergunta: string }
export type DmeDimensao = { id: string; nome: string; descricao: string | null; peso: number; questoes: DmeQuestao[] }
export type DmeEscalaItem = { nota: number; rotulo: string; descricao: string }

export const DME360_VERSAO = "highlights-v1"
export const DME360_ESCALA: DmeEscalaItem[] = [
  {
    "nota": 1,
    "rotulo": "Caótico",
    "descricao": "Ausência de padrões, controles e previsibilidade; gestão reativa e dependente de pessoas-chave."
  },
  {
    "nota": 2,
    "rotulo": "Consciente",
    "descricao": "Reconhecimento dos problemas e existência de iniciativas isoladas, ainda sem consistência."
  },
  {
    "nota": 3,
    "rotulo": "Definido",
    "descricao": "Processos, práticas e responsabilidades formalizados; gestão parcialmente estruturada."
  },
  {
    "nota": 4,
    "rotulo": "Gerenciado",
    "descricao": "Gestão sistemática baseada em indicadores, rituais e acompanhamento recorrente."
  },
  {
    "nota": 5,
    "rotulo": "Otimizado",
    "descricao": "Melhoria contínua, inovação, aprendizado organizacional e alta performance sustentada."
  }
]
export const DME360_DIMENSOES: DmeDimensao[] = [
  {
    "id": "governanca",
    "nome": "Governança e Cultura",
    "descricao": "Governança, é um conjunto de mecanismos que garantem que a empresa está dentro das regras do jogo e está caminhando para o lugar certo, de acordo com os objetivos definidos. Cultura, é a forma como o jogo é jogado dentro da empresa, um sistema operacional quase invisível, onde e como as pessoas se comportam quando ninguém está olhando.",
    "peso": 0.15,
    "questoes": [
      {
        "codigo": "S1.1",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existe uma estrutura formal de pessoas responsáveis pela gestão da Governança?"
      },
      {
        "codigo": "S1.2",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Dentro da empresa, há um Organograma e níveis de autoridade, definidos?"
      },
      {
        "codigo": "S1.3",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existem as funções e responsabilidades definidas de maneira formal? (Matriz RACI)"
      },
      {
        "codigo": "S1.4",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Há um modo de avaliar se a estrutura suporta as necessidades atuais e de crescimento do negócio?"
      },
      {
        "codigo": "S1.5",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Decisões são registradas e rastreáveis?"
      },
      {
        "codigo": "S1.6",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existe mapeamento de conflitos de autoridade atualmente?"
      },
      {
        "codigo": "S2.1",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos que compõem a Governança, estão mapeados?"
      },
      {
        "codigo": "S2.2",
        "subdimensao": "PROCESSOS",
        "pergunta": "A empresa tem processo de revisão sua estratégia de maneira formal e periódica?"
      },
      {
        "codigo": "S2.3",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há auditorias internas e reuniões para controle de processos gerais de trabalho?"
      },
      {
        "codigo": "S2.4",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há padronização documentos e processos, de maneira geral na empresa?"
      },
      {
        "codigo": "S2.5",
        "subdimensao": "PROCESSOS",
        "pergunta": "A empresa se preocupa em compreender seus fluxos internos e registrá-los?"
      },
      {
        "codigo": "S3.1",
        "subdimensao": "INDICADORES",
        "pergunta": "Há indicadores que avaliam temas de Governança, como Riscos do Negócio, Compliance e Liderança, por exemplo?"
      },
      {
        "codigo": "S3.2",
        "subdimensao": "INDICADORES",
        "pergunta": "Há indicadores que medem a qualidade do sistema/estrutura de gestão da empresa?"
      },
      {
        "codigo": "S3.3",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem metas de negócio formalizadas?"
      },
      {
        "codigo": "S3.4",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores influenciam na tomada de decisão?"
      },
      {
        "codigo": "S3.5",
        "subdimensao": "INDICADORES",
        "pergunta": "A empresa se preocupa em criar e gerir os indicadores para as áreas internas do negócio?"
      },
      {
        "codigo": "S4.1",
        "subdimensao": "PESSOAS",
        "pergunta": "A cultura organizacional é formalizada?"
      },
      {
        "codigo": "S4.2",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe um padrão de comunicação para que as pessoas compreendam suas responsabilidades dentro do negócio?"
      },
      {
        "codigo": "S4.3",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe alguma análise do negócio que visa compreender a dependência da empresa com relação a sua liderança?"
      },
      {
        "codigo": "S4.4",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe política de qualidade de vida no trabalho?"
      },
      {
        "codigo": "S4.5",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe plano de sucessão de liderança?"
      },
      {
        "codigo": "S4.6",
        "subdimensao": "PESSOAS",
        "pergunta": "Há comunicação transparente das decisões tomadas pela gestão e alta gestão?"
      },
      {
        "codigo": "S5.1",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As informações de Governança e Cultura do negócio (processos, documentos, dados, comunicações...) estão digitalizados?"
      },
      {
        "codigo": "S5.2",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existem sistemas ou ferramentas para apoiar a Governança e Cultura da empresa?"
      },
      {
        "codigo": "S5.3",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "A tecnologia apoia a tomada de decisão dentro da Governança e Cultura?"
      },
      {
        "codigo": "S5.4",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existem automações relevantes dentro dos processos de Governança e Cultura?"
      },
      {
        "codigo": "S6.1",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Lições aprendidas de Governança, são registradas?"
      },
      {
        "codigo": "S6.2",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existem ações formais de melhoria contínua na Governança e Cultura da empresa?"
      },
      {
        "codigo": "S6.3",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Há apoio dos líderes em Governança e Cultura, para o crescimento sustentável do negócio?"
      },
      {
        "codigo": "S6.4",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Há um plano de treinamento e desenvolvimento do negócio para crescimento sustentável em prol da Governança e Cultura?"
      },
      {
        "codigo": "S7.1",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há avaliação de desempenho dos indicadores de Governança e Cultura?"
      },
      {
        "codigo": "S7.2",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há período de atingimento de metas de Governança e Cultura, sendo avaliados?"
      },
      {
        "codigo": "S7.3",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há análise crítica de desvios de padrões e metas estabelecidos em Governança e Cultura?"
      },
      {
        "codigo": "S7.4",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Os resultados das ações de Governança e Cultura geram valor para o negócio?"
      }
    ]
  },
  {
    "id": "estrategia",
    "nome": "Estratégia",
    "descricao": "A Gestão Estratégica é o ponto central do sistema de métodos, processos, decisões, pessoas e mecanismos que direcionam a empresa para seus objetivos de médio/longo prazo, assegurando alinhamento entre mercado, recursos internos e execução operacional",
    "peso": 0.15,
    "questoes": [
      {
        "codigo": "S1.1",
        "subdimensao": "ESTRUTURA",
        "pergunta": "A empresa tem conhecimento e executa a Gestão com base no conceito de S&OP? - (Sales and Operations Planning) - (demanda, oferta e estratégia do negócio) --> conecta vendas, operação e finanças"
      },
      {
        "codigo": "S1.2",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Dentro da empresa, há um planejamento estratégico e/ou plano estratégico de desenvolvimento, definidos?"
      },
      {
        "codigo": "S1.3",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existem as funções e responsabilidades definidas de maneira formal quanto a Gestão Estratégica empresarial?"
      },
      {
        "codigo": "S1.4",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Decisões sobre a Gestão Estratégia do Negócio, são registradas e rastreáveis?"
      },
      {
        "codigo": "S1.5",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Há processo de avaliação de dores estruturais do negócio, setor a setor?"
      },
      {
        "codigo": "S1.6",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Há um processo que avalie a priorização de planos estratégicos?"
      },
      {
        "codigo": "S2.1",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há mapeamento dos fluxos de trabalho com relação a Gestão Estratégica?"
      },
      {
        "codigo": "S2.2",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos que compõem a Gestão Estratégica, estão mapeados?"
      },
      {
        "codigo": "S2.3",
        "subdimensao": "PROCESSOS",
        "pergunta": "Existem processos de coleta de informação para a composição dos planos de Gestão Estratégica?"
      },
      {
        "codigo": "S2.4",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há padronização em documentos que tratam dos processos de Gestão Estratégica?"
      },
      {
        "codigo": "S2.5",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há processo estruturado para que as decisões estratégicas da companhia, cheguem para as áreas da estrutura?"
      },
      {
        "codigo": "S3.1",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem indicadores definidos para a Gestão Estratégica do negócio?"
      },
      {
        "codigo": "S3.2",
        "subdimensao": "INDICADORES",
        "pergunta": "Há um padrão de acompanhamento dos indicadores estratégicos do negócio?"
      },
      {
        "codigo": "S3.3",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem metas formalizadas dentro do tema de Gestão Estratégica?"
      },
      {
        "codigo": "S3.4",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores influenciam na tomada de decisão?"
      },
      {
        "codigo": "S3.5",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem dashboards e/ou relatórios estruturados?"
      },
      {
        "codigo": "S4.1",
        "subdimensao": "PESSOAS",
        "pergunta": "Os responsáveis pela Gestão Estratégica do negócio, possuem capacitação adequada?"
      },
      {
        "codigo": "S4.2",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe um padrão de comunicação para que as pessoas compreendam suas responsabilidades estratégicas dentro do negócio?"
      },
      {
        "codigo": "S4.3",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe um plano de treinamento e desenvolvimento relacionados ao tema de Gestão Estratégica no negócio?"
      },
      {
        "codigo": "S4.4",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe um plano de responsabilização pelos resultados estratégicos alcançados?"
      },
      {
        "codigo": "S4.5",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe plano de sucessão de liderança estratégica?"
      },
      {
        "codigo": "S4.6",
        "subdimensao": "PESSOAS",
        "pergunta": "Quanto ao engajamento de equipes com relação as ações de Gestão Estratégica, existe ação de avaliaçao sobre o tema?"
      },
      {
        "codigo": "S5.1",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As informações de Gestão Estratégica do negócio (processos, documentos, dados, comunicações...) estão digitalizados?"
      },
      {
        "codigo": "S5.2",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existem sistemas ou ferramentas para apoiar a Gestão Estratégica do Negócio?"
      },
      {
        "codigo": "S5.3",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existe integração de sistemas dentro da Gestão Estratégica do negócio?"
      },
      {
        "codigo": "S5.4",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "A tecnologia apoia a tomada de decisão dentro da Gestão Estratégica do negócio?"
      },
      {
        "codigo": "S5.5",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existem automações relevantes dentro dos processos de Gestão Estratégica?"
      },
      {
        "codigo": "S6.1",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existem revisões periódicas de estratégias de negócios adotadas pela empresa?"
      },
      {
        "codigo": "S6.2",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Lições aprendidas quanto a Gestão Estratégica do negócio, são registradas?"
      },
      {
        "codigo": "S6.3",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existem ações formais de melhoria no setor de Gestão Estratégica de empresa?"
      },
      {
        "codigo": "S6.4",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Com relação a Gestão Estratégica, há um plano de desenvolvimento dessa dimensão, dentro do negócio?"
      },
      {
        "codigo": "S6.5",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existe um método de análise de evolução de ações aplicadas a estratégia do negócio?"
      },
      {
        "codigo": "S7.1",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há avaliação de desempenho dos indicadores de Gestão Estratégica?"
      },
      {
        "codigo": "S7.2",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há período de atingimento de metas de Gestão Estratégica, sendo avaliados?"
      },
      {
        "codigo": "S7.3",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há análise crítica de desvios de padrões e metas estabelecidos dentro da Gestão Estratégica do negócio?"
      },
      {
        "codigo": "S7.4",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Existe alguma análise de previsibilidade de resultados, quanto os planos de Gestão Estratégica aplicados no negócio?"
      },
      {
        "codigo": "S7.5",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Os resultados das ações de Gestão Estratégica, geram valor para o negócio?"
      }
    ]
  },
  {
    "id": "pessoas",
    "nome": "Pessoas",
    "descricao": "Pessoas determinam se as estratégias e os processos, vão acontecer ou não. Garantir que uma empresa tenha as pessoas certas, com competências adequadas, cultura alinhada, lideranças preparadas, engajamento, ambiente saudável e capacidade de adaptação, faz com que os resultados estejam sempre alinhados com o sucesso do negócio",
    "peso": 0.15,
    "questoes": [
      {
        "codigo": "S1.1",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Há plano de classificação de cargos e salários, dentro da empresa?"
      },
      {
        "codigo": "S1.2",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existem as funções e responsabilidades definidas de maneira formal, para o setor de Gestão de Pessoas, dentro do negócio?"
      },
      {
        "codigo": "S1.3",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Decisões sobre o tema de Recursos Humanos e Gestão de Pessoas, são registradas e rastreáveis?"
      },
      {
        "codigo": "S1.4",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Há processo de avaliação de dores com relação a qualidade de vida, dentro da empresa?"
      },
      {
        "codigo": "S1.5",
        "subdimensao": "ESTRUTURA",
        "pergunta": "A empresa, por cultura, trata de maneira estruturada o tema Pessoas dentro do negócio?"
      },
      {
        "codigo": "S2.1",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há mapeamento dos fluxos de trabalho, com relação a RH e/ou demais setores que tratam de pessoas?"
      },
      {
        "codigo": "S2.2",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos que compõem o setor de Gestão de Pessoas, estão mapeados?"
      },
      {
        "codigo": "S2.3",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há padronização em documentos que tratam dos processos do setor de Gestão de Pessoas dentro da empresa?"
      },
      {
        "codigo": "S2.4",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há processo estruturado para que as decisões sobre Gestão de Pessoas, cheguem para todas as áreas da estrutura?"
      },
      {
        "codigo": "S2.5",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há processos onde o setor de Gestão de Pessoas, conduza ações na companhia, em prol do alinhamento de valores e cultura do negócio?"
      },
      {
        "codigo": "S3.1",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem indicadores definidos para a Gestão de Pessoas no negócio?"
      },
      {
        "codigo": "S3.2",
        "subdimensao": "INDICADORES",
        "pergunta": "Há um padrão de acompanhamento dos indicadores de Gestão de Pessoas no negócio?"
      },
      {
        "codigo": "S3.3",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem metas formalizadas dentro do tema de Gestão de Pessoas?"
      },
      {
        "codigo": "S3.4",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores existentes para Gestão de Pessoas, influenciam na tomada de decisão da empresa?"
      },
      {
        "codigo": "S3.5",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem dashboards e/ou relatórios estruturados para Gestão de Pessoas?"
      },
      {
        "codigo": "S4.1",
        "subdimensao": "PESSOAS",
        "pergunta": "Os responsáveis pela Gestão de Pessoas do negócio, possuem capacitação adequada?"
      },
      {
        "codigo": "S4.2",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe um padrão de comunicação para que as pessoas compreendam suas responsabilidades Cultura e Valores do negócio?"
      },
      {
        "codigo": "S4.3",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe um plano de treinamento e desenvolvimento relacionado ao tema de Gestão de Pessoas no negócio?"
      },
      {
        "codigo": "S4.4",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe um plano de avaliação de competências comportamentais aplicado dentro do negócio?"
      },
      {
        "codigo": "S4.5",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe plano de sucessão de liderança para a área de gestão de pessoas?"
      },
      {
        "codigo": "S4.6",
        "subdimensao": "PESSOAS",
        "pergunta": "Quanto ao engajamento de equipes com relação as ações de promovem os valores e cultura organizacionais, existe ação de avaliaçao sobre o tema?"
      },
      {
        "codigo": "S5.1",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As informações de Gestão de Pessoas no negócio (processos, documentos, dados, comunicações...) estão digitalizados?"
      },
      {
        "codigo": "S5.2",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existem sistemas ou ferramentas para apoiar a Gestão de Pessoas do Negócio?"
      },
      {
        "codigo": "S5.3",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existe integração de sistema de Gestão de Pessoas, com outras áreas do negócio?"
      },
      {
        "codigo": "S5.4",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "A tecnologia apoia a tomada de decisão dentro da Gestão Pessoas do negócio?"
      },
      {
        "codigo": "S5.5",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existem automações relevantes dentro dos processos de Gestão Pessoas?"
      },
      {
        "codigo": "S6.1",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Os processos de Gestao de Pessoas, são revisados periodicamente para eliminar desperdícios e reduzir riscos?"
      },
      {
        "codigo": "S6.2",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Lições aprendidas quanto a Gestão de Pessoas, são registradas?"
      },
      {
        "codigo": "S6.3",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existem ações formais de melhoria no setor de Gestão de Pessoas da empresa?"
      },
      {
        "codigo": "S6.4",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Com relação a Gestão de Pessoas, há um plano de desenvolvimento dessa dimensão, dentro do negócio?"
      },
      {
        "codigo": "S6.5",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existe um método de análise de evolução de ações aplicadas a estratégia de Gestão de Pessoas no negócio?"
      },
      {
        "codigo": "S7.1",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há avaliação de desempenho dos indicadores de Gestão de Pessoas?"
      },
      {
        "codigo": "S7.2",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há período de atingimento de metas de Gestão de Pessoas, sendo avaliados?"
      },
      {
        "codigo": "S7.3",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há análise crítica de desvios de padrões e metas estabelecidos dentro da Gestão de Pessoas no negócio?"
      }
    ]
  },
  {
    "id": "comercial",
    "nome": "Comercial",
    "descricao": "A Gestão Comercial é o conjunto de mecanismos responsáveis por conectar a empresa ao mercado, identificar oportunidades, conquistar novos negócios e gerar receita de forma previsível e sustentável. É por meio da Gestão Comercial que a estratégia da empresa se transforma em vendas, crescimento, posicionamento competitivo e resultados financeiros.",
    "peso": 0.15,
    "questoes": [
      {
        "codigo": "S1.1",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existe uma estratégia comercial formalmente definida e comunicada?"
      },
      {
        "codigo": "S1.2",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Os responsáveis comerciais estão claramente definidos?"
      },
      {
        "codigo": "S1.3",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existe estrutura adequada para prospecção, vendas e pós-venda?"
      },
      {
        "codigo": "S1.4",
        "subdimensao": "ESTRUTURA",
        "pergunta": "As políticas comerciais (descontos, alçadas e comissões) estão documentadas?"
      },
      {
        "codigo": "S1.5",
        "subdimensao": "ESTRUTURA",
        "pergunta": "A estrutura comercial suporta o crescimento esperado do negócio?"
      },
      {
        "codigo": "S2.1",
        "subdimensao": "PROCESSOS",
        "pergunta": "Existe um mapeamento do processo comercial padronizado e documentado?"
      },
      {
        "codigo": "S2.2",
        "subdimensao": "PROCESSOS",
        "pergunta": "As etapas do funil comercial possuem critérios de entrada e saída definidos?"
      },
      {
        "codigo": "S2.3",
        "subdimensao": "PROCESSOS",
        "pergunta": "Existe processo estruturado para elaboração de propostas?"
      },
      {
        "codigo": "S2.4",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há processo formal de gestão do pós-venda e renovação/revenda de contratos/produtos?"
      },
      {
        "codigo": "S2.5",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos comerciais são periodicamente revisados?"
      },
      {
        "codigo": "S3.1",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem indicadores definidos para Comercial?"
      },
      {
        "codigo": "S3.2",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem metas formalizadas?"
      },
      {
        "codigo": "S3.3",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores são acompanhados regularmente?"
      },
      {
        "codigo": "S3.4",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem dashboards ou relatórios estruturados?"
      },
      {
        "codigo": "S3.5",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores influenciam a tomada de decisão?"
      },
      {
        "codigo": "S4.1",
        "subdimensao": "PESSOAS",
        "pergunta": "Os perfis e competências comerciais estão claramente definidos?"
      },
      {
        "codigo": "S4.2",
        "subdimensao": "PESSOAS",
        "pergunta": "Existem metas individuais e coletivas para a equipe comercial?"
      },
      {
        "codigo": "S4.3",
        "subdimensao": "PESSOAS",
        "pergunta": "A empresa realiza treinamentos periódicos em vendas e negociação?"
      },
      {
        "codigo": "S4.4",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe processo estruturado de feedback e avaliação de desempenho?"
      },
      {
        "codigo": "S4.5",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe modelo de incentivos alinhado aos resultados esperados?"
      },
      {
        "codigo": "S5.1",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "A empresa utiliza CRM para gestão comercial?"
      },
      {
        "codigo": "S5.2",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As informações de clientes e oportunidades estão centralizadas?"
      },
      {
        "codigo": "S5.3",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As ferramentas comerciais estão integradas aos demais sistemas do negócio?"
      },
      {
        "codigo": "S5.4",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existem recursos de automação comercial e marketing?"
      },
      {
        "codigo": "S5.5",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "A tecnologia apoia a tomada de decisões no setor comercial?"
      },
      {
        "codigo": "S6.1",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "A empresa realiza análises das oportunidades perdidas no comercial?"
      },
      {
        "codigo": "S6.2",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existem reuniões periódicas de revisão de resultados comerciais?"
      },
      {
        "codigo": "S6.3",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "As causas de baixo desempenho são investigadas sistematicamente?"
      },
      {
        "codigo": "S6.4",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "São realizados testes de novos canais ou abordagens comerciais?"
      },
      {
        "codigo": "S6.5",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "As lições aprendidas são registradas e disseminadas?"
      },
      {
        "codigo": "S7.1",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Existe um plano de crescimento comercial previsível e sustentável?"
      },
      {
        "codigo": "S7.2",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há metodologia de acompanhamento do resultado das metas de faturamento/vendas, comerciais em geral?"
      },
      {
        "codigo": "S7.3",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há acompanhamento dos níveis de retenção e fidelização?"
      },
      {
        "codigo": "S7.4",
        "subdimensao": "PERFORMANCE",
        "pergunta": "A empresa possui previsibilidade de vendas e receitas futuras?"
      },
      {
        "codigo": "S7.5",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Há análise de rentabilidade comercial para que atenda aos objetivos estratégicos da companhia?"
      }
    ]
  },
  {
    "id": "financeiro",
    "nome": "Financeiro",
    "descricao": "A Gestão Financeira representa um conjunto de operações que guiam a empresa em sua capacidade de gerar caixa, lucro e valor de forma consistente, sustentando todas as demais áreas, garantindo controle de riscos e a perenidade do negócio\".",
    "peso": 0.15,
    "questoes": [
      {
        "codigo": "S1.1",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existe uma estrutura financeira formal com responsabilidades e níveis de aprovação claramente definidos?"
      },
      {
        "codigo": "S1.2",
        "subdimensao": "ESTRUTURA",
        "pergunta": "A empresa possui políticas financeiras documentadas para pagamentos, recebimentos e investimentos?"
      },
      {
        "codigo": "S1.3",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Há um plano de contas e de custos alinhados à gestão do negócio?"
      },
      {
        "codigo": "S1.4",
        "subdimensao": "ESTRUTURA",
        "pergunta": "O planejamento financeiro anual está formalizado e alinhado aos objetivos estratégicos?"
      },
      {
        "codigo": "S1.5",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Os papéis e responsáveis entre financeiro, controladoria, contabilidade e demais áreas estão claramente definidos?"
      },
      {
        "codigo": "S2.1",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos de contas a pagar, contas a receber são padronizados e documentados?"
      },
      {
        "codigo": "S2.2",
        "subdimensao": "PROCESSOS",
        "pergunta": "O fluxo de caixa é atualizado e projetado de forma sistemática?"
      },
      {
        "codigo": "S2.3",
        "subdimensao": "PROCESSOS",
        "pergunta": "Existe um processo estruturado para elaboração e revisão de orçamentos?"
      },
      {
        "codigo": "S2.4",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os custos são apurados por critérios consistentes e utilizados na tomada de decisão?"
      },
      {
        "codigo": "S2.5",
        "subdimensao": "PROCESSOS",
        "pergunta": "Há rotinas formais de fechamento financeiro e análise de resultados?"
      },
      {
        "codigo": "S3.1",
        "subdimensao": "INDICADORES",
        "pergunta": "São monitorados indicadores financeiros, como de liquidez, rentabilidade, geração de caixa, margem, ponto de equilíbrio e EBITDA, conforme aplicável ao negócio?"
      },
      {
        "codigo": "S3.2",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores financeiros são confiáveis e passam por atualização periódica?"
      },
      {
        "codigo": "S3.3",
        "subdimensao": "INDICADORES",
        "pergunta": "Há análise de desvio entre metas e o executado para identificar causas, riscos e oportunidades de melhoria?"
      },
      {
        "codigo": "S3.4",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores financeiros são utilizados como suporte para decisões gerenciais, definição de prioridades e planejamento financeiro?"
      },
      {
        "codigo": "S3.5",
        "subdimensao": "INDICADORES",
        "pergunta": "Há monitoramento histórico dos resultados dos indicadores, para avaliar a consistência da performance financeira e da sustentabilidade econômica da organização?"
      },
      {
        "codigo": "S4.1",
        "subdimensao": "PESSOAS",
        "pergunta": "Os perfis e competências das pessoas do setor Financeiro, estão claramente definidos?"
      },
      {
        "codigo": "S4.2",
        "subdimensao": "PESSOAS",
        "pergunta": "Os gestores das demais áreas compreendem os impactos financeiros de suas decisões?"
      },
      {
        "codigo": "S4.3",
        "subdimensao": "PESSOAS",
        "pergunta": "A empresa realiza treinamentos periódicos em gestão financeira?"
      },
      {
        "codigo": "S4.4",
        "subdimensao": "PESSOAS",
        "pergunta": "Existem responsabilizações por resultados que respeitem funções e controles internos?"
      },
      {
        "codigo": "S4.5",
        "subdimensao": "PESSOAS",
        "pergunta": "A cultura organizacional incentiva decisões orientadas por resultados financeiros sustentáveis?"
      },
      {
        "codigo": "S5.1",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existe sistema ERP integra adequadamente as informações financeiras com as demais áreas?"
      },
      {
        "codigo": "S5.2",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existem dashboards ou relatórios automatizados para acompanhamento financeiro?"
      },
      {
        "codigo": "S5.3",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As conciliações bancárias e controles financeiros são automatizados sempre que possível?"
      },
      {
        "codigo": "S5.4",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As informações financeiras são confiáveis, rastreáveis e acessíveis para os gestores?"
      },
      {
        "codigo": "S5.5",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "A empresa utiliza ferramentas tecnológicas para apoiar previsões e análises financeiras?"
      },
      {
        "codigo": "S6.1",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Os processos financeiros são revisados periodicamente para eliminar desperdícios e reduzir riscos?"
      },
      {
        "codigo": "S6.2",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "São implementadas ações corretivas para desvios financeiros recorrentes?"
      },
      {
        "codigo": "S6.3",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "A empresa busca continuamente melhorar a qualidade das informações financeiras?"
      },
      {
        "codigo": "S6.4",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Projetos de automação e simplificação financeira são priorizados quando agregam valor?"
      },
      {
        "codigo": "S6.5",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "As lições aprendidas são registradas e disseminadas?"
      },
      {
        "codigo": "S7.1",
        "subdimensao": "PERFORMANCE",
        "pergunta": "A empresa possuí análise, que observa se há geração de caixa suficiente para sustentar sua operação e crescimento?"
      },
      {
        "codigo": "S7.2",
        "subdimensao": "PERFORMANCE",
        "pergunta": "A empresa monitora se rentabilidade atende às expectativas definidas pelos sócios ou investidores?"
      },
      {
        "codigo": "S7.3",
        "subdimensao": "PERFORMANCE",
        "pergunta": "O capital de giro é administrado de forma equilibrada?"
      },
      {
        "codigo": "S7.4",
        "subdimensao": "PERFORMANCE",
        "pergunta": "A empresa mantém capacidade de investimento sem comprometer sua saúde financeira?"
      },
      {
        "codigo": "S7.5",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Os resultados financeiros demonstram evolução consistente ao longo do tempo?"
      }
    ]
  },
  {
    "id": "operacoes",
    "nome": "Operações",
    "descricao": "Gestão de Operações é o conjunto de práticas responsáveis por transformar recursos (pessoas, materiais, informações, tecnologia e capital) em produtos ou serviços de maneira eficiente, previsível, segura, padronizada e alinhada à estratégia do negócio\".",
    "peso": 0.15,
    "questoes": [
      {
        "codigo": "S1.1",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existe uma estrutura operacional formalmente definida para suportar a execução das atividades da empresa?"
      },
      {
        "codigo": "S1.2",
        "subdimensao": "ESTRUTURA",
        "pergunta": "As responsabilidades das funções operacionais são formalmente definidas e documentadas?"
      },
      {
        "codigo": "S1.3",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existem critérios documentados para dimensionamento dos recursos operacionais?"
      },
      {
        "codigo": "S1.4",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existe um padrão definido para organização física (layout) da operação?"
      },
      {
        "codigo": "S1.5",
        "subdimensao": "ESTRUTURA",
        "pergunta": "A estrutura operacional é periodicamente revisada para acompanhar as necessidades do negócio?"
      },
      {
        "codigo": "S2.1",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos operacionais críticos estão documentados?"
      },
      {
        "codigo": "S2.2",
        "subdimensao": "PROCESSOS",
        "pergunta": "Existe padronização formal para execução das atividades operacionais?"
      },
      {
        "codigo": "S2.3",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos operacionais possuem responsáveis formalmente definidos?"
      },
      {
        "codigo": "S2.4",
        "subdimensao": "PROCESSOS",
        "pergunta": "Existe um procedimento documentado para revisão dos processos operacionais?"
      },
      {
        "codigo": "S2.5",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos operacionais são periodicamente revisados e otimizados?"
      },
      {
        "codigo": "S3.1",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem indicadores definidos para monitorar a produtividade operacional?"
      },
      {
        "codigo": "S3.2",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem indicadores definidos para monitorar qualidade, prazo, custo ou eficiência operacional?"
      },
      {
        "codigo": "S3.3",
        "subdimensao": "INDICADORES",
        "pergunta": "Existe um procedimento documentado para coleta e atualização dos indicadores operacionais?"
      },
      {
        "codigo": "S3.4",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores operacionais são periodicamente analisados para apoiar a tomada de decisão?"
      },
      {
        "codigo": "S3.5",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores operacionais são revisados e aprimorados conforme a evolução da operação?"
      },
      {
        "codigo": "S4.1",
        "subdimensao": "PESSOAS",
        "pergunta": "Existem critérios definidos para capacitação das equipes operacionais?"
      },
      {
        "codigo": "S4.2",
        "subdimensao": "PESSOAS",
        "pergunta": "As competências necessárias para cada função operacional estão documentadas?"
      },
      {
        "codigo": "S4.3",
        "subdimensao": "PESSOAS",
        "pergunta": "Existe um padrão para treinamento e integração dos colaboradores operacionais?"
      },
      {
        "codigo": "S4.4",
        "subdimensao": "PESSOAS",
        "pergunta": "Os treinamentos operacionais passam por atualização periódica?"
      },
      {
        "codigo": "S4.5",
        "subdimensao": "PESSOAS",
        "pergunta": "As competências das equipes são periodicamente avaliadas e desenvolvidas?"
      },
      {
        "codigo": "S5.1",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existe tecnologia definida para apoiar os processos operacionais?"
      },
      {
        "codigo": "S5.2",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As ferramentas tecnológicas utilizadas possuem padrões de utilização documentados?"
      },
      {
        "codigo": "S5.3",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existe um procedimento para atualização das tecnologias utilizadas na operação?"
      },
      {
        "codigo": "S5.4",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Os sistemas utilizados na operação passam por revisões periódicas?"
      },
      {
        "codigo": "S5.5",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As tecnologias empregadas são continuamente avaliadas visando aumento de produtividade e eficiência?"
      },
      {
        "codigo": "S6.1",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existe um processo formal para identificação de oportunidades de melhoria operacional?"
      },
      {
        "codigo": "S6.2",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existe um procedimento documentado para tratamento das causas dos problemas operacionais?"
      },
      {
        "codigo": "S6.3",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "As melhorias implementadas são documentadas e padronizadas?"
      },
      {
        "codigo": "S6.4",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "As ações de melhoria passam por acompanhamento periódico?"
      },
      {
        "codigo": "S6.5",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existe uma rotina estruturada para revisão e otimização contínua dos processos operacionais?"
      },
      {
        "codigo": "S7.1",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Existe um processo formal para acompanhamento da performance operacional?"
      },
      {
        "codigo": "S7.2",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Os critérios utilizados para avaliação da performance operacional estão documentados?"
      },
      {
        "codigo": "S7.3",
        "subdimensao": "PERFORMANCE",
        "pergunta": "As reuniões de acompanhamento da performance operacional seguem um padrão definido?"
      },
      {
        "codigo": "S7.4",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Os resultados da performance operacional são periodicamente revisados para definição de ações?"
      },
      {
        "codigo": "S7.5",
        "subdimensao": "PERFORMANCE",
        "pergunta": "O modelo de gestão da performance operacional é periodicamente avaliado e aprimorado?"
      }
    ]
  },
  {
    "id": "cliente",
    "nome": "Cliente",
    "descricao": null,
    "peso": 0.1,
    "questoes": [
      {
        "codigo": "S1.1",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existe uma estrutura organizacional formalmente responsável pela gestão do relacionamento e experiência dos clientes?"
      },
      {
        "codigo": "S1.2",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Os papéis e responsabilidades relacionados à gestão de clientes estão claramente definidos entre Comercial, Operação e Atendimento?"
      },
      {
        "codigo": "S1.3",
        "subdimensao": "ESTRUTURA",
        "pergunta": "Existem critérios para classificação e priorização de clientes conforme sua importância estratégica?"
      },
      {
        "codigo": "S1.4",
        "subdimensao": "ESTRUTURA",
        "pergunta": "A alta liderança participa das decisões relacionadas à retenção e satisfação dos clientes?"
      },
      {
        "codigo": "S1.5",
        "subdimensao": "ESTRUTURA",
        "pergunta": "A organização possui governança definida para tratamento de reclamações, retenção e desenvolvimento da carteira de clientes?"
      },
      {
        "codigo": "S2.1",
        "subdimensao": "PROCESSOS",
        "pergunta": "Existe processo padronizado para acompanhamento da jornada do cliente desde a venda até o pós-venda?"
      },
      {
        "codigo": "S2.2",
        "subdimensao": "PROCESSOS",
        "pergunta": "As reclamações e solicitações dos clientes seguem fluxo estruturado de registro, tratativa e retorno?"
      },
      {
        "codigo": "S2.3",
        "subdimensao": "PROCESSOS",
        "pergunta": "Existe processo formal para renovação, retenção e recuperação de clientes em risco de cancelamento?"
      },
      {
        "codigo": "S2.4",
        "subdimensao": "PROCESSOS",
        "pergunta": "Os processos de atendimento e relacionamento possuem níveis de serviço (SLAs) definidos e monitorados?"
      },
      {
        "codigo": "S2.5",
        "subdimensao": "PROCESSOS",
        "pergunta": "As informações obtidas com os clientes retroalimentam os processos de melhoria e tomada de decisão?"
      },
      {
        "codigo": "S3.1",
        "subdimensao": "INDICADORES",
        "pergunta": "A organização monitora indicadores de satisfação, retenção e fidelização de clientes de forma periódica?"
      },
      {
        "codigo": "S3.2",
        "subdimensao": "INDICADORES",
        "pergunta": "São medidos os motivos de perda de clientes e seus impactos financeiros?"
      },
      {
        "codigo": "S3.3",
        "subdimensao": "INDICADORES",
        "pergunta": "Existem indicadores para avaliar desempenho da experiência do cliente ao longo da jornada?"
      },
      {
        "codigo": "S3.4",
        "subdimensao": "INDICADORES",
        "pergunta": "A empresa acompanha indicadores de desenvolvimento e expansão da carteira de clientes existente?"
      },
      {
        "codigo": "S3.5",
        "subdimensao": "INDICADORES",
        "pergunta": "Os indicadores de clientes são utilizados na tomada de decisão gerencial e estratégica?"
      },
      {
        "codigo": "S4.1",
        "subdimensao": "PESSOAS",
        "pergunta": "As equipes que interagem com clientes recebem capacitação periódica em atendimento e relacionamento?"
      },
      {
        "codigo": "S4.2",
        "subdimensao": "PESSOAS",
        "pergunta": "Os colaboradores compreendem a importância estratégica da experiência e satisfação do cliente?"
      },
      {
        "codigo": "S4.3",
        "subdimensao": "PESSOAS",
        "pergunta": "Existem competências claramente definidas para profissionais que atuam na gestão de clientes?"
      },
      {
        "codigo": "S4.4",
        "subdimensao": "PESSOAS",
        "pergunta": "A empresa estimula comportamentos orientados à empatia, resolução de problemas e geração de valor ao cliente?"
      },
      {
        "codigo": "S4.5",
        "subdimensao": "PESSOAS",
        "pergunta": "Os resultados relacionados aos clientes influenciam avaliações de desempenho e desenvolvimento das equipes?"
      },
      {
        "codigo": "S5.1",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "A empresa possui sistemas que centralizam o histórico de relacionamento e interações com os clientes?"
      },
      {
        "codigo": "S5.2",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As ferramentas tecnológicas permitem monitorar a satisfação e a experiência dos clientes?"
      },
      {
        "codigo": "S5.3",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "Existe integração entre os sistemas utilizados pelas áreas que interagem com os clientes?"
      },
      {
        "codigo": "S5.4",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "As tecnologias empregadas permitem identificar riscos de perda e oportunidades de expansão de clientes?"
      },
      {
        "codigo": "S5.5",
        "subdimensao": "TECNOLOGIA",
        "pergunta": "A organização utiliza recursos digitais para automatizar atendimentos, pesquisas ou relacionamentos recorrentes?"
      },
      {
        "codigo": "S6.1",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "As reclamações e feedbacks dos clientes geram planos de ação estruturados?"
      },
      {
        "codigo": "S6.2",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existe análise de causa raiz para problemas recorrentes percebidos pelos clientes?"
      },
      {
        "codigo": "S6.3",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "As melhorias implementadas são posteriormente validadas pelos próprios clientes?"
      },
      {
        "codigo": "S6.4",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "A organização aprende sistematicamente com perdas, cancelamentos e reclamações de clientes?"
      },
      {
        "codigo": "S6.5",
        "subdimensao": "MELHORIA CONTÍNUA",
        "pergunta": "Existe processo contínuo de revisão da jornada e experiência do cliente?"
      },
      {
        "codigo": "S7.1",
        "subdimensao": "PERFORMANCE",
        "pergunta": "A empresa apresenta evolução consistente na retenção e fidelização de clientes?"
      },
      {
        "codigo": "S7.2",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Os clientes percebem valor suficiente para manter e ampliar o relacionamento com a organização?"
      },
      {
        "codigo": "S7.3",
        "subdimensao": "PERFORMANCE",
        "pergunta": "A organização consegue converter clientes satisfeitos em promotores e geradores de novas oportunidades?"
      },
      {
        "codigo": "S7.4",
        "subdimensao": "PERFORMANCE",
        "pergunta": "Os resultados financeiros provenientes da carteira atual de clientes apresentam crescimento sustentável?"
      },
      {
        "codigo": "S7.5",
        "subdimensao": "PERFORMANCE",
        "pergunta": "A gestão de clientes contribui efetivamente para a diferenciação competitiva e geração de valor do negócio?"
      }
    ]
  }
]
