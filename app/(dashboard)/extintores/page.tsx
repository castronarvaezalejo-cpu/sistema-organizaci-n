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
  fechaRecarga: string | null
) {

  if (!fechaRecarga) {
    return {
      texto: "Sin fecha",
      descripcion: "No registrada",
      fechaTitulo: "Fecha",
      fecha: "-",
      color: "bg-slate-500",
      borde: "border-slate-500/30",
    };
  }

  const hoy = new Date();

  const [anio, mes, dia] = fechaRecarga
    .split("-")
    .map(Number); 

const vencimiento = new Date(
  anio,
  mes - 1,
  dia
);


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


// ABRIR AUTOMÁTICAMENTE LA EMPRESA


  useEffect(() => {

  if (!empresaFiltro || extintores.length === 0) return;

  const extintor = extintores.find(
    (e) => e.empresa_id === empresaFiltro
  );

  if (!extintor?.empresas?.nombre) return;

  setAbiertas({
    [extintor.empresas.nombre]: true,
  });

}, [empresaFiltro, extintores]);


  // ELIMINAR

async function eliminarExtintor(id: string) {

  const confirmar = confirm(
    "¿Eliminar este extintor?"
  );

  if (!confirmar) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("No hay una sesión activa.");
    return;
  }

  const respuesta = await fetch(
    "/api/extintores/eliminar",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        extintorId: id,
      }),
    }
  );

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    alert(resultado.error);
    return;
  }

  await cargarExtintores();
}

  async function recargarExtintor(extintor: Extintor) {

  const confirmar = confirm(
    `¿Confirmar la recarga del extintor ${extintor.codigo}?`
  );

  if (!confirmar) return;

  const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  alert("No hay una sesión activa.");
  return;
}

const respuesta = await fetch("/api/extintores/recarga", {
  method: "POST",
headers: {
  Authorization: `Bearer ${session.access_token}`,
  "Content-Type": "application/json",
},
  body: JSON.stringify({
    extintorId: extintor.id,
  }),
});

const resultado = await respuesta.json();

console.log(resultado);

if (!respuesta.ok) {
  alert(resultado.error);
  return;
}

alert("La API respondió correctamente.");

await cargarExtintores();

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

    <div className="p-5">

      {/* HEADER */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-5
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
            text-slate-500
          ">

            Gestión agrupada
            por empresa

          </p>

          <p className="
            text-slate-500
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
            text-white
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
      text-slate-500
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
      bg-white
      border
      border-slate-200
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
                bg-white
                border
                border-slate-200
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
                  p-5
                  hover:bg-white/40
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
                    text-slate-500
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
                  border-slate-200
                  p-5
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
                          bg-slate-100
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
                          gap-5
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
                              text-slate-600
                            ">

                              <p>
                                <span className="
                                  font-semibold
                                  text-slate-800
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
                                  text-slate-800
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
                                  text-slate-800
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
                                  text-slate-800
                                ">
                                  Recarga:
                                </span>{" "}

{extintor.fecha_recarga ? (
  (() => {
    const [anio, mes, dia] =
      extintor.fecha_recarga
        .split("-")
        .map(Number);

    return new Date(anio, mes - 1, dia)
      .toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
  })()
) : (
  "Sin fecha"
)}
                              </p>

                              <p>
  <span
    className="
      font-semibold
      text-slate-800
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
    text-slate-600
    mt-2
    text-center
  "
>

  {estado.descripcion}

</p>

                            </div>

{estado.texto !== "Vigente" && (
  <button
    onClick={() => recargarExtintor(extintor)}
    className="
      bg-green-600
      hover:bg-green-700
      transition
      px-4
      py-2
      rounded-lg
      text-sm
      text-white
      font-semibold
    "
  >
    Recargar
  </button>
)}

                            <Link
                              href={`/extintores/${extintor.id}?empresa=${extintor.empresa_id}`}
                              className="
                                bg-blue-600
                                hover:bg-blue-700
                                transition
                                px-4
                                py-2
                                rounded-lg
                                text-sm
                                text-white
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
                                text-white
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
