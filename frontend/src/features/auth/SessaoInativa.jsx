import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Modal } from "../../components/Modal";
import { useAuthStore } from "./store";

// Encerra a sessão automaticamente após um período sem interação do usuário —
// o app lida com dado de saúde sensível, a sessão não deveria ficar aberta
// indefinidamente num navegador destravado. Issues #92 e #143.
//
// Decisão do time (23/09/2026, #143): 30 minutos sem atividade, com um pop-up
// dois minutos antes oferecendo "Renovar sessão". O limite é fixo (não é
// preferência do usuário); o pop-up é o que atende o WCAG 2.2.1 — aviso com
// tempo de sobra e uma ação simples para estender. Antes o aviso era um toast
// de 3,5 s, sem botão, e a única forma de estender era mexer o mouse sem saber.
//
// Com o pop-up aberto, atividade FORA dele não renova: a renovação tem que ser
// explícita ("Renovar sessão", Esc ou clique no fundo — todos renovam). Senão
// um movimento acidental do mouse fecharia o aviso sem a pessoa ler.
//
// Só age quando há usuário logado. Ao expirar, usa o mesmo `logout()` do store
// e manda para o /login, que explica o motivo (ver Login.jsx). O motivo vai
// por sessionStorage, não pelo `state` da navegação: o React Router v7 navega
// como transition, o store de auth atualiza na hora, e a RotaProtegida da tela
// atual redirecionava para /login com o próprio `state`, apagando o nosso.
//
// TODO: com o login real, "Renovar sessão" deve renovar o token no backend e
// "encerrar sessão" deve invalidar o refresh token (#105); hoje `logout()` só
// limpa o estado local.
export const MINUTOS_LIMITE_SESSAO = 30;

const MIN = 60 * 1000;
const LIMITE_INATIVIDADE = MINUTOS_LIMITE_SESSAO * MIN;
const AVISO_ANTES = 2 * MIN;
const INTERVALO_CHECAGEM = 15 * 1000;

const EVENTOS_ATIVIDADE = ["mousedown", "keydown", "scroll", "touchstart", "pointermove"];

const CHAVE_SESSAO_EXPIRADA = "rastria:sessao-expirada";

function marcarSessaoExpirada() {
  try {
    sessionStorage.setItem(CHAVE_SESSAO_EXPIRADA, "1");
  } catch {
    // sessionStorage indisponível: o Login só não explica o motivo.
  }
}

/** Lida pelo Login: a sessão anterior terminou por inatividade? */
export function sessaoExpirouPorInatividade() {
  try {
    return sessionStorage.getItem(CHAVE_SESSAO_EXPIRADA) === "1";
  } catch {
    return false;
  }
}

/** Apaga a marca depois que o Login mostrou a mensagem. */
export function esquecerSessaoExpirada() {
  try {
    sessionStorage.removeItem(CHAVE_SESSAO_EXPIRADA);
  } catch {
    // idem
  }
}

function formatarRestante(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  if (minutos === 0) return `${resto} segundos`;
  return resto === 0 ? `${minutos} min` : `${minutos} min ${resto} s`;
}

export function SessaoInativa() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // null = sem aviso na tela; número = ms que faltam para expirar.
  const [restanteMs, setRestanteMs] = useState(null);
  const avisoAberto = restanteMs !== null;
  const avisoAbertoRef = useRef(false);
  avisoAbertoRef.current = avisoAberto;
  const ultimaAtividade = useRef(Date.now());

  useEffect(() => {
    if (!usuario) return undefined;
    ultimaAtividade.current = Date.now();

    // Timestamp barato atualizado a cada evento; um intervalo confere a
    // diferença. Evita recriar timers a cada movimento do mouse.
    const registrarAtividade = () => {
      if (!avisoAbertoRef.current) ultimaAtividade.current = Date.now();
    };
    EVENTOS_ATIVIDADE.forEach((evento) =>
      window.addEventListener(evento, registrarAtividade, { passive: true }),
    );

    const intervalo = setInterval(() => {
      const inativoHa = Date.now() - ultimaAtividade.current;
      if (inativoHa >= LIMITE_INATIVIDADE) {
        setRestanteMs(null);
        marcarSessaoExpirada();
        navigate("/login", { replace: true });
        logout();
      } else if (inativoHa >= LIMITE_INATIVIDADE - AVISO_ANTES) {
        setRestanteMs(LIMITE_INATIVIDADE - inativoHa);
      }
    }, INTERVALO_CHECAGEM);

    return () => {
      clearInterval(intervalo);
      EVENTOS_ATIVIDADE.forEach((evento) =>
        window.removeEventListener(evento, registrarAtividade),
      );
    };
  }, [usuario, logout, navigate]);

  if (!usuario || !avisoAberto) return null;

  const renovar = () => {
    ultimaAtividade.current = Date.now();
    setRestanteMs(null);
  };
  const sairAgora = () => {
    setRestanteMs(null);
    navigate("/login", { replace: true });
    logout();
  };

  return (
    <Modal
      papel="alertdialog"
      tituloId="sessao-expirando-titulo"
      descricaoId="sessao-expirando-descricao"
      seletorFocoInicial="[data-renovar-sessao]"
      onClose={renovar}
      className="w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-xl"
    >
      <h2 id="sessao-expirando-titulo" className="mb-2 text-lg font-semibold text-primary">
        Sua sessão está prestes a expirar
      </h2>
      <p id="sessao-expirando-descricao" className="mb-6 text-sm text-text-muted">
        Por segurança, a sessão é encerrada após {MINUTOS_LIMITE_SESSAO} minutos sem atividade. Ela será
        encerrada em <strong className="text-text-dark">{formatarRestante(restanteMs)}</strong>.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={sairAgora}
          className="flex-1 rounded-lg border border-line py-2.5 text-sm font-semibold text-text-dark"
        >
          Sair agora
        </button>
        <button
          type="button"
          data-renovar-sessao
          onClick={renovar}
          className="btn-primary flex-1 rounded-lg py-2.5 text-sm font-semibold"
        >
          Renovar sessão
        </button>
      </div>
    </Modal>
  );
}
