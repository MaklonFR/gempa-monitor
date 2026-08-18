## ROLE

Anda adalah **Senior Full-Stack Web Developer, UI/UX Designer, dan Frontend Engineer** yang berpengalaman membangun dashboard monitoring data realtime, aplikasi geospasial, dan Progressive Web App (PWA).

## TUGAS UTAMA

Buat sebuah **aplikasi web monitoring gempa bumi realtime Indonesia** yang:

* Responsive dan mobile-first.
* Sangat nyaman digunakan pada smartphone.
* Menggunakan **HTML5 + Tailwind CSS + JavaScript Vanilla (ES6+)**.
* Data gempa berasal dari struktur JSON yang diberikan di bawah.
* Data harus dapat diperbarui secara realtime melalui mekanisme polling.
* Tidak menggunakan framework frontend seperti React, Vue, atau Angular.
* Tidak menggunakan backend untuk versi demo.
* Kode harus modular, bersih, mudah dipahami, dan mudah dikembangkan menjadi aplikasi production.
* Gunakan desain modern bergaya dashboard monitoring bencana.
* Prioritaskan performa, accessibility, UX mobile, dan keterbacaan data.

---

# 1. TEKNOLOGI

Gunakan:

* HTML5 semantic.
* Tailwind CSS melalui CDN.
* JavaScript Vanilla ES6+.
* Font modern seperti Inter.
* Font Awesome atau Lucide Icons melalui CDN jika diperlukan.
* LocalStorage untuk menyimpan preferensi pengguna.
* Fetch API untuk simulasi pengambilan data realtime.
* CSS animation/transitions yang ringan.
* Jangan menggunakan jQuery.

Untuk versi demo, data JSON boleh disimpan dalam:

```javascript
const earthquakeData = { ... };
```

Namun struktur kode harus dibuat sehingga nantinya mudah diganti menjadi:

```javascript
fetch("/api/gempa")
```

atau URL API eksternal.

---

# 2. SUMBER DATA

Gunakan struktur JSON berikut sebagai data utama aplikasi:

