alter table public.actividades_realizadas
  add column if not exists facturada boolean not null default false,
  add column if not exists fecha_facturacion date,
  add column if not exists cuenta_cobro_id uuid;

create index if not exists actividades_realizadas_facturada_idx
  on public.actividades_realizadas (facturada);

create index if not exists actividades_realizadas_cuenta_cobro_id_idx
  on public.actividades_realizadas (cuenta_cobro_id);
