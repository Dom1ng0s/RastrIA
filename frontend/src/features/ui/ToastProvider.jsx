import { Check, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { useAcessibilidadeStore } from "../acessibilidade/store";
import { ID_CONTEUDO } from "../../lib/navegacaoTeclado";

const ToastContext = createContext(null);

/**
 * Avisos temporários (toasts) — issue #142.
 *
 * - As duas regiões `aria-live` existem desde a carga, vazias: região criada
 *   junto com o texto costuma não ser lida (NVDA+Chrome, VoiceOver iOS).
 *   Sucesso vai para `role="status"` (polite); erro para `role="alert"`
 *   (assertive). `aria-atomic="false"` para ler só o aviso novo, não a pilha.
 * - Sucesso some depois de `duracaoAvisos` segundos (Configurações ›
 *   Acessibilidade; 0 = até fechar). Erro sempre fica até o usuário fechar.
 * - O tempo pausa com o ponteiro ou o foco sobre o aviso (WCAG 2.2.1).
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((mensagem, tipo = "sucesso") => {
    const id = Date.now() + Math.random();
    setToasts((atual) => [...atual, { id, mensagem, tipo }]);
  }, []);

  const remover = useCallback((id) => {
    setToasts((atual) => atual.filter((t) => t.id !== id));
  }, []);

  const erros = toasts.filter((t) => t.tipo === "erro");
  const sucessos = toasts.filter((t) => t.tipo !== "erro");

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div data-pilha-avisos className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] flex-col gap-2">
        <div role="alert" aria-live="assertive" aria-atomic="false" className="flex flex-col gap-2">
          {erros.map((toast) => (
            <Toast key={toast.id} toast={toast} onFechar={remover} />
          ))}
        </div>
        <div role="status" aria-live="polite" aria-atomic="false" className="flex flex-col gap-2">
          {sucessos.map((toast) => (
            <Toast key={toast.id} toast={toast} onFechar={remover} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onFechar }) {
  const erro = toast.tipo === "erro";
  const segundos = useAcessibilidadeStore((state) => state.duracaoAvisos);
  // Lida uma vez: mudar a preferência não reinicia avisos já na tela.
  const duracaoMs = useRef(erro ? 0 : segundos * 1000);

  const restanteMs = useRef(duracaoMs.current);
  const inicio = useRef(0);
  const timer = useRef(null);
  const pausas = useRef(0); // ponteiro e foco podem pausar ao mesmo tempo

  const retomar = useCallback(() => {
    if (!duracaoMs.current || timer.current) return;
    inicio.current = Date.now();
    timer.current = setTimeout(() => onFechar(toast.id), restanteMs.current);
  }, [onFechar, toast.id]);

  const pausar = () => {
    pausas.current += 1;
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    restanteMs.current -= Date.now() - inicio.current;
  };

  const soltar = () => {
    pausas.current = Math.max(0, pausas.current - 1);
    if (pausas.current === 0) retomar();
  };

  useEffect(() => {
    retomar();
    // Zerar a ref, não só cancelar: no StrictMode o efeito roda duas vezes e,
    // com a ref ainda preenchida, o segundo `retomar` não armaria o timer.
    return () => {
      clearTimeout(timer.current);
      timer.current = null;
    };
  }, [retomar]);

  // Fechar pelo botão tira o elemento focado da tela: o foco vai para o
  // próximo aviso, se houver, senão para o conteúdo da página — nunca <body>.
  const fecharPeloBotao = (evento) => {
    const pilha = evento.currentTarget.closest("[data-pilha-avisos]");
    const outros = [...(pilha?.querySelectorAll("[data-fechar-aviso]") ?? [])].filter(
      (botao) => botao !== evento.currentTarget,
    );
    onFechar(toast.id);
    requestAnimationFrame(() => {
      if (outros[0]) outros[0].focus();
      else document.getElementById(ID_CONTEUDO)?.focus({ preventScroll: true });
    });
  };

  return (
    <div
      onMouseEnter={pausar}
      onMouseLeave={soltar}
      onFocus={pausar}
      onBlur={soltar}
      className="animate-toast-in flex items-center gap-2.5 rounded-lg bg-white py-3 pl-4 pr-2 text-sm font-medium text-text-dark shadow-lg ring-1 ring-line"
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          erro ? "badge-alterado" : "badge-normal"
        }`}
      >
        {erro ? <X size={13} /> : <Check size={13} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="sr-only">{erro ? "Erro: " : "Sucesso: "}</span>
        {toast.mensagem}
      </span>
      <button
        type="button"
        data-fechar-aviso
        onClick={fecharPeloBotao}
        aria-label="Fechar aviso"
        className="shrink-0 rounded p-1 text-text-muted hover:bg-bg-tint hover:text-text-dark"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast precisa ser usado dentro de <ToastProvider>");
  }
  return context;
}
