"use client";

import { useEffect, useState } from "react";

import { Briefcase, CalendarDays, Phone, User } from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { EmpresaOption, Trabajador } from "./types";

type TrabajadorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId?: string;
  empresas?: EmpresaOption[];
  onCreated: () => void;
  onSaved?: (trabajador: Trabajador) => void;
  trabajador?: Trabajador | null;
};

export default function TrabajadorDialog({
  open,
  onOpenChange,
  empresaId,
  empresas = [],
  onCreated,
  onSaved,
  trabajador,
}: TrabajadorDialogProps) {
  const [nombre, setNombre] = useState("");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(empresaId || "");
  const [cargo, setCargo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState("");

  useEffect(() => {
    if (!open) return;

    if (!trabajador) {
      setNombre("");
      setEmpresaSeleccionada(empresaId || "");
      setCargo("");
      setFechaNacimiento("");
      setFechaIngreso("");
      setTelefono("");
      setCorreo("");
      setEstado("Activo");
      setFoto(null);
      setPreviewFoto("");
      return;
    }

    setNombre(trabajador.nombre || "");
    setEmpresaSeleccionada(trabajador.empresa_id || empresaId || "");
    setCargo(trabajador.cargo || "");
    setFechaNacimiento(trabajador.fecha_nacimiento || "");
    setFechaIngreso(trabajador.fecha_ingreso || "");
    setTelefono(trabajador.telefono || "");
    setCorreo(trabajador.correo || "");
    setEstado(trabajador.estado || "Activo");

    if (trabajador.foto_url) {
      const { data } = supabase.storage
        .from("trabajadores")
        .getPublicUrl(trabajador.foto_url);

      setPreviewFoto(data.publicUrl);
    } else {
      setPreviewFoto("");
    }

    setFoto(null);
  }, [trabajador, open, empresaId]);

  function limpiarFormulario() {
    setNombre("");
    setEmpresaSeleccionada(empresaId || "");
    setCargo("");
    setFechaNacimiento("");
    setFechaIngreso("");
    setTelefono("");
    setCorreo("");
    setEstado("Activo");
    setFoto(null);
    setPreviewFoto("");
  }

  async function guardarTrabajador() {
    if (!nombre.trim()) {
      alert("Debe ingresar el nombre.");
      return;
    }

    if (!empresaSeleccionada) {
      alert("Debe seleccionar una empresa.");
      return;
    }

    let fotoUrl = trabajador?.foto_url || null;

    if (foto) {
      const extension = foto.name.split(".").pop();
      const nombreArchivo = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("trabajadores")
        .upload(nombreArchivo, foto);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      fotoUrl = nombreArchivo;
    }

    const payload = {
      empresa_id: empresaSeleccionada,
      nombre,
      cargo,
      fecha_nacimiento: fechaNacimiento || null,
      fecha_ingreso: fechaIngreso || null,
      telefono,
      correo,
      estado,
      foto_url: fotoUrl,
    };

    const query = trabajador
      ? supabase
          .from("trabajadores_empresa")
          .update(payload)
          .eq("id", trabajador.id)
      : supabase
          .from("trabajadores_empresa")
          .insert(payload);

    const { data, error } = await query
      .select(`
        *,
        empresas (
          nombre
        )
      `)
      .single();

    if (error) {
      alert(error.message || "No fue posible guardar el trabajador.");
      return;
    }

    if (data) {
      onSaved?.(data);
    }

    onOpenChange(false);
    limpiarFormulario();

    if (!onSaved) {
      onCreated();
    }
  }

  const inputClass = `
    w-full
    rounded-xl
    border
    border-slate-200
    px-4
    py-3
    outline-none
    transition
    focus:border-[#0B4A92]
    focus:ring-4
    focus:ring-blue-100
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {trabajador ? "Editar trabajador" : "Nuevo trabajador"}
          </DialogTitle>
          <p className="mt-1 text-sm text-slate-500">
            Registra la información del trabajador de la empresa.
          </p>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center">
          <label htmlFor="foto-trabajador" className="cursor-pointer">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 transition hover:bg-blue-50">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt="Foto trabajador"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={30} className="text-slate-400" />
              )}
            </div>
          </label>

          <input
            id="foto-trabajador"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const archivo = event.target.files?.[0];
              if (!archivo) return;

              setFoto(archivo);
              setPreviewFoto(URL.createObjectURL(archivo));
            }}
          />

          <button
            type="button"
            onClick={() => document.getElementById("foto-trabajador")?.click()}
            className="mt-2 text-sm font-medium text-[#0B4A92] hover:underline"
          >
            {previewFoto ? "Cambiar fotografía" : "Agregar fotografía"}
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <section>
            <SectionTitle
              icon={<User size={18} />}
              title="Información personal"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Nombre completo"
                className={inputClass}
              />
              <input
                value={cargo}
                onChange={(event) => setCargo(event.target.value)}
                placeholder="Cargo"
                className={inputClass}
              />
            </div>
          </section>

          <section>
            <SectionTitle
              icon={<Phone size={18} />}
              title="Información de contacto"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                placeholder="Teléfono"
                className={inputClass}
              />
              <input
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="Correo electrónico"
                className={inputClass}
              />
            </div>
          </section>

          <section>
            <SectionTitle
              icon={<Briefcase size={18} />}
              title="Información laboral"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={empresaSeleccionada}
                onChange={(event) => setEmpresaSeleccionada(event.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar empresa</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={fechaIngreso}
                onChange={(event) => setFechaIngreso(event.target.value)}
                className={inputClass}
              />

              <select
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                className={inputClass}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </section>

          <section>
            <SectionTitle
              icon={<CalendarDays size={18} />}
              title="Fecha de nacimiento"
            />
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(event) => setFechaNacimiento(event.target.value)}
              className={inputClass}
            />
          </section>
        </div>

        <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => {
              limpiarFormulario();
              onOpenChange(false);
            }}
            className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={guardarTrabajador}
            className="rounded-xl bg-[#0B4A92] px-5 py-2.5 font-medium text-white transition hover:bg-[#0B75C9]"
          >
            {trabajador ? "Actualizar trabajador" : "Guardar trabajador"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B4A92]">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-800">
        {title}
      </h3>
    </div>
  );
}
