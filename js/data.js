/* ============================================================
   GEMPA MONITOR — MODUL DATA
   ============================================================
   Bagian:  DATA | CONFIG | UTILITIES | FILTER | SORT
   ------------------------------------------------------------
   Modul ini berisi:
   - Dataset lokal (fallback/demo) sesuai struktur BMKG.
   - Konfigurasi API (siap diganti ke endpoint production).
   - Normalisasi data mentah API → struktur internal yang aman.
   - Utility: parse koordinat, format waktu, klasifikasi magnitude.
   - Fungsi filter & sort yang reusable.
   ============================================================ */

"use strict";

window.GempaData = (() => {
  /* ----------------------------------------------------------
     CONFIG
     ---------------------------------------------------------- */
  const CONFIG = {
    /**
     * URL API BMKG.
     * Saat ini mengarah ke endpoint publik BMKG:
     *   https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json
     *
     * Untuk mode demo/data lokal saja, ubah menjadi:
     *   API_URL: null
     */
    API_URL: "https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json",

    /** Interval polling (ms). 60 detik sesuai spesifikasi. */
    REFRESH_INTERVAL: 60000,

    /** Jumlah data per halaman. */
    PAGE_SIZE: 10,
  };

  /* ----------------------------------------------------------
     DATA — Dataset lokal (struktur persis dari BMKG JSON)
     Dipakai sebagai fallback/cache saat API gagal atau offline.
     ---------------------------------------------------------- */
  const LOCAL_DATA = {
    Infogempa: {
      gempa: [
        {
          Tanggal: "17 Agu 2026",
          Jam: "17:42:42 WIB",
          DateTime: "2026-08-17T10:42:42+00:00",
          Coordinates: "-7.85,120.47",
          Lintang: "7.85 LS",
          Bujur: "120.47 BT",
          Magnitude: "5.0",
          Kedalaman: "10 km",
          Wilayah: "84 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "17 Agu 2026",
          Jam: "14:20:20 WIB",
          DateTime: "2026-08-17T07:20:20+00:00",
          Coordinates: "-7.84,120.52",
          Lintang: "7.84 LS",
          Bujur: "120.52 BT",
          Magnitude: "5.0",
          Kedalaman: "10 km",
          Wilayah: "86 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "17 Agu 2026",
          Jam: "10:48:05 WIB",
          DateTime: "2026-08-17T03:48:05+00:00",
          Coordinates: "-8.30,121.28",
          Lintang: "8.30 LS",
          Bujur: "121.28 BT",
          Magnitude: "5.1",
          Kedalaman: "10 km",
          Wilayah: "41 km BaratLaut MBAY-NAGEKEO-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "17 Agu 2026",
          Jam: "10:36:41 WIB",
          DateTime: "2026-08-17T03:36:41+00:00",
          Coordinates: "-8.26,121.25",
          Lintang: "8.26 LS",
          Bujur: "121.25 BT",
          Magnitude: "5.4",
          Kedalaman: "10 km",
          Wilayah: "46 km BaratLaut MBAY-NAGEKEO-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "17 Agu 2026",
          Jam: "07:46:43 WIB",
          DateTime: "2026-08-17T00:46:43+00:00",
          Coordinates: "-8.38,121.52",
          Lintang: "8.38 LS",
          Bujur: "121.52 BT",
          Magnitude: "5.8",
          Kedalaman: "10 km",
          Wilayah: "40 km TimurLaut MBAY-NAGEKEO-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "17 Agu 2026",
          Jam: "00:26:17 WIB",
          DateTime: "2026-08-16T17:26:17+00:00",
          Coordinates: "-7.93,120.50",
          Lintang: "7.93 LS",
          Bujur: "120.50 BT",
          Magnitude: "5.0",
          Kedalaman: "10 km",
          Wilayah: "75 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "16 Agu 2026",
          Jam: "20:38:41 WIB",
          DateTime: "2026-08-16T13:38:41+00:00",
          Coordinates: "-7.95,120.58",
          Lintang: "7.95 LS",
          Bujur: "120.58 BT",
          Magnitude: "5.2",
          Kedalaman: "10 km",
          Wilayah: "74 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "16 Agu 2026",
          Jam: "17:31:37 WIB",
          DateTime: "2026-08-16T10:31:37+00:00",
          Coordinates: "-7.93,120.62",
          Lintang: "7.93 LS",
          Bujur: "120.62 BT",
          Magnitude: "5.1",
          Kedalaman: "10 km",
          Wilayah: "77 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "16 Agu 2026",
          Jam: "17:14:37 WIB",
          DateTime: "2026-08-16T10:14:37+00:00",
          Coordinates: "-7.93,120.65",
          Lintang: "7.93 LS",
          Bujur: "120.65 BT",
          Magnitude: "5.6",
          Kedalaman: "10 km",
          Wilayah: "78 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "16 Agu 2026",
          Jam: "13:51:48 WIB",
          DateTime: "2026-08-16T06:51:48+00:00",
          Coordinates: "-7.94,120.65",
          Lintang: "7.94 LS",
          Bujur: "120.65 BT",
          Magnitude: "5.5",
          Kedalaman: "10 km",
          Wilayah: "77 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "16 Agu 2026",
          Jam: "06:12:54 WIB",
          DateTime: "2026-08-15T23:12:54+00:00",
          Coordinates: "-7.87,120.64",
          Lintang: "7.87 LS",
          Bujur: "120.64 BT",
          Magnitude: "5.2",
          Kedalaman: "10 km",
          Wilayah: "84 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "15 Agu 2026",
          Jam: "23:25:19 WIB",
          DateTime: "2026-08-15T16:25:19+00:00",
          Coordinates: "0.25,120.22",
          Lintang: "0.25 LU",
          Bujur: "120.22 BT",
          Magnitude: "6.2",
          Kedalaman: "44 km",
          Wilayah: "74 km BaratDaya PARIGIMOUTONG-SULTENG",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "15 Agu 2026",
          Jam: "19:14:41 WIB",
          DateTime: "2026-08-15T12:14:41+00:00",
          Coordinates: "-8.25,121.28",
          Lintang: "8.25 LS",
          Bujur: "121.28 BT",
          Magnitude: "5.1",
          Kedalaman: "10 km",
          Wilayah: "47 km BaratLaut MBAY-NAGEKEO-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "15 Agu 2026",
          Jam: "17:54:52 WIB",
          DateTime: "2026-08-15T10:54:52+00:00",
          Coordinates: "2.97,98.95",
          Lintang: "2.97 LU",
          Bujur: "98.95 BT",
          Magnitude: "6.4",
          Kedalaman: "163 km",
          Wilayah: "10 km Tenggara SIMALUNGUN-SUMUT",
          Potensi: "Tidak berpotensi tsunami",
        },
        {
          Tanggal: "15 Agu 2026",
          Jam: "14:39:41 WIB",
          DateTime: "2026-08-15T07:39:41+00:00",
          Coordinates: "-7.94,120.79",
          Lintang: "7.94 LS",
          Bujur: "120.79 BT",
          Magnitude: "5.1",
          Kedalaman: "10 km",
          Wilayah: "82 km TimurLaut RUTENG-MANGGARAI-NTT",
          Potensi: "Tidak berpotensi tsunami",
        },
      ],
    },
  };

  /* ----------------------------------------------------------
     UTILITIES
     ---------------------------------------------------------- */

  /**
   * Escape karakter HTML untuk mencegah XSS saat innerHTML.
   * String entity dibangun via concat agar tidak diubah auto-format.
   */
  function escapeHtml(value) {
    const AMP = "&" + "amp;";
    const LT = "&" + "lt;";
    const GT = "&" + "gt;";
    const QUOT = "&" + "quot;";
    const APOS = "&" + "#039;";
    return String(value ?? "")
      .replace(/&/g, AMP)
      .replace(/</g, LT)
      .replace(/>/g, GT)
      .replace(/"/g, QUOT)
      .replace(/'/g, APOS);
  }

  /** Fallback aman: value ?? "-" sesuai spesifikasi. */
  function fallback(value, def = "-") {
    if (value === null || value === undefined || value === "") return def;
    return value;
  }

  /**
   * Parse "Coordinates" dari BMKG: "-7.85,120.47"
   * → { lat: -7.85, lon: 120.47 }
   * Mengembalikan null bila tidak valid.
   */
  function parseCoordinates(coordStr) {
    if (!coordStr || typeof coordStr !== "string") return null;
    const parts = coordStr.split(",");
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return { lat, lon };
  }

  /** Ubah string DateTime BMKG menjadi Date yang valid, atau null. */
  function toDate(dateTime) {
    if (!dateTime) return null;
    const d = new Date(dateTime);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  /**
   * Sortir tanggal pilihan (untuk filter Tanggal).
   */
  function formatDateOnly(date) {
    const d = toDate(date);
    if (!d) return null;
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  /**
   * Format waktu jam realtime → "HH:MM:SS" (WIB / Asia/Jakarta).
   */
  function formatClockWIB(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type)?.value ?? "00";
    return `${get("hour")}:${get("minute")}:${get("second")}`;
  }

  /**
   * Format kapan terakhir diperbarui:
   * "17 Agu 2026 • 17:42:42 WIB"
   */
  function formatLastUpdated(date) {
    const d = toDate(date);
    if (!d) return "-";
    const dateStr = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
    const timeStr = formatClockWIB(d);
    return `${dateStr} • ${timeStr} WIB`;
  }

  /**
   * Klasifikasi kelas magnitude (sesuai #33).
   * Return: "green" | "blue" | "yellow" | "orange" | "red"
   */
  function getMagnitudeClass(magnitude) {
    const mag = Number(magnitude);
    if (!Number.isFinite(mag)) return "gray";
    if (mag >= 7) return "red";
    if (mag >= 6) return "orange";
    if (mag >= 5) return "yellow";
    if (mag >= 3) return "blue";
    return "green";
  }

  /**
   * Warna hex untuk marker Leaflet berdasarkan kelas magnitude.
   */
  function getMagnitudeColor(magnitude) {
    const map = {
      green: "#22c55e",
      blue: "#3b82f6",
      yellow: "#eab308",
      orange: "#f97316",
      red: "#ef4444",
      gray: "#64748b",
    };
    return map[getMagnitudeClass(magnitude)] || map.gray;
  }

  /** Label warna statis (dark/light safe) untuk teks. */
  function getMagnitudeTextColor(magnitude) {
    const map = {
      green: "text-emerald-400",
      blue: "text-sky-400",
      yellow: "text-yellow-400",
      orange: "text-orange-400",
      red: "text-red-400",
      gray: "text-slate-400",
    };
    return map[getMagnitudeClass(magnitude)] || map.gray;
  }

  /** Label warna statis untuk badge (background + text). */
  function getMagnitudeBadgeClass(magnitude) {
    const map = {
      green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      blue: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
      red: "bg-red-500/15 text-red-400 border-red-500/30",
      gray: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    };
    return map[getMagnitudeClass(magnitude)] || map.gray;
  }

  /**
   * Konversi string kedalaman "10 km" → angka 10.
   */
  function parseDepth(depthStr) {
    const num = parseFloat(String(depthStr ?? "").replace(",", "."));
    return Number.isFinite(num) ? num : null;
  }

  /* ----------------------------------------------------------
     NORMALISASI — Membuat data API aman untuk dipakai UI.
     ---------------------------------------------------------- */

  /**
   * Normalisasi satu record gempa mentah.
   * Semua nilai divalidasi; record bermasalah tidak membuat crash.
   */
  function normalizeEarthquake(raw) {
    const mag = parseFloat(raw?.Magnitude);
    const depthStr = fallback(raw?.Kedalaman, "10 km");
    const coords = parseCoordinates(raw?.Coordinates);

    return {
      id: fallback(raw?.DateTime, `${fallback(raw?.Tanggal, "")}-${fallback(raw?.Jam, "")}`),
      tanggal: fallback(raw?.Tanggal),
      jam: fallback(raw?.Jam),
      dateTime: fallback(raw?.DateTime),
      date: toDate(raw?.DateTime), // Date | null (untuk sorting)
      coordinates: fallback(raw?.Coordinates),
      lat: coords?.lat ?? null,
      lon: coords?.lon ?? null,
      lintang: fallback(raw?.Lintang),
      bujur: fallback(raw?.Bujur),
      magnitude: Number.isFinite(mag) ? mag : 0,
      magnitudeRaw: String(fallback(raw?.Magnitude, "-")),
      kedalaman: String(depthStr),
      depth: parseDepth(depthStr),
      wilayah: escapeHtml(String(fallback(raw?.Wilayah))),
      potensi: escapeHtml(String(fallback(raw?.Potensi, "Tidak berpotensi tsunami"))),
    };
  }

  /**
   * Normalisasi daftar mentah menjadi array internal.
   * Record yang sama sekali tidak valid (< 1 field penting) disaring.
   */
  function normalizeEarthquakes(rawList) {
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map(normalizeEarthquake)
      .filter((eq) => eq.wilayah !== "-" || eq.magnitudeRaw !== "-");
  }

  /**
   * Ekstrak daftar gempa dari respons JSON BMKG.
   * Mendukung bentuk { Infogempa: { gempa: [...] } } maupun array polos.
   */
  function extractEarthquakes(payload) {
    if (Array.isArray(payload)) return payload;
    return payload?.Infogempa?.gempa ?? [];
  }

  /* ----------------------------------------------------------
     DATA PROCESSING — Fungsi reusable (#22)
     ---------------------------------------------------------- */

  /** Seluruh gempa (normalized). Diberi dari luar (state). */
  function getEarthquakes(earthquakes) {
    return Array.isArray(earthquakes) ? earthquakes.slice() : [];
  }

  /** Gempa terbaru berdasarkan DateTime (#34 — jangan andalkan urutan JSON). */
  function getLatestEarthquake(earthquakes) {
    return getEarthquakes(earthquakes)
      .filter((eq) => eq.date)
      .sort((a, b) => b.date - a.date)[0] || null;
  }

  /** Gempa dengan magnitude terbesar. */
  function getLargestMagnitude(earthquakes) {
    return getEarthquakes(earthquakes)
      .sort((a, b) => b.magnitude - a.magnitude)[0] || null;
  }

  /** Gempa dengan kedalaman terdangkal (null depth dianggap paling dalam). */
  function getShallowestEarthquake(earthquakes) {
    return getEarthquakes(earthquakes)
      .filter((eq) => eq.depth !== null)
      .sort((a, b) => a.depth - b.depth)[0] || null;
  }

  /** Ringkasan statistik: total, M5+, terbesar, terdangkal. */
  function getMagnitudeStats(earthquakes) {
    const list = getEarthquakes(earthquakes);
    const total = list.length;
    const m5Plus = list.filter((eq) => eq.magnitude >= 5).length;
    const largest = getLargestMagnitude(list);
    const shallowest = getShallowestEarthquake(list);
    return {
      total,
      m5Plus,
      largestMagnitude: largest ? largest.magnitude : null,
      largestWilayah: largest ? largest.wilayah : null,
      shallowestDepth: shallowest ? shallowest.depth : null,
      shallowestKedalaman: shallowest ? shallowest.kedalaman : null,
      shallowestWilayah: shallowest ? shallowest.wilayah : null,
    };
  }

  /* ----------------------------------------------------------
     FILTER
     ---------------------------------------------------------- */

  /**
   * Filter daftar gempa.
   * filters = {
   *   magnitude: "all" | "lt5" | "gte5" | "gte6",
   *   tsunami:   "all" | "berpotensi" | "tidak",
   *   search:    string (cari di Wilayah),
   *   tanggal:   string tanggal seperti "17 Agu 2026" | ""
   * }
   */
  function filterEarthquakes(list, filters) {
    const f = filters || {};
    return getEarthquakes(list).filter((eq) => {
      // Filter magnitude
      if (f.magnitude === "lt5" && !(eq.magnitude < 5)) return false;
      if (f.magnitude === "gte5" && !(eq.magnitude >= 5)) return false;
      if (f.magnitude === "gte6" && !(eq.magnitude >= 6)) return false;

      // Filter potensi tsunami
      // "Tidak berpotensi tsunami" mengandung kata "berpotensi",
      // jadi filter "berpotensi" harus mengecualikan yang mengandung "tidak".
      if (f.tsunami === "berpotensi" && !(/berpotensi/i.test(eq.potensi) && !/tidak/i.test(eq.potensi))) return false;
      if (f.tsunami === "tidak" && !/tidak/i.test(eq.potensi)) return false;

      // Search wilayah (case-insensitive, debounce di app.js)
      if (f.search) {
        const kw = String(f.search).trim().toLowerCase();
        if (kw && !eq.wilayah.toLowerCase().includes(kw)) return false;
      }

      // Filter tanggal
      if (f.tanggal && eq.tanggal !== f.tanggal) return false;

      return true;
    });
  }

  /* ----------------------------------------------------------
     SORT
     ---------------------------------------------------------- */

  /**
   * Sorting daftar gempa.
   * sortBy: "latest" | "oldest" | "largest" | "smallest"
   *         | "shallowest" | "deepest"
   */
  function sortEarthquakes(list, sortBy) {
    const copy = getEarthquakes(list);

    const byDate = (a, b) => {
      const ad = a.date ? a.date.getTime() : -Infinity;
      const bd = b.date ? b.date.getTime() : -Infinity;
      return bd - ad;
    };

    switch (sortBy) {
      case "oldest":
        copy.sort((a, b) => {
          const ad = a.date ? a.date.getTime() : Infinity;
          const bd = b.date ? b.date.getTime() : Infinity;
          return ad - bd;
        });
        break;
      case "largest":
        copy.sort((a, b) => b.magnitude - a.magnitude);
        break;
      case "smallest":
        copy.sort((a, b) => a.magnitude - b.magnitude);
        break;
      case "shallowest":
        copy.sort((a, b) => {
          if (a.depth === null && b.depth === null) return 0;
          if (a.depth === null) return 1;
          if (b.depth === null) return -1;
          return a.depth - b.depth;
        });
        break;
      case "deepest":
        copy.sort((a, b) => {
          if (a.depth === null && b.depth === null) return 0;
          if (a.depth === null) return 1;
          if (b.depth === null) return -1;
          return b.depth - a.depth;
        });
        break;
      case "latest":
      default:
        // Terbaru: null date dianggap paling lama
        copy.sort(byDate);
        break;
    }
    return copy;
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    CONFIG,
    LOCAL_DATA,
    extractEarthquakes,
    normalizeEarthquake,
    normalizeEarthquakes,
    escapeHtml,
    fallback,
    parseCoordinates,
    toDate,
    formatDateOnly,
    formatClockWIB,
    formatLastUpdated,
    getMagnitudeClass,
    getMagnitudeColor,
    getMagnitudeTextColor,
    getMagnitudeBadgeClass,
    parseDepth,
    getEarthquakes,
    getLatestEarthquake,
    getLargestMagnitude,
    getShallowestEarthquake,
    getMagnitudeStats,
    filterEarthquakes,
    sortEarthquakes,
  };
})();