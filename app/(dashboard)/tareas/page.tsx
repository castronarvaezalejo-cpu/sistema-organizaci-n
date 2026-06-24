"use client"

import { useEffect, useState }
from "react"

import { Plus }
from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { supabase }
from "@/lib/supabase"

export default function TareasPage() {

  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    colaborador,
    setColaborador,
  ] = useState<any>(null)

  const [
    titulo,
    setTitulo,
  ] = useState("")

  const [
    empresaId,
    setEmpresaId,
  ] = useState("")

  const [
    colaboradorId,
    setColaboradorId,
  ] = useState("")

  const [
    prioridad,
    setPrioridad,
  ] = useState("media")

  const [
    fechaLimite,
    setFechaLimite,
  ] = useState("")

  const [
  estado,
  setEstado,
] = useState("pendiente")

  const [
    editandoId,
    setEditandoId,
  ] = useState<string | null>(
    null
  )

  const [
  googleEventId,
  setGoogleEventId,
] = useState<string | null>(
  null
)

  const [
    tareas,
    setTareas,
  ] = useState<any[]>([])

  const [
    empresas,
    setEmpresas,
  ] = useState<any[]>([])

  const [
    colaboradores,
    setColaboradores,
  ] = useState<any[]>([])

  const [
    filtro,
    setFiltro,
  ] = useState("todas")

  const [
    busqueda,
    setBusqueda,
  ] = useState("")

  // =====================================
  // USUARIO
  // =====================================

  async function obtenerUsuario() {

    const {
      data: { session },
    } = await supabase
      .auth
      .getSession()

    if (!session) return

    const { data } =
      await supabase
        .from("colaboradores")
        .select("*")
        .eq(
          "email",
          session.user.email
        )
        .single()

    if (data) {

      setColaborador(data)
    }
  }

  // =====================================
  // EMPRESAS
  // =====================================

  async function obtenerEmpresas() {

    const { data } =
      await supabase
        .from("empresas")
        .select("*")
        .order("nombre")

    if (data) {

      setEmpresas(data)
    }
  }

  // =====================================
  // COLABORADORES
  // =====================================

  async function obtenerColaboradores() {

    const { data } =
      await supabase
        .from("colaboradores")
        .select("*")
        .order("nombre")

    if (data) {

      setColaboradores(data)
    }
  }

  // =====================================
  // TAREAS
  // =====================================

  async function obtenerTareas() {

    const {
      data,
      error,
    } = await supabase
      .from("tareas")
      .select(`
        *,
        empresas (
          nombre
        ),
        colaboradores (
          nombre
        )
      `)
      .eq(
        "archivada",
        false
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )

    if (error) {

      console.error(error)

      return
    }

    if (data) {

      setTareas(data)
    }
  }

  // =====================================
  // CREAR / EDITAR
  // =====================================

async function crearEventoGoogleCalendar(
  colaboradorIdDestino: string,
  empresaNombre: string
): Promise<string | null> {
  if (!colaboradorIdDestino || !fechaLimite) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null;

  console.log("=== EVENTO GOOGLE ===");
console.log("colaboradorIdDestino:", colaboradorIdDestino);
console.log("titulo:", titulo);
console.log("fecha:", fechaLimite);
console.log("empresa:", empresaNombre);

  const response = await fetch("/api/google-calendar/event", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      colaboradorId: colaboradorIdDestino,
      title: `Tarea: ${titulo}`,
      description: `Empresa: ${empresaNombre || "Sin empresa"}\nPrioridad: ${prioridad}`,
      date: fechaLimite,
    }),
  });

const datosGoogle = await response.json();

console.log("GOOGLE EVENT STATUS:", response.status);
console.log("GOOGLE EVENT RESPONSE:", datosGoogle);

if (datosGoogle.created && datosGoogle.eventId) {
  return datosGoogle.eventId;
}

