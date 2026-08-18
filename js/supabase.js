/* ============================================================
   GEMPA MONITOR — MODUL SUPABASE (REALTIME)
   ============================================================
   Bagian:  SUPABASE
   ------------------------------------------------------------
   Modul ini berisi:
   - Inisialisasi client Supabase (dari CDN global `supabase`).
   - Menyimpan data gempa (upsert) ke tabel `gempa`.
   - Mengambil data gempa dari Supabase.
   - Subscribe realtime terhadap perubahan tabel `gempa`.
   - Fallback aman bila Supabase belum dikonfigurasi.
   ============================================================ */

"use strict";

window.GempaSupabase = (() => {
  const D = window.GempaData;

  /* ----------------------------------------------------------
     KONFIGURASI
     ---------------------------------------------------------- */
  const CFG = window.GEMPA_SUPABASE_CONFIG || {
    SUPABASE_URL: "",
    SUPABASE_ANON_KEY: "",
    TABLE_GEMPA: "gempa",
  };

  let client = null;
  let channel = null;
  let realtimeListeners = new Set();

  /* ----------------------------------------------------------
     STATUS
     ---------------------------------------------------------- */

  function isConfigured() {
    return Boolean(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  }

  function isReady() {
    return Boolean(client) && isConfigured();
  }

  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */

  async function init() {
    if (!isConfigured()) {
      console.warn(
        "[GempaMonitor] Supabase belum dikonfigurasi. " +
          "Isi js/supabase-config.js dengan URL & anon key project Supabase Anda."
      );
      return false;
    }

    // Supabase JS dimuat via CDN → global `window.supabase`
    if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
      console.warn("[GempaMonitor] Supabase JS CDN belum termuat.");
      return false;
    }

    try {
      client = window.supabase.createClient(
        CFG.SUPABASE_URL,
        CFG.SUPABASE_ANON_KEY
      );
      return true;
    } catch (err) {
      console.error("[GempaMonitor] Gagal init Supabase:", err);
      return false;
    }
  }

  /* ----------------------------------------------------------
     SAVE — Simpan data JSON realtime ke database Supabase
     ---------------------------------------------------------- */

  /**
   * Simpan daftar gempa ter-normalisasi ke tabel `gempa`.
   * Upsert manual: cek apakah `tanggal` sudah ada → update; jika tidak → insert.
   * Tidak bergantung constraint unique di database.
   */
  async function saveEarthquakes(list) {
    if (!isReady()) return { ok: false, error: "Supabase belum siap" };

    let saved = 0;
    for (const eq of list) {
      const row = {
        tanggal: eq.dateTime || eq.tanggal,
        magnitude: eq.magnitude,
        kedalaman: eq.depth ?? null,
        wilayah: eq.wilayah,
        koordinat: eq.coordinates || null,
        potensi: eq.potensi || null,
      };

      // Cek apakah sudah ada berdasarkan tanggal
      const { data: existing } = await client
        .from(CFG.TABLE_GEMPA)
        .select("id")
        .eq("tanggal", row.tanggal)
        .maybeSingle();

      try {
        if (existing?.id) {
          const { error } = await client
            .from(CFG.TABLE_GEMPA)
            .update(row)
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await client.from(CFG.TABLE_GEMPA).insert(row);
          if (error) throw error;
        }
        saved++;
      } catch (err) {
        console.warn("[GempaMonitor] Gagal simpan record:", err.message);
      }
    }

    return { ok: true, count: saved };
  }

  /* ----------------------------------------------------------
     FETCH — Ambil data realtime dari database Supabase
     ---------------------------------------------------------- */

  async function fetchEarthquakes() {
    if (!isReady()) return [];

    try {
      const { data, error } = await client
        .from(CFG.TABLE_GEMPA)
        .select("*")
        .order("tanggal", { ascending: false });

      if (error) throw error;
      return (data || []).map(dbRowToRaw);
    } catch (err) {
      console.error("[GempaMonitor] Gagal ambil data Supabase:", err);
      return [];
    }
  }

  /* ----------------------------------------------------------
     REALTIME SUBSCRIPTION
     ---------------------------------------------------------- */

  /**
   * Subscribe ke perubahan tabel `gempa`.
   * callback(payload) dipanggil saat INSERT/UPDATE/DELETE.
   */
  function subscribeRealtime(callback) {
    if (!isReady()) return false;

    try {
      if (!channel) {
        channel = client
          .channel("gempa-realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: CFG.TABLE_GEMPA },
            (payload) => {
              realtimeListeners.forEach((cb) => cb(payload));
            }
          )
          .subscribe();
      }

      if (typeof callback === "function") {
        realtimeListeners.add(callback);
      }
      return true;
    } catch (err) {
      console.error("[GempaMonitor] Gagal subscribe realtime:", err);
      return false;
    }
  }

  function unsubscribeRealtime(callback) {
    if (typeof callback === "function") {
      realtimeListeners.delete(callback);
    }
  }

  /* ----------------------------------------------------------
     HELPER — Ubah baris DB ke bentuk BMKG mentah
     ---------------------------------------------------------- */

  /**
   * Konversi satu row dari tabel Supabase (field lowercase)
   * menjadi struktur mentah BMKG (field kapital) agar bisa
   * dinormalisasi oleh GempaData.normalizeEarthquakes().
   */
  function dbRowToRaw(row) {
    if (!row) return null;

    // Format tanggal: ISO (2026-08-17T10:42:42+00:00) → "17 Agu 2026"
    let tanggal = null;
    let jam = null;
    if (row.tanggal) {
      const d = new Date(row.tanggal);
      if (!Number.isNaN(d.getTime())) {
        tanggal = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(d);
        const parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).formatToParts(d);
        const get = (t) => parts.find((p) => p.type === t)?.value ?? "00";
        jam = `${get("hour")}:${get("minute")}:${get("second")} WIB`;
      }
    }

    return {
      Tanggal: tanggal,
      Jam: jam,
      DateTime: row.tanggal || null,
      Coordinates: row.koordinat || null,
      Lintang: row.koordinat ? row.koordinat.split(",")[0] : null,
      Bujur: row.koordinat ? row.koordinat.split(",")[1] : null,
      Magnitude: row.magnitude != null ? String(row.magnitude) : null,
      Kedalaman: row.kedalaman != null ? `${row.kedalaman} km` : null,
      Wilayah: row.wilayah || null,
      Potensi: row.potensi || null,
    };
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    init,
    isConfigured,
    isReady,
    saveEarthquakes,
    fetchEarthquakes,
    subscribeRealtime,
    unsubscribeRealtime,
  };
})();