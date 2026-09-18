// Camada de dados do domínio "instituições" (painel agregado do Comando,
// exames administrativos atrasados, nome de instituição). Hooks já no formato
// final do TanStack Query (issue #119) — hoje resolvem mocks locais.

import { useMockQuery } from "../../lib/mockQuery";

const DELAY_DEMO_MS = 600; // referência visual de skeleton/erro (issue #120)

// --- Mocks (extraídos das telas — issue #119) --------------------------------

// Exceção deliberada à regra "Comando nunca vê dado individual nominal" (issue
// #11): o que aparece aqui é só o STATUS ADMINISTRATIVO de pendência (nome +
// tipo de exame + atraso), nunca o resultado/valor clínico.
const EXAMES_ATRASADOS = [
  { id: 1, nome: "Sd. João Pereira", unidade: "1º Batalhão", exame: "Exame de sangue de rotina", diasAtraso: 12 },
  { id: 2, nome: "Cb. Ana Ramos", unidade: "2º Batalhão", exame: "Avaliação cardiológica anual", diasAtraso: 5 },
  { id: 3, nome: "Sd. Marcos Lima", unidade: "3º Batalhão", exame: "TAF", diasAtraso: 20 },
];

// Indicador agregado "% com exames em dia", indexado por id de unidade.
//
// Só os PERCENTUAIS vivem aqui — a ESTRUTURA da hierarquia (quais batalhões e
// companhias existem) é do `features/hierarquia/store.js`, editável pelo
// Gerente (issue #98). Antes os dois carregavam a lista inteira de unidades, e
// as duas cópias já tinham começado a divergir (issue #125). A divisão segue o
// que cada lado é capaz de saber: a instituição define a própria estrutura, e
// só o backend consegue calcular o indicador por cima dela.
//
// Unidade sem entrada aqui é unidade sem dado real ainda (uma companhia recém
// criada pelo Gerente, por exemplo) — a tela mostra "Sem dado ainda".
const PERCENTUAIS_POR_UNIDADE = {
  batalhoes: { 1: 94, 2: 88, 3: 95 },
  subunidades: { 1: 96, 2: 91, 3: 95, 4: 85, 5: 90, 6: 97, 7: 94, 8: 95 },
};

const EFETIVO_GERAL = 92;

const NOMES_INSTITUICAO = { 1: "Batalhão PMAL", 2: "Outra instituição" };

// --- Hooks -------------------------------------------------------------------

/** GET /api/registros-saude?atrasados= — pendências administrativas do efetivo. */
export function useExamesAtrasados() {
  return useMockQuery({
    queryKey: ["exames-atrasados"],
    dados: EXAMES_ATRASADOS,
    delayMs: DELAY_DEMO_MS,
  });
}

/**
 * GET /api/instituicoes/:id/agregado — percentual em dia do efetivo e de cada
 * unidade. A tela cruza estes números com a hierarquia do store (issue #98)
 * pelo id da unidade.
 */
export function useAgregadoInstituicao() {
  return useMockQuery({
    queryKey: ["instituicoes", "agregado"],
    dados: { efetivoGeral: EFETIVO_GERAL, percentuais: PERCENTUAIS_POR_UNIDADE },
    delayMs: DELAY_DEMO_MS,
  });
}

/** GET /api/instituicoes/:id — nome da instituição (`null` se desconhecida). */
export function useNomeInstituicao(id) {
  return useMockQuery({
    queryKey: ["instituicoes", id, "nome"],
    dados: () => NOMES_INSTITUICAO[id] ?? null,
  });
}