```json
{
  "Infogempa": {
    "gempa": [
      {
        "Tanggal": "17 Agu 2026",
        "Jam": "17:42:42 WIB",
        "DateTime": "2026-08-17T10:42:42+00:00",
        "Coordinates": "-7.85,120.47",
        "Lintang": "7.85 LS",
        "Bujur": "120.47 BT",
        "Magnitude": "5.0",
        "Kedalaman": "10 km",
        "Wilayah": "84 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "17 Agu 2026",
        "Jam": "14:20:20 WIB",
        "DateTime": "2026-08-17T07:20:20+00:00",
        "Coordinates": "-7.84,120.52",
        "Lintang": "7.84 LS",
        "Bujur": "120.52 BT",
        "Magnitude": "5.0",
        "Kedalaman": "10 km",
        "Wilayah": "86 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "17 Agu 2026",
        "Jam": "10:48:05 WIB",
        "DateTime": "2026-08-17T03:48:05+00:00",
        "Coordinates": "-8.30,121.28",
        "Lintang": "8.30 LS",
        "Bujur": "121.28 BT",
        "Magnitude": "5.1",
        "Kedalaman": "10 km",
        "Wilayah": "41 km BaratLaut MBAY-NAGEKEO-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "17 Agu 2026",
        "Jam": "10:36:41 WIB",
        "DateTime": "2026-08-17T03:36:41+00:00",
        "Coordinates": "-8.26,121.25",
        "Lintang": "8.26 LS",
        "Bujur": "121.25 BT",
        "Magnitude": "5.4",
        "Kedalaman": "10 km",
        "Wilayah": "46 km BaratLaut MBAY-NAGEKEO-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "17 Agu 2026",
        "Jam": "07:46:43 WIB",
        "DateTime": "2026-08-17T00:46:43+00:00",
        "Coordinates": "-8.38,121.52",
        "Lintang": "8.38 LS",
        "Bujur": "121.52 BT",
        "Magnitude": "5.8",
        "Kedalaman": "10 km",
        "Wilayah": "40 km TimurLaut MBAY-NAGEKEO-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "17 Agu 2026",
        "Jam": "00:26:17 WIB",
        "DateTime": "2026-08-16T17:26:17+00:00",
        "Coordinates": "-7.93,120.50",
        "Lintang": "7.93 LS",
        "Bujur": "120.50 BT",
        "Magnitude": "5.0",
        "Kedalaman": "10 km",
        "Wilayah": "75 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "16 Agu 2026",
        "Jam": "20:38:41 WIB",
        "DateTime": "2026-08-16T13:38:41+00:00",
        "Coordinates": "-7.95,120.58",
        "Lintang": "7.95 LS",
        "Bujur": "120.58 BT",
        "Magnitude": "5.2",
        "Kedalaman": "10 km",
        "Wilayah": "74 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "16 Agu 2026",
        "Jam": "17:31:37 WIB",
        "DateTime": "2026-08-16T10:31:37+00:00",
        "Coordinates": "-7.93,120.62",
        "Lintang": "7.93 LS",
        "Bujur": "120.62 BT",
        "Magnitude": "5.1",
        "Kedalaman": "10 km",
        "Wilayah": "77 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "16 Agu 2026",
        "Jam": "17:14:37 WIB",
        "DateTime": "2026-08-16T10:14:37+00:00",
        "Coordinates": "-7.93,120.65",
        "Lintang": "7.93 LS",
        "Bujur": "120.65 BT",
        "Magnitude": "5.6",
        "Kedalaman": "10 km",
        "Wilayah": "78 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "16 Agu 2026",
        "Jam": "13:51:48 WIB",
        "DateTime": "2026-08-16T06:51:48+00:00",
        "Coordinates": "-7.94,120.65",
        "Lintang": "7.94 LS",
        "Bujur": "120.65 BT",
        "Magnitude": "5.5",
        "Kedalaman": "10 km",
        "Wilayah": "77 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "16 Agu 2026",
        "Jam": "06:12:54 WIB",
        "DateTime": "2026-08-15T23:12:54+00:00",
        "Coordinates": "-7.87,120.64",
        "Lintang": "7.87 LS",
        "Bujur": "120.64 BT",
        "Magnitude": "5.2",
        "Kedalaman": "10 km",
        "Wilayah": "84 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "15 Agu 2026",
        "Jam": "23:25:19 WIB",
        "DateTime": "2026-08-15T16:25:19+00:00",
        "Coordinates": "0.25,120.22",
        "Lintang": "0.25 LU",
        "Bujur": "120.22 BT",
        "Magnitude": "6.2",
        "Kedalaman": "44 km",
        "Wilayah": "74 km BaratDaya PARIGIMOUTONG-SULTENG",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "15 Agu 2026",
        "Jam": "19:14:41 WIB",
        "DateTime": "2026-08-15T12:14:41+00:00",
        "Coordinates": "-8.25,121.28",
        "Lintang": "8.25 LS",
        "Bujur": "121.28 BT",
        "Magnitude": "5.1",
        "Kedalaman": "10 km",
        "Wilayah": "47 km BaratLaut MBAY-NAGEKEO-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "15 Agu 2026",
        "Jam": "17:54:52 WIB",
        "DateTime": "2026-08-15T10:54:52+00:00",
        "Coordinates": "2.97,98.95",
        "Lintang": "2.97 LU",
        "Bujur": "98.95 BT",
        "Magnitude": "6.4",
        "Kedalaman": "163 km",
        "Wilayah": "10 km Tenggara SIMALUNGUN-SUMUT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "15 Agu 2026",
        "Jam": "14:39:41 WIB",
        "DateTime": "2026-08-15T07:39:41+00:00",
        "Coordinates": "-7.94,120.79",
        "Lintang": "7.94 LS",
        "Bujur": "120.79 BT",
        "Magnitude": "5.1",
        "Kedalaman": "10 km",
        "Wilayah": "82 km TimurLaut RUTENG-MANGGARAI-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      }
    ]
  }
}
```

