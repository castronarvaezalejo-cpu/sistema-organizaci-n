"use client"

import { supabase } from "@/lib/supabase"

export default function LogoutButton() {

  async function cerrarSesion() {

    await supabase.auth.signOut()

    window.location.href = "/login"
  }

  return (

    <button
      onClick={cerrarSesion}
      className="
        w-14
        h-14
        rounded-2xl
        bg-gradient-to-br
        from-white
        to-zinc-300
        text-black
        flex
        items-center
        justify-center
        font-black
        text-lg
        shadow-2xl
      "
    >

      A

    </button>
  )
}