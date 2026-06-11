"use client"

import { useEffect, useState }
from "react";

import { supabase }
from "@/lib/supabase";

import { Plus }
from "lucide-react";

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
      .select("tarifa_hora")
      .eq("id", empresaId)
      .single();

    const totalFacturado =
      Number(horas) *
      Number(
        empresa?.tarifa_hora || 0
      );

    // ===================================
    // GUARDAR EN HORAS
    // ===================================

    const {
      error,
    } = await supabase
      .from("horas_trabajo")
      .insert([

        {
          asesor_id:
            colaboradorId,

          empresa_id:
            empresaId,

          fecha,

          horas:
            Number(horas),

          actividad,

          tipo,
        },
      ]);

if (error) {

  console.log(error);

  alert(
    JSON.stringify(error)
  );

  return;
}

    // ===================================
    // GUARDAR EN ACTIVIDADES
    // ===================================

    const {
      error: errorActividad,
    } = await supabase
      .from(
        "actividades_realizadas"
      )
      .insert([

        {
          colaborador_id:
            colaboradorId,

          empresa_id:
            empresaId,

          descripcion:
            actividad,

          horas:
            Number(horas),

          fecha,

          total_facturado:
            totalFacturado,
        },
      ]);

    if (errorActividad) {

      console.log(
        errorActividad
      );
    }

    alert(
      "Horas registradas"
    );

    setHoras("");
    setActividad("");
    setTipo("");

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

        {/* ACTIVIDAD */}

        <input
          placeholder="
            Descripción
          "
          value={actividad}
          onChange={(e) =>
            setActividad(
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

      </div>

      {/* BUTTON */}

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
          mb-10
        "
      >

        <Plus size={18} />

        Registrar Horas

      </button>

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

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}