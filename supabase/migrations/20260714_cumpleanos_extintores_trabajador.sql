create table if not exists public.cumpleanos_plantillas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  nombre text not null,
  contenido text not null,
  predeterminada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cumpleanos_historial (
  id uuid primary key default gen_random_uuid(),
  trabajador_id uuid references public.trabajadores_empresa(id) on delete set null,
  empresa_id uuid references public.empresas(id) on delete set null,
  tipo text not null,
  estado text not null default 'Pendiente',
  mensaje text,
  created_at timestamptz not null default now()
);

insert into public.cumpleanos_plantillas (tipo, nombre, contenido, predeterminada)
select
  'WhatsApp',
  'Felicitación WhatsApp predeterminada',
  'Hola {{nombre}}.

Todo el equipo de {{empresa}} te desea un muy feliz cumpleaños.

Esperamos que disfrutes este día.

SEITON',
  true
where not exists (
  select 1 from public.cumpleanos_plantillas
  where tipo = 'WhatsApp' and predeterminada = true
);

insert into public.cumpleanos_plantillas (tipo, nombre, contenido, predeterminada)
select
  'Correo',
  'Felicitación correo predeterminada',
  'Hola {{nombre}}.

Todo el equipo de {{empresa}} te desea un muy feliz cumpleaños.

Esperamos que disfrutes este día.

SEITON',
  true
where not exists (
  select 1 from public.cumpleanos_plantillas
  where tipo = 'Correo' and predeterminada = true
);

insert into public.cumpleanos_plantillas (tipo, nombre, contenido, predeterminada)
select
  'Interna',
  'Mensaje interno predeterminado',
  'Hoy está de cumpleaños {{nombre}} de {{empresa}}. Cumple {{edad}} años.',
  true
where not exists (
  select 1 from public.cumpleanos_plantillas
  where tipo = 'Interna' and predeterminada = true
);

alter table public.extintores
  add column if not exists responsable_calendario text,
  add column if not exists google_calendar_event_ids jsonb not null default '[]'::jsonb;
