(function () {
  "use strict";

  window.BRVM_RADAR_LIVE_READY = fetch("http://127.0.0.1:8787/radar-data", {
    cache: "no-store"
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => {
      if (payload && Array.isArray(payload.companies)) {
        window.BRVM_RADAR_DATA = payload;
      }
    })
    .catch(() => {});
})();
