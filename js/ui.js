/* ============================================================
   GEMPA MONITOR — MODUL UI
   ============================================================
   Bagian:  RENDER | UI | THEME | TOAST | MODAL
   ------------------------------------------------------------
   Modul ini berisi semua fungsi rendering DOM dan komponen UI:
   - renderHero (gempa terbaru)
   - renderStats (4 kartu statistik)
   - renderEarthquakes (daftar gempa + pagination)
   - renderSkeleton / renderEmpty / renderError
   - showToast (notifikasi reusable)
   - showEarthquakeDetail (modal/drawer)
   - Theme (dark/light mode + localStorage)
   - Scroll-to-top button
   ============================================================ */

"use strict";

window.GempaUI = (() => {
  const D = window.GempaData;

  /* ----------------------------------------------------------
     DOM REFS (diisi saat init)
     ---------------------------------------------------------- */
  let els = {};

  function init(refs) {
    els = refs;
  }

  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */

  /** Ikon status tsunami (dengan teks, tidak hanya warna). */
  function tsunamiBadge(potensi) {
    // "Tidak berpotensi tsunami" mengandung kata "berpotensi",
    // jadi pengecekan "berpotensi" harus mengecualikan yang diawali "tidak".
    const isTsunami = /berpotensi/i.test(potensi) && !/tidak/i.test(potensi);
    const isTidak = /tidak/i.test(potensi);
    if (isTsunami) {
      return `<span class="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
        <span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true"></span>
        Berpotensi tsunami
      </span>`;
    }
    if (isTidak) {
      return `<span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
        <span class="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
        Tidak berpotensi tsunami
      </span>`;
    }
    return `<span class="inline-flex items-center gap-1.5 rounded-full border border-slate-500/40 bg-slate-500/15 px-3 py-1 text-xs font-semibold text-slate-400">
      <span class="h-2 w-2 rounded-full bg-slate-500" aria-hidden="true"></span>
      ${D.escapeHtml(potensi)}
    </span>`;
  }

  /** Format koordinat tampilan: "-7.85, 120.47" */
  function formatCoords(eq) {
    if (eq.lat !== null && eq.lon !== null) {
      return `${eq.lat.toFixed(2)}, ${eq.lon.toFixed(2)}`;
    }
    return D.escapeHtml(eq.coordinates);
  }

  /* ----------------------------------------------------------
     SKELETON LOADING
     ---------------------------------------------------------- */

  function skeletonBlock(extra = "") {
    return `<div class="animate-pulse rounded-xl bg-slate-800/60 ${extra}"></div>`;
  }

  function renderSkeleton() {
    if (!els.hero || !els.stats || !els.list) return;

    // Hero skeleton
    els.hero.innerHTML = `
      <div class="space-y-4">
        ${skeletonBlock("h-4 w-32")}
        ${skeletonBlock("h-20 w-40 mx-auto")}
        ${skeletonBlock("h-6 w-64 mx-auto")}
        ${skeletonBlock("h-4 w-48 mx-auto")}
        <div class="flex justify-center gap-3 pt-2">
          ${skeletonBlock("h-8 w-28")}
          ${skeletonBlock("h-8 w-28")}
        </div>
      </div>`;

    // Stats skeleton
    els.stats.innerHTML = Array.from({ length: 4 })
      .map(
        () => `
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          ${skeletonBlock("h-3 w-20 mb-2")}
          ${skeletonBlock("h-8 w-16")}
        </div>`
      )
      .join("");

    // List skeleton
    els.list.innerHTML = Array.from({ length: 5 })
      .map(
        () => `
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div class="flex items-start gap-4">
            ${skeletonBlock("h-14 w-14 rounded-xl shrink-0")}
            <div class="flex-1 space-y-2">
              ${skeletonBlock("h-4 w-3/4")}
              ${skeletonBlock("h-3 w-1/2")}
              ${skeletonBlock("h-3 w-2/3")}
            </div>
          </div>
        </div>`
      )
      .join("");
  }

  /* ----------------------------------------------------------
     HERO — GEMPA TERBARU
     ---------------------------------------------------------- */

  function renderHero(eq) {
    if (!els.hero) return;
    if (!eq) {
      els.hero.innerHTML = `
        <div class="text-center py-8">
          <p class="text-slate-400">Belum ada data gempa</p>
        </div>`;
      return;
    }

    const magClass = D.getMagnitudeClass(eq.magnitude);
    const textColor = D.getMagnitudeTextColor(eq.magnitude);
    const isSevere = eq.magnitude >= 7;
    const pulseClass = isSevere ? "animate-pulse" : "";

    els.hero.innerHTML = `
      <div class="text-center">
        <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Gempa Terbaru
        </p>

        <div class="relative mx-auto mb-2 w-fit">
          <div class="absolute inset-0 -z-10 rounded-full bg-orange-500/10 blur-2xl" aria-hidden="true"></div>
          <p class="text-7xl font-black leading-none ${textColor} ${pulseClass}">
            ${eq.magnitude.toFixed(1)}
          </p>
        </div>
        <p class="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">Magnitude</p>

        <h2 class="mx-auto mb-3 max-w-md text-lg font-bold leading-snug text-white sm:text-xl">
          ${eq.wilayah}
        </h2>

        <p class="mb-5 text-sm text-slate-400">
          ${D.escapeHtml(eq.tanggal)} • ${D.escapeHtml(eq.jam)}
        </p>

        <div class="mx-auto mb-5 grid max-w-sm grid-cols-2 gap-3">
          <div class="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Kedalaman</p>
            <p class="mt-1 text-sm font-semibold text-slate-200">${D.escapeHtml(eq.kedalaman)}</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Koordinat</p>
            <p class="mt-1 text-sm font-semibold text-slate-200">${formatCoords(eq)}</p>
          </div>
        </div>

        <div class="flex justify-center">
          ${tsunamiBadge(eq.potensi)}
        </div>
      </div>`;
  }

  /* ----------------------------------------------------------
     STATISTIK
     ---------------------------------------------------------- */

  function renderStats(stats) {
    if (!els.stats) return;

    const cards = [
      {
        label: "Total Gempa",
        value: String(stats.total),
        icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6l5.25 3.15L17 14.92l-4-2.4V7z",
        accent: "text-sky-400",
      },
      {
        label: "Gempa M5+",
        value: String(stats.m5Plus),
        icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6l5.25 3.15L17 14.92l-4-2.4V7z",
        accent: "text-yellow-400",
      },
      {
        label: "Magnitude Terbesar",
        value: stats.largestMagnitude !== null ? stats.largestMagnitude.toFixed(1) : "-",
        icon: "M12 2L1 21h22L12 2zm0 4.2L18.5 19h-13L12 6.2z",
        accent: "text-orange-400",
      },
      {
        label: "Kedalaman Terdangkal",
        value: stats.shallowestDepth !== null ? `${stats.shallowestDepth} km` : "-",
        icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        accent: "text-emerald-400",
      },
    ];

    els.stats.innerHTML = cards
      .map(
        (c) => `
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20">
          <div class="mb-2 flex items-center gap-2">
            <svg class="h-4 w-4 ${c.accent}" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="${c.icon}"/>
            </svg>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">${c.label}</p>
          </div>
          <p class="text-2xl font-bold text-white">${c.value}</p>
        </div>`
      )
      .join("");
  }

  /* ----------------------------------------------------------
     DAFTAR GEMPA
     ---------------------------------------------------------- */

  function earthquakeCard(eq, isNew = false) {
    const textColor = D.getMagnitudeTextColor(eq.magnitude);
    const badge = D.getMagnitudeBadgeClass(eq.magnitude);
    const newHighlight = isNew
      ? "ring-2 ring-orange-500/60 border-orange-500/50"
      : "border-slate-800 hover:border-slate-700";

    return `
      <button
        type="button"
        class="earthquake-card group w-full rounded-2xl border bg-slate-900 p-4 text-left shadow-lg shadow-black/20 transition-all duration-200 hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-[0.99] ${newHighlight}"
        data-id="${D.escapeHtml(eq.id)}"
        aria-label="Detail gempa ${eq.magnitude.toFixed(1)} SR, ${D.escapeHtml(eq.wilayah)}"
      >
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border ${badge}">
            <span class="text-lg font-black leading-none">${eq.magnitude.toFixed(1)}</span>
            <span class="text-[9px] font-semibold uppercase tracking-wider">Mag</span>
          </div>

          <div class="min-w-0 flex-1">
            <p class="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-white">
              ${eq.wilayah}
            </p>
            <p class="mb-2 text-xs text-slate-400">
              ${D.escapeHtml(eq.tanggal)} • ${D.escapeHtml(eq.jam)}
            </p>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span class="inline-flex items-center gap-1">
                <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                ${D.escapeHtml(eq.kedalaman)}
              </span>
              <span class="inline-flex items-center gap-1">
                <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                ${formatCoords(eq)}
              </span>
            </div>
          </div>

          <svg class="mt-1 h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </div>

        <div class="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
          ${tsunamiBadge(eq.potensi)}
          ${isNew ? '<span class="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">Baru</span>' : ""}
        </div>
      </button>`;
  }

  function renderEarthquakes(list, page, pageSize, newIds = new Set()) {
    if (!els.list) return;

    if (!list.length) {
      renderEmpty();
      return;
    }

    const start = (page - 1) * pageSize;
    const pageItems = list.slice(start, start + pageSize);

    const fragment = document.createDocumentFragment();
    const container = document.createElement("div");
    container.className = "space-y-3";
    container.innerHTML = pageItems
      .map((eq) => earthquakeCard(eq, newIds.has(eq.id)))
      .join("");

    while (container.firstChild) fragment.appendChild(container.firstChild);
    els.list.innerHTML = "";
    els.list.appendChild(fragment);

    // Load more button
    const hasMore = start + pageSize < list.length;
    const loadMoreWrap = document.getElementById("load-more-wrap");
    if (loadMoreWrap) {
      loadMoreWrap.innerHTML = hasMore
        ? `<button
            type="button"
            id="load-more-btn"
            class="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-[0.99]"
          >
            Muat Lebih Banyak
            <span class="ml-1 text-xs text-slate-500">(${list.length - (start + pageSize)} tersisa)</span>
          </button>`
        : "";
    }
  }

  /* ----------------------------------------------------------
     EMPTY STATE
     ---------------------------------------------------------- */

  function renderEmpty() {
    if (!els.list) return;
    els.list.innerHTML = `
      <div class="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
          <svg class="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
        </div>
        <h3 class="mb-1 text-base font-semibold text-white">Tidak ada gempa ditemukan</h3>
        <p class="mb-5 text-sm text-slate-400">Coba ubah filter atau kata pencarian.</p>
        <button
          type="button"
          id="empty-reset-btn"
          class="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          Reset Filter
        </button>
      </div>`;

    const resetBtn = document.getElementById("empty-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        const evt = new CustomEvent("gempa:reset-filters");
        document.dispatchEvent(evt);
      });
    }
  }

  /* ----------------------------------------------------------
     ERROR STATE
     ---------------------------------------------------------- */

  function renderError(message, lastUpdated) {
    if (!els.status) return;
    const lastText = lastUpdated
      ? `Data terakhir: ${D.formatLastUpdated(lastUpdated)}`
      : "Belum ada data tersimpan";

    els.status.innerHTML = `
      <div class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <div class="flex items-start gap-3">
          <svg class="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <p class="text-sm font-semibold text-red-400">${D.escapeHtml(message)}</p>
            <p class="mt-1 text-xs text-red-300/80">${D.escapeHtml(lastText)}</p>
            <p class="mt-1 text-xs text-red-300/60">Mencoba menghubungkan kembali...</p>
          </div>
        </div>
      </div>`;
  }

  function clearError() {
    if (els.status) els.status.innerHTML = "";
  }

  /* ----------------------------------------------------------
     TOAST
     ---------------------------------------------------------- */

  function showToast({ title, message, type = "info", duration = 4000 }) {
    if (!els.toastContainer) return;

    const typeStyles = {
      success: {
        border: "border-emerald-500/40",
        iconBg: "bg-emerald-500/20 text-emerald-400",
        icon: "M5 13l4 4L19 7",
      },
      error: {
        border: "border-red-500/40",
        iconBg: "bg-red-500/20 text-red-400",
        icon: "M6 18L18 6M6 6l12 12",
      },
      warning: {
        border: "border-yellow-500/40",
        iconBg: "bg-yellow-500/20 text-yellow-400",
        icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      },
      info: {
        border: "border-sky-500/40",
        iconBg: "bg-sky-500/20 text-sky-400",
        icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      },
    };

    const style = typeStyles[type] || typeStyles.info;

    const toast = document.createElement("div");
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.className = `pointer-events-auto flex w-full items-start gap-3 rounded-xl border ${style.border} bg-slate-900/95 p-4 shadow-xl shadow-black/30 backdrop-blur transition-all duration-300`;

    toast.innerHTML = `
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconBg}">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="${style.icon}"/>
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-white">${D.escapeHtml(title)}</p>
        ${message ? `<p class="mt-0.5 text-xs text-slate-400">${D.escapeHtml(message)}</p>` : ""}
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg p-1 text-slate-500 transition-colors hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        aria-label="Tutup notifikasi"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>`;

    // Animasi masuk
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px)";
    els.toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // Tombol tutup
    const closeBtn = toast.querySelector("button");
    closeBtn.addEventListener("click", () => removeToast(toast));

    // Auto dismiss
    const timer = setTimeout(() => removeToast(toast), duration);
    toast.dataset.timer = timer;
  }

  function removeToast(toast) {
    if (!toast) return;
    clearTimeout(toast.dataset.timer);
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px)";
    setTimeout(() => toast.remove(), 300);
  }

  /* ----------------------------------------------------------
     MODAL DETAIL
     ---------------------------------------------------------- */

  function showEarthquakeDetail(eq) {
    if (!els.modal) return;

    const textColor = D.getMagnitudeTextColor(eq.magnitude);
    const badge = D.getMagnitudeBadgeClass(eq.magnitude);
    const hasCoords = eq.lat !== null && eq.lon !== null;
    const mapsUrl = hasCoords
      ? `https://www.google.com/maps?q=${eq.lat},${eq.lon}`
      : null;

    els.modal.innerHTML = `
      <div class="modal-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true"></div>
      <div
        class="modal-panel relative mx-auto w-full max-w-md rounded-t-3xl bg-slate-900 shadow-2xl shadow-black/50 sm:my-8 sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="flex items-start justify-between border-b border-slate-800 p-5">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Detail Gempa</p>
            <h2 id="modal-title" class="mt-1 text-lg font-bold text-white">${eq.wilayah}</h2>
          </div>
          <button
            type="button"
            id="modal-close"
            class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Tutup detail gempa"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5">
          <div class="mb-5 flex items-center gap-4">
            <div class="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border ${badge}">
              <span class="text-3xl font-black leading-none ${textColor}">${eq.magnitude.toFixed(1)}</span>
              <span class="text-[10px] font-semibold uppercase tracking-wider">Magnitude</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-white">${eq.wilayah}</p>
              <p class="mt-1 text-xs text-slate-400">${D.escapeHtml(eq.tanggal)} • ${D.escapeHtml(eq.jam)}</p>
              <div class="mt-2">${tsunamiBadge(eq.potensi)}</div>
            </div>
          </div>

          <dl class="space-y-3">
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Tanggal</dt>
              <dd class="text-sm font-semibold text-slate-200">${D.escapeHtml(eq.tanggal)}</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Jam</dt>
              <dd class="text-sm font-semibold text-slate-200">${D.escapeHtml(eq.jam)}</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">DateTime</dt>
              <dd class="text-right text-sm font-semibold text-slate-200">${D.escapeHtml(eq.dateTime)}</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Magnitude</dt>
              <dd class="text-sm font-semibold ${textColor}">${eq.magnitude.toFixed(1)} SR</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Kedalaman</dt>
              <dd class="text-sm font-semibold text-slate-200">${D.escapeHtml(eq.kedalaman)}</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Wilayah</dt>
              <dd class="text-right text-sm font-semibold text-slate-200">${eq.wilayah}</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Lintang</dt>
              <dd class="text-sm font-semibold text-slate-200">${D.escapeHtml(eq.lintang)}</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Bujur</dt>
              <dd class="text-sm font-semibold text-slate-200">${D.escapeHtml(eq.bujur)}</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Koordinat</dt>
              <dd class="text-sm font-semibold text-slate-200">${formatCoords(eq)}</dd>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <dt class="text-xs font-medium text-slate-500">Potensi</dt>
              <dd class="text-sm font-semibold text-slate-200">${D.escapeHtml(eq.potensi)}</dd>
            </div>
          </dl>

          ${mapsUrl
            ? `<a
                href="${mapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Lihat di Peta
              </a>`
            : ""}
        </div>
      </div>`;

    // Tampilkan modal
    els.modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Fokus ke tombol tutup
    const closeBtn = els.modal.querySelector("#modal-close");
    if (closeBtn) closeBtn.focus();

    // Event: tutup
    const closeModal = () => hideEarthquakeDetail();
    closeBtn.addEventListener("click", closeModal);

    // Klik backdrop
    const backdrop = els.modal.querySelector(".modal-backdrop");
    backdrop.addEventListener("click", closeModal);

    // ESC
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", onKey);
      }
    };
    document.addEventListener("keydown", onKey);
  }

  function hideEarthquakeDetail() {
    if (!els.modal) return;
    els.modal.classList.add("hidden");
    document.body.style.overflow = "";
    els.modal.innerHTML = "";
  }

  /* ----------------------------------------------------------
     THEME
     ---------------------------------------------------------- */

  const THEME_KEY = "gempa-monitor-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "dark";
    } catch {
      return "dark";
    }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* localStorage tidak tersedia */
    }
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function updateThemeIcon(theme) {
    if (!els.themeIcon) return;
    els.themeIcon.innerHTML =
      theme === "dark"
        ? `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>`
        : `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>`;
  }

  /* ----------------------------------------------------------
     SCROLL TO TOP
     ---------------------------------------------------------- */

  function initScrollTop() {
    if (!els.scrollTop) return;
    const onScroll = () => {
      const show = window.scrollY > 400;
      els.scrollTop.classList.toggle("opacity-0", !show);
      els.scrollTop.classList.toggle("pointer-events-none", !show);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    els.scrollTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    init,
    renderSkeleton,
    renderHero,
    renderStats,
    renderEarthquakes,
    renderEmpty,
    renderError,
    clearError,
    showToast,
    showEarthquakeDetail,
    hideEarthquakeDetail,
    getStoredTheme,
    applyTheme,
    toggleTheme,
    initScrollTop,
  };
})();