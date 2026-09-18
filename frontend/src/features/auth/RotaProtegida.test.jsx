import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { RotaProtegida } from "./RotaProtegida";
import { useAuthStore } from "./store";

// Este é o componente que aplica a segregação de acesso por papel no frontend
// (issue #61). A proteção de verdade é do backend — um papel não pode depender
// de uma guarda de rota no cliente para não ver dado de outro. Mas se esta
// guarda quebrar, um médico passa a ver o painel do Comando na demonstração, e
// isso quebra em silêncio.

const PAPEIS = ["comando", "medico", "educador-fisico", "usuario"];
const INICIAL_DO_PAPEL = {
  comando: "/gerente",
  medico: "/medico",
  "educador-fisico": "/educador-fisico",
  usuario: "/usuario",
};

/**
 * Monta as rotas reais do app em miniatura: uma rota protegida por papel, as
 * 4 telas iniciais e o /login — assim o teste observa ONDE a pessoa parou, não
 * só se o componente renderizou.
 */
function renderizarEm(rotaInicial, papeisPermitidos) {
  return render(
    <MemoryRouter initialEntries={[rotaInicial]}>
      <Routes>
        <Route path="/login" element={<p>tela de login</p>} />
        <Route element={<RotaProtegida papeis={papeisPermitidos} />}>
          <Route path="/protegida" element={<p>conteúdo protegido</p>} />
        </Route>
        {Object.entries(INICIAL_DO_PAPEL).map(([papel, caminho]) => (
          <Route key={papel} path={caminho} element={<p>inicial de {papel}</p>} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}

function logarComo(papel) {
  useAuthStore.setState({ usuario: papel ? { papel, instituicaoId: 1 } : null });
}

beforeEach(() => {
  localStorage.clear();
  logarComo(null);
});

describe("RotaProtegida — sem usuário logado", () => {
  it("manda para o login", () => {
    renderizarEm("/protegida", ["usuario"]);
    expect(screen.getByText("tela de login")).toBeInTheDocument();
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("manda para o login mesmo quando a rota não restringe papel", () => {
    // Rota comum a todos (ex: /perfil) ainda exige estar logado.
    renderizarEm("/protegida", undefined);
    expect(screen.getByText("tela de login")).toBeInTheDocument();
  });
});

describe("RotaProtegida — acesso permitido", () => {
  it.each(PAPEIS)("deixa o papel %s entrar na rota do próprio papel", (papel) => {
    logarComo(papel);
    renderizarEm("/protegida", [papel]);
    expect(screen.getByText("conteúdo protegido")).toBeInTheDocument();
  });

  it.each(PAPEIS)("deixa o papel %s entrar em rota sem restrição de papel", (papel) => {
    logarComo(papel);
    renderizarEm("/protegida", undefined);
    expect(screen.getByText("conteúdo protegido")).toBeInTheDocument();
  });

  it("deixa entrar quando o papel está numa lista com vários permitidos", () => {
    logarComo("medico");
    renderizarEm("/protegida", ["medico", "educador-fisico"]);
    expect(screen.getByText("conteúdo protegido")).toBeInTheDocument();
  });
});

describe("RotaProtegida — acesso negado", () => {
  // Matriz completa: cada papel tentando entrar na rota de cada outro papel.
  const combinacoes = PAPEIS.flatMap((papel) =>
    PAPEIS.filter((outro) => outro !== papel).map((rotaDe) => [papel, rotaDe]),
  );

  it.each(combinacoes)("nega o papel %s numa rota restrita a %s", (papel, rotaDe) => {
    logarComo(papel);
    renderizarEm("/protegida", [rotaDe]);
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it.each(combinacoes)(
    "redireciona %s para a própria tela inicial ao tentar a rota de %s",
    (papel, rotaDe) => {
      // Não é 404 nem "acesso negado": a pessoa é levada para onde ela pode estar.
      logarComo(papel);
      renderizarEm("/protegida", [rotaDe]);
      expect(screen.getByText(`inicial de ${papel}`)).toBeInTheDocument();
    },
  );

  it("nunca leva ao login quem está logado mas sem permissão", () => {
    logarComo("usuario");
    renderizarEm("/protegida", ["comando"]);
    expect(screen.queryByText("tela de login")).not.toBeInTheDocument();
  });

  it("manda papel desconhecido para o login", () => {
    logarComo("papel-inventado");
    renderizarEm("/protegida", ["usuario"]);
    expect(screen.getByText("tela de login")).toBeInTheDocument();
  });
});

describe("RotaProtegida — forma de uso", () => {
  it("funciona como wrapper de um filho, não só como rota de layout", () => {
    logarComo("usuario");
    render(
      <MemoryRouter initialEntries={["/protegida"]}>
        <Routes>
          <Route path="/login" element={<p>tela de login</p>} />
          <Route
            path="/protegida"
            element={
              <RotaProtegida papeis={["usuario"]}>
                <p>conteúdo protegido</p>
              </RotaProtegida>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("conteúdo protegido")).toBeInTheDocument();
  });
});
