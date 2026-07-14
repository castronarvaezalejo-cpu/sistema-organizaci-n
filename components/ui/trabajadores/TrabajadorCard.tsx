"use client"

import {
  Pencil,
  Trash2,
  Phone,
  Mail,
  CalendarDays,
  User,
} from "lucide-react"

import { supabase } from "@/lib/supabase"

import Link from "next/link"

type TrabajadorCardProps = {
  trabajador: any
  onEdit: () => void
  onDelete: () => void
}

export default function TrabajadorCard({
  trabajador,
  onEdit,
  onDelete,
}: TrabajadorCardProps) {

  const iniciales =
    trabajador.nombre
      ?.split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()


      const fotoUrl = trabajador.foto_url
  ? supabase.storage
      .from("trabajadores")
      .getPublicUrl(trabajador.foto_url)
      .data.publicUrl
  : null

      const fechaNacimiento =
  trabajador.fecha_nacimiento
    ? new Date(
        trabajador.fecha_nacimiento
      ).toLocaleDateString(
        "es-CO",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "-"

  return (

<div
  className="
    w-full
    max-w-[320px]
    bg-white
    border
    border-slate-200
    rounded-2xl
    shadow-sm
    hover:shadow-md
    transition
    overflow-hidden
  "
>

      {/* Avatar */}

      <div className="flex justify-center pt-5">

        <div
          className="
            w-16
            h-16
            rounded-full
            bg-blue-50
            flex
            items-center
            justify-center
            text-xl
            font-black
            text-[#0B4A92]
          "
        >

          {fotoUrl ? (

  <img
    src={fotoUrl}
    alt={trabajador.nombre}
    className="
      w-full
      h-full
      object-cover
    "
  />

) : (

  iniciales || <User size={30} />

)}

        </div>

      </div>

      {/* Datos */}

      <div className="px-5 pt-4 pb-3">

<Link
  href={`/trabajadores/${trabajador.id}`}
  className="
    block
    text-center
    text-xl
    font-bold
    text-slate-800
    hover:text-[#0B4A92]
    transition
  "

>
  {trabajador.nombre}
</Link>

        <p className="text-center text-slate-500 mt-1">

          {trabajador.cargo || "Sin cargo"}

        </p>

<div className="flex justify-center mt-3">



</div>

        <div className="mt-3 flex justify-center">

  <span
    className={`
      px-3
      py-1
      rounded-full
      text-xs
      font-semibold

      ${
        trabajador.estado === "Activo"

          ? "bg-green-100 text-green-700"

          : "bg-red-100 text-red-700"
      }
    `}
  >

    {trabajador.estado}

  </span>

</div>

        <div className="mt-4 space-y-3">

          <div className="flex items-center gap-3">

            <Phone
              size={17}
              className="text-slate-400"
            />

            <span className="text-slate-600 text-sm">

              {trabajador.telefono || "-"}

            </span>

          </div>

          <div className="flex items-center gap-3">

            <Mail
              size={17}
              className="text-slate-400"
            />

            <span className="text-slate-600 text-sm">

              {trabajador.correo || "-"}

            </span>

          </div>

          <div className="flex items-center gap-3">

            <CalendarDays
              size={17}
              className="text-slate-400"
            />

            <span className="text-slate-600 text-sm">

              {fechaNacimiento}

            </span>

          </div>

        </div>

      </div>

      {/* Acciones */}

      <div
        className="
          border-t
          border-slate-100
          p-3
          flex
          justify-end
          gap-2
        "
      >

        <button
          onClick={onEdit}
          className="
            w-10
            h-10
            rounded-xl
            border
            border-slate-200
            hover:bg-slate-50
            transition
            flex
            items-center
            justify-center
          "
        >

          <Pencil
            size={18}
            className="text-slate-600"
          />

        </button>

        <button
          onClick={onDelete}
          className="
            w-10
            h-10
            rounded-xl
            bg-red-50
            hover:bg-red-100
            transition
            flex
            items-center
            justify-center
          "
        >

          <Trash2
            size={18}
            className="text-red-500"
          />

        </button>

      </div>

    </div>

  )

}