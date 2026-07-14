"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Cake,
  Clock3,
  Mail,
  Pencil,
  Phone,
  User,
} from "lucide-react";

import TrabajadorAvatar from "@/components/ui/trabajadores/TrabajadorAvatar";
import TrabajadorDialog from "@/components/ui/trabajadores/TrabajadorDialog";
import type {
  EmpresaOption,
  Trabajador,
} from "@/components/ui/trabajadores/types";
import { supabase } from "@/lib/supabase";

export default function TrabajadorPage() {
  const params = useParams();
  const router = useRouter();
  const trabajadorId = params.id as string;

  const [trabajador, setTrabajador] =
    useState<Trabajador | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [openEditar, setOpenEditar] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const [trabajadorResult, empresasResult] =
      await Promise.all([
        supabase
          .from("trabajadores_empresa")
          .select(`
            *,
            empresas (
              nombre
            )
          `)
          .eq("id", trabajadorId)
          .single(),
        supabase
          .from("empresas")
          .select("id, nombre")
          .eq("activa", true)
          .order("nombre", { ascending: true }),
      ]);

    if (trabajadorResult.error) {
      console.error(trabajadorResult.error);
      return;
    }

    if (empresasResult.error) {
      console.error(empresasResult.error);
      return;
    }

    setTrabajador(trabajadorResult.data);
    setEmpresas(empresasResult.data || []);
  }

  if (!trabajador) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        Cargando trabajador...
      </div>
    );
  }

  const activo = trabajador.estado === "Activo";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.push("/trabajadores")}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <button
          type="button"
          onClick={() => setOpenEditar(true)}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#0B4A92] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0B75C9]"
        >
          <Pencil size={16} />
          Editar perfil
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <TrabajadorAvatar
            nombre={trabajador.nombre}
            fotoUrl={trabajador.foto_url}
            size="lg"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <h1 className="truncate text-2xl font-black text-slate-800">
                {trabajador.nombre}
              </h1>
              <span
                className={`
                  inline-flex
                  w-fit
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  ${activo
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                  }
                `}
              >
                {trabajador.estado || "Sin estado"}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {trabajador.cargo || "Sin cargo"} · {trabajador.empresas?.nombre || "Sin empresa"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoGroup title="Información personal">
          <InfoItem
            icon={<User size={17} />}
            label="Nombre"
            value={trabajador.nombre}
          />
          <InfoItem
            icon={<Briefcase size={17} />}
            label="Cargo"
            value={trabajador.cargo || "-"}
          />
          <InfoItem
            icon={<Building2 size={17} />}
            label="Empresa"
            value={trabajador.empresas?.nombre || "-"}
          />
          <InfoItem
            icon={<User size={17} />}
            label="Estado"
            value={trabajador.estado || "-"}
          />
        </InfoGroup>

        <InfoGroup title="Información de contacto">
          <InfoItem
            icon={<Phone size={17} />}
            label="Teléfono"
            value={trabajador.telefono || "-"}
          />
          <InfoItem
            icon={<Mail size={17} />}
            label="Correo"
            value={trabajador.correo || "-"}
          />
        </InfoGroup>

        <InfoGroup title="Información laboral">
          <InfoItem
            icon={<CalendarDays size={17} />}
            label="Fecha ingreso"
            value={formatearFecha(trabajador.fecha_ingreso)}
          />
          <InfoItem
            icon={<Clock3 size={17} />}
            label="Antigüedad"
            value={calcularAntiguedad(trabajador.fecha_ingreso)}
          />
          <InfoItem
            icon={<Building2 size={17} />}
            label="Empresa"
            value={trabajador.empresas?.nombre || "-"}
          />
          <InfoItem
            icon={<Briefcase size={17} />}
            label="Cargo"
            value={trabajador.cargo || "-"}
          />
        </InfoGroup>

        <InfoGroup title="Información personal">
          <InfoItem
            icon={<Cake size={17} />}
            label="Fecha nacimiento"
            value={formatearFecha(trabajador.fecha_nacimiento)}
          />
          <InfoItem
            icon={<Clock3 size={17} />}
            label="Edad"
            value={calcularEdad(trabajador.fecha_nacimiento)}
          />
        </InfoGroup>
      </div>

      <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-800">
          Información laboral futura
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Esta sección queda preparada para capacitaciones, actividades realizadas,
          horas trabajadas, historial, documentos y evaluaciones.
        </p>
      </section>

      <TrabajadorDialog
        open={openEditar}
        onOpenChange={setOpenEditar}
        empresaId={trabajador.empresa_id}
        empresas={empresas}
        trabajador={trabajador}
        onCreated={cargarDatos}
        onSaved={(actualizado) => setTrabajador(actualizado)}
      />
    </div>
  );
}

function InfoGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B4A92]">
        {icon}
      </div>
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) return "-";

  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calcularEdad(fecha?: string | null) {
  if (!fecha) return "-";

  const nacimiento = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (
    mes < 0 ||
    (mes === 0 && hoy.getDate() < nacimiento.getDate())
  ) {
    edad -= 1;
  }

  return `${edad} años`;
}

function calcularAntiguedad(fecha?: string | null) {
  if (!fecha) return "-";

  const ingreso = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  let meses =
    (hoy.getFullYear() - ingreso.getFullYear()) * 12 +
    hoy.getMonth() -
    ingreso.getMonth();

  if (hoy.getDate() < ingreso.getDate()) {
    meses -= 1;
  }

  if (meses < 1) return "Menos de 1 mes";

  const años = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  if (años > 0) {
    return `${años} ${años === 1 ? "año" : "años"}`;
  }

  return `${mesesRestantes} ${mesesRestantes === 1 ? "mes" : "meses"}`;
}
