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
} from "lucide-react"

export const metadata: Metadata = {
  title: "Sistema Organización",
  description: "Panel de organización empresarial",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="bg-zinc-950 text-white">

        <main className="min-h-screen flex">

          {/* SIDEBAR */}

          <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-6">

            <h1 className="text-2xl font-bold mb-10">
              Organización
            </h1>

            <nav className="space-y-3">

              <SidebarItem
                icon={<LayoutDashboard size={20} />}
                title="Dashboard"
                href="/"
              />

              <SidebarItem
                icon={<Building2 size={20} />}
                title="Empresas"
                href="/empresas"
              />

              <SidebarItem
                icon={<CheckSquare size={20} />}
                title="Tareas"
                href="/tareas"
              />

              <SidebarItem
                icon={<Users size={20} />}
                title="Colaboradores"
                href="/colaboradores"
              />

              <SidebarItem
                icon={<ClipboardList size={20} />}
                title="Actividades"
                href="/actividades"
              />

              <SidebarItem
                icon={<Bell size={20} />}
                title="Alertas"
                href="/alertas"
              />

            </nav>

          </aside>

          {/* CONTENIDO */}

          <section className="flex-1 p-8">
            {children}
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
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
    >
      {icon}

      <span>{title}</span>
    </Link>
  )
}