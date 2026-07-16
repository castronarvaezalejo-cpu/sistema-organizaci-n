"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Empresa = {
  id: string;
  nombre: string;
};

export default function RegistroTrabajadorPage() {
  const router = useRouter();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [busquedaEmpresa, setBusquedaEmpresa] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [cargo, setCargo] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  async function cargarEmpresas() {
    const { data } = await supabase
      .from("empresas")
      .select("id, nombre")
      .eq("activa", true)
      .order("nombre");

    setEmpresas((data || []) as Empresa[]);
  }

  const empresasFiltradas = useMemo(() => {
    const texto = busquedaEmpresa.toLowerCase();

    return empresas.filter((empresa) =>
      empresa.nombre.toLowerCase().includes(texto)
    );
  }, [busquedaEmpresa, empresas]);

  async function registrarTrabajador(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (password !== confirmarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!empresaId) {
      alert("Selecciona una empresa.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("correo", correo);
    formData.append("password", password);
    formData.append("telefono", telefono);
    formData.append("fechaNacimiento", fechaNacimiento);
    formData.append("empresaId", empresaId);
    formData.append("cargo", cargo);

    if (foto) {
      formData.append("foto", foto);
    }

    const respuesta = await fetch("/api/registro-trabajador", {
      method: "POST",
      body: formData,
    });

    const data = await respuesta.json();

    setLoading(false);

    if (!respuesta.ok) {
      alert(data.error || "No fue posible crear el registro.");
      return;
    }

    const login = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });

    if (login.error) {
      setRegistrado(true);
      return;
    }

    router.push("/mi-perfil");
    router.refresh();
  }

  if (registrado) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">
            Registro creado
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Tu cuenta fue creada correctamente. Ya puedes iniciar sesión.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-5 rounded-xl bg-[#0B4A92] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0B75C9]"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-center">
          <img
            src="/logo.png"
            alt="SEITON"
            className="h-auto w-52 object-contain"
          />
        </div>

        <form
          onSubmit={registrarTrabajador}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5">
            <h1 className="text-2xl font-black text-slate-800">
              Registro de trabajador
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Completa tus datos para crear tu cuenta en SEITON.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Campo
              label="Nombre completo"
              value={nombre}
              onChange={setNombre}
              required
            />
            <Campo
              label="Correo electrónico"
              type="email"
              value={correo}
              onChange={setCorreo}
              required
            />
            <Campo
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />
            <Campo
              label="Confirmar contraseña"
              type="password"
              value={confirmarPassword}
              onChange={setConfirmarPassword}
              required
            />
            <Campo
              label="Teléfono"
              value={telefono}
              onChange={setTelefono}
              required
            />
            <Campo
              label="Fecha de nacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={setFechaNacimiento}
              required
            />
            <Campo
              label="Cargo"
              value={cargo}
              onChange={setCargo}
              required
            />

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-600">
                Fotografía 
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <Camera size={16} />
                <span className="min-w-0 flex-1 truncate">
                  {foto?.name || "Seleccionar fotografía"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(event) =>
                    setFoto(event.target.files?.[0] || null)
                  }
                  className="hidden"
                  id="foto-trabajador"
                />
                <label
                  htmlFor="foto-trabajador"
                  className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Buscar
                </label>
              </div>
            </label>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Empresa
            </label>
            <input
              value={busquedaEmpresa}
              onChange={(event) =>
                setBusquedaEmpresa(event.target.value)
              }
              placeholder="Buscar empresa..."
              className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
              {empresasFiltradas.map((empresa) => (
                <label
                  key={empresa.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 hover:bg-blue-50/60"
                >
                  <input
                    type="radio"
                    name="empresa"
                    checked={empresaId === empresa.id}
                    onChange={() => setEmpresaId(empresa.id)}
                    className="h-4 w-4 accent-[#0B4A92]"
                  />
                  <span className="font-medium text-slate-700">
                    {empresa.nombre}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-[#0B4A92] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0B75C9] disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear mi cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}
