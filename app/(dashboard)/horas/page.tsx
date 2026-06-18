"use client"

import { useEffect, useState }
from "react";

import { supabase }
from "@/lib/supabase";

import {
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

export default function HorasPage() {

  const [
    colaboradores,
    setColaboradores,
  ] = useState<any[]>([]);

  const [
    empresas,
    setEmpresas,
  ] = useState<any[]>([]);

  const [
    registros,
    setRegistros,
  ] = useState<any[]>([]);

  const [
    colaboradorId,
    setColaboradorId,
  ] = useState("");

  const [
    empresaId,
    setEmpresaId,
  ] = useState("");

  const [
    horas,
    setHoras,
  ] = useState("");

  const [
    actividad,
    setActividad,
  ] = useState("");

  const [
    tipo,
    setTipo,
  ] = useState("");

  const [
    fecha,
    setFecha,
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  const [
    usuario,
    setUsuario,
  ] = useState<any>(null);

  const [
  editandoId,
  setEditandoId,
] = useState<string | null>(null);

const [
  editando,
  setEditando,
] = useState(false);

  useEffect(() => {

    cargarDatos();

  }, []);

  async function cargarDatos() {

    // ===================================
    // USUARIO ACTUAL
    // ===================================

    const {
      data: { session },
    } = await supabase
      .auth
      .getSession();

    if (!session) return;

    const {
      data: usuarioData,
    } = await supabase
      .from("colaboradores")
      .select("*")
      .eq(
        "email",
        session.user.email
      )
      .single();

    if (usuarioData) {

      setUsuario(usuarioData);

      setColaboradorId(
        usuarioData.id
      );
    }

    // ===================================
    // COLABORADORES
    // ===================================

    const {
      data: colaboradoresData,
    } = await supabase
      .from("colaboradores")
      .select("*")
      .eq("activo", true);

    if (colaboradoresData) {

      setColaboradores(
        colaboradoresData
      );
    }

    // ===================================
    // EMPRESAS
    // ===================================

const {
  data: empresasData,
} = await supabase
  .from("empresas")
  .select("*")
  .eq("activa", true)
  .order("nombre", {
    ascending: true,
  });

    if (empresasData) {

      setEmpresas(
        empresasData
      );
    }

    // ===================================
    // REGISTROS
    // ===================================

    obtenerRegistros();
  }
function editarRegistro(registro: any) {

  setEditando(true);

  setEditandoId(registro.id);

  setColaboradorId(registro.asesor_id);

  setEmpresaId(registro.empresa_id);

  setHoras(String(registro.horas));

  setActividad(registro.actividad || "");

  setTipo(registro.tipo || "");

  setFecha(registro.fecha);

}

function limpiarFormulario() {

  setHoras("");

  setActividad("");

  setTipo("");

  setEmpresaId("");

  setEditando(false);

  setEditandoId(null);

  setFecha(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  if (usuario) {

    setColaboradorId(
      usuario.id
    );

  }

}

async function eliminarRegistro(id: string) {

  const confirmar = window.confirm(
    "¿Deseas eliminar este registro de horas?"
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from("horas_trabajo")
    .delete()
    .eq("id", id);

  if (error) {

    console.error(error);

    alert("No fue posible eliminar el registro.");

    return;

  }

  if (editandoId === id) {

    limpiarFormulario();

  }

  obtenerRegistros();

}
  async function obtenerRegistros() {

    const {
      data,
    } = await supabase
      .from("horas_trabajo")
      .select(`
        *,
        colaboradores (
          nombre
        ),
        empresas (
          nombre
        )
      `)
      .order(
        "fecha",
        {
          ascending: false,
        }
      );

    if (data) {

      setRegistros(data);
    }
  }

  async function guardarHoras() {

    if (
      !colaboradorId ||
      !empresaId ||
      !horas
    ) {

      alert(
        "Completa los campos"
      );

      return;
    }

    // ===================================
    // BUSCAR TARIFA
    // ===================================

const {
  data: empresa,
} = await supabase
  .from("empresas")
  .select(`
    tarifa_hora,
    horas_contratadas
  `)
  .eq("id", empresaId)
  .single();

const tarifaMensual =
  Number(
    empresa?.tarifa_hora || 0
  );

const horasContratadas =
  Number(
    empresa?.horas_contratadas || 1
  );

const valorHora =
  tarifaMensual /
  horasContratadas;

const totalFacturado =
  valorHora *
  Number(horas);

// ===================================
// GUARDAR / ACTUALIZAR EN HORAS
// ===================================

let horaCreada = null;
let error = null;

if (editando) {

  const respuesta = await supabase
    .from("horas_trabajo")
    .update({

      asesor_id: colaboradorId,

      empresa_id: empresaId,

      fecha,

      horas: Number(horas),

      actividad,

      tipo,

    })
    .eq("id", editandoId)
    .select()
    .single();

  horaCreada = respuesta.data;
  error = respuesta.error;

} else {

  const respuesta = await supabase
    .from("horas_trabajo")
    .insert([
      {

        asesor_id: colaboradorId,

        empresa_id: empresaId,

        fecha,

        horas: Number(horas),

        actividad,

        tipo,

      },
    ])
    .select()
    .single();

  horaCreada = respuesta.data;
  error = respuesta.error;

}

if (error) {

  console.log(error);

  alert(
    JSON.stringify(error)
  );

  return;
}

  // ===================================
// GUARDAR / ACTUALIZAR ACTIVIDAD
// ===================================

let errorActividad = null;

if (editando) {

  const respuestaActividad = await supabase
    .from("actividades_realizadas")
    .update({

      colaborador_id: colaboradorId,

      empresa_id: empresaId,

      descripcion: actividad,

      horas: Number(horas),

      fecha,

      total_facturado: totalFacturado,

    })
    .eq("horas_trabajo_id", editandoId);

  errorActividad = respuestaActividad.error;

} else {

  const respuestaActividad = await supabase
    .from("actividades_realizadas")
    .insert([
      {

        colaborador_id: colaboradorId,

        empresa_id: empresaId,

        descripcion: actividad,

        horas: Number(horas),

        fecha,

        horas_trabajo_id: horaCreada.id,

        total_facturado: totalFacturado,

      },
    ]);

  errorActividad = respuestaActividad.error;

}

    if (errorActividad) {

      console.log(
        errorActividad
      );
    }

alert(

  editando
    ? "Horas actualizadas"
    : "Horas registradas"

);

limpiarFormulario();

obtenerRegistros();
  }

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

            Horas Laborales

          </h1>

          <p className="
            text-zinc-400
          ">

            Registro operativo
            del equipo

          </p>

        </div>

      </div>

      {/* FORM */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-4
        mb-8
      ">

        {/* COLABORADOR */}

        {usuario?.rol === "admin" ? (

          <select
            value={colaboradorId}
            onChange={(e) =>
              setColaboradorId(
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
              Colaborador
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

        ) : (

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
          ">

            {usuario?.nombre}

          </div>

        )}

        {/* EMPRESA */}

        <select
          value={empresaId}
          onChange={(e) =>
            setEmpresaId(
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

        {/* HORAS */}

        <input
          type="number"
          placeholder="Horas"
          value={horas}
          onChange={(e) =>
            setHoras(
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
        />

        {/* FECHA */}

        <input
          type="date"
          value={fecha}
          onChange={(e) =>
            setFecha(
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
        />

        {/* TIPO */}

        <input
          placeholder="
            Tipo actividad
          "
          value={tipo}
          onChange={(e) =>
            setTipo(
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
        />

<div className="md:col-span-2 xl:col-span-3">

  <textarea
    placeholder="Descripción detallada de la actividad"
    value={actividad}
    onChange={(e) => setActividad(e.target.value)}
    rows={4}
    className="
      w-full
      bg-zinc-900
      border
      border-zinc-800
      rounded-2xl
      px-4
      py-4
      outline-none
      resize-none
    "
  />

</div>

      </div>

      {/* BUTTON */}

      <div className="flex gap-3 mb-10">

  <button
    onClick={guardarHoras}
    className="
      flex
      items-center
      gap-2
      bg-blue-600
      hover:bg-blue-700
      transition
      px-6
      py-4
      rounded-2xl
      font-medium
    "
  >

    <Plus size={18} />

    {editando
      ? "Actualizar Horas"
      : "Registrar Horas"}

  </button>

  {editando && (

    <button
      onClick={limpiarFormulario}
      className="
        bg-zinc-700
        hover:bg-zinc-600
        transition
        px-6
        py-4
        rounded-2xl
      "
    >
      Cancelar
    </button>

  )}

</div>

      {/* TABLA */}

      <div className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
      ">

        <table className="
          w-full
        ">

          <thead className="
            bg-zinc-950/50
            border-b
            border-zinc-800
          ">

            <tr>

              <th className="p-5 text-left">
                Fecha
              </th>

              <th className="p-5 text-left">
                Colaborador
              </th>

              <th className="p-5 text-left">
                Empresa
              </th>

              <th className="p-5 text-left">
                Horas
              </th>

              <th className="p-5 text-left">
                Tipo
              </th>

              <th className="p-5 text-left">
  Acción
</th>

            </tr>

          </thead>

          <tbody>

            {registros.map(
              (registro) => (

              <tr
                key={registro.id}
                className="
                  border-b
                  border-zinc-800
                "
              >

                <td className="p-5">

                  {registro.fecha}

                </td>

                <td className="p-5">

                  {
                    registro
                    .colaboradores
                    ?.nombre
                  }

                </td>

                <td className="p-5">

                  {
                    registro
                    .empresas
                    ?.nombre
                  }

                </td>

                <td className="
                  p-5
                  font-bold
                  text-blue-400
                ">

                  {registro.horas}h

                </td>

                <td className="p-5">

                  {registro.tipo || "-"}

                </td>


<td className="p-5">

  <div className="flex gap-2">

<button
  onClick={() =>
    editarRegistro(registro)
  }
  className="
    p-2
    rounded-lg
    bg-blue-500/10
    text-blue-400
    hover:bg-blue-500/20
    transition
  "
>

  <Pencil size={16} />

</button>

<button
  onClick={() =>
    eliminarRegistro(registro.id)
  }
  className="
    p-2
    rounded-lg
    bg-red-500/10
    text-red-400
    hover:bg-red-500/20
    transition
  "
>

  <Trash2 size={16} />

</button>

  </div>

</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}