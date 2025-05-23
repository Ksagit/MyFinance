import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "./ToastContainer";

function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration
) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}

export const PWABadge = () => {
  const { addToast } = useToast();

  const period = 0;

  const {
    needRefresh: [, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
    onNeedRefresh() {
      addToast(
        "Dostępna jest nowa wersja aplikacji!",
        "info",
        0,
        "Odśwież",
        () => updateServiceWorker(true)
      );
      setNeedRefresh(true);
    },
    onOfflineReady() {
      addToast("Aplikacja jest teraz dostępna offline!", "success");
    },
  });

  return null;
};
