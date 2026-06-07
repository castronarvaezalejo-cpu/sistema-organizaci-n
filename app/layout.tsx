import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "SEITON",
  description: "Sistema empresarial SEITON",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="es">

      <body>

        {children}

      </body>

    </html>
  )
}