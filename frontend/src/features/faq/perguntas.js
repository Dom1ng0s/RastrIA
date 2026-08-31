// Perguntas frequentes exibidas na seção pública da Landing (issue #91) e
// acessíveis pelo menu de ajuda dentro do app ("Ver perguntas frequentes", que
// leva para `/#faq`).
//
// Conteúdo alinhado às decisões já registradas em agents/claude.md: plataforma
// exclusivamente institucional (sem autocadastro), acesso segmentado por papel,
// dado de saúde como dado sensível sob a LGPD, conexão por solicitação →
// confirmação (não matching instantâneo).
export const PERGUNTAS_FREQUENTES = [
  {
    pergunta: "O que é a Rastria?",
    resposta:
      "É uma plataforma que centraliza o histórico de saúde e desempenho físico dos integrantes de uma instituição, verifica automaticamente os índices cadastrados contra tabelas de referência clínica e conecta cada pessoa aos profissionais da própria instituição.",
  },
  {
    pergunta: "Posso criar uma conta por conta própria?",
    resposta:
      "Não. A Rastria opera exclusivamente como plataforma institucional. As contas são provisionadas pela própria instituição (empresa, academia ou corporação) — não há cadastro público de pessoa física.",
  },
  {
    pergunta: "Meu comandante ou gestor vê meus exames?",
    resposta:
      "Não. Quem tem papel de comando ou gestão enxerga apenas indicadores agregados (por exemplo, o percentual do efetivo com exames em dia) e o status administrativo de pendência — nunca resultados ou valores clínicos individuais.",
  },
  {
    pergunta: "Quem tem acesso ao meu dado clínico individual?",
    resposta:
      "Apenas o profissional responsável pelo seu acompanhamento, dentro da sua instituição. Dado de saúde é dado sensível sob a LGPD e o acesso é restrito por papel.",
  },
  {
    pergunta: "Como funciona a conexão com um profissional?",
    resposta:
      "Você envia uma solicitação de acompanhamento e um médico ou educador físico da sua instituição confirma. Não é um aceite automático — o profissional precisa confirmar antes de o atendimento ser registrado.",
  },
  {
    pergunta: "Consigo baixar uma cópia do meu histórico?",
    resposta:
      "Sim. Em Configurações → Meus dados você exporta seu histórico completo em CSV ou PDF a qualquer momento, atendendo ao direito de portabilidade da LGPD.",
  },
  {
    pergunta: "Esqueci minha senha. E agora?",
    resposta:
      'Na tela de login, use "Esqueci minha senha" e informe o e-mail cadastrado. Você receberá um link para definir uma nova senha.',
  },
  {
    pergunta: "Como reabro o tour guiado do sistema?",
    resposta:
      'Clique no ícone de ajuda no topo de qualquer tela e escolha "Rever tour guiado".',
  },
];
