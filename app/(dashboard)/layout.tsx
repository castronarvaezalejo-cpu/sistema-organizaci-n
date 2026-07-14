"use client"

import { useEffect, useState }
from "react";

import { useRouter }
from "next/navigation";

import { usePathname }
from "next/navigation";

import { supabase }
from "@/lib/supabase";

import Link from "next/link";

import LogoutButton
from "@/components/LogoutButton";

import DesktopSidebar from "@/components/layout/DesktopSidebar";

import MobileSidebar from "@/components/layout/MobileSidebar";

import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    colaborador,
    setColaborador,
  ] = useState<any>(null);

  const [
    esAdmin,
    setEsAdmin,
  ] = useState(false);

  const [
    rol,
    setRol,
  ] = useState<string | null>(null);

  const [
  menuAbierto,
  setMenuAbierto,
] = useState(false);

  useEffect(() => {

    verificarSesion();

  }, []);

  async function verificarSesion() {

    const {
      data: { session },
    } = await supabase
      .auth
      .getSession();

    if (!session) {

      router.push("/login");

      return;
    }

    // ===================================
    // BUSCAR COLABORADOR
    // ===================================

    const {
      data,
    } = await supabase
      .from("colaboradores")
      .select("*")
      .eq(
        "email",
        session.user.email
      )
      .single();

    if (data) {

      setColaborador(data);
      setRol(data.rol || null);

      if (data.rol === "admin") {

        setEsAdmin(true);
      }

      if (
        data.rol === "trabajador" &&
        !rutaPermitidaTrabajador(pathname)
      ) {
        router.replace("/mi-perfil");
      }
    } else {
      const { data: trabajador } = await supabase
        .from("trabajadores_empresa")
        .select("id, nombre, correo")
        .eq("correo", session.user.email)
        .single();

      if (trabajador) {
        setColaborador({
          nombre: trabajador.nombre,
          email: trabajador.correo,
          rol: "trabajador",
        });
        setRol("trabajador");

        if (!rutaPermitidaTrabajador(pathname)) {
          router.replace("/mi-perfil");
        }
      }
    }

    setLoading(false);
  }

  if (loading) {

    return (

<div className="
  min-h-screen
  bg-slate-100
  flex
  items-center
  justify-center
  text-slate-800
">

        Cargando...

      </div>
    );
  }

  const fecha =
    new Date()
    .toLocaleDateString(
      "es-CO",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  return (

<main className="
  min-h-screen
  flex
  bg-slate-100
  text-slate-800
  relative
">

      {/* SIDEBAR */}

      <aside className="
hidden
md:flex
md:w-56
md:min-w-56
        bg-[#0B4A92]
        border-r
        border-slate-200
        flex-col
      ">

        {/* LOGO */}

        <div className="
          p-3
          border-b
          border-white/20
        ">

          <div className="
            flex
            justify-center
          ">

<img
  src="/logo.png"
  alt="SEITON"
  className="
    w-56
    h-auto
    object-contain
  "
/>

          </div>

        </div>

        {/* NAV */}

 <DesktopSidebar
  esAdmin={esAdmin}
  rol={rol}
/>

      </aside>

      {/* CONTENIDO */}

      <section className="
        flex-1
        w-full
        min-w-0
        overflow-y-auto
        bg-slate-100
      ">

        {/* TOPBAR */}

        <div className="
          sticky
          top-0
          z-50
          border-b
          border-slate-200
          bg-white
          backdrop-blur-2xl
        ">

<div className="
  max-w-[1600px]
  mx-auto
  px-4
  sm:px-5
  lg:px-6
  py-2
  sm:py-3
  flex
  items-center
  justify-between
">

<button
  onClick={() => setMenuAbierto(true)}
  className="
    md:hidden
    mr-4
    p-2
    rounded-xl
    hover:bg-blue-500/10
    transition
  "
>
  <Menu size={28} />
</button>

            <div>

<h2 className="
  text-lg
  sm:text-2xl
  font-bold
  text-slate-800
">

  ¡Hola, {colaborador?.nombre?.split(" ")[0] || "Usuario"}! 👋

</h2>

<p className="
  text-slate-500
  text-xs
  mt-1
">

  Bienvenido nuevamente a SEITON · {fecha}

</p>

            </div>

            {/* PERFIL */}

            <div className="
              flex
              items-center
              min-w-fit
              gap-4
            ">

              <div className="
                hidden
                md:block
                text-right
              ">

                <p className="
                  font-bold
                ">

                  {
                    colaborador?.nombre
                    || "Administrador"
                  }

                </p>

                <p className="
                  text-sm
                  text-slate-500
                  capitalize
                ">

                  {
                    colaborador?.rol
                    || "admin"
                  }

                </p>

              </div>

              <LogoutButton />

            </div>

          </div>

        </div>

        {/* PAGE */}

<div className="
  max-w-[1400px]
  mx-auto
  px-3
  sm:px-5
  lg:px-6
  py-4
  sm:py-6
">

          {children}

        </div>

      </section>

<MobileSidebar
  abierto={menuAbierto}
  cerrar={() => setMenuAbierto(false)}
  esAdmin={esAdmin}
  rol={rol}
/>

    </main>
  );
}

function rutaPermitidaTrabajador(pathname: string) {
  return [
    "/mi-perfil",
    "/mis-capacitaciones",
    "/mis-actividades",
    "/mis-documentos",
  ].some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

