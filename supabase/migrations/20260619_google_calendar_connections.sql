create table if not exists public.google_calendar_connections (
  colaborador_id uuid primary key references public.colaboradores(id) on delete cascade,
  google_email text not null,
  refresh_token_encrypted text not null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_calendar_connections enable row level security;

-- Los permisos de Google solo se administran desde las rutas del servidor.
-- La service role omite esta política; ningún cliente obtiene los tokens.
