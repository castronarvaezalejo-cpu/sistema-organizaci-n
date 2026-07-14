"use client";

import { useEffect, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
import TrabajadorAvatar from "@/components/ui/trabajadores/TrabajadorAvatar";
import { Trabajador } from "@/components/ui/trabajadores/types";

export default function MiPerfilPage() {
  const [trabajador, setTrabajador] =
    useState<Trabajador | null>(null);
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user.email) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("trabajadores_empresa")
      .select("*, empresas(nombre)")
      .eq("correo", session.user.email)
      .single();

    if (data) {
      setTrabajador(data as Trabajador);
      setTelefono(data.telefono || "");
      setCorreo(data.correo || "");
      setFotoUrl(data.foto_url || null);
    }

    setLoading(false);
  }

  async function subirFoto(file: File) {
    if (!trabajador) return;

    const extension =
      file.name.split(".").pop() || "jpg";
    const path = `${trabajador.id}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("trabajadores")
      .upload(path, file, { upsert: true });

    if (error) {
      alert("No se pudo subir la fotografía.");
      return;
    }

    const { data } = supabase.storage
      .from("trabajadores")
      .getPublicUrl(path);

    setFotoUrl(data.publicUrl);
  }

  async function guardarPerfil() {
    if (!trabajador) return;

    setGuardando(true);

    const { data, error } = await supabase
      .from("trabajadores_empresa")
      .update({
        telefono,
        correo,
        foto_url: fotoUrl,
      })
      .eq("id", trabajador.id)
      .select("*, empresas(nombre)")
      .single();

    setGuardando(false);

    if (error) {
      alert("No se pudo actualizar el perfil.");
      return;
    }

    setTrabajador(data as Trabajador);
    alert("Perfil actualizado.");
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando perfil...
      </div>
    );
  }

  if (!trabajador) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
        No encontramos un trabajador asociado a tu correo.
      </div>
    );
  }

  const trabajadorVista = {
    ...trabajador,
    foto_url: fotoUrl,
  };

  return (
    <div>
      <PageHeader
        title="Mi Perfil"
        description="Consulta y mantén actualizada tu información personal."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col items-center text-center">
            <TrabajadorAvatar
              nombre={trabajadorVista.nombre}
              fotoUrl={trabajadorVista.foto_url}
              size="lg"
            />
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              {trabajador.nombre}
            </h2>
            <p className="text-sm text-slate-500">
              {trabajador.cargo || "Sin cargo"}
            </p>
            <span className="mt-3 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize text-green-700">
              {trabajador.estado || "activo"}
            </span>
          </div>

          <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <Info label="Empresa" value={trabajador.empresas?.nombre} />
            <Info label="Fecha ingreso" value={trabajador.fecha_ingreso} />
            <Info label="Fecha nacimiento" value={trabajador.fecha_nacimiento} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            Editar información
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CampoSoloLectura
              label="Nombre"
              value={trabajador.nombre}
            />
            <CampoSoloLectura
              label="Cargo"
              value={trabajador.cargo}
            />
            <CampoSoloLectura
              label="Empresa"
              value={trabajador.empresas?.nombre}
            />
            <CampoSoloLectura
              label="Estado"
              value={trabajador.estado}
            />

            <Campo
              label="Teléfono"
              value={telefono}
              onChange={setTelefono}
            />
            <Campo
              label="Correo"
              value={correo}
              onChange={setCorreo}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Fotografía
            </p>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0B4A92] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B75C9]">
                <Camera size={16} />
                Subir / cambiar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) subirFoto(file);
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setFotoUrl(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={guardarPerfil}
              disabled={guardando}
              className="rounded-xl bg-[#0B4A92] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B75C9] disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">
        {value || "-"}
      </span>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}

function CampoSoloLectura({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        value={value || "-"}
        disabled
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
      />
    </label>
  );
}
