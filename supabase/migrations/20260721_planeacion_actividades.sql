create table if not exists public.planeacion_actividades (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references public.colaboradores(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  horas_programadas numeric(5, 2) not null check (horas_programadas >= 0),
  actividad text not null,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists planeacion_actividades_fecha_idx
  on public.planeacion_actividades (fecha);

create index if not exists planeacion_actividades_colaborador_fecha_idx
  on public.planeacion_actividades (colaborador_id, fecha);

create index if not exists planeacion_actividades_empresa_idx
  on public.planeacion_actividades (empresa_id);