---

# 3. KONSEP UI

Buat aplikasi dengan nama:

**GEMPA MONITOR**

Subtitle:

**Monitoring Gempa Bumi Indonesia Realtime**

Gunakan visual dashboard modern:

* Background `slate-950`.
* Card `slate-900`.
* Border tipis `slate-800`.
* Text putih/slate.
* Accent merah/oranye untuk gempa.
* Hijau untuk status aman.
* Kuning untuk peringatan.
* Merah untuk gempa kuat.
* Rounded corners.
* Soft shadow.
* Glassmorphism secukupnya.
* Jangan membuat UI terlalu ramai.

Gunakan icon yang relevan.

---

# 4. HEADER

Buat header sticky/mobile-friendly.

Isi:

**Logo/icon**
🌋

**GEMPA MONITOR**

Status:

🟢 LIVE

Di sebelah kanan:

* Tombol refresh.
* Tombol dark/light mode jika diperlukan.
* Jam realtime.

Contoh:

```text
🌋 GEMPA MONITOR
Indonesia Earthquake Monitoring

● LIVE                 22:08:12 WIB
```

Jam harus berjalan realtime menggunakan JavaScript.

---

# 5. HERO / GEMPA TERBARU

Buat card besar untuk gempa terbaru.

Tampilkan:

* Magnitude besar.
* Wilayah.
* Waktu.
* Kedalaman.
* Koordinat.
* Status tsunami.

Contoh:

```text
GEMPA TERBARU

5.0
MAGNITUDE

84 km TimurLaut RUTENG-MANGGARAI-NTT

17 Agu 2026 • 17:42:42 WIB

Kedalaman       10 km
Koordinat       -7.85, 120.47

🟢 Tidak berpotensi tsunami
```

Magnitude harus menjadi elemen visual paling menonjol.

Gunakan warna magnitude secara dinamis:

* `< 3.0` → hijau
* `3.0 - 4.9` → biru
* `5.0 - 5.9` → kuning/oranye
* `6.0 - 6.9` → merah
* `>= 7.0` → merah gelap + animasi pulse

---

# 6. STATISTIK

Buat 4 summary cards:

### Total Gempa

Jumlah seluruh data.

### Gempa M5+

Jumlah gempa dengan magnitude >= 5.

### Magnitude Terbesar

Magnitude terbesar pada dataset.

### Kedalaman Terdangkal

Kedalaman terkecil.

Pada mobile:

```text
[ Total ] [ M5+ ]

[ Terbesar ] [ Terdangkal ]
```

Pada desktop gunakan grid 4 kolom.

---

# 7. FILTER

Buat filter interaktif.

Filter:

### Magnitude

* Semua
* M < 5
* M 5+
* M 6+

### Wilayah

Search berdasarkan `Wilayah`.

### Tanggal

Filter berdasarkan tanggal.

### Potensi Tsunami

* Semua
* Berpotensi tsunami
* Tidak berpotensi tsunami

Tambahkan tombol:

**Reset Filter**

Filter harus bekerja secara realtime tanpa reload halaman.

---

# 8. DAFTAR GEMPA

Tampilkan earthquake list.

Setiap item memiliki:

```text
5.8
MAG

40 km TimurLaut MBAY-NAGEKEO-NTT

17 Agu 2026
07:46:43 WIB

Depth 10 km
-8.38, 121.52

🟢 Tidak berpotensi tsunami
```

Gunakan card/list yang sangat nyaman untuk touchscreen.

Pada mobile jangan menggunakan tabel horizontal yang menyebabkan overflow.

Pada desktop boleh menggunakan tabel atau card grid.

---

# 9. SORTING

Sediakan sorting:

* Terbaru.
* Terlama.
* Magnitude terbesar.
* Magnitude terkecil.
* Kedalaman terdangkal.
* Kedalaman terdalam.

