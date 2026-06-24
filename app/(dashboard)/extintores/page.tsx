"use client";

import { useSearchParams }
from "next/navigation";

import {
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Extintor = {
  id: string;
  codigo: string;
  ubicacion: string;
  tipo: string;
  capacidad: string;
  fecha_recarga: string;
  empresa_id: string;

  empresas?: {
    id: string;
    nombre: string;
    contacto: string;
    telefono: string;
  };
};

function calcularEstado(
  fechaRecarga: string
) {

  const hoy = new Date();

  const vencimiento =
    new Date(fechaRecarga);


  // SUMAR 1 AÑO

  vencimiento.setFullYear(
    vencimiento.getFullYear() + 1
  );
  
const fechaFormateada =
  vencimiento.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const diferencia =
    vencimiento.getTime() -
    hoy.getTime();

  const dias =
    Math.ceil(
      diferencia /
      (1000 * 60 * 60 * 24)
    );

  // VENCIDO

if (dias < 0) {

  return {
    texto: "Vencido",
    descripcion:
      `Hace ${Math.abs(dias)} días`,
    fechaTitulo:
      "Venció el",
    fecha:
      fechaFormateada,
    color: "bg-red-500",
    borde:
      "border-red-500/40",
  };
}

  // PRÓXIMO A VENCER

if (dias <= 30) {

  return {
    texto: "Próximo",
    descripcion:
      `Vence en ${dias} días`,
    fechaTitulo:
      "Vence el",
    fecha:
      fechaFormateada,
    color: "bg-yellow-500",
    borde:
      "border-yellow-500/40",
  };
}

  // VIGENTE

return {
  texto: "Vigente",
  descripcion: `${dias} días restantes`,
  fechaTitulo: "Vence el",
  fecha: fechaFormateada,
  color: "bg-green-500",
  borde: "border-green-500/30",
};  
}

export default function ExtintoresPage() {

  const searchParams =
    useSearchParams();

  const empresaFiltro =
    searchParams.get("empresa");

  const [
    extintores,
    setExtintores,
  ] = useState<
    Extintor[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    abiertas,
    setAbiertas,
  ] = useState<
    Record<string, boolean>
  >({});

  const [
  busquedaEmpresa,
  setBusquedaEmpresa,
] = useState("");

  // CARGAR EXTINTORES

  async function cargarExtintores() {

    setLoading(true);

    try {

      let query = supabase
        .from("extintores")
        .select(`
          *,
          empresas (
            id,
            nombre,
            contacto,
            telefono
          )
        `)
        .order("codigo");

      // FILTRO POR EMPRESA

      if (empresaFiltro) {

        query = query.eq(
          "empresa_id",
          empresaFiltro
        );
      }

      const { data, error } =
        await query;

      if (error) {

        console.error(error);

        setLoading(false);

        return;
      }

      setExtintores(data || []);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  }

  // INIT

  useEffect(() => {

    cargarExtintores();

  }, [empresaFiltro]);

  // ELIMINAR

  async function eliminarExtintor(
    id: string
  ) {

    const confirmar = confirm(
      "¿Eliminar este extintor?"
    );

    if (!confirmar) return;

    const { error } =
      await supabase
        .from("extintores")
        .delete()
        .eq("id", id);

    if (error) {

      alert(
        "Error eliminando extintor"
      );

      return;
    }

    setExtintores((prev) =>
      prev.filter(
        (extintor) =>
          extintor.id !== id
      )
    );
  }

  // AGRUPAR

const agrupados =
  extintores
    .filter((extintor) =>
      extintor.empresas?.nombre
        ?.toLowerCase()
        .includes(
          busquedaEmpresa.toLowerCase()
        )
    )
    .reduce(
      (acc: any, extintor) => {

        const nombre =
          extintor.empresas?.nombre ||
          "Sin empresa";

        if (!acc[nombre]) {
          acc[nombre] = [];
        }

        acc[nombre].push(extintor);

        return acc;

      },
      {}
    );
  // ABRIR / CERRAR

  function toggleEmpresa(
    nombre: string
  ) {

    setAbiertas((prev) => ({
      ...prev,
      [nombre]:
        !prev[nombre],
    }));
  }

  // LOADING

  if (loading) {

    return (
      <div className="
        p-10
        text-center
      ">
        Cargando...
      </div>
    );
  }

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-6
        mb-10
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            mb-2
          ">
            Extintores
          </h1>

          <p className="
            text-zinc-400
          ">

            Gestión agrupada
            por empresa

          </p>

          <p className="
            text-zinc-500
            text-sm
            mt-2
          ">

            Total:
            {" "}
            {extintores.length}
            {" "}
            extintores

          </p>

        </div>

        <Link
          href="/extintores/nuevo"
          className="
            bg-blue-600
            hover:bg-blue-700
            transition
            px-5
            py-3
            rounded-xl
            font-medium
            text-center
          "
        >

          + Nuevo Extintor

        </Link>

      </div>

      <div className="relative mb-8 w-full md:w-96">

  <Search
    size={20}
    className="
      absolute
      left-4
      top-1/2
      -translate-y-1/2
      text-zinc-500
    "
  />

  <input
    type="text"
    placeholder="Buscar empresa..."
    value={busquedaEmpresa}
    onChange={(e) =>
      setBusquedaEmpresa(e.target.value)
    }
    className="
      w-full
      bg-zinc-900
      border
      border-zinc-800
      rounded-2xl
      py-3
      pl-12
      pr-4
      outline-none
      focus:border-blue-500
    "
  />

</div>

      {/* EMPRESAS */}

      <div className="
        space-y-6
      ">

        {Object.entries(
          agrupados
        ).map(
          ([empresa, lista]: any) => {

          const abiertos =
            abiertas[empresa];

          return (

            <div
              key={empresa}
              className="
                bg-zinc-900
                border
                border-zinc-800
                rounded-2xl
                overflow-hidden
              "
            >

              {/* HEADER */}

              <button
                onClick={() =>
                  toggleEmpresa(
                    empresa
                  )
                }
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  p-6
                  hover:bg-zinc-800/40
                  transition
                "
              >

                <div className="
                  text-left
                ">

                  <h2 className="
                    text-2xl
                    font-bold
                  ">
                    {empresa}
                  </h2>

                  <p className="
                    text-zinc-400
                    mt-1
                  ">

                    {
                      lista.length
                    }
                    {" "}
                    extintores

                  </p>

                </div>

                {abiertos
                  ? <ChevronDown />
                  : <ChevronRight />
                }

              </button>

              {/* CONTENIDO */}

              {abiertos && (

                <div className="
                  border-t
                  border-zinc-800
                  p-6
                  space-y-4
                ">

                  {lista.map(
                    (
                      extintor:
                      Extintor
                    ) => {

                    const estado =
                      calcularEstado(
                        extintor.fecha_recarga
                      );

                    return (

                      <div
                        key={
                          extintor.id
                        }
                        className={`
                          bg-black/30
                          border
                          ${estado.borde}
                          rounded-2xl
                          p-5
                        `}
                      >

                        <div className="
                          flex
                          flex-col
                          lg:flex-row
                          lg:items-start
                          lg:justify-between
                          gap-6
                        ">

                          {/* INFO */}

                          <div>

                            <h3 className="
                              text-xl
                              font-bold
                              mb-3
                            ">
                              {
                                extintor.codigo
                              }
                            </h3>

                            <div className="
                              space-y-1
                              text-zinc-300
                            ">

                              <p>
                                <span className="
                                  font-semibold
                                  text-white
                                ">
                                  Ubicación:
                                </span>{" "}

                                {
                                  extintor.ubicacion
                                }
                              </p>

                              <p>
                                <span className="
                                  font-semibold
                                  text-white
                                ">
                                  Tipo:
                                </span>{" "}

                                {
                                  extintor.tipo
                                }
                              </p>

                              <p>
                                <span className="
                                  font-semibold
                                  text-white
                                ">
                                  Capacidad:
                                </span>{" "}

                                {
                                  extintor.capacidad
                                }
                              </p>

                              <p>
                                <span className="
                                  font-semibold
                                  text-white
                                ">
                                  Recarga:
                                </span>{" "}

                                {new Date(extintor.fecha_recarga)
  .toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}
                              </p>

                              <p>
  <span
    className="
      font-semibold
      text-white
    "
  >
    Vence:
  </span>{" "}

  {estado.fecha}

</p>

                            </div>

                          </div>

                          {/* ACCIONES */}

                          <div className="
                            flex
                            flex-col
                            items-start
                            lg:items-end
                            gap-3
                          ">

                            <div className="
                              flex
                              flex-col
                              items-center
                            ">

<span
  className={`
    ${estado.color}
    text-black
    px-4
    py-2
    rounded-full
    text-sm
    font-bold
  `}
>

  {estado.texto}

</span>

<p
  className="
    text-xs
    text-zinc-300
    mt-2
    text-center
  "
>

  {estado.descripcion}

</p>

                            </div>

                            <Link
                              href={`/extintores/${extintor.id}`}
                              className="
                                bg-blue-600
                                hover:bg-blue-700
                                transition
                                px-4
                                py-2
                                rounded-lg
                                text-sm
                                font-semibold
                              "
                            >

                              Editar

                            </Link>

                            <button
                              onClick={() =>
                                eliminarExtintor(
                                  extintor.id
                                )
                              }
                              className="
                                bg-red-600
                                hover:bg-red-700
                                transition
                                px-4
                                py-2
                                rounded-lg
                                text-sm
                                font-semibold
                              "
                            >

                              Eliminar

                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}