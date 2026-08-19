/* ============================================================
   GEMPA MONITOR — MODUL REALTIME
   ============================================================
   Bagian:  REALTIME
   ------------------------------------------------------------
   Modul ini berisi:
   - Fetch data dari API BMKG (dengan fallback ke data lokal).
   - Polling otomatis (setInterval).
   - Countdown "next update".
   - Deteksi gempa baru (bandingkan DateTime terbaru).
   - Status online/offline.
   ============================================================ */

"use strict";

window.GempaRealtime = (() => {
  const D = window.GempaData;

  let pollTimer = null;
  let countdownTimer = null;
  let nextUpdateAt = 0;
  let onDataCallback = null;
  let onErrorCallback = null;
  let lastKnownLatest = null; // DateTime terbaru yang sudah diproses

  /* ----------------------------------------------------------
     FETCH DATA
     ---------------------------------------------------------- */

  /**
   * Ambil data dari API BMKG.
   * Jika API_URL null → gunakan data lokal.
   * Jika fetch gagal → throw (ditangani caller).
   */
  async function fetchEarthquakeData() {
    const { API_URL } = D.CONFIG;

    if (!API_URL) {
      // Mode demo: gunakan data lokal
      return D.LOCAL_DATA;
    }

    const response = await fetch(API_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Gagal mengambil data gempa");
    }
    return response.json();
  }

  /* ----------------------------------------------------------
     DETEKSI DATA BARU
     ---------------------------------------------------------- */

  /**
   * Bandingkan DateTime gempa terbaru dengan data sebelumnya.
   * Return array gempa baru (yang belum pernah terlihat).
   */
  function detectNewEarthquakes(prevLatest, newList) {
    if (!prevLatest) return [];
    const latest = D.getLatestEarthquake(newList);
    if (!latest) return [];

    // Jika DateTime terbaru sama → tidak ada data baru
    if (latest.dateTime === prevLatest) return [];

    // Kumpulkan semua gempa yang lebih baru dari prevLatest
    const prevTime = D.toDate(prevLatest);
    if (!prevTime) return [];

    return newList.filter((eq) => {
      if (!eq.date) return false;
      return eq.date.getTime() > prevTime.getTime();
    });
  }

  /* ----------------------------------------------------------
     POLLING
     ---------------------------------------------------------- */

  /**
   * Muat data gempa (dipanggil manual & oleh interval).
   * onData(list, isNewData) dipanggil saat sukses.
   * onError(err) dipanggil saat gagal.
   */
  async function loadEarthquakeData() {
    try {
      const payload = await fetchEarthquakeData();
      const rawList = D.extractEarthquakes(payload);
      const normalized = D.normalizeEarthquakes(rawList);

      if (!normalized.length) {
        throw new Error("Data gempa kosong");
      }

      // Deteksi data baru
      const newOnes = detectNewEarthquakes(lastKnownLatest, normalized);
      const hasNew = newOnes.length > 0;

      // Update lastKnownLatest
      const latest = D.getLatestEarthquake(normalized);
      if (latest) lastKnownLatest = latest.dateTime;

      // Panggil callback
      if (onDataCallback) {
        onDataCallback(normalized, { hasNew, newOnes });
      }

      return { ok: true, hasNew, newOnes };
    } catch (err) {
      if (onErrorCallback) onErrorCallback(err);
      return { ok: false, error: err };
    }
  }

  /* ----------------------------------------------------------
     COUNTDOWN
     ---------------------------------------------------------- */

  function startCountdown() {
    stopCountdown();
    nextUpdateAt = Date.now() + D.CONFIG.REFRESH_INTERVAL;

    const update = () => {
      const remaining = Math.max(0, nextUpdateAt - Date.now());
      const seconds = Math.ceil(remaining / 1000);
      const el = document.getElementById("next-update");
      if (el) {
        el.textContent = `Next update in ${seconds}s`;
      }
      if (remaining <= 0) {
        // Saatnya refresh
        loadEarthquakeData();
        nextUpdateAt = Date.now() + D.CONFIG.REFRESH_INTERVAL;
      }
    };

    update();
    countdownTimer = setInterval(update, 1000);
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  /* ----------------------------------------------------------
     START / STOP
     ---------------------------------------------------------- */

  function start(onData, onError) {
    onDataCallback = onData;
    onErrorCallback = onError;

    // Muat data pertama kali
    loadEarthquakeData();

    // Mulai polling
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(loadEarthquakeData, D.CONFIG.REFRESH_INTERVAL);

    // Countdown
    startCountdown();
  }

  function stop() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    stopCountdown();
  }

  /**
   * Set nilai terakhir yang sudah diproses (dari luar).
   * Dipakai agar sinkron dengan data yang diambil dari Supabase.
   */
  function setLastKnownLatest(dateTime) {
    lastKnownLatest = dateTime;
  }

  /* ----------------------------------------------------------
     ONLINE / OFFLINE
     ---------------------------------------------------------- */

  function initOnlineStatus() {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      const el = document.getElementById("offline-banner");
      if (!el) return;

      if (isOnline) {
        el.classList.add("hidden");
      } else {
        el.classList.remove("hidden");
        // Saat offline, coba muat ulang saat kembali online
      }
    };

    window.addEventListener("online", () => {
      updateStatus();
      loadEarthquakeData();
      const UI = window.GempaUI;
      if (UI) {
        UI.showToast({
          title: "Koneksi kembali",
          message: "Memperbarui data gempa...",
          type: "success",
        });
      }
    });

    window.addEventListener("offline", () => {
      updateStatus();
      const UI = window.GempaUI;
      if (UI) {
        UI.showToast({
          title: "Offline",
          message: "Menampilkan data terakhir",
          type: "warning",
        });
      }
    });

    updateStatus();
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    fetchEarthquakeData,
    loadEarthquakeData,
    detectNewEarthquakes,
    start,
    stop,
    setLastKnownLatest,
    startCountdown,
    stopCountdown,
    initOnlineStatus,
  };
})();
