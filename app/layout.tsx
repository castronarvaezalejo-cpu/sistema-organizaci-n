import type { Metadata } from "next"
import "./globals.css"

import Link from "next/link"

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

export const metadata: Metadata = {
  title: "SEITON",
  description: "Sistema empresarial SEITON",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

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
    <html lang="es">

      <body className="bg-black text-white">

        <main className="min-h-screen flex">

          {/* SIDEBAR */}

          <aside className="
            w-72
            bg-[#050816]
            border-r
            border-zinc-900
            flex
            flex-col
            shadow-2xl
          ">

            {/* HEADER SIDEBAR */}

            <div className="
              p-8
              border-b
              border-zinc-900
            ">

              <div className="flex justify-center">

                {/* LOGO */}

                <img
                  src="/logo.png"
                  alt="SEITON"
                  className="
                    w-52
                    h-auto
                    object-contain
                    drop-shadow-2xl
                  "
                />

              </div>

            </div>

            {/* MENU */}

            <nav className="
              flex-1
              p-6
              space-y-2
            ">

              <SidebarItem
                icon={<LayoutDashboard size={21} />}
                title="Dashboard"
                href="/"
              />

              <SidebarItem
                icon={<Building2 size={21} />}
                title="Empresas"
                href="/empresas"
              />

              <SidebarItem
                icon={<CheckSquare size={21} />}
                title="Tareas"
                href="/tareas"
              />

              <SidebarItem
                icon={<CalendarDays size={21} />}
                title="Calendario"
                href="/calendario"
              />

              <SidebarItem
                icon={<Users size={21} />}
                title="Colaboradores"
                href="/colaboradores"
              />

              <SidebarItem
                icon={<ClipboardList size={21} />}
                title="Actividades"
                href="/actividades"
              />

              <SidebarItem
                icon={<Bell size={21} />}
                title="Alertas"
                href="/alertas"
              />

              <SidebarItem
                icon={<BarChart3 size={21} />}
                title="Reportes"
                href="/reportes"
              />

            </nav>

            {/* FOOTER SIDEBAR */}

            <div className="
              p-6
              border-t
              border-zinc-900
            ">

              <div className="
                bg-gradient-to-br
                from-zinc-900
                to-[#0b1020]
                border
                border-zinc-800
                rounded-3xl
                p-5
                shadow-xl
              ">

                <p className="
                  text-sm
                  text-zinc-400
                  mb-3
                ">

                  Estado del sistema

                </p>

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <div className="
                    w-3
                    h-3
                    rounded-full
                    bg-green-400
                    animate-pulse
                  " />

                  <p className="
                    text-sm
                    font-semibold
                  ">

                    Operativo

                  </p>

                </div>

              </div>

            </div>

          </aside>

          {/* CONTENIDO */}

          <section className="
            flex-1
            overflow-auto
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
                px-14
                py-7
                flex
                items-center
                justify-between
              ">

                {/* LEFT */}

                <div>

                  <h2 className="
                    text-5xl
                    font-black
                    tracking-tight
                    leading-none
                  ">

                    Panel Empresarial

                  </h2>

                  <p className="
                    text-zinc-400
                    text-base
                    mt-4
                    capitalize
                  ">

                    {fecha}

                  </p>

                </div>

                {/* RIGHT */}

                <div className="
                  flex
                  items-center
                  gap-5
                ">

                  <div className="text-right">

                    <p className="
                      font-bold
                      text-xl
                    ">

                      Administrador

                    </p>

                    <p className="
                      text-sm
                      text-zinc-500
                      mt-1
                    ">

                      SEITON

                    </p>

                  </div>

                  <div className="
                    w-16
                    h-16
                    rounded-3xl
                    bg-gradient-to-br
                    from-white
                    to-zinc-300
                    text-black
                    flex
                    items-center
                    justify-center
                    font-black
                    text-xl
                    shadow-2xl
                  ">

                    A

                  </div>

                </div>

              </div>

            </div>

            {/* PAGE */}

            <div className="
              p-14
              max-w-[1700px]
            ">

              {children}

            </div>

          </section>

        </main>

      </body>

    </html>
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
        group
        relative
        w-full
        flex
        items-center
        gap-4
        px-5
        py-4
        rounded-3xl
        text-zinc-400
        hover:bg-blue-500/10
        hover:text-blue-400
        transition-all
        duration-300
        overflow-hidden
      "
    >

      {/* ICONO */}

      <div className="
        relative
        z-10
        transition-transform
        duration-300
        group-hover:scale-110
      ">

        {icon}

      </div>

      {/* TEXTO */}

      <span className="
        relative
        z-10
        font-semibold
        tracking-wide
        text-lg
      ">

        {title}

      </span>

    </Link>
  )
}