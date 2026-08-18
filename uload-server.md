# 🚀 Panduan Upload ke GitHub & Deploy ke Vercel

Panduan lengkap untuk meng-upload proyek **Gempa Monitor** ke GitHub, lalu men-deploy-nya ke Vercel secara otomatis.

---

## 📋 Prasyarat

Sebelum memulai, pastikan hal-hal berikut sudah tersedia:

| Kebutuhan | Keterangan |
|-----------|------------|
| **Akun GitHub** | Daftar di [github.com](https://github.com) |
| **Akun Vercel** | Daftar di [vercel.com](https://vercel.com) (bisa login pakai GitHub) |
| **Git** | Sudah terinstall di komputer (cek dengan `git --version`) |
| **Node.js** | Sudah terinstall (cek dengan `node --version`) |

---

## 📦 Bagian 1: Upload ke GitHub

### Langkah 1.1 — Inisialisasi Git (jika belum)

Buka **Command Prompt** / **Terminal** di folder proyek:

```bash
cd c:\Users\Admin\Music\kiro-project\gempa-data
```

Jika folder belum memiliki repository Git, inisialisasi:

```bash
git init
```

### Langkah 1.2 — Buat File `.gitignore`

Buat file `.gitignore` di root proyek (jika belum ada) dengan isi:

```
node_modules/
.env
.DS_Store
*.log
```

> ⚠️ **PENTING:** File `.env` **JANGAN** di-upload ke GitHub karena berisi kredensial. Kredensial Supabase sudah di-hardcode di `js/supabase-config.js`, jadi aplikasi tetap berfungsi.

### Langkah 1.3 — Tambahkan Semua File ke Staging

```bash
git add .
```

### Langkah 1.4 — Commit Perubahan

```bash
git commit -m "Initial commit: Gempa Monitor Indonesia"
```

### Langkah 1.5 — Buat Repository di GitHub

1. Buka [github.com](https://github.com) dan login.
2. Klik tombol **"+"** di pojok kanan atas → **"New repository"**.
3. Isi **Repository name**, contoh: `gempa-monitor`.
4. Pilih **Public** atau **Private** (bebas).
5. **JANGAN** centang "Add a README file" (karena sudah ada).
6. Klik **"Create repository"**.

### Langkah 1.6 — Hubungkan Repository Lokal ke GitHub

Setelah repository dibuat, GitHub akan menampilkan perintah. Salin dan jalankan:

```bash
git remote add origin https://github.com/USERNAME/gempa-monitor.git
```

> Ganti `USERNAME` dengan username GitHub Anda.

### Langkah 1.7 — Push ke GitHub

```bash
git branch -M main
git push -u origin main
```

### ✅ Selesai Bagian 1

Proyek Anda sekarang sudah ada di GitHub. Buka `https://github.com/USERNAME/gempa-monitor` untuk memverifikasi.

---

## ⚡ Bagian 2: Deploy ke Vercel

Ada **2 cara** untuk deploy ke Vercel:

### 🅰️ Cara A: Deploy Otomatis via GitHub (Direkomendasikan)

Dengan cara ini, setiap kali Anda push ke GitHub, Vercel akan otomatis deploy versi terbaru.

#### Langkah 2.1 — Login ke Vercel

1. Buka [vercel.com](https://vercel.com).
2. Klik **"Sign Up"** atau **"Log In"**.
3. Pilih **"Continue with GitHub"** dan ikuti proses otorisasi.

#### Langkah 2.2 — Import Repository

1. Setelah login, klik **"Add New..."** → **"Project"**.
2. Pilih repository `gempa-monitor` dari daftar.
3. Klik **"Import"**.

#### Langkah 2.3 — Konfigurasi Project

Vercel akan mendeteksi konfigurasi secara otomatis dari `vercel.json`:

| Pengaturan | Nilai |
|------------|-------|
| **Framework Preset** | `Other` (karena `framework: null` di vercel.json) |
| **Build Command** | Kosong (tidak ada build) |
| **Output Directory** | `.` (root folder) |
| **Install Command** | Kosong |

> ✅ Tidak perlu mengubah apa pun — `vercel.json` sudah dikonfigurasi dengan benar.

#### Langkah 2.4 — Deploy

1. Klik tombol **"Deploy"**.
2. Tunggu beberapa detik hingga proses selesai.
3. Vercel akan memberikan URL, contoh: `https://gempa-monitor.vercel.app`.

#### Langkah 2.5 — Verifikasi

Buka URL yang diberikan dan pastikan aplikasi berjalan dengan baik.

> 🔄 **Auto-Deploy:** Setiap kali Anda push perubahan ke GitHub (`git push`), Vercel akan otomatis deploy versi terbaru. Tidak perlu melakukan apa pun!

---

### 🅱️ Cara B: Deploy via Vercel CLI (Manual)

Cara ini berguna jika ingin deploy langsung dari komputer tanpa GitHub.

#### Langkah 2.1 — Install Vercel CLI

```bash
npm install -g vercel
```

#### Langkah 2.2 — Login ke Vercel

```bash
vercel login
```

Ikuti instruksi di terminal (biasanya membuka browser untuk login).

#### Langkah 2.3 — Deploy ke Production

```bash
vercel --prod
```

Vercel akan menanyakan beberapa hal:

| Pertanyaan | Jawaban |
|------------|---------|
| Set up and deploy? | `Y` |
| Which scope? | Pilih akun Anda |
| Link to existing project? | `N` (jika pertama kali) |
| What's your project's name? | `gempa-monitor` |
| In which directory is your code? | `.` (Enter) |
| Want to modify settings? | `N` |

Setelah selesai, Vercel akan memberikan URL production.

#### Langkah 2.4 — Deploy Preview (Opsional)

Untuk deploy preview (tidak langsung ke production):

```bash
vercel
```

---

## 🔧 Konfigurasi Tambahan (Opsional)

### Custom Domain

1. Di dashboard Vercel, buka project Anda.
2. Klik tab **"Settings"** → **"Domains"**.
3. Masukkan domain Anda, contoh: `gempa.example.com`.
4. Ikuti instruksi untuk mengatur DNS.

### Environment Variables

Karena kredensial Supabase sudah di-hardcode di `js/supabase-config.js`, **tidak perlu** menambahkan environment variables di Vercel.

Namun jika ingin memindahkannya ke environment variables:

1. Di dashboard Vercel, buka **"Settings"** → **"Environment Variables"**.
2. Tambahkan:
   - `VITE_SUPABASE_URL` = `https://emldrttzfynjydkdtmyp.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Klik **"Save"** dan redeploy.

---

## 🔄 Update Aplikasi

### Jika menggunakan Cara A (Auto-Deploy via GitHub):

```bash
git add .
git commit -m "Update fitur baru"
git push
```

Vercel otomatis deploy. Tunggu 1-2 menit.

### Jika menggunakan Cara B (Vercel CLI):

```bash
vercel --prod
```

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| **Halaman 404 setelah deploy** | Pastikan `outputDirectory` di `vercel.json` adalah `.` dan `index.html` ada di root. |
| **Service Worker tidak berfungsi** | Pastikan header `Service-Worker-Allowed: /` sudah ada di `vercel.json` (sudah dikonfigurasi). |
| **Data tidak muncul** | Cek koneksi Supabase di `js/supabase-config.js` dan pastikan tabel `gempa` ada. |
| **Perubahan tidak muncul setelah push** | Tunggu 1-2 menit, atau cek tab **"Deployments"** di dashboard Vercel untuk melihat status. |
| **`vercel` tidak dikenali** | Install ulang: `npm install -g vercel`, lalu buka terminal baru. |
| **Git push ditolak** | Jalankan `git pull origin main --rebase` lalu `git push` lagi. |

---

## 📝 Ringkasan Perintah

```bash
# ===== UPLOAD KE GITHUB =====
cd c:\Users\Admin\Music\kiro-project\gempa-data
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/gempa-monitor.git
git branch -M main
git push -u origin main

# ===== DEPLOY KE VERCEL (CLI) =====
npm install -g vercel
vercel login
vercel --prod

# ===== UPDATE APLIKASI =====
git add .
git commit -m "Update"
git push
```

---

## 🎯 Kesimpulan

1. **Upload ke GitHub** → Push kode ke repository GitHub.
2. **Deploy ke Vercel** → Import repository dari GitHub (Cara A) atau deploy langsung via CLI (Cara B).
3. **Auto-Deploy** → Setiap push ke GitHub otomatis deploy ke Vercel.

Selamat mencoba! 🎉