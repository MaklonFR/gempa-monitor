# 🌋 GEMPA MONITOR

**Monitoring Gempa Bumi Indonesia Realtime** — Dashboard PWA modern dengan data dari BMKG, disimpan ke database Supabase, dan ditampilkan secara realtime.

---

## Fitur

- 🚀 **Mobile-first, responsive** — 360px s.d. 1440px
- 📡 **Data realtime dari BMKG** — polling 60 detik (`data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`)
- 🗄️ **Backend Supabase** — setiap data BMKG otomatis disimpan ke tabel `gempa`
- 🔄 **Realtime dari database** — perubahan di tabel Supabase langsung tampil di UI (marker peta, daftar, statistik)
- 🗺️ **Peta Leaflet** — marker berwarna sesuai magnitude + popup info
- 🔍 **Filter & Search** — magnitude, potensi tsunami, wilayah, tanggal (debounce 300ms)
- 📊 **Statistik** — total gempa, M5+, magnitude terbesar, kedalaman terdangkal
- 🔔 **Toast notifikasi** — deteksi gempa baru (M ≥ 5 mendapat highlight)
- 🌗 **Dark/Light mode** — tersimpan di localStorage
- 📱 **PWA** — installable, offline fallback, service worker

---

## Cara Menjalankan (tanpa Supabase — mode demo)

```bash
npx http-server -p 8080 -c-1
```

Buka <http://localhost:8080>.

> Tanpa konfigurasi Supabase, aplikasi tetap berjalan dengan data lokal BMKG & polling dari API BMKG.

---

## Setup Supabase (Backend Database + Realtime)

### 1. Buat project Supabase

- Kunjungi <https://supabase.com> → **New project**
- Catat **Project URL** dan **anon public key** dari: Dashboard → Settings → API

### 2. Jalankan SQL schema

Buka **SQL Editor** di Dashboard Supabase, tempel isi `supabase/schema.sql`, lalu **Run**.

```sql
-- supabase/schema.sql  (intinya:)
create table public.gempa (
  id uuid primary key default gen_random_uuid(),
  tanggal text not null,
  magnitude numeric(3,1) not null,
  kedalaman integer null,
  wilayah text not null unique,
  koordinat text null,
  potensi text null,
  created_at timestamptz not null default now()
);
alter table public.gempa enable row level security;
create policy "gempa_select_public" on public.gempa for select using (true);
create policy "gempa_insert_public" on public.gempa for insert with check (true);
create policy "gempa_update_public" on public.gempa for update using (true);
alter publication supabase_realtime add table public.gempa;
```

### 3. Isi konfigurasi di `js/supabase-config.js`

```js
window.GEMPA_SUPABASE_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIs...",
  TABLE_GEMPA: "gempa",
};
```

### 4. Selesai!

- Saat aplikasi dimuat → ambil data dari Supabase & render
- Polling BMKG → data baru otomatis **disimpan ke Supabase** (upsert)
- Perubahan tabel (INSERT/UPDATE/DELETE) → **realtime subscription** memicu render ulang

---

## Cara Menjalankan (dengan Supabase)

```bash
npx http-server -p 8080 -c-1
```

Buka <http://localhost:8080>.

---

## Struktur File

```
├── index.html              # HTML utama + Tailwind CDN + Leaflet + Supabase CDN
├── manifest.json           # PWA manifest
├── service-worker.js       # PWA service worker (cache aset statis)
├── css/
│   └── app.css             # Custom CSS (dark/light, animasi, marker, dsb.)
├── js/
│   ├── data.js             # Data BMKG (lokal fallback) + utils + filter + sort
│   ├── supabase-config.js  # ⬅ KONFIGURASI SUPABASE (isi URL + anon key)
│   ├── supabase.js         # Modul Supabase: save, fetch, realtime
│   ├── ui.js               # Render DOM: hero, stats, list, toast, modal
│   ├── map.js              # Leaflet map + markers
│   ├── realtime.js         # Polling BMKG + countdown + online/offline
│   └── app.js              # State, filter, event handlers, init
├── supabase/
│   └── schema.sql          # ⬅ SQL schema untuk Supabase Dashboard
├── assets/
│   ├── icon-192.png
│   └── icon-512.png
└── scripts/
    ├── generate-icons.js   # (opsional) generate ikon PNG
    └── test.js             # Unit test logika data
```

---

## Cara Kerja Backend Realtime

### 1. Simpan ke Database

Di `js/app.js` → `onData()` setiap kali polling BMKG sukses:

```js
if (SB && SB.isReady()) {
  SB.saveEarthquakes(list).then((res) => { ... });
}
```

`saveEarthquakes()` melakukan **upsert** ke tabel `gempa`:

```js
client.from(TABLE_GEMPA).upsert(rows, { onConflict: "tanggal" });
```

### 2. Ambil dari Database

Di `js/app.js` → `init()`:

```js
const dbData = await SB.fetchEarthquakes();
const normalized = D.normalizeEarthquakes(dbData);
```

Kolom DB (lowercase) dikonversi ke bentuk BMKG (kapital) lalu dinormalisasi.

### 3. Realtime Database

Di `js/app.js` setelah init sukses:

```js
SB.subscribeRealtime((payload) => {
  console.log("Perubahan:", payload.eventType);
  SB.fetchEarthquakes().then(...);  // render ulang
});
```

`subscribeRealtime()` memakai **Postgres Changes** channel:

```js
client
  .channel("gempa-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "gempa" }, cb)
  .subscribe();
```

---

## API BMKG

Endpoint: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`

Konfigurasi ada di `js/data.js`:

```js
API_URL: "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json",
REFRESH_INTERVAL: 60000, // 60 detik
```

Untuk mode demo tanpa internet, ubah `API_URL` menjadi `null` → aplikasi memakai `LOCAL_DATA`.

---

## Teknologi

- HTML5 + Tailwind CSS (CDN)
- JavaScript Vanilla ES6+ (tanpa framework, tanpa build step)
- Leaflet.js (peta)
- Supabase JS v2 (backend database + realtime)
- PWA (service worker + manifest)

---

## Disclaimer

⚠️ **Informasi gempa ditampilkan untuk tujuan monitoring.**
Untuk informasi resmi dan peringatan kebencanaan, selalu ikuti informasi dari [BMKG](https://www.bmkg.go.id) dan instansi berwenang.

© 2026 GEMPA MONITOR# EarthquakeAlerts
# gempa-monitor