Default:

**Terbaru**

Gunakan `DateTime` untuk sorting, bukan string `Tanggal`.

---

# 10. PAGINATION / LOAD MORE

Jangan langsung menampilkan seluruh data jika dataset besar.

Buat:

**Load More**

atau pagination sederhana.

Default:

10 data per halaman.

---

# 11. DETAIL GEMPA

Ketika user mengklik earthquake card, buka modal/detail drawer.

Tampilkan:

* Tanggal
* Jam
* DateTime
* Magnitude
* Kedalaman
* Wilayah
* Latitude
* Longitude
* Coordinates
* Potensi tsunami

Tambahkan tombol:

**Lihat di Peta**

Jika memungkinkan buka koordinat menggunakan URL Google Maps berdasarkan latitude/longitude.

Jangan hardcode koordinat.

Parse:

```text
Coordinates: "-7.85,120.47"
```

menjadi:

```javascript
const [lat, lon] = earthquake.Coordinates.split(",");
```

---

# 12. PETA

Tambahkan peta interaktif Indonesia.

Gunakan library ringan seperti:

**Leaflet.js**

Tampilkan marker untuk setiap earthquake.

Marker harus menggunakan warna berdasarkan magnitude.

Popup marker menampilkan:

* Magnitude
* Wilayah
* Waktu
* Kedalaman

Gunakan:

```javascript
L.marker([lat, lon])
```

Jika menggunakan OpenStreetMap tile, jangan hardcode attribution secara tidak benar.

Map harus responsive dan mempunyai tinggi yang nyaman pada mobile.

Contoh layout mobile:

```text
┌─────────────────────────┐
│       PETA GEMPA        │
│                         │
│        🌋               │
│             🌋          │
│                         │
└─────────────────────────┘
```

---

# 13. REALTIME UPDATE

Implementasikan sistem polling.

Contoh konfigurasi:

```javascript
const CONFIG = {
  API_URL: null,
  REFRESH_INTERVAL: 60000
};
```

Jika `API_URL === null`, gunakan data lokal.

Jika `API_URL` tersedia, gunakan:

```javascript
async function fetchEarthquakeData() {
    const response = await fetch(CONFIG.API_URL);
    if (!response.ok) {
        throw new Error("Gagal mengambil data gempa");
    }

    return await response.json();
}
```

Kemudian:

```javascript
setInterval(loadEarthquakeData, CONFIG.REFRESH_INTERVAL);
```

Tambahkan indikator:

```text
● LIVE
Last updated: 22:08:12 WIB
Next update in 58s
```

Countdown harus berjalan realtime.

---

# 14. DETEKSI DATA BARU

Bandingkan `DateTime` gempa terbaru dengan data sebelumnya.

Jika terdapat earthquake baru:

1. Update dashboard.
2. Tampilkan notification/toast.
3. Berikan highlight pada gempa baru.
4. Jika magnitude >= 5.0, tampilkan notifikasi lebih menonjol.

Contoh:

```text
🔴 GEMPA BARU

M 5.4
46 km BaratLaut MBAY-NAGEKEO-NTT
```

Jangan menggunakan browser notification secara otomatis tanpa izin user.

---

# 15. NOTIFIKASI TOAST

Buat toast notification reusable.

Contoh:

```text
┌───────────────────────────┐
│ ✓ Data berhasil diperbarui│
│ 17 gempa ditemukan        │
└───────────────────────────┘
```

Toast otomatis hilang setelah beberapa detik.

---

# 16. STATUS ERROR

Jika API gagal:

```text
🔴 Koneksi data bermasalah

Data terakhir:
17 Agu 2026 • 17:42:42 WIB

Mencoba menghubungkan kembali...
```

Jangan menghapus data terakhir ketika request berikutnya gagal.

Gunakan data cached terakhir.

---

# 17. EMPTY STATE

Jika filter tidak menghasilkan data:

