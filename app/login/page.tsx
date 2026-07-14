"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)

  async function iniciarSesion() {

    setLoading(true)

    const { data, error } =
      await supabase.auth.signInWithPassword({

        email,

        password,

      })

    if (error) {

      alert(error.message)

      setLoading(false)

      return
    }

    const correo =
      data.session?.user.email || email

    const { data: colaborador } =
      await supabase
        .from("colaboradores")
        .select("rol")
        .eq("email", correo)
        .single()

    if (colaborador?.rol === "trabajador") {
      router.push("/mi-perfil")
    } else {
      const { data: trabajador } =
        await supabase
          .from("trabajadores_empresa")
          .select("id")
          .eq("correo", correo)
          .single()

      router.push(trabajador ? "/mi-perfil" : "/")
    }

    router.refresh()
  }

  return (

    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-slate-100
      px-4
    ">

      <div className="
        w-full
        max-w-md
        border
        border-slate-200
        bg-white
        rounded-2xl
        p-6
        shadow-sm
      ">

        <div className="flex justify-center mb-6">

          <div className="flex justify-center mb-6">

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

        <h1 className="
          text-2xl
          font-black
          text-center
          mb-2
          text-slate-800
        ">

          Iniciar Sesión

        </h1>

        <p className="
          text-slate-500
          text-center
          mb-6
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
              bg-white
              border
              border-slate-200
              rounded-xl
              px-4
              py-3
              outline-none
              text-slate-800
              shadow-sm
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-100
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
              bg-white
              border
              border-slate-200
              rounded-xl
              px-4
              py-3
              outline-none
              text-slate-800
              shadow-sm
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-100
            "
          />

          <button
            onClick={iniciarSesion}
            disabled={loading}
            className="
              w-full
              bg-[#0B4A92]
              text-white
              py-2.5
              rounded-xl
              font-bold
              hover:bg-[#0B75C9]
              transition
            "
          >

            {loading
              ? "Entrando..."
              : "Entrar"
            }

          </button>

        </div>

      </div>

    </div>
  )
}
