import { useEffect, useState } from "react";
import Joyride from "react-joyride";

const joyrideStyles = {
  options: {
    primaryColor: "#0C4A44",
    textColor: "#1B2C29",
    backgroundColor: "#FFFFFF",
    arrowColor: "#FFFFFF",
    overlayColor: "rgba(12, 74, 68, 0.55)",
    zIndex: 100,
  },
  buttonNext: { borderRadius: 8, fontWeight: 600 },
  buttonBack: { color: "#5B6B67" },
};

const joyrideLocale = {
  back: "Voltar",
  close: "Fechar",
  last: "Concluir",
  next: "Próximo",
  nextLabelWithProgress: "Próximo (passo {step} de {steps})",
  skip: "Pular",
};

// A sidebar do desktop é `hidden md:flex` — no mobile os alvos `[data-tour=...]`
// dos itens de navegação continuam no DOM, mas com display:none e
// getBoundingClientRect() zerado. Sem filtrar, o Joyride abre passos com
// spotlight de tamanho zero e tooltip solto no canto (ver issue #38).
function alvoVisivel(target) {
  if (typeof target !== "string") return true; // alvo já é um elemento/ref
  const elemento = document.querySelector(target);
  if (!elemento || elemento.offsetParent === null) return false;
  const { width, height } = elemento.getBoundingClientRect();
  return width > 0 && height > 0;
}

export function GuidedTour({ run, steps, callback }) {
  const [passosVisiveis, setPassosVisiveis] = useState([]);

  useEffect(() => {
    if (!run) {
      setPassosVisiveis([]);
      return;
    }
    // useEffect roda após o commit no DOM, então os alvos [data-tour] da página
    // já existem e o `hidden md:flex` da sidebar já está resolvido aqui.
    const visiveis = (steps ?? []).filter((passo) => alvoVisivel(passo.target));
    // O 1º passo abre direto (sem beacon), mesmo que o passo original com
    // disableBeacon tenha sido filtrado (ex.: nav-historico no mobile).
    setPassosVisiveis(
      visiveis.map((passo, indice) => (indice === 0 ? { ...passo, disableBeacon: true } : passo)),
    );
  }, [run, steps]);

  if (!run || !passosVisiveis.length) return null;

  return (
    <Joyride
      run={run}
      steps={passosVisiveis}
      callback={callback}
      continuous
      showProgress
      showSkipButton
      locale={joyrideLocale}
      styles={joyrideStyles}
    />
  );
}
