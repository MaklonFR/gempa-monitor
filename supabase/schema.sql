-- ============================================================
-- GEMPA MONITOR — SUPABASE SCHEMA
-- ============================================================
-- Tabel untuk data gempa realtime.
-- Kolom* mencerminkan data yang dikirim oleh js/supabase.js
-- (saveEarthquakes).
-- `wilayah` unik agar upsert (onConflict) tidak duplikat.
-- ============================================================

create table if not exists public.gempa (
  id uuid primary key default gen_random_uuid(),
  tanggal text not null unique,    -- DateTime ISO BMKG; unik per gempa (untuk upsert)
  magnitude numeric(3,1) not null,
  kedalaman integer null,
  wilayah text not null,
  koordinat text null,             -- "lat,lon" mentah
  potensi text null,
  created_at timestamptz not null default now()
);

-- Indeks untuk sorting terbaru
create index if not exists idx_gempa_tanggal on public.gempa (tanggal desc);

-- Row Level Security (default deny all; ayo tambahkan policy sesuai kebutuhan)
alter table public.gempa enable row level security;

-- Policy: izinkan anon key untuk membaca (dan menulis via anon jika diizinkan)
create policy "gempa_select_public"
  on public.gempa for select
  using (true);

create policy "gempa_insert_public"
  on public.gempa for insert
  with check (true);

create policy "gempa_update_public"
  on public.gempa for update
  using (true);

-- Realtime publication
alter publication supabase_realtime add table public.gempa;