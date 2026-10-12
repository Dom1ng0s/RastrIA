// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LinkExterno } from "./LinkExterno";

// Issue #197: o destino do LinkExterno vem de dado (anexo da API) e passa por
// urlSegura antes de virar `href`.

describe("LinkExterno", () => {
  it("renderiza o link quando a URL é segura", () => {
    render(<LinkExterno href="/mock/exame-anexo-exemplo.png">Visualizar anexo</LinkExterno>);
    expect(screen.getByRole("link", { name: /Visualizar anexo/ })).toHaveAttribute(
      "href",
      "/mock/exame-anexo-exemplo.png",
    );
  });

  it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "http://evil.com/a.pdf"])(
    "não renderiza link para %s",
    (href) => {
      const { container } = render(<LinkExterno href={href}>Visualizar anexo</LinkExterno>);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(container.querySelector("a")).toBeNull();
    },
  );
});
