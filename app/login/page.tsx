"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function iniciarSesion() {

    const { error } = await supabase.auth.signInWithPassword({

      email,
      password,

    })

    if (error) {

      alert("Credenciales incorrectas")

      return
    }

    router.push("/")
  }

  return (

    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-black
      px-6
    ">

      <div className="
        w-full
        max-w-md
        border
        border-zinc-800
        bg-zinc-900/40
        backdrop-blur-xl
        rounded-3xl
        p-8
        shadow-2xl
      ">

        {/* LOGO */}

        <div className="flex justify-center mb-8">

          <img
            src="/logo-black.png"
            alt="SEITON"
            className="
              w-44
              rounded-2xl
            "
          />

        </div>

        <h1 className="
          text-3xl
          font-black
          text-center
          mb-2
        ">
          Iniciar Sesión
        </h1>

        <p className="
          text-zinc-400
          text-center
          mb-8
        ">
          Plataforma empresarial SEITON
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              bg-zinc-800
              border
              border-zinc-700
              rounded-2xl
              px-4
              py-3
              outline-none
            "
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
              w-full
              bg-zinc-800
              border
              border-zinc-700
              rounded-2xl
              px-4
              py-3
              outline-none
            "
          />

          <button
            onClick={iniciarSesion}
            className="
              w-full
              bg-white
              text-black
              py-3
              rounded-2xl
              font-bold
              hover:opacity-90
              transition
            "
          >

            Entrar

          </button>

        </div>

      </div>

    </div>
  )
}