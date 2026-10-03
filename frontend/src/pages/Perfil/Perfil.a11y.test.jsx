// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import Perfil from "./Perfil";
import { useAuthStore } from "../../features/auth/store";
import { PREFERENCIAS, useAcessibilidadeStore } from "../../features/acessibilidade/store";
import { ToastProvider } from "../../features/ui/ToastProvider";
import { analisar, descreverViolacoes } from "../../test/axe";

// A aba Configurações › Acessibilidade é onde moram todas as preferências
// (issues #149, #138, #148) — se ela quebrar, quebra o recurso de quem mais
// depende dele. Issue #151.

function renderizar() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <MemoryRouter initialEntries={["/perfil?secao=acessibilidade"]}>
          <Routes>
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  useAcessibilidadeStore.getState().restaurarPadroes();
  useAuthStore.setState({ usuario: { papel: "usuario", instituicaoId: 1 } });
});

describe("aba Acessibilidade", () => {
  it("passa no axe", async () => {
    const { container } = renderizar();
    const resultado = await analisar(container);
    expect(resultado.violations, descreverViolacoes(resultado)).toHaveLength(0);
  });

  // Preferência nova sem toggle é preferência que não existe para o usuário.
  it("mostra um controle para cada preferência de PREFERENCIAS", () => {
    renderizar();
    const comToggle = screen.getAllByRole("switch").length;
    // `duracaoAvisos` é a única de múltipla escolha; as demais são switches.
    const booleanas = Object.values(PREFERENCIAS).filter((def) => !def.opcoes).length;
    expect(comToggle).toBeGreaterThanOrEqual(booleanas);
    // A única de múltipla escolha tem controle próprio, um <select> rotulado.
    expect(screen.getByRole("combobox", { name: "Duração dos avisos" })).toBeInTheDocument();
  });

  it("alterna a classe no <html> ao ligar uma preferência, e desfaz ao restaurar", async () => {
    renderizar();
    const toggle = screen.getByRole("switch", { name: /Filtro para daltonismo/ });
    expect(document.documentElement).not.toHaveClass("daltonismo");

    await userEvent.click(toggle);
    expect(document.documentElement).toHaveClass("daltonismo");
    expect(screen.getByRole("switch", { name: /Filtro para daltonismo/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await userEvent.click(screen.getByRole("button", { name: "Restaurar padrões" }));
    expect(document.documentElement).not.toHaveClass("daltonismo");
  });

  it("continua acessível com as preferências de exibição ligadas", async () => {
    const { container } = renderizar();
    for (const nome of [/Alto contraste/, /Fonte grande/, /Espaçamento de texto/]) {
      await userEvent.click(screen.getByRole("switch", { name: nome }));
    }
    const resultado = await analisar(container);
    expect(resultado.violations, descreverViolacoes(resultado)).toHaveLength(0);
  });

  it("leva para a página pública de acessibilidade", () => {
    renderizar();
    expect(
      screen.getByRole("link", { name: /Saiba mais sobre a acessibilidade/ }),
    ).toHaveAttribute("href", "/acessibilidade");
  });
});
