"use client"

import { useEffect, useState } from "react"

import { Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { supabase } from "@/lib/supabase"

export default function ActividadesPage() {

  const [open, setOpen] = useState(false)

  const [descripcion, setDescripcion] = useState("")
  const [horas, setHoras] = useState("")
  const [fecha, setFecha] = useState("")

  const [empresaId, setEmpresaId] = useState("")
  const [colaboradorId, setColaboradorId] = useState("")
  const [tareaId, setTareaId] = useState("")

  const [actividades, setActividades] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [tareas, setTareas] = useState<any[]>([])

  // =========================================
  // FILTROS
  // =========================================

  const [busquedaEmpresa, setBusquedaEmpresa] =
    useState("")

  const [busquedaColaborador, setBusquedaColaborador] =
    useState("")

  const [mesFiltro, setMesFiltro] =
    useState("")

  const [anioFiltro, setAnioFiltro] =
    useState("")

  // =========================================
  // OBTENER ACTIVIDADES
  // =========================================

  async function obtenerActividades() {

    const { data } = await supabase
      .from("actividades_realizadas")
      .select(`
        *,
        empresas (
          nombre
        ),
        colaboradores (
          nombre
        ),
        tareas (
          titulo
        )
      `)
      .order("fecha", {
        ascending: false,
      })

    if (data) {

      setActividades(data)
    }
  }

  // =========================================
  // EMPRESAS
  // =========================================

  async function obtenerEmpresas() {

    const { data } = await supabase
      .from("empresas")
      .select("*")
      .order("nombre", {
        ascending: true,
      })

    if (data) {

      setEmpresas(data)
    }
  }

  // =========================================
  // COLABORADORES
  // =========================================

  async function obtenerColaboradores() {

    const { data } = await supabase
      .from("colaboradores")
      .select("*")
      .order("nombre", {
        ascending: true,
      })

    if (data) {

      setColaboradores(data)
    }
  }

  // =========================================
  // TAREAS
  // =========================================

  async function obtenerTareas() {

    const { data } = await supabase
      .from("tareas")
      .select("*")
      .order("titulo", {
        ascending: true,
      })

    if (data) {

      setTareas(data)
    }
  }

  // =========================================
  // CREAR ACTIVIDAD
  // =========================================

  async function crearActividad() {

    if (
      !descripcion ||
      !horas ||
      !empresaId ||
      !colaboradorId
    ) {

      alert("Completa todos los campos")

      return
    }

    // OBTENER TARIFA

    const { data: empresaData } =
      await supabase
        .from("empresas")
        .select("tarifa_hora")
        .eq("id", empresaId)
        .single()

    if (!empresaData) {

      alert("Empresa no encontrada")

      return
    }

    // CALCULAR FACTURACIÓN

    const tarifaHora =
      Number(
        empresaData.tarifa_hora || 0
      )

    const totalFacturado =
      Number(horas) * tarifaHora

    // INSERTAR

    const { error } =
      await supabase
        .from("actividades_realizadas")
        .insert([
          {
            descripcion,

            horas:
              Number(horas),

            fecha,

            empresa_id:
              empresaId,

            colaborador_id:
              colaboradorId,

            tarea_id:
              tareaId || null,

            total_facturado:
              totalFacturado,
          },
        ])

    if (error) {

      console.error(error)

      alert(
        "Error creando actividad"
      )

      return
    }

    alert(
      `Actividad registrada\n\nFacturación: $${totalFacturado.toLocaleString()}`
    )

    // LIMPIAR

    setDescripcion("")
    setHoras("")
    setFecha("")
    setEmpresaId("")
    setColaboradorId("")
    setTareaId("")

    setOpen(false)

    obtenerActividades()
  }

  // =========================================
  // ELIMINAR
  // =========================================

  async function eliminarActividad(
    id: string
  ) {

    const confirmar = confirm(
      "¿Eliminar actividad?"
    )

    if (!confirmar) return

    const { error } =
      await supabase
        .from("actividades_realizadas")
        .delete()
        .eq("id", id)

    if (error) {

      console.error(error)

      return
    }

    obtenerActividades()
  }

  // =========================================
  // USE EFFECT
  // =========================================

  useEffect(() => {

    obtenerActividades()

    obtenerEmpresas()

    obtenerColaboradores()

    obtenerTareas()

  }, [])

  // =========================================
  // FILTRO ACTIVIDADES
  // =========================================

  const actividadesFiltradas =
    actividades.filter((actividad) => {

      const empresa =
        actividad.empresas?.nombre
          ?.toLowerCase() || ""

      const colaborador =
        actividad.colaboradores?.nombre
          ?.toLowerCase() || ""

      const fechaActividad =
        new Date(actividad.fecha)

      const mes =
        String(
          fechaActividad.getMonth() + 1
        ).padStart(2, "0")

      const anio =
        String(
          fechaActividad.getFullYear()
        )

      return (

        empresa.includes(
          busquedaEmpresa.toLowerCase()
        )

        &&

        colaborador.includes(
          busquedaColaborador.toLowerCase()
        )

        &&

        (
          !mesFiltro ||
          mes === mesFiltro
        )

        &&

        (
          !anioFiltro ||
          anio === anioFiltro
        )
      )
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

            Actividades

          </h1>

          <p className="
            text-zinc-400
          ">

            Registro operativo y control de horas

          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
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
            hover:opacity-90
            transition
          "
        >

          <Plus size={18} />

          Nueva Actividad

        </button>

      </div>

      {/* FILTROS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
        mb-6
      ">

        {/* EMPRESA */}

        <input
          value={busquedaEmpresa}
          onChange={(e) =>
            setBusquedaEmpresa(
              e.target.value
            )
          }
          placeholder="
            Buscar empresa
          "
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        />

        {/* COLABORADOR */}

        <input
          value={busquedaColaborador}
          onChange={(e) =>
            setBusquedaColaborador(
              e.target.value
            )
          }
          placeholder="
            Buscar colaborador
          "
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        />

        {/* MES */}

        <select
          value={mesFiltro}
          onChange={(e) =>
            setMesFiltro(
              e.target.value
            )
          }
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        >

          <option value="">
            Todos los meses
          </option>

          <option value="01">Enero</option>
          <option value="02">Febrero</option>
          <option value="03">Marzo</option>
          <option value="04">Abril</option>
          <option value="05">Mayo</option>
          <option value="06">Junio</option>
          <option value="07">Julio</option>
          <option value="08">Agosto</option>
          <option value="09">Septiembre</option>
          <option value="10">Octubre</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>

        </select>

        {/* AÑO */}

        <input
          value={anioFiltro}
          onChange={(e) =>
            setAnioFiltro(
              e.target.value
            )
          }
          placeholder="
            Año
          "
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        />

      </div>

      {/* TABLA */}

      <div className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        overflow-hidden
      ">

        <table className="w-full">

          <thead className="
            border-b
            border-zinc-800
            bg-zinc-950/40
          ">

            <tr className="text-left">

              <th className="p-5 text-zinc-400 font-medium">
                Fecha
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Colaborador
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Empresa
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Actividad
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Tarea
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Horas
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Facturación
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {actividadesFiltradas.map(
              (actividad) => (

              <tr
                key={actividad.id}
                className="
                  border-b
                  border-zinc-800
                  hover:bg-zinc-800/40
                  transition
                "
              >

                <td className="p-5">
                  {actividad.fecha}
                </td>

                <td className="p-5 font-medium">
                  {
                    actividad
                    .colaboradores
                    ?.nombre
                  }
                </td>

                <td className="p-5">
                  {
                    actividad
                    .empresas
                    ?.nombre
                  }
                </td>

                <td className="p-5">
                  {actividad.descripcion}
                </td>

                <td className="p-5">
                  {
                    actividad
                    .tareas
                    ?.titulo || "-"
                  }
                </td>

                <td className="p-5">
                  {actividad.horas}h
                </td>

                <td className="
                  p-5
                  text-green-400
                  font-semibold
                ">

                  $
                  {Number(
                    actividad.total_facturado || 0
                  ).toLocaleString()}

                </td>

                <td className="p-5">

                  <button
                    onClick={() =>
                      eliminarActividad(
                        actividad.id
                      )
                    }
                    className="
                      bg-red-500/20
                      text-red-400
                      px-3
                      py-2
                      rounded-lg
                      text-sm
                      hover:bg-red-500/30
                      transition
                    "
                  >

                    Eliminar

                  </button>

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
        ">

          <DialogHeader>

            <DialogTitle>
              Nueva Actividad
            </DialogTitle>

          </DialogHeader>

          <div className="
            space-y-4
            mt-4
          ">

            <textarea
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
              placeholder="
                Descripción de la actividad
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

            <input
              type="number"
              value={horas}
              onChange={(e) =>
                setHoras(
                  e.target.value
                )
              }
              placeholder="
                Horas trabajadas
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

            <input
              type="date"
              value={fecha}
              onChange={(e) =>
                setFecha(
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
                Seleccionar empresa
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
                Seleccionar colaborador
              </option>

              {colaboradores.map(
                (colaborador) => (

                <option
                  key={colaborador.id}
                  value={colaborador.id}
                >

                  {colaborador.nombre}

                </option>

              ))}

            </select>

            <select
              value={tareaId}
              onChange={(e) =>
                setTareaId(
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
                Seleccionar tarea
              </option>

              {tareas.map(
                (tarea) => (

                <option
                  key={tarea.id}
                  value={tarea.id}
                >

                  {tarea.titulo}

                </option>

              ))}

            </select>

            <button
              onClick={crearActividad}
              className="
                w-full
                bg-white
                text-black
                py-3
                rounded-xl
                font-medium
              "
            >

              Guardar Actividad

            </button>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}