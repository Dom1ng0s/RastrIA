import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "../ui/ToastProvider";
import { useAuthStore } from "./store";

// Encerra a sessão automaticamente após um período sem interação do usuário —
// o app lida com dado de saúde sensível, a sessão não deveria ficar aberta
// indefinidamente num navegador destravado. Issue #92.
//
// Só age quando há usuário logado. Ao expirar, usa o mesmo `logout()` do store
// (features/auth/store.js) e manda pro /login — a proteção de rota
// (RotaProtegida.jsx) cuida do resto.
//
// TODO: com o login real, "encerrar sessão" também deve invalidar o refresh
// token no backend; hoje `logout()` só limpa o estado local.
const MIN = 60 * 1000;
const LIMITE_INATIVIDADE = 20 * MIN;
const AVISO_ANTES = 2 * MIN;
const INTERVALO_CHECAGEM = 15 * 1000;

const EVENTOS_ATIVIDADE = ["mousedown", "keydown", "scroll", "touchstart", "pointermove"];

export function SessaoInativa() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!usuario) return undefined;

    // Timestamp barato atualizado a cada evento; um intervalo confere a
    // diferença. Evita recriar timers a cada movimento do mouse.
    let ultimaAtividade = Date.now();
    let avisado = false;

    const registrarAtividade = () => {
      ultimaAtividade = Date.now();
      avisado = false;
    };

    EVENTOS_ATIVIDADE.forEach((evento) =>
      window.addEventListener(evento, registrarAtividade, { passive: true }),
    );

    const intervalo = setInterval(() => {
      const inativoHa = Date.now() - ultimaAtividade;
      if (inativoHa >= LIMITE_INATIVIDADE) {
        logout();
        navigate("/login", { replace: true });
        showToast("Sessão encerrada por inatividade", "erro");
      } else if (!avisado && inativoHa >= LIMITE_INATIVIDADE - AVISO_ANTES) {
        avisado = true;
        showToast("Sua sessão vai encerrar em breve por inatividade");
      }
    }, INTERVALO_CHECAGEM);

    return () => {
      clearInterval(intervalo);
      EVENTOS_ATIVIDADE.forEach((evento) =>
        window.removeEventListener(evento, registrarAtividade),
      );
    };
  }, [usuario, logout, navigate, showToast]);

  return null;
}
