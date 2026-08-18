-- ============================================================
-- GEMPA MONITOR — MIGRATION FIX (untuk tabel yang sudah dibuat)
-- ============================================================
-- Jalankan di Supabase SQL Editor jika tabel `gempa` sudah ada
-- dengan constraint unik lama `wilayah`.
--
-- Masalah: beberapa gempa BMKG memiliki wilayah yang sama
-- (contoh: "84 km TimurLaut RUTENG-MANGGARAI-NTT" muncul
-- beberapa kali pada jam berbeda), sehingga constraint unik
-- `wilayah` lama menyebabkan data tertimpa / gagal insert.
--
-- Solusi: hapus constraint unik `wilayah`, lalu tambahkan
-- indeks (tidak unik) untuk performa query.
-- ============================================================

-- Hapus constraint unik lama (jika ada)
alter table public.gempa drop constraint if exists gempa_wilayah_key;

-- Pastikan kolom `tanggal` ada (jika tabel lama menggunakan nama lain)
-- Jika tabel lama menggunakan kolom `tanggal` sebagai text, tidak perlu diubah.

-- Tambahkan indeks untuk sorting tanggal (tidak unik)
create index if not exists idx_gempa_tanggal on public.gempa (tanggal desc);

-- Hapus data test yang tidak valid (jika ada)
delete from public.gempa where tanggal = 'test-insert';