"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase"

import Link from "next/link"

import LogoutButton from "@/components/LogoutButton"

import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Users,
  Bell,
  ClipboardList,
  CalendarDays,
  BarChart3,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const router = useRouter()

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    verificarSesion()

  }, [])

  async function verificarSesion() {

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {

      router.push("/login")

      return
    }

    setLoading(false)
  }

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        text-white
      ">

        Cargando...

      </div>
    )
  }

  const fecha = new Date().toLocaleDateString(
    "es-CO",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  )

  return (

    <main className="
      h-screen
      flex
      overflow-hidden
      bg-black
      text-white
    ">

      {/* SIDEBAR */}

      <aside className="
        w-64
        min-w-64
        bg-[#050816]
        border-r
        border-zinc-900
        flex
        flex-col
      ">

        <div className="
          p-6
          border-b
          border-zinc-900
        ">

          <div className="flex justify-center">

            <img
              src="/logo.png"
              alt="SEITON"
              className="w-44"
            />

          </div>

        </div>

        <nav className="
          flex-1
          p-4
          space-y-1
        ">

          <SidebarItem
            icon={<LayoutDashboard size={19} />}
            title="Dashboard"
            href="/"
          />

          <SidebarItem
            icon={<Building2 size={19} />}
            title="Empresas"
            href="/empresas"
          />

          <SidebarItem
            icon={<CheckSquare size={19} />}
            title="Tareas"
            href="/tareas"
          />

          <SidebarItem
            icon={<CalendarDays size={19} />}
            title="Calendario"
            href="/calendario"
          />

          <SidebarItem
            icon={<Users size={19} />}
            title="Colaboradores"
            href="/colaboradores"
          />

          <SidebarItem
            icon={<ClipboardList size={19} />}
            title="Actividades"
            href="/actividades"
          />

          <SidebarItem
            icon={<Bell size={19} />}
            title="Alertas"
            href="/alertas"
          />

          <SidebarItem
            icon={<BarChart3 size={19} />}
            title="Reportes"
            href="/reportes"
          />

        </nav>

      </aside>

      {/* CONTENIDO */}

      <section className="
        flex-1
        overflow-y-auto
        bg-gradient-to-br
        from-black
        via-[#060816]
        to-black
      ">

        {/* TOPBAR */}

        <div className="
          sticky
          top-0
          z-50
          border-b
          border-zinc-900
          bg-[#050816]/80
          backdrop-blur-2xl
        ">

          <div className="
            max-w-[1200px]
            mx-auto
            px-6
            py-5
            flex
            items-center
            justify-between
          ">

            <div>

              <h2 className="
                text-4xl
                font-black
              ">

                Panel Empresarial

              </h2>

              <p className="
                text-zinc-400
                text-sm
                mt-2
                capitalize
              ">

                {fecha}

              </p>

            </div>

            <div className="
              flex
              items-center
              gap-4
            ">

              <div className="text-right">

                <p className="font-bold">
                  Administrador
                </p>

                <p className="
                  text-sm
                  text-zinc-500
                ">
                  SEITON
                </p>

              </div>

              <LogoutButton />

            </div>

          </div>

        </div>

        {/* PAGE */}

        <div className="
          max-w-[1200px]
          mx-auto
          px-6
          py-8
        ">

          {children}

        </div>

      </section>

    </main>
  )
}

function SidebarItem({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode
  title: string
  href: string
}) {

  return (

    <Link
      href={href}
      className="
        flex
        items-center
        gap-3
        px-4
        py-3
        rounded-2xl
        text-zinc-400
        hover:bg-blue-500/10
        hover:text-blue-400
        transition-all
      "
    >

      {icon}

      <span className="font-semibold">

        {title}

      </span>

    </Link>
  )
}