import { create } from "zustand";

// Hierarquia de unidades (Batalhão > Companhia) editável pelo Gerente
// (issue #98) — antes era dado mockado fixo em DashboardGerente.jsx, sem
// nenhum jeito de uma instituição nova (ou mudança de estrutura de uma
// existente) ser refletida sem um desenvolvedor mexer direto no código.
//
// Estado local (Zustand, sem persistência) por enquanto — a estrutura real
// depende de modelagem de backend ainda não definida, e possivelmente de
// confirmação da PM sobre a hierarquia real (companhia/pelotão).
//
// Este store guarda só a ESTRUTURA (quais unidades existem e como se aninham),
// que é o que a instituição define sobre si mesma. O indicador agregado
// ("% com exames em dia") saiu daqui na issue #125: é dado que só o backend
// pode calcular, vem de `useAgregadoInstituicao()` em
// features/instituicoes/queries.js e é cruzado com esta estrutura pelo id da
// unidade. Unidade sem número lá é unidade sem dado real ainda — nasce assim
// quando o Gerente cria uma nova.
//
// TODO: substituir por dado real via TanStack Query (GET/POST/PATCH/DELETE
// /api/instituicoes/:id/unidades) quando o endpoint existir.
let proximoIdBatalhao = 4;
let proximoIdCompanhia = 100;

const unidadesIniciais = [
  {
    id: 1,
    nome: "1º Batalhão",
    subunidades: [
      { id: 1, nome: "1ª Companhia" },
      { id: 2, nome: "2ª Companhia" },
      { id: 3, nome: "3ª Companhia" },
    ],
  },
  {
    id: 2,
    nome: "2º Batalhão",
    subunidades: [
      { id: 4, nome: "1ª Companhia" },
      { id: 5, nome: "2ª Companhia" },
    ],
  },
  {
    id: 3,
    nome: "3º Batalhão",
    subunidades: [
      { id: 6, nome: "1ª Companhia" },
      { id: 7, nome: "2ª Companhia" },
      { id: 8, nome: "3ª Companhia" },
    ],
  },
];

export const useHierarquiaStore = create((set) => ({
  unidades: unidadesIniciais,

  adicionarBatalhao: (nome) =>
    set((state) => ({
      unidades: [
        ...state.unidades,
        { id: proximoIdBatalhao++, nome, subunidades: [] },
      ],
    })),

  editarBatalhao: (id, nome) =>
    set((state) => ({
      unidades: state.unidades.map((unidade) => (unidade.id === id ? { ...unidade, nome } : unidade)),
    })),

  removerBatalhao: (id) =>
    set((state) => ({ unidades: state.unidades.filter((unidade) => unidade.id !== id) })),

  adicionarCompanhia: (batalhaoId, nome) =>
    set((state) => ({
      unidades: state.unidades.map((unidade) =>
        unidade.id === batalhaoId
          ? {
              ...unidade,
              subunidades: [...unidade.subunidades, { id: proximoIdCompanhia++, nome }],
            }
          : unidade,
      ),
    })),

  editarCompanhia: (batalhaoId, subId, nome) =>
    set((state) => ({
      unidades: state.unidades.map((unidade) =>
        unidade.id === batalhaoId
          ? {
              ...unidade,
              subunidades: unidade.subunidades.map((sub) => (sub.id === subId ? { ...sub, nome } : sub)),
            }
          : unidade,
      ),
    })),

  removerCompanhia: (batalhaoId, subId) =>
    set((state) => ({
      unidades: state.unidades.map((unidade) =>
        unidade.id === batalhaoId
          ? { ...unidade, subunidades: unidade.subunidades.filter((sub) => sub.id !== subId) }
          : unidade,
      ),
    })),
}));
