import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * Lint do frontend (issue #151). O foco é acessibilidade: várias falhas já
 * encontradas em auditoria (input sem rótulo, `role="menu"` sem `menuitem`,
 * `<label>` órfão) seriam pegas aqui antes da revisão humana.
 *
 * `jsx-a11y/recommended` entra inteiro, sem desligar regra globalmente — uma
 * exceção pontual e justificada vai de comentário no arquivo, onde quem lê o
 * código vê o motivo.
 *
 * Ferramenta automática cobre ~30–40% dos critérios WCAG. O resto continua
 * exigindo o roteiro manual em `docs/acessibilidade/roteiro-teste.md`.
 */
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      // Só as duas regras clássicas: o preset `recommended` do plugin hoje
      // embute as regras do React Compiler, que são outro assunto (e outra
      // issue) — misturar as duas faria `npm run lint` nascer vermelho por
      // motivo que não é acessibilidade.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      ...jsxA11y.flatConfigs.recommended.rules,
      // O projeto não usa PropTypes nem TypeScript; o contrato de cada
      // componente está no comentário de topo.
      "react/prop-types": "off",
    },
  },
  {
    // Testes rodam no Vitest com `globals: true`.
    files: ["src/**/*.test.{js,jsx}", "src/setupTests.js"],
    languageOptions: { globals: { ...globals.node, ...globals.vitest } },
  },
  {
    // Playwright e as configs de build rodam em Node, fora do navegador.
    files: ["e2e/**/*.js", "*.config.js"],
    // `browser` também: o corpo de `page.evaluate()` roda dentro da página.
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
