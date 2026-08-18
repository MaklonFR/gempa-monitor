/* ============================================================
   GEMPA MONITOR — MODUL UTAMA
   ============================================================
   Bagian:  STATE | FILTER | EVENT HANDLERS | INITIALIZATION
   ------------------------------------------------------------
   Modul ini berisi:
   - State management (sumber kebenaran UI).
   - Filter & sort pipeline.
   - Pagination (load more).
   - Event handlers (search debounce, filter, sort, refresh).
   - Inisialisasi aplikasi.
   ============================================================ */

"use strict";

window.GempaApp = (() => {
  const D = window.GempaData;
  const UI = window.GempaUI;
  const Map = window.GempaMap;
  const RT = window.GempaRealtime;
  const SB = window.GempaSupabase;

  /* ----------------------------------------------------------
     STATE (#23)
     ---------------------------------------------------------- */
  const state = {
    earthquakes: [],
    filteredEarthquakes: [],
    currentPage: 1,
    pageSize: D.CONFIG.PAGE_SIZE,
    sortBy: "latest",
    magnitudeFilter: "all",
    tsunamiFilter: "all",
    search: "",
    tanggalFilter: "",
    selectedEarthquake: null,
    isLoading: true,
    lastUpdated: null,
    newIds: new Set(),
  };

  /* ----------------------------------------------------------
     DOM REFS
     ---------------------------------------------------------- */
  let els = {};

  /* ----------------------------------------------------------
     PIPELINE: FILTER + SORT + PAGINATION
     ---------------------------------------------------------- */

  function applyFilters() {
    const filtered = D.filterEarthquakes(state.earthquakes, {
      magnitude: state.magnitudeFilter,
      tsunami: state.tsunamiFilter,
      search: state.search,
      tanggal: state.tanggalFilter,
    });
    state.filteredEarthquakes = D.sortEarthquakes(filtered, state.sortBy);
    state.currentPage = 1;
    render();
  }

  function render() {
    // Hero
    const latest = D.getLatestEarthquake(state.earthquakes);
    UI.renderHero(latest);

    // Stats
    const stats = D.getMagnitudeStats(state.earthquakes);
    UI.renderStats(stats);

    // List
    UI.renderEarthquakes(
      state.filteredEarthquakes,
      state.currentPage,
      state.pageSize,
      state.newIds
    );

    // Map
    Map.renderMarkers(state.earthquakes);

    // Result count
    const resultCount = document.getElementById("result-count");
    if (resultCount) {
      resultCount.textContent = `${state.filteredEarthquakes.length} gempa ditampilkan`;
    }

    // Last updated
    updateLastUpdated();
  }

  function updateLastUpdated() {
    const el = document.getElementById("last-updated");
    if (el) {
      el.textContent = state.lastUpdated
        ? `Last updated: ${D.formatLastUpdated(state.lastUpdated)}`
        : "Last updated: -";
    }
  }

  /* ----------------------------------------------------------
     REALTIME CALLBACKS
     ---------------------------------------------------------- */

  function onData(list, { hasNew, newOnes }) {
    const wasEmpty = state.earthquakes.length === 0;
    state.lastUpdated = new Date();
    state.isLoading = false;

    // Deteksi data baru (toast) — dijalankan sebelum simpan ke Supabase
    if (hasNew && !wasEmpty) {
      newOnes.forEach((eq) => state.newIds.add(eq.id));

      const strong = newOnes.filter((eq) => eq.magnitude >= 5);
      if (strong.length > 0) {
        const top = strong[0];
        UI.showToast({
          title: "GEMPA BARU",
          message: `M ${top.magnitude.toFixed(1)} • ${top.wilayah}`,
          type: "warning",
          duration: 6000,
        });
      } else {
        UI.showToast({
          title: "Gempa baru terdeteksi",
          message: `${newOnes.length} gempa baru ditemukan`,
          type: "info",
        });
      }
    } else if (wasEmpty) {
      UI.showToast({
        title: "Data berhasil dimuat",
        message: `${list.length} gempa ditemukan`,
        type: "success",
      });
    }

    // Simpan data ke database Supabase (jika dikonfigurasi),
    // lalu render ulang dari database agar data yang tampil
    // selalu berasal dari Supabase.
    if (SB && SB.isReady()) {
      SB.saveEarthquakes(list).then((res) => {
        if (res.ok) {
          console.log(`[GempaMonitor] ${res.count} gempa disimpan ke Supabase`);
          // Ambil ulang dari database & render
          SB.fetchEarthquakes().then((rows) => {
            if (rows.length > 0) {
              const normalized = D.normalizeEarthquakes(rows);
              if (normalized.length > 0) {
                state.earthquakes = normalized;
                UI.clearError();
                populateTanggalOptions();
                applyFilters();
                RT.startCountdown();
              }
            }
          });
        }
      });
      return; // data ditampilkan dari Supabase, bukan dari BMKG langsung
    }

    // Fallback: tanpa Supabase, tampilkan data BMKG langsung
    state.earthquakes = list;

    // Bersihkan error
    UI.clearError();

    // Populate tanggal options
    populateTanggalOptions();

    // Render
    applyFilters();

    // Countdown reset
    RT.startCountdown();
  }

  function onError(err) {
    state.isLoading = false;
    UI.renderError(
      err?.message || "Koneksi data bermasalah",
      state.lastUpdated
    );
  }

  /* ----------------------------------------------------------
     FILTER UI HANDLERS
     ---------------------------------------------------------- */

  function handleMagnitudeFilter(value) {
    state.magnitudeFilter = value;
    applyFilters();
  }

  function handleTsunamiFilter(value) {
    state.tsunamiFilter = value;
    applyFilters();
  }

  function handleSort(value) {
    state.sortBy = value;
    applyFilters();
  }

  function handleSearch(value) {
    state.search = value;
    applyFilters();
  }

  function handleTanggalFilter(value) {
    state.tanggalFilter = value;
    applyFilters();
  }

  function resetFilters() {
    state.magnitudeFilter = "all";
    state.tsunamiFilter = "all";
    state.search = "";
    state.tanggalFilter = "";
    state.sortBy = "latest";
    state.currentPage = 1;

    // Reset UI controls
    const magSelect = document.getElementById("filter-magnitude");
    if (magSelect) magSelect.value = "all";
    const tsunamiSelect = document.getElementById("filter-tsunami");
    if (tsunamiSelect) tsunamiSelect.value = "all";
    const sortSelect = document.getElementById("sort-by");
    if (sortSelect) sortSelect.value = "latest";
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";
    const tanggalSelect = document.getElementById("filter-tanggal");
    if (tanggalSelect) tanggalSelect.value = "";

    applyFilters();
  }

  /* ----------------------------------------------------------
     TANGGAL OPTIONS
     ---------------------------------------------------------- */

  function populateTanggalOptions() {
    const select = document.getElementById("filter-tanggal");
    if (!select) return;

    const dates = [...new Set(state.earthquakes.map((eq) => eq.tanggal))].sort(
      (a, b) => {
        const da = D.toDate(
          state.earthquakes.find((e) => e.tanggal === a)?.dateTime
        );
        const db = D.toDate(
          state.earthquakes.find((e) => e.tanggal === b)?.dateTime
        );
        return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
      }
    );

    select.innerHTML = `
      <option value="">Semua Tanggal</option>
      ${dates
        .map((d) => `<option value="${D.escapeHtml(d)}">${D.escapeHtml(d)}</option>`)
        .join("")}`;
  }

  /* ----------------------------------------------------------
     EVENT HANDLERS
     ---------------------------------------------------------- */

  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function bindEvents() {
    // Search (debounce 300ms)
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounce((e) => handleSearch(e.target.value), 300)
      );
    }

    // Filter magnitude
    const magSelect = document.getElementById("filter-magnitude");
    if (magSelect) {
      magSelect.addEventListener("change", (e) =>
        handleMagnitudeFilter(e.target.value)
      );
    }

    // Filter tsunami
    const tsunamiSelect = document.getElementById("filter-tsunami");
    if (tsunamiSelect) {
      tsunamiSelect.addEventListener("change", (e) =>
        handleTsunamiFilter(e.target.value)
      );
    }

    // Filter tanggal
    const tanggalSelect = document.getElementById("filter-tanggal");
    if (tanggalSelect) {
      tanggalSelect.addEventListener("change", (e) =>
        handleTanggalFilter(e.target.value)
      );
    }

    // Sort
    const sortSelect = document.getElementById("sort-by");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => handleSort(e.target.value));
    }

    // Reset filter
    const resetBtn = document.getElementById("reset-filter-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    // Reset filter dari empty state (custom event)
    document.addEventListener("gempa:reset-filters", resetFilters);

    // Refresh manual
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        refreshBtn.disabled = true;
        const icon = refreshBtn.querySelector("svg");
        if (icon) icon.classList.add("animate-spin");
        RT.loadEarthquakeData().finally(() => {
          refreshBtn.disabled = false;
          if (icon) icon.classList.remove("animate-spin");
        });
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => UI.toggleTheme());
    }

    // Event delegation untuk kartu gempa (klik → detail)
    const listEl = document.getElementById("earthquake-list");
    if (listEl) {
      listEl.addEventListener("click", (e) => {
        const card = e.target.closest(".earthquake-card");
        if (!card) return;
        const id = card.dataset.id;
        const eq = state.earthquakes.find((item) => item.id === id);
        if (eq) {
          state.selectedEarthquake = eq;
          UI.showEarthquakeDetail(eq);
        }
      });
    }

    // Load more
    const loadMoreWrap = document.getElementById("load-more-wrap");
    if (loadMoreWrap) {
      loadMoreWrap.addEventListener("click", (e) => {
        if (e.target.closest("#load-more-btn")) {
          state.currentPage += 1;
          UI.renderEarthquakes(
            state.filteredEarthquakes,
            state.currentPage,
            state.pageSize,
            state.newIds
          );
        }
      });
    }
  }

  /* ----------------------------------------------------------
     CLOCK
     ---------------------------------------------------------- */

  function startClock() {
    const el = document.getElementById("clock");
    if (!el) return;
    const update = () => {
      el.textContent = `${D.formatClockWIB()} WIB`;
    };
    update();
    setInterval(update, 1000);
  }

  /* ----------------------------------------------------------
     INITIALIZATION
     ---------------------------------------------------------- */

  async function init() {
    // Kumpulkan refs
    els = {
      hero: document.getElementById("hero"),
      stats: document.getElementById("stats"),
      list: document.getElementById("earthquake-list"),
      status: document.getElementById("status-area"),
      toastContainer: document.getElementById("toast-container"),
      modal: document.getElementById("modal"),
      themeIcon: document.getElementById("theme-icon"),
      scrollTop: document.getElementById("scroll-top"),
    };

    // Init UI
    UI.init(els);

    // Theme
    UI.applyTheme(UI.getStoredTheme());

    // Skeleton loading
    UI.renderSkeleton();

    // Map
    Map.init("map");

    // Clock
    startClock();

    // Scroll top
    UI.initScrollTop();

    // Bind events
    bindEvents();

    // Online/offline
    RT.initOnlineStatus();

    // Init Supabase (jika dikonfigurasi)
    if (SB) {
      const sbReady = await SB.init();
      if (sbReady) {
        // Ambil data dari database Supabase
        const dbData = await SB.fetchEarthquakes();
        if (dbData.length > 0) {
          // Normalisasi data dari DB → struktur internal
          const normalized = D.normalizeEarthquakes(dbData);
          if (normalized.length > 0) {
            state.earthquakes = normalized;
            state.lastUpdated = new Date();
            state.isLoading = false;
            applyFilters();
            UI.showToast({
              title: "Data dari database",
              message: `${normalized.length} gempa dimuat dari Supabase`,
              type: "success",
            });
          }
        }

        // Subscribe realtime ke perubahan tabel gempa
        SB.subscribeRealtime((payload) => {
          console.log("[GempaMonitor] Perubahan realtime:", payload.eventType);
          // Muat ulang data dari database saat ada perubahan
          SB.fetchEarthquakes().then((rows) => {
            if (rows.length > 0) {
              const normalized = D.normalizeEarthquakes(rows);
              if (normalized.length > 0) {
                state.earthquakes = normalized;
                state.lastUpdated = new Date();
                applyFilters();
              }
            }
          });
        });
      }
    }

    // Start realtime (polling BMKG)
    RT.start(onData, onError);
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    init,
    state,
    applyFilters,
    resetFilters,
  };
})();

/* ----------------------------------------------------------
   BOOTSTRAP
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  window.GempaApp.init();
});