return null;
}

  async function crearTarea() {

    console.log("ENTRÓ A crearTarea");
    if (
      !titulo ||
      !empresaId
    ) return

    let error
    

    if (editandoId) {

      const response =
        await supabase
          .from("tareas")
          .update({

            titulo,

            empresa_id:
              empresaId,

            colaborador_id:
              colaboradorId,

            prioridad,

            fecha_limite:
              fechaLimite,
              estado,
          })
          .eq(
            "id",
            editandoId
          )

      error =
        response.error

if (!error) {

  console.log("Enviando solicitud a WhatsApp...");

console.log("LLAMANDO API WHATSAPP...");

  const respuesta = await fetch("/api/whatsapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
body: JSON.stringify({
  titulo,
  prioridad,
  fechaLimite,
  colaboradorId,
  empresaNombre:
    empresas.find(e => e.id === empresaId)?.nombre,
}),
  });

  const datos = await respuesta.json();

  console.log("WHATSAPP STATUS:", respuesta.status);
console.log("WHATSAPP RESPUESTA:", datos);

  console.log("Status:", respuesta.status);
  console.log("Respuesta:", datos);


const tareaActual = tareas.find(
  t => t.id === editandoId
);

const googleEventId =
  tareaActual?.google_calendar_event_id;
  
const {
  data: { session },
} = await supabase.auth.getSession();

console.log("SESSION:", session);
console.log("COLABORADOR ID:", colaboradorId);

console.log(
  "EVENT ID:",
  googleEventId
);

if (session && googleEventId) {

  const respuestaGoogle = await fetch(
    "/api/google-calendar/event",
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: googleEventId,
        colaboradorId,
        title: `Tarea: ${titulo}`,
        description: `Prioridad: ${prioridad}`,
        date: fechaLimite,
      }),
    }
  );

  console.log(
    "PATCH GOOGLE:",
    await respuestaGoogle.text()
  );
}

}

    } 