```text
Tidak ada gempa ditemukan

Coba ubah filter atau kata pencarian.
```

Tambahkan tombol:

**Reset Filter**

---

# 18. LOADING STATE

Saat pertama kali aplikasi dimuat:

Gunakan skeleton loading.

Contoh:

```text
████████████
██████████████████
████████
```

Jangan langsung menampilkan layout kosong.

---

# 19. RESPONSIVE DESIGN

WAJIB mobile-first.

Breakpoint:

* Mobile: default.
* Tablet: `md`.
* Desktop: `lg`.
* Large desktop: `xl`.

Pastikan:

* Tidak ada horizontal overflow.
* Button minimal sekitar 44px tinggi.
* Text mudah dibaca.
* Card tidak terlalu kecil.
* Map tidak terpotong.
* Modal nyaman digunakan dengan satu tangan.
* Navigation/header tetap usable pada layar kecil.

Target minimal:

```text
360px
390px
412px
768px
1024px
1280px
1440px
```

---

# 20. ACCESSIBILITY

Implementasikan:

* Semantic HTML.
* `aria-label`.
* Keyboard navigation.
* Focus state.
* Kontras warna yang baik.
* Tombol harus memiliki accessible name.
* Modal dapat ditutup dengan ESC.
* Jangan mengandalkan warna saja untuk menyampaikan status.

---

# 21. DARK/LIGHT MODE

Default:

**Dark mode**

Simpan preferensi menggunakan:

```javascript
localStorage
```

Jika user mengganti tema, pilihan tetap tersimpan setelah refresh.

---

# 22. DATA PROCESSING

Buat fungsi reusable:

```javascript
getEarthquakes()
getLatestEarthquake()
getLargestMagnitude()
getShallowestEarthquake()
getMagnitudeStats()
filterEarthquakes()
sortEarthquakes()
parseCoordinates()
formatDateTime()
getMagnitudeClass()
getMagnitudeColor()
renderEarthquakes()
renderStats()
renderMap()
showEarthquakeDetail()
showToast()
```

Jangan membuat satu fungsi JavaScript raksasa.

Pisahkan:

```text
DATA
STATE
UTILITIES
FILTER
RENDER
MAP
REALTIME
UI
```

---

# 23. STATE MANAGEMENT

Gunakan state sederhana:

```javascript
const state = {
    earthquakes: [],
    filteredEarthquakes: [],
    currentPage: 1,
    pageSize: 10,
    sortBy: "latest",
    magnitudeFilter: "all",
    tsunamiFilter: "all",
    search: "",
    selectedEarthquake: null,
    isLoading: false,
    lastUpdated: null
};
```

Semua perubahan UI harus bersumber dari state tersebut.

---

# 24. SECURITY DAN ROBUSTNESS

Jangan menggunakan:

```javascript
eval()
```

Validasi data API.

Antisipasi field:

* null
* undefined
* string kosong
* angka dalam bentuk string
* API error
* malformed JSON

Jangan membuat aplikasi crash jika satu record JSON tidak lengkap.

Gunakan fallback:

```javascript
value ?? "-"
```

Pastikan data dari API tidak langsung dimasukkan ke HTML tanpa sanitasi yang sesuai.

---

# 25. PWA

Jika memungkinkan, tambahkan dukungan Progressive Web App:

```text
manifest.json
service-worker.js
```

Aplikasi dapat di-install ke home screen smartphone.

Tambahkan:

* App icon.
* Splash/theme color.
* Offline fallback.
* Cache asset statis.

Jika PWA terlalu kompleks untuk satu file demo, buat versi dasar tetapi tetap siapkan struktur agar mudah dikembangkan.

---

# 26. STRUKTUR FILE

Buat struktur:

```text
earthquake-monitor/
│
├── index.html
├── manifest.json
├── service-worker.js
│
├── assets/
│   ├── icon-192.png
│   └── icon-512.png
│
├── css/
│   └── app.css
│
└── js/
    ├── data.js
    ├── app.js
    ├── map.js
    ├── ui.js
    └── realtime.js
```

