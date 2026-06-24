"use client"

import { useEffect, useState }
from "react"

import { supabase }
from "@/lib/supabase"

import {
  CalendarDays,
  CheckSquare,
  GraduationCap,
  ShieldAlert,
} from "lucide-react"

export default function CalendarioPage() {

  const [
    eventos,
    setEventos,
  ] = useState<any[]>([])

  const [
    filtro,
    setFiltro,
  ] = useState("todos")

  const [googleEmail, setGoogleEmail] =
    useState<string | null>(null)

  const [cargandoGoogle, setCargandoGoogle] =
    useState(false)

  useEffect(() => {

    cargarEventos()
    cargarConexionGoogle()

  }, [])

  async function tokenSesion() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || null
  }

  async function cargarConexionGoogle() {
    const token = await tokenSesion()

    if (!token) return

    const response = await fetch(
      "/api/google-calendar/status",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) return

    const { connection } = await response.json()
    setGoogleEmail(connection?.google_email || null)
  }

  async function conectarGoogleCalendar() {
    const token = await tokenSesion()

    if (!token) return

    setCargandoGoogle(true)

    try {
      const response = await fetch(
        "/api/google-calendar/connect",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const body = await response.json()

      if (!response.ok || !body.authorizationUrl) {
        throw new Error(body.error || "No fue posible iniciar la conexión.")
      }

      window.location.assign(body.authorizationUrl)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar la conexión con Google."
      )
      setCargandoGoogle(false)
    }
  }

  async function desconectarGoogleCalendar() {
    const token = await tokenSesion()

    if (!token) return

    setCargandoGoogle(true)

    try {
      const response = await fetch(
        "/api/google-calendar/disconnect",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("No fue posible desconectar Google Calendar.")
      }

      setGoogleEmail(null)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No fue posible desconectar Google Calendar."
      )
    } finally {
      setCargandoGoogle(false)
    }
  }

  async function cargarEventos() {

    const eventosFinales:
      any[] = []

    // =====================================
    // TAREAS
    // =====================================

    const {
      data: tareasData,
    } = await supabase
      .from("tareas")
      .select(`
        *,
        empresas (
          nombre
        )
      `)
      .not(
        "fecha_limite",
        "is",
        null
      )

    if (tareasData) {

      tareasData.forEach(
        (tarea: any) => {

          eventosFinales.push({

            id: tarea.id,

            fecha:
              tarea.fecha_limite,

            titulo:
              tarea.titulo,

            empresa:
              tarea.empresas
                ?.nombre,

            tipo:
              "tarea",

            prioridad:
              tarea.prioridad,

            estado:
              tarea.estado,
          })
        }
      )
    }

    // =====================================
    // CAPACITACIONES
    // =====================================

    const {
      data: capacitacionesData,
    } = await supabase
      .from("capacitaciones")
      .select(`
        *,
        empresas (
          nombre
        )
      `)

    if (
      capacitacionesData
    ) {

      capacitacionesData
        .forEach(
          (
            capacitacion: any
          ) => {

          eventosFinales.push({

            id:
              capacitacion.id,

            fecha:
              capacitacion.fecha,

            titulo:
              capacitacion.tipo,

            empresa:
              capacitacion
                .empresas
                ?.nombre,

            tipo:
              "capacitacion",

            estado:
              capacitacion.estado,
          })
        })
    }

// =====================================
// EXTINTORES
// =====================================

const {
  data: extintoresData,
} = await supabase
  .from("extintores")
  .select(`
    *,
    empresas (
      nombre
    )
  `)
  .not(
  "fecha_recarga",
  "is",
  null
)

if (extintoresData) {

  extintoresData.forEach(
    (extintor: any) => {

      eventosFinales.push({

        id:
          extintor.id,

        fecha:
          extintor.fecha_recarga,

        titulo:
          `Vence extintor ${extintor.codigo || ""}`,

        empresa:
          extintor
            .empresas
            ?.nombre,

        tipo:
          "extintor",

        estado:
          "pendiente",
      })
    }
  )
}

    // =====================================
    // ORDENAR
    // =====================================

    eventosFinales.sort(
      (a, b) =>
        new Date(
          a.fecha
        ).getTime()
        -
        new Date(
          b.fecha
        ).getTime()
    )

    setEventos(
      eventosFinales
    )
  }

  // =====================================
  // FILTRO
  // =====================================

  const eventosFiltrados =
    filtro === "todos"

      ? eventos

      : eventos.filter(
          (evento: any) =>
            evento.tipo
            === filtro
        )

  // =====================================
  // AGRUPAR
  // =====================================

  const eventosAgrupados =
    eventosFiltrados.reduce(

      (
        acc:
          Record<
            string,
            any[]
          >,

        evento: any
      ) => {

        const fecha =
          evento.fecha

        if (!acc[fecha]) {

          acc[fecha] = []
        }

        acc[fecha].push(
          evento
        )

        return acc
      },

      {}
    )

  // =====================================
  // KPIs
  // =====================================

  const hoy =
    new Date()
      .toISOString()
      .split("T")[0]

  const eventosHoy =
    eventos.filter(
      (
        evento: any
      ) =>
        evento.fecha === hoy
    ).length

  const capacitaciones =
    eventos.filter(
      (
        evento: any
      ) =>
        evento.tipo
        ===
        "capacitacion"
    ).length

  const tareas =
    eventos.filter(
      (
        evento: any
      ) =>
        evento.tipo
        === "tarea"
    ).length

    const extintores =
  eventos.filter(
    (
      evento: any
    ) =>
      evento.tipo
        ?.toLowerCase()
        .trim()
      === "extintor"
  ).length

  return (

    <div className="max-w-[1200px]">

      {/* HEADER */}

      <div className="
        mb-8
      ">

        <h1 className="
          text-5xl
          font-black
          tracking-tight
          mb-3
        ">

          Calendario SST

        </h1>

        <p className="
          text-zinc-400
          text-lg
        ">

          Agenda operativa
          empresarial

        </p>

      </div>

      <div className="
        mb-8
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/40
        p-5
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
      ">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Google Calendar
          </h2>
          <p className="text-sm text-zinc-400">
            {googleEmail
              ? `Conectado como ${googleEmail}`
              : "Conecta tu cuenta para recibir recordatorios en tu calendario."
            }
          </p>
        </div>

        <button
          type="button"
          onClick={
            googleEmail
              ? desconectarGoogleCalendar
              : conectarGoogleCalendar
          }
          disabled={cargandoGoogle}
          className={`
            px-5
            py-3
            rounded-2xl
            font-medium
            transition
            disabled:opacity-60
            ${googleEmail
              ? "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              : "bg-white text-black hover:bg-zinc-200"
            }
          `}
        >
          {cargandoGoogle
            ? "Procesando..."
            : googleEmail
            ? "Desconectar"
            : "Conectar Google Calendar"
          }
        </button>
      </div>

      {/* CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        xl:grid-cols-4
        gap-4
        mb-8
      ">

        <MiniCard
          title="Eventos Hoy"
          value={
            eventosHoy
          }
          color="blue"
          icon={
            <CalendarDays
              size={20}
            />
          }
        />

        <MiniCard
          title="Tareas"
          value={tareas}
          color="red"
          icon={
            <CheckSquare
              size={20}
            />
          }
        />

        <MiniCard
          title="Capacitaciones"
          value={
            capacitaciones
          }
          color="green"
          icon={
            <GraduationCap
              size={20}
            />
          }
        />

        <MiniCard
  title="Extintores"
  value={extintores}
  color="yellow"
  icon={
    <ShieldAlert
      size={20}
    />
  }
/>

      </div>

      {/* FILTROS */}

      <div className="
        flex
        gap-3
        mb-8
        flex-wrap
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/40
        p-3
      ">

        <FiltroButton
          active={
            filtro ===
            "todos"
          }
          onClick={() =>
            setFiltro(
              "todos"
            )
          }
        >

          Todos

        </FiltroButton>

        <FiltroButton
          active={
            filtro ===
            "tarea"
          }
          onClick={() =>
            setFiltro(
              "tarea"
            )
          }
        >

          Tareas

        </FiltroButton>

        <FiltroButton
  active={
    filtro ===
    "capacitacion"
  }
  onClick={() =>
    setFiltro(
      "capacitacion"
    )
  }
>

  Capacitaciones

</FiltroButton>

<FiltroButton
  active={
    filtro ===
    "extintor"
  }
  onClick={() =>
    setFiltro(
      "extintor"
    )
  }
>

  Extintores

</FiltroButton>

      </div>

      {/* EVENTOS */}

      <div className="
        space-y-8
      ">

        {Object.entries(
          eventosAgrupados
        ).map(
          (
            [
              fecha,
              eventosDelDia,
            ]: any
          ) => (

          <div
            key={fecha}
            className="
              bg-zinc-900/40
              border
              border-zinc-800
              rounded-3xl
              overflow-hidden
            "
          >

            {/* FECHA */}

            <div className="
              p-6
              border-b
              border-zinc-800
            ">

              <div className="
                flex
                items-center
                gap-3
              ">
                <div className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-blue-500/10
                  text-blue-400
                  flex
                  items-center
                  justify-center
                ">
                  <CalendarDays size={20} />
                </div>

                <h2 className="
                  text-2xl
                  font-black
                ">
                  {fecha}
                </h2>
              </div>

            </div>

            {/* LISTA */}

            <div className="
              divide-y
              divide-zinc-800
            ">

              {(eventosDelDia as any[]).map(
                (evento: any) => (

                <div
                  key={
                    evento.id
                  }
                  className="
                    p-6
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    justify-between
                    gap-4
                    transition
                    hover:bg-zinc-800/30
                  "
                >

                  {/* INFO */}

                  <div>

                    <div className="
                      flex
                      items-center
                      gap-3
                      mb-2
                    ">

                      <span className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold

                        ${
  evento.tipo
  ===
  "tarea"

  ? `
    bg-red-500/20
    text-red-400
  `

  : evento.tipo
    ===
    "capacitacion"

  ? `
    bg-blue-500/20
    text-blue-400
  `

  : `
    bg-yellow-500/20
    text-yellow-400
  `
}
                      `}>

                        {
                          evento.tipo
                        }

                      </span>

                    </div>

                    <h3 className="
                      text-xl
                      font-bold
                      mb-2
                    ">

                      {
                        evento.titulo
                      }

                    </h3>

                    <p className="
                      text-zinc-400
                    ">

                      {
                        evento.empresa
                      }

                    </p>

                  </div>

                  {/* ESTADO */}

                  <div className="
                    text-right
                  ">

                    <p className="
                      capitalize
                      font-semibold
                    ">

                      {
                        evento.estado
                      }

                    </p>

                    {evento
                      .prioridad && (

                      <p className="
                        text-sm
                        text-zinc-500
                        capitalize
                        mt-2
                      ">

                        {
                          evento.prioridad
                        }

                      </p>

                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}

// =====================================
// COMPONENTES
// =====================================

function MiniCard({
  title,
  value,
  color,
  icon,
}: any) {

  const styles: any = {

    yellow:
  "text-yellow-400 bg-yellow-500/10",

    blue:
      "text-blue-400 bg-blue-500/10",

    red:
      "text-red-400 bg-red-500/10",

    green:
      "text-green-400 bg-green-500/10",
  }

  return (

    <div className="
      rounded-3xl
      border
      border-zinc-800
      bg-zinc-900/40
      p-5
    ">

      <div className="
        flex
        items-center
        justify-between
        mb-6
      ">

        <div className={`
          w-12
          h-12
          rounded-2xl
          flex
          items-center
          justify-center

          ${styles[color]}
        `}>

          {icon}

        </div>

      </div>

      <h3 className="
        text-lg
        font-semibold
        mb-2
      ">
        {title}
      </h3>

      <p className={`
        text-4xl
        font-black
        ${color === "red"
          ? "text-red-400"
          : color === "yellow"
          ? "text-yellow-400"
          : color === "green"
          ? "text-green-400"
          : "text-blue-400"
        }
      `}>

        {value}

      </p>

    </div>
  )
}

function FiltroButton({
  children,
  active,
  onClick,
}: any) {

  return (

    <button
      onClick={onClick}
      className={`
        px-5
        py-3
        rounded-2xl
        transition

        ${
          active

          ? `
            bg-blue-600
            text-white
          `

          : `
            bg-zinc-900
            text-zinc-400
          `
        }
      `}
    >

      {children}

    </button>
  )
}
