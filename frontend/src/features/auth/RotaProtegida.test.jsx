// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { ROLES } from "./roles";
import { RotaProtegida } from "./RotaProtegida";
import { useAuthStore } from "./store";

// Segregação de acesso por papel no frontend (issue #61). É a garantia central
// vendida ao cliente institucional — do lado do cliente, ela é este componente.
//
// Vale o lembrete que o próprio código traz: isto é camada de apresentação. A
// proteção que conta é a do backend (issues #59/#103); um teste verde aqui não
// substitui aquela.

const PAPEIS = ROLES.map((role) => role.id);

// Mapa papel → rota exclusiva dele, derivado de `ROLES` para um papel novo não
// passar despercebido por este teste.
const ROTA_DO_PAPEL = Object.fromEntries(ROLES.map((role) => [role.id, role.path]));

function renderizar({ rota, papeis }) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route element={<RotaProtegida papeis={papeis} />}>
          <Route path={rota} element={<h1>Conteúdo protegido</h1>} />
        </Route>
        <Route path="/login" element={<h1>Tela de login</h1>} />
        {ROLES.map((role) => (
          <Route key={role.id} path={role.path} element={<h1>Início de {role.id}</h1>} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}

function logarComo(papel) {
  useAuthStore.setState({ usuario: papel ? { papel, instituicaoId: 1 } : null });
}

beforeEach(() => {
  logarComo(null);
  localStorage.clear();
});

describe("sem usuário logado", () => {
  it("manda para o login em vez de renderizar a tela", () => {
    renderizar({ rota: "/gerente", papeis: ["comando"] });
    expect(screen.getByRole("heading", { name: "Tela de login" })).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });

  it("protege também a rota sem lista de papéis (só exige estar logado)", () => {
    renderizar({ rota: "/perfil", papeis: undefined });
    expect(screen.getByRole("heading", { name: "Tela de login" })).toBeInTheDocument();
  });
});

describe("papel permitido", () => {
  it.each(PAPEIS)("%s abre a própria rota", (papel) => {
    logarComo(papel);
    renderizar({ rota: ROTA_DO_PAPEL[papel], papeis: [papel] });
    expect(screen.getByRole("heading", { name: "Conteúdo protegido" })).toBeInTheDocument();
  });

  it.each(PAPEIS)("%s abre rota sem restrição de papel (ex: Configurações)", (papel) => {
    logarComo(papel);
    renderizar({ rota: "/perfil", papeis: undefined });
    expect(screen.getByRole("heading", { name: "Conteúdo protegido" })).toBeInTheDocument();
  });
});

describe("papel errado", () => {
  // Todos os pares (papel logado, rota de outro papel): é aqui que um descuido
  // na lista de `papeis` de uma rota nova apareceria.
  const pares = PAPEIS.flatMap((logado) =>
    PAPEIS.filter((dono) => dono !== logado).map((dono) => [logado, dono]),
  );

  it.each(pares)("%s não entra na rota de %s", (logado, dono) => {
    logarComo(logado);
    renderizar({ rota: ROTA_DO_PAPEL[dono], papeis: [dono] });
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });

  it.each(pares)("%s é levado para a própria tela inicial, não para o login", (logado, dono) => {
    logarComo(logado);
    renderizar({ rota: ROTA_DO_PAPEL[dono], papeis: [dono] });
    // Não é 404 nem "acesso negado": a pessoa vai para onde ela pode estar.
    expect(screen.getByRole("heading", { name: `Início de ${logado}` })).toBeInTheDocument();
  });

  it("papel desconhecido cai no login", () => {
    logarComo("papel-que-nao-existe");
    renderizar({ rota: "/gerente", papeis: ["comando"] });
    expect(screen.getByRole("heading", { name: "Tela de login" })).toBeInTheDocument();
  });
});

describe("uso como wrapper, não como rota de layout", () => {
  it("renderiza os filhos quando o papel confere", () => {
    logarComo("medico");
    render(
      <MemoryRouter initialEntries={["/medico"]}>
        <Routes>
          <Route
            path="/medico"
            element={
              <RotaProtegida papeis={["medico"]}>
                <h1>Conteúdo protegido</h1>
              </RotaProtegida>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Conteúdo protegido" })).toBeInTheDocument();
  });
});
