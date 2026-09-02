import { create } from "zustand";

// Hierarquia de unidades (Batalhão > Companhia) editável pelo Gerente
// (issue #98) — antes era dado mockado fixo em DashboardGerente.jsx, sem
// nenhum jeito de uma instituição nova (ou mudança de estrutura de uma
// existente) ser refletida sem um desenvolvedor mexer direto no código.
//
// Estado local (Zustand, sem persistência) por enquanto — a estrutura real
// depende de modelagem de backend ainda não definida, e possivelmente de
// confirmação da PM sobre a hierarquia real (companhia/pelotão). `percentual`
// (indicador agregado "% com exames em dia") continua sendo dado que só o
// backend pode calcular de verdade; uma unidade nova nasce sem indicador
// (`percentual: null`) até existir dado real por trás dela.
//
// TODO: substituir por dado real via TanStack Query (GET/POST/PATCH/DELETE
// /api/instituicoes/:id/unidades) quando o endpoint existir.
let proximoIdBatalhao = 4;
let proximoIdCompanhia = 100;

const unidadesIniciais = [
  {
    id: 1,
    nome: "1º Batalhão",
    percentual: 94,
    subunidades: [
      { id: 1, nome: "1ª Companhia", percentual: 96 },
      { id: 2, nome: "2ª Companhia", percentual: 91 },
      { id: 3, nome: "3ª Companhia", percentual: 95 },
    ],
  },
  {
    id: 2,
    nome: "2º Batalhão",
    percentual: 88,
    subunidades: [
      { id: 4, nome: "1ª Companhia", percentual: 85 },
      { id: 5, nome: "2ª Companhia", percentual: 90 },
    ],
  },
  {
    id: 3,
    nome: "3º Batalhão",
    percentual: 95,
    subunidades: [
      { id: 6, nome: "1ª Companhia", percentual: 97 },
      { id: 7, nome: "2ª Companhia", percentual: 94 },
      { id: 8, nome: "3ª Companhia", percentual: 95 },
    ],
  },
];

export const useHierarquiaStore = create((set) => ({
  unidades: unidadesIniciais,

  adicionarBatalhao: (nome) =>
    set((state) => ({
      unidades: [
        ...state.unidades,
        { id: proximoIdBatalhao++, nome, percentual: null, subunidades: [] },
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
              subunidades: [...unidade.subunidades, { id: proximoIdCompanhia++, nome, percentual: null }],
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