Jika output hanya satu file diperbolehkan, gabungkan seluruh kode ke `index.html`, tetapi tetap pisahkan kode menggunakan komentar:

```text
DATA
CONFIG
STATE
UTILITIES
UI
FILTER
MAP
REALTIME
EVENT HANDLERS
INITIALIZATION
```

---

# 27. PERFORMA

Optimalkan:

* DOM rendering.
* Event delegation.
* Debounce search.
* Jangan render ulang seluruh halaman jika tidak diperlukan.
* Hindari memory leak dari interval/event listener.
* Jangan membuat marker Leaflet berulang tanpa menghapus/memperbarui marker lama.
* Gunakan `DocumentFragment` jika relevan.

Search harus menggunakan debounce sekitar 250–300ms.

---

# 28. UX TAMBAHAN

Tambahkan:

* "Terakhir diperbarui".
* Countdown refresh.
* LIVE indicator.
* Scroll-to-top button.
* Smooth animation.
* Hover state desktop.
* Active state mobile.
* Toast.
* Skeleton loading.
* Modal detail.
* Search.
* Filter.
* Sorting.
* Load more.

---

# 29. INFORMASI KEAMANAN

Tambahkan footer kecil:

```text
⚠️ Informasi gempa ditampilkan untuk tujuan monitoring.
Untuk informasi resmi dan peringatan kebencanaan, selalu ikuti informasi dari BMKG dan instansi berwenang.
```

Jangan menyatakan aplikasi sebagai sumber peringatan resmi.

---

# 30. EMPTY / ERROR / OFFLINE

Pastikan terdapat UI untuk:

### Loading

```text
Memuat data gempa...
```

### Success

```text
● LIVE
Data diperbarui
```

### Error

```text
Tidak dapat memperbarui data
```

### Offline

```text
Offline — menampilkan data terakhir
```

Deteksi:

```javascript
window.addEventListener("online", ...)
window.addEventListener("offline", ...)
```

---

# 31. DESAIN DESKTOP

Desktop layout:

```text
┌──────────────────────────────────────────────────────┐
│ 🌋 GEMPA MONITOR                 ● LIVE     22:08 WIB│
├──────────────────────────────────────────────────────┤
│                                                      │
│  GEMPA TERBARU                    │   STATISTIK      │
│  M 5.0                            │   17 Gempa       │
│  RUTENG-MANGGARAI                 │   15 M5+         │
│                                   │   M 6.4 Terbesar │
│                                                      │
├──────────────────────────────────────────────────────┤
│ FILTER                                                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│ PETA GEMPA                                           │
│                                                      │
├──────────────────────────────────────────────────────┤
│ DAFTAR GEMPA                                         │
│                                                      │
│ M5.8  MBAY...                                        │
│ M5.4  MBAY...                                        │
│ M5.1  MBAY...                                        │
└──────────────────────────────────────────────────────┘
```

---

# 32. DESAIN MOBILE

Prioritaskan layout:

```text
┌──────────────────────┐
│ 🌋 GEMPA MONITOR     │
│ ● LIVE      22:08 WIB│
├──────────────────────┤
│ GEMPA TERBARU        │
│                      │
│       5.0            │
│     MAGNITUDE        │
│                      │
│ RUTENG-MANGGARAI     │
│ 17 Agu • 17:42 WIB   │
│                      │
│ 🟢 Tidak tsunami     │
├──────────────────────┤
│ TOTAL    │ M5+       │
│ 17       │ 15        │
├──────────────────────┤
│ PETA GEMPA           │
│                      │
│       MAP            │
│                      │
├──────────────────────┤
│ 🔎 Cari wilayah      │
│                      │
│ Filter ▼             │
├──────────────────────┤
│ DAFTAR GEMPA         │
│                      │
│ ┌──────────────────┐ │
│ │ M 5.8            │ │
│ │ MBAY-NAGEKEO     │ │
│ │ 10 km • 07:46    │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ M 5.4            │ │
│ │ MBAY-NAGEKEO     │ │
│ └──────────────────┘ │
└──────────────────────┘
```

