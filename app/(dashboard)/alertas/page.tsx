"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  MessageCircle,
} from "lucide-react";

import { supabase }
from "@/lib/supabase";

type Alerta = {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  color: string;

  telefono?: string;
  empresa?: string;
};

function calcularEstadoExtintor(
  fechaRecarga: string
) {

  const hoy = new Date();

  const vencimiento =
    new Date(fechaRecarga);

  // +1 año

  vencimiento.setFullYear(
    vencimiento.getFullYear() + 1
  );

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
      tipo: "vencido",
      texto:
        `Vencido hace ${Math.abs(dias)} días`,
      color:
        "border-red-500 bg-red-500/10 text-red-400",
    };
  }

  // PRÓXIMO

  if (dias <= 30) {

    return {
      tipo: "proximo",
      texto:
        `Vence en ${dias} días`,
      color:
        "border-yellow-500 bg-yellow-500/10 text-yellow-400",
    };
  }

  return null;
}

export default function AlertasPage() {

  const [
    alertas,
    setAlertas,
  ] = useState<
    Alerta[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    obtenerAlertas();

  }, []);

  // ===================================
  // WHATSAPP
  // ===================================

  function abrirWhatsApp(
    alerta: Alerta
  ) {

    if (!alerta.telefono) {

      alert(
        "Esta empresa no tiene teléfono registrado"
      );

      return;
    }

    const telefono =
      alerta.telefono.replace(
        /\D/g,
        ""
      );

    const mensaje =
`Hola 

Te contactamos desde SEITON.

Alerta:
${alerta.titulo}

${alerta.descripcion}

Por favor programar revisión o mantenimiento.

SEITON`;

    const url =
`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(
      url,
      "_blank"
    );
  }

  // ===================================
  // OBTENER ALERTAS
  // ===================================

  async function obtenerAlertas() {

    setLoading(true);

    const resultado:
      Alerta[] = [];

    // ===================================
    // TAREAS
    // ===================================

    const hoy =
      new Date();

    const {
      data: tareas,
    } = await supabase
      .from("tareas")
      .select(`
        *,
        empresas (
          nombre,
          telefono
        ),
        colaboradores (
          nombre
        )
      `)
      .neq(
        "estado",
        "completada"
      )
      .order(
        "fecha_limite",
        {
          ascending: true,
        }
      );

    if (tareas) {

      tareas.forEach(
        (tarea: any) => {

        const fecha =
          new Date(
            tarea.fecha_limite
          );

        let tipo =
          "proxima";

        let color =
          "border-blue-500 bg-blue-500/10 text-blue-400";

        let descripcion =
          "Próxima";

        // VENCIDA

        if (fecha < hoy) {

          tipo =
            "vencida";

          color =
            "border-red-500 bg-red-500/10 text-red-400";

          descripcion =
            "Tarea vencida";
        }

        // HOY

        else if (
          fecha.toDateString() ===
          hoy.toDateString()
        ) {

          tipo = "hoy";

          color =
            "border-yellow-500 bg-yellow-500/10 text-yellow-400";

          descripcion =
            "Vence hoy";
        }

        resultado.push({

          id:
            "tarea-" +
            tarea.id,

          tipo,

          titulo:
            tarea.titulo,

          descripcion:
            `${descripcion} • ${tarea.empresas?.nombre || "-"}`,

          fecha:
            tarea.fecha_limite,

          color,

          telefono:
            tarea.empresas?.telefono,

          empresa:
            tarea.empresas?.nombre,
        });
      });
    }

    // ===================================
    // EXTINTORES
    // ===================================

    const {
      data: extintores,
    } = await supabase
      .from("extintores")
      .select(`
        *,
        empresas (
          nombre,
          telefono
        )
      `);

    if (extintores) {

      extintores.forEach(
        (
          extintor: any
        ) => {

        const estado =
          calcularEstadoExtintor(
            extintor.fecha_recarga
          );

        // SOLO MOSTRAR
        // próximos o vencidos

        if (!estado) return;

        resultado.push({

          id:
            "extintor-" +
            extintor.id,

          tipo:
            estado.tipo,

          titulo:
            `Extintor ${extintor.codigo || "Sin codigo"}`,

          descripcion:
            `${estado.texto} • ${extintor.empresas?.nombre || "Sin empresa"}`,

          fecha:
            extintor.fecha_recarga,

          color:
            estado.color,

          telefono:
            extintor.empresas?.telefono,

          empresa:
            extintor.empresas?.nombre,
        });
      });
    }

    // ===================================
    // ORDENAR
    // ===================================

    resultado.sort(
      (a, b) =>
        new Date(
          a.fecha
        ).getTime() -
        new Date(
          b.fecha
        ).getTime()
    );

    setAlertas(
      resultado
    );

    setLoading(false);
  }

  // ===================================
  // LOADING
  // ===================================

  if (loading) {

    return (
      <div className="
        p-10
        text-center
      ">
        Cargando alertas...
      </div>
    );
  }

  return (

    <div>

      {/* HEADER */}

      <div className="
        mb-10
      ">

        <h1 className="
          text-4xl
          font-bold
          mb-2
        ">
          Alertas
        </h1>

        <p className="
          text-zinc-400
        ">

          Seguimiento automático
          de tareas y extintores

        </p>

        <p className="
          text-zinc-500
          text-sm
          mt-3
        ">

          Total:
          {" "}
          {alertas.length}
          {" "}
          alertas activas

        </p>

      </div>

      {/* VACÍO */}

      {alertas.length === 0 && (

        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-2xl
          p-10
          text-center
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-2
          ">

            Todo está al día ✅

          </h2>

          <p className="
            text-zinc-400
          ">

            No hay tareas
            ni extintores críticos

          </p>

        </div>
      )}

      {/* ALERTAS */}

      <div className="
        space-y-5
      ">

        {alertas.map(
          (alerta) => (

          <div
            key={alerta.id}
            className={`
              border
              rounded-2xl
              p-6
              transition
              ${alerta.color}
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

                <h2 className="
                  text-xl
                  font-semibold
                  mb-2
                  text-white
                ">

                  {alerta.titulo}

                </h2>

                <p className="
                  text-zinc-300
                  mb-3
                ">

                  {
                    alerta.descripcion
                  }

                </p>

                <p className="
                  text-sm
                  text-zinc-400
                ">

                  {
                    alerta.fecha
                  }

                </p>

              </div>

              {/* ACCIONES */}

              <div className="
                flex
                items-center
                gap-3
              ">

                <button
                  onClick={() =>
                    abrirWhatsApp(
                      alerta
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    bg-green-600
                    hover:bg-green-700
                    transition
                    px-4
                    py-3
                    rounded-xl
                    font-medium
                  "
                >

                  <MessageCircle
                    size={18}
                  />

                  WhatsApp

                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}