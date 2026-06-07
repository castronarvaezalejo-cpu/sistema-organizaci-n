import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export function middleware(
  request: NextRequest
) {

  const token =
    request.cookies.get(
      "sb-access-token"
    )

  const isLoginPage =
    request.nextUrl.pathname === "/login"

  // SI NO HAY LOGIN

  if (!token && !isLoginPage) {

    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    )
  }

  // SI YA ESTÁ LOGEADO

  if (token && isLoginPage) {

    return NextResponse.redirect(
      new URL(
        "/",
        request.url
      )
    )
  }

  return NextResponse.next()
}

export const config = {

  matcher: [

    "/",
    "/empresas",
    "/tareas",
    "/actividades",
    "/calendario",
    "/colaboradores",
    "/alertas",
    "/reportes",
    "/login",
  ],
}