else {

const { data: nuevaTarea, error } =
  await supabase
    .from("tareas")
    .insert([
      {
        titulo,
        empresa_id: empresaId,
        colaborador_id: colaboradorId,
        prioridad,
        fecha_limite: fechaLimite,
        estado: "pendiente",
        archivada: false,
      },
    ])
    .select()
    .single();
  console.log("2. Se guardó la tarea");

if (!error) {

  console.log("ANTES DEL FETCH");

  try {
    
    console.log("3. Va a llamar la API");

    const colaboradorSeleccionado =
  colaboradores.find(
    c => c.id === colaboradorId
  );

const empresaSeleccionada =
  empresas.find(
    e => e.id === empresaId
  );

    const respuesta = await fetch("/api/whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
body: JSON.stringify({

  titulo,

  prioridad,

  fechaLimite,

  colaboradorId,

  empresaNombre:
    empresaSeleccionada?.nombre,

}), 
    });

    console.log("STATUS:", respuesta.status);

const datos = await respuesta.json();

console.log("RESPUESTA:", datos);

// ==========================
// GOOGLE CALENDAR
// ==========================

const eventId = await crearEventoGoogleCalendar(
  colaboradorId,
  empresaSeleccionada?.nombre || ""
);

if (eventId) {
  const { error: updateError } = await supabase
    .from("tareas")
    .update({
      google_calendar_event_id: eventId,
    })
    .eq("id", nuevaTarea.id);

  if (updateError) {
    console.error("Error guardando eventId:", updateError);
  }
}

  } catch (e) {

    console.error("ERROR FETCH:", e);

  }

}

}

    if (error) {

      console.error(error)

      alert(
        "Error guardando tarea"
      )

      return
    }



    limpiarFormulario()

    setOpen(false)

    obtenerTareas()
  }

  // =====================================
  // COMPLETAR
  // =====================================

  async function completarTarea(
    id: string
  ) {

    await supabase
      .from("tareas")
      .update({
        estado:
          "completada",
      })
      .eq("id", id)

    obtenerTareas()
  }

  // =====================================
  // EDITAR
  // =====================================

  function editarTarea(
    tarea: any
  ) {

    setTitulo(
      tarea.titulo
    )

    setEmpresaId(
      tarea.empresa_id
    )

    setColaboradorId(
      tarea.colaborador_id
      || ""
    )

    setPrioridad(
      tarea.prioridad
    )

    setFechaLimite(
      tarea.fecha_limite
      || ""
    )

    setEstado(
  tarea.estado
  || "pendiente"
)

    setEditandoId(
      tarea.id
    )

    setGoogleEventId(
  tarea.google_calendar_event_id || null
)

console.log("TAREA COMPLETA:", tarea);

    setOpen(true)
  }

  // =====================================
  // ARCHIVAR
  // =====================================

  async function eliminarTarea(
    id: string
  ) {

    const confirmar =
      confirm(
        "¿Archivar tarea?"
      )

    if (!confirmar)
      return

    const {
  data: tarea,
} = await supabase
  .from("tareas")
  .select("google_calendar_event_id, colaborador_id")
  .eq("id", id)
  .single();

const {
  data: { session },
} = await supabase.auth.getSession();

if (
  session &&
  tarea?.google_calendar_event_id
) {
  const respuesta = await fetch(
    "/api/google-calendar/event/delete",
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: tarea.google_calendar_event_id,
        colaboradorId: tarea.colaborador_id,
      }),
    }
  );

  console.log(
    "DELETE GOOGLE:",
    await respuesta.text()
  );
}

    await supabase
      .from("tareas")
      .update({
        archivada: true,
      })
      .eq("id", id)

    obtenerTareas()
  }

  // =====================================
  // LIMPIAR
  // =====================================

  function limpiarFormulario() {

    setTitulo("")
    setEmpresaId("")
    setColaboradorId("")
    setPrioridad("media")
    setFechaLimite("")
    setEstado("pendiente")
    setEditandoId(null)
    setGoogleEventId(null)
  }

  // =====================================
  // INIT
  // =====================================

  useEffect(() => {

    const filtroUrl =
      new URLSearchParams(
        window.location.search
      ).get("filtro")

    let frame: number | undefined

    if (
      filtroUrl === "pendientes" ||
      filtroUrl === "completadas"
    ) {
      frame = window.requestAnimationFrame(() => {
        setFiltro(filtroUrl)
      })
    }

    obtenerUsuario()

    obtenerTareas()

    obtenerEmpresas()

    obtenerColaboradores()

    return () => {
      if (frame !== undefined) {
        window.cancelAnimationFrame(frame)
      }
    }

  }, [])

  // =====================================
  // FILTROS
  // =====================================

  const tareasFiltradas =
    tareas.filter(
      (tarea) => {

      const textoBusqueda =
        busqueda.toLowerCase()

      const coincideBusqueda =

        tarea.titulo
          .toLowerCase()
          .includes(
            textoBusqueda
          )

        ||

        tarea.empresas
          ?.nombre
          ?.toLowerCase()
          .includes(
            textoBusqueda
          )

        ||

        tarea.colaboradores
          ?.nombre
          ?.toLowerCase()
          .includes(
            textoBusqueda
          )

      if (
        !coincideBusqueda
      ) return false

      if (
        filtro ===
        "pendientes"
      ) {

        return (
          tarea.estado
          !==
          "completada"
        )
      }

      if (
        filtro ===
        "completadas"
      ) {

        return (
          tarea.estado
          ===
          "completada"
        )
      }

      return true
    })

  return (

    <div>

      {/* HEADER */}

      <div className="
        flex
        items-center
        justify-between
        mb-10
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            mb-2
          ">

            Tareas

          </h1>

          <p className="
            text-zinc-400
          ">

            Gestión de tareas

          </p>

        </div>

        {/* SOLO ADMIN */}

        {colaborador?.rol
          === "admin" && (

          <button
            onClick={() => {

              limpiarFormulario()

              setOpen(true)

            }}
            className="
              flex
              items-center
              gap-2
              bg-white
              text-black
              px-5
              py-3
              rounded-xl
              font-medium
            "
          >

            <Plus size={18} />

            Nueva Tarea

          </button>

        )}

      </div>

      {/* BUSQUEDA */}

      <div className="
        flex
        flex-col
        md:flex-row
        gap-4
        mb-6
      ">

        <input
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
          placeholder="
            Buscar tarea...
          "
          className="
            flex-1
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-3
            outline-none
          "
        />

        <select
          value={filtro}
          onChange={(e) =>
            setFiltro(
              e.target.value
            )
          }
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-3
            outline-none
          "
        >

          <option value="todas">
            Todas
          </option>

          <option value="pendientes">
            Pendientes
          </option>

          <option value="completadas">
            Completadas
          </option>

        </select>

      </div>

      {/* TABLA */}

      <div className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        overflow-hidden
      ">

        <table className="
          w-full
        ">

          <thead className="
            border-b
            border-zinc-800
          ">

            <tr>

              <th className="p-5">
                Tarea
              </th>

              <th className="p-5">
                Empresa
              </th>

              <th className="p-5">
                Responsable
              </th>

              <th className="p-5">
                Estado
              </th>

              <th className="p-5">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {tareasFiltradas.map(
              (tarea) => (

              <tr
                key={tarea.id}
                className="
                  border-b
                  border-zinc-800
                "
              >

                <td className="p-5">
                  {tarea.titulo}
                </td>

                <td className="p-5">
                  {
                    tarea.empresas
                    ?.nombre
                  }
                </td>

                <td className="p-5">
                  {
                    tarea
                    .colaboradores
                    ?.nombre || "-"
                  }
                </td>

                <td className="p-5 capitalize">
                  {tarea.estado}
                </td>

                <td className="
                  p-5
                  flex
                  gap-2
                ">

                  {tarea.estado
                    !==
                    "completada" && (

                    <button
                      onClick={() =>
                        completarTarea(
                          tarea.id
                        )
                      }
                      className="
                        bg-green-500/20
                        text-green-400
                        px-3
                        py-2
                        rounded-lg
                      "
                    >

                      Completar

                    </button>

                  )}

                  {/* SOLO ADMIN */}

                  {colaborador?.rol
                    === "admin" && (

                    <>

                      <button
                        onClick={() =>
                          editarTarea(
                            tarea
                          )
                        }
                        className="
                          bg-blue-500/20
                          text-blue-400
                          px-3
                          py-2
                          rounded-lg
                        "
                      >

                        Editar

                      </button>

                      <button
                        onClick={() =>
                          eliminarTarea(
                            tarea.id
                          )
                        }
                        className="
                          bg-red-500/20
                          text-red-400
                          px-3
                          py-2
                          rounded-lg
                        "
                      >

                        Archivar

                      </button>

                    </>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="
          bg-zinc-900
          border-zinc-800
          text-white
          max-w-2xl
        ">

          <DialogHeader>

            <DialogTitle>

              {editandoId

                ? "Editar Tarea"

                : "Nueva Tarea"}

            </DialogTitle>

          </DialogHeader>

          <div className="
            space-y-4
            mt-4
          ">

            <input
              value={titulo}
              onChange={(e) =>
                setTitulo(
                  e.target.value
                )
              }
              placeholder="
                Título tarea
              "
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            <select
              value={empresaId}
              onChange={(e) =>
                setEmpresaId(
                  e.target.value
                )
              }
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
                outline-none
              "
            >

              <option value="">
                Empresa
              </option>

              {empresas.map(
                (empresa) => (

                <option
                  key={empresa.id}
                  value={empresa.id}
                >

                  {empresa.nombre}

                </option>

              ))}

            </select>

            <select
              value={colaboradorId}
              onChange={(e) =>
                setColaboradorId(
                  e.target.value
                )
              }
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
                outline-none
              "
            >

              <option value="">
                Responsable
              </option>

              {colaboradores.map(
                (colaborador) => (

                <option
                  key={
                    colaborador.id
                  }
                  value={
                    colaborador.id
                  }
                >

                  {
                    colaborador.nombre
                  }

                </option>

              ))}

            </select>

            <select
              value={prioridad}
              onChange={(e) =>
                setPrioridad(
                  e.target.value
                )
              }
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
                outline-none
              "
            >

              <option value="baja">
                Baja
              </option>

              <option value="media">
                Media
              </option>

              <option value="alta">
                Alta
              </option>

              

            </select>

            <select
  value={estado}
  onChange={(e) =>
    setEstado(
      e.target.value
    )
  }
  className="
    w-full
    bg-zinc-800
    border
    border-zinc-700
    rounded-xl
    px-4
    py-3
    outline-none
  "
>

  <option value="pendiente">
    Pendiente
  </option>

  <option value="en progreso">
    En progreso
  </option>

  <option value="completada">
    Completada
  </option>

</select>

            <input
              type="date"
              value={fechaLimite}
              onChange={(e) =>
                setFechaLimite(
                  e.target.value
                )
              }
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            <div className="
              flex
              gap-3
              pt-4
            ">

              <button
                onClick={crearTarea}
                className="
                  flex-1
                  bg-white
                  text-black
                  py-3
                  rounded-xl
                  font-medium
                "
              >

                {editandoId

                  ? "Guardar Cambios"

                  : "Crear Tarea"}

              </button>

              <button
                onClick={() => {

                  limpiarFormulario()

                  setOpen(false)

                }}
                className="
                  flex-1
                  bg-zinc-800
                  text-white
                  py-3
                  rounded-xl
                  font-medium
                "
              >

                Cancelar

              </button>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}
