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

export function GuidedTour({ run, steps, callback }) {
  if (!steps?.length) return null;

  return (
    <Joyride
      run={run}
      steps={steps}
      callback={callback}
      continuous
      showProgress
      showSkipButton
      locale={joyrideLocale}
      styles={joyrideStyles}
    />
  );
}
