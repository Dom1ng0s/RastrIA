// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { CampoBusca } from "./CampoBusca";
import { FieldError } from "./FieldError";
import { Modal } from "./Modal";
import { NotificacoesMenu } from "./NotificacoesMenu";
import { PasswordInput } from "./PasswordInput";
import { ToastProvider, useToast } from "../features/ui/ToastProvider";
import { analisar, descreverViolacoes } from "../test/axe";

// Teste de acessibilidade por componente (issue #151). Ferramenta automática
// cobre ~30–40% dos critérios WCAG — o resto está no roteiro manual em
// docs/acessibilidade/roteiro-teste.md. O que é pego aqui é regressão óbvia:
// rótulo que some, papel ARIA incompleto, botão sem nome.

async function semViolacoes(container) {
  const resultado = await analisar(container);
  expect(resultado.violations, descreverViolacoes(resultado)).toHaveLength(0);
}

describe("CampoBusca", () => {
  it("passa no axe", async () => {
    const { container } = render(
      <CampoBusca rotulo="Buscar paciente" valor="" aoMudar={() => {}} />,
    );
    await semViolacoes(container);
  });

  // O placeholder some ao digitar e não serve de rótulo (WCAG 3.3.2) — foi uma
  // das falhas que motivaram a issue.
  it("tem rótulo acessível mesmo com o rótulo visualmente oculto", () => {
    render(<CampoBusca rotulo="Buscar paciente" valor="" aoMudar={() => {}} />);
    expect(screen.getByRole("searchbox", { name: "Buscar paciente" })).toBeInTheDocument();
  });
});

describe("FieldError", () => {
  it("passa no axe e é anunciado como alerta", async () => {
    const { container } = render(<FieldError id="cpf-erro">CPF inválido</FieldError>);
    expect(screen.getByRole("alert")).toHaveTextContent("CPF inválido");
    await semViolacoes(container);
  });

  it("não deixa um alerta vazio no DOM quando não há erro", () => {
    render(<FieldError id="cpf-erro">{null}</FieldError>);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("PasswordInput", () => {
  it("passa no axe", async () => {
    const { container } = render(
      <>
        <label htmlFor="senha">Senha</label>
        <PasswordInput id="senha" />
      </>,
    );
    await semViolacoes(container);
  });

  it("o botão de olhinho muda de nome e de estado ao alternar", async () => {
    render(
      <>
        <label htmlFor="senha">Senha</label>
        <PasswordInput id="senha" />
      </>,
    );
    const botao = screen.getByRole("button", { name: "Mostrar senha" });
    expect(botao).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(botao);
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("Modal", () => {
  function ModalDeTeste() {
    return (
      <Modal tituloId="titulo" descricaoId="descricao" onClose={() => {}}>
        <h2 id="titulo">Confirmar exclusão</h2>
        <p id="descricao">Esta ação não pode ser desfeita.</p>
        <button type="button">Excluir</button>
      </Modal>
    );
  }

  it("passa no axe", async () => {
    render(<ModalDeTeste />);
    await semViolacoes(document.body);
  });

  it("é um diálogo modal nomeado pelo próprio título", () => {
    render(<ModalDeTeste />);
    expect(screen.getByRole("dialog", { name: "Confirmar exclusão" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
  });
});

describe("NotificacoesMenu", () => {
  // O menu leva para a tela de origem de cada notificação, então precisa do
  // router em volta.
  it("passa no axe fechado e aberto", async () => {
    render(
      <MemoryRouter>
        <NotificacoesMenu papel="usuario" />
      </MemoryRouter>,
    );
    await semViolacoes(document.body);

    await userEvent.click(screen.getByRole("button", { name: /Notificações/ }));
    await semViolacoes(document.body);
  });
});

describe("ToastProvider", () => {
  function Disparador() {
    const { showToast } = useToast();
    return (
      <button type="button" onClick={() => showToast("Registro salvo")}>
        Salvar
      </button>
    );
  }

  it("passa no axe com um aviso na tela", async () => {
    render(
      <ToastProvider>
        <Disparador />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Registro salvo")).toBeInTheDocument();
    await semViolacoes(document.body);
  });
});

describe("estado controlado pelo usuário", () => {
  // Garante que a busca continua acessível depois de digitar, não só no
  // primeiro render.
  function BuscaControlada() {
    const [valor, setValor] = useState("");
    return (
      <CampoBusca rotulo="Buscar colega" valor={valor} aoMudar={setValor} totalResultados={2} />
    );
  }

  it("passa no axe depois de digitar", async () => {
    const { container } = render(<BuscaControlada />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar colega" }), "ana");
    await semViolacoes(container);
  });
});
