import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "rastria:tour:";

// Tour roda automaticamente uma vez por navegador/papel (localStorage) e pode
// ser reaberto a qualquer momento pelo botão de ajuda no DashboardLayout.
export function useGuidedTour(tourId) {
  const storageKey = `${STORAGE_PREFIX}${tourId}`;
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      setRun(true);
    }
  }, [storageKey]);

  const handleCallback = useCallback(
    ({ status }) => {
      if (status === "finished" || status === "skipped") {
        localStorage.setItem(storageKey, "1");
        setRun(false);
      }
    },
    [storageKey]
  );

  const restart = useCallback(() => setRun(true), []);

  return { run, handleCallback, restart };
}
