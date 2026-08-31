import { useCallback, useEffect, useState } from "react";

// Chave ÚNICA e global (não mais uma por papel) — o tour automático aparece no
// máximo uma vez por navegador, mesmo que o apresentador troque de papel na
// demo (issue #74). Antes era `rastria:tour:<papel>`, o que disparava um popup
// na primeira visita de cada um dos 4 painéis.
//
// Fica fora do prefixo `rastria:tour:` limpo no logout (features/auth/store.js):
// como o tema, é preferência do dispositivo ("já vi a apresentação do app
// aqui"), não do usuário. O botão de ajuda (?) no header continua reabrindo o
// tour do painel atual a qualquer momento, via `restart`.
const STORAGE_KEY = "rastria:tour-visto";

// Pequeno atraso antes de abrir: dá tempo do layout assentar (a sidebar é
// `hidden md:flex`) para o Joyride medir e posicionar o primeiro tooltip
// corretamente, em vez de abrir por cima da sidebar no desktop (issue #74).
const ATRASO_INICIO_MS = 400;

export function useGuidedTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    let jaVisto = null;
    try {
      jaVisto = localStorage.getItem(STORAGE_KEY);
    } catch {
      jaVisto = null;
    }
    if (jaVisto) return undefined;

    const timer = setTimeout(() => setRun(true), ATRASO_INICIO_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleCallback = useCallback(({ status }) => {
    if (status === "finished" || status === "skipped") {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // localStorage indisponível: o tour reaparece na próxima visita, tudo bem.
      }
      setRun(false);
    }
  }, []);

  const restart = useCallback(() => setRun(true), []);

  return { run, handleCallback, restart };
}
