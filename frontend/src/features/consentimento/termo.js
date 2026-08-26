// Termo único de consentimento LGPD (Lei nº 13.709/2018), estruturado
// internamente em seções por tipo de dado — não é consentimento granular
// (não há aceite por seção), o aceite é único, ao final da leitura de tudo.
// Ver "Segurança de Dados para Laudos Médicos" em agents/claude.md: este
// termo documenta transparência, mas não substitui a base legal formal
// (tutela da saúde/obrigação legal) exigida para o dado mais sensível
// (laudo da Junta Médica).
export const VERSAO_TERMO = "1.0";

export const TERMO_CONSENTIMENTO = {
  versao: VERSAO_TERMO,
  titulo: "Termo de Consentimento para Tratamento de Dados Pessoais",
  introducao:
    "A Rastria trata dados pessoais seus, incluindo dados sensíveis de saúde, para viabilizar o " +
    "acompanhamento da sua saúde ocupacional dentro da sua instituição. Este termo explica, por " +
    "tipo de dado, o que é coletado, para que serve e quem pode acessar. Leia todas as seções " +
    "abaixo antes de aceitar.",
  secoes: [
    {
      id: "dados-saude",
      titulo: "Dados de saúde",
      corpo:
        "Incluem exames, índices clínicos e outros registros de saúde que você cadastra na " +
        "plataforma. São dados sensíveis nos termos do art. 5º, II da LGPD. São usados para " +
        "verificação automática contra tabelas de referência clínica e para permitir que você " +
        "solicite acompanhamento de um médico da sua instituição. Só o médico responsável pelo " +
        "seu atendimento acessa o conteúdo clínico individual — sua chefia/comando nunca vê dado " +
        "clínico nominal, apenas indicadores agregados da instituição.",
    },
    {
      id: "desempenho-fisico",
      titulo: "Dados de desempenho físico",
      corpo:
        "Incluem testes de aptidão física (ex: TAF) e demais registros de atividade física. São " +
        "usados para acompanhamento pelo educador físico da sua instituição, dentro de um escopo " +
        "segregado do escopo médico (educador físico não acessa dado clínico fora de desempenho " +
        "físico). Se você participar do ranking de desempenho físico, seu nome fica visível aos " +
        "colegas da mesma instituição — você pode desativar essa exibição a qualquer momento em " +
        "\"Perfil\", independente deste termo.",
    },
    {
      id: "acesso-institucional",
      titulo: "Dados de acesso institucional",
      corpo:
        "Incluem seu vínculo com a instituição (papel, unidade) e dados cadastrais fornecidos por " +
        "ela no provisionamento da sua conta (ex: nome, CPF, data de nascimento). São usados para " +
        "autenticação, controle de acesso por papel e para que sua instituição acompanhe " +
        "indicadores agregados de saúde ocupacional (ex: \"% do efetivo com exames em dia\"), sem " +
        "acesso a dado individual nominal por parte de quem tem autoridade hierárquica sobre você.",
    },
  ],
  fechamento:
    "Ao aceitar, você declara ciência de como seus dados são tratados nas categorias acima. Este " +
    "aceite não pode ser revogado depois de dado, mas o conteúdo deste termo fica sempre disponível " +
    "para consulta em \"Perfil\".",
};
