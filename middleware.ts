import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(
  request: NextRequest
) {

  return NextResponse.next()
}

export const config = {

  matcher: [
    "/",
    "/empresas/:path*",
    "/tareas/:path*",
    "/actividades/:path*",
    "/colaboradores/:path*",
    "/alertas/:path*",
    "/reportes/:path*",
    "/calendario/:path*",
  ],
}