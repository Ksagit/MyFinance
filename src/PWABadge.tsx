import { useRegisterSW } from "virtual:pwa-register/react";

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
  const period = 0;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
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
  });

  function close() {
    setNeedRefresh(false);
  }

  return (
    <div role="alert" aria-labelledby="toast-message">
      {needRefresh && (
        <div className="fixed right-0 bottom-0 m-4 p-3 border border-gray-300/50 rounded z-10 text-left shadow-md bg-white">
          <div className="mb-2">
            <span id="toast-message">
              New content available, click on reload button to update.
            </span>
          </div>
          <div className="flex justify-end">
            <button
              className="border border-gray-300/50 focus:outline-none mr-1.5 rounded-sm px-2.5 py-1 text-sm bg-gray-50 hover:bg-gray-100"
              onClick={() => updateServiceWorker(true)}
            >
              Reload
            </button>
            <button
              className="border border-gray-300/50 focus:outline-none rounded-sm px-2.5 py-1 text-sm bg-gray-50 hover:bg-gray-100"
              onClick={() => close()}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