---

# 33. WARNA MAGNITUDE

Gunakan utility JavaScript untuk menentukan warna:

```javascript
function getMagnitudeColor(magnitude) {
    if (magnitude >= 7) return "red";
    if (magnitude >= 6) return "orange";
    if (magnitude >= 5) return "yellow";
    if (magnitude >= 3) return "blue";
    return "green";
}
```

Sesuaikan dengan Tailwind tanpa menghasilkan class dinamis yang tidak terdeteksi oleh Tailwind CDN.

---

# 34. PENGURUTAN DATA

Walaupun JSON sudah terlihat berurutan, jangan bergantung pada urutan tersebut.

Selalu gunakan:

```javascript
new Date(DateTime)
```

untuk menentukan data terbaru.

Gempa terbaru:

```javascript
earthquakes
    .slice()
    .sort((a, b) =>
        new Date(b.DateTime) - new Date(a.DateTime)
    )[0];
```

---

# 35. TESTING

Setelah membuat aplikasi, lakukan pengecekan:

1. Apakah JSON berhasil dibaca?
2. Apakah gempa terbaru benar?
3. Apakah magnitude terbesar benar?
4. Apakah filter bekerja?
5. Apakah search bekerja?
6. Apakah sorting bekerja?
7. Apakah modal bekerja?
8. Apakah map menampilkan marker?
9. Apakah koordinat negatif diproses dengan benar?
10. Apakah polling bekerja?
11. Apakah countdown bekerja?
12. Apakah error API ditangani?
13. Apakah offline state bekerja?
14. Apakah mobile 360px tidak horizontal overflow?
15. Apakah dark/light mode tersimpan?
16. Apakah tombol keyboard accessible?
17. Apakah tidak ada error JavaScript di console?

---

# 36. OUTPUT YANG SAYA INGINKAN

Berikan hasil berupa aplikasi yang **langsung dapat dijalankan**.

Jika menghasilkan satu file:

```text
index.html
```

maka file tersebut harus sudah berisi:

* HTML.
* Tailwind CDN.
* JavaScript.
* JSON dataset.
* Leaflet.
* UI.
* Responsive layout.
* Filtering.
* Search.
* Sorting.
* Modal.
* Realtime polling.
* Countdown.
* Toast.
* Map.
* Theme.
* Error handling.

Jika menggunakan struktur multi-file, tampilkan seluruh file yang diperlukan.

**Jangan memberikan pseudocode.**

**Jangan menggunakan placeholder seperti `// implement here`.**

**Jangan memotong kode dengan `...`.**

Semua fungsi harus benar-benar diimplementasikan.

---

# 37. HASIL AKHIR

Setelah kode selesai:

1. Jelaskan struktur aplikasi secara singkat.
2. Jelaskan cara menjalankannya.
3. Jelaskan bagian yang harus diganti ketika API realtime asli tersedia.
4. Pastikan aplikasi dapat berjalan hanya dengan membuka `index.html` jika menggunakan versi single-file.
5. Pastikan tidak ada dependency build seperti npm/Vite/Webpack untuk versi demo.
6. Gunakan CDN untuk dependency eksternal.
7. Berikan kode lengkap dan siap copy-paste.

## PRIORITAS

Urutan prioritas pengembangan:

**1. Functional**
→ aplikasi harus bekerja.

**2. Mobile UX**
→ nyaman digunakan pada smartphone.

**3. Realtime**
→ data dapat diperbarui otomatis.

**4. Visual**
→ modern dan profesional.

**5. Performance**
→ ringan dan cepat.

**6. Accessibility**
→ dapat digunakan oleh sebanyak mungkin pengguna.

Buat hasil akhir terlihat seperti **dashboard monitoring gempa profesional**, bukan sekadar halaman HTML yang menampilkan JSON.
