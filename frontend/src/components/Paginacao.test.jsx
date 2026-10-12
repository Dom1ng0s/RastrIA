// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";

import { Paginacao } from "./Paginacao";
import { analisar, descreverViolacoes } from "../test/axe";

// Issue #121.

function ListaPaginada({ total = 5, inicial = 1 }) {
  const [pagina, setPagina] = useState(inicial);
  const titulo = useRef(null);
  return (
    <>
      <h2 ref={titulo}>Lista</h2>
      <p>Mostrando página {pagina}</p>
      <Paginacao paginaAtual={pagina} totalPaginas={total} aoMudarPagina={setPagina} alvoFoco={titulo} />
    </>
  );
}

describe("Paginacao", () => {
  it("passa no axe", async () => {
    const { container } = render(<ListaPaginada total={12} inicial={6} />);
    const resultado = await analisar(container);
    expect(resultado.violations, descreverViolacoes(resultado)).toHaveLength(0);
  });

  it("é uma navegação rotulada com a página atual marcada", () => {
    render(<ListaPaginada inicial={2} />);
    const nav = screen.getByRole("navigation", { name: "Paginação" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Página 1" })).not.toHaveAttribute("aria-current");
  });

  it("desabilita anterior na primeira página e próxima na última", () => {
    const { unmount } = render(<ListaPaginada inicial={1} />);
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeEnabled();
    unmount();
    render(<ListaPaginada inicial={5} />);
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
  });

  it("troca de página, leva o foco ao início da lista e anuncia a posição", async () => {
    render(<ListaPaginada />);
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));

    expect(screen.getByText("Mostrando página 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lista" })).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Página 2 de 5");

    await userEvent.click(screen.getByRole("button", { name: "Página 5" }));
    expect(screen.getByText("Mostrando página 5")).toBeInTheDocument();
  });

  it("não mostra a navegação com uma página só, mas mantém a região viva", () => {
    render(<ListaPaginada total={1} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
