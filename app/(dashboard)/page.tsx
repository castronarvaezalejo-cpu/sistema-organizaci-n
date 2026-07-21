"use client"

import { useEffect, useState }
from "react";

import Link from "next/link";

import {

  AlertTriangle,
  Clock3,
  Building2,
  Cake,
  CheckCircle2,
  DollarSign,
  Trophy,

} from "lucide-react";

import {

  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,

} from "recharts";

import { supabase }
from "@/lib/supabase";

export default function Home() {

  const [
    colaborador,
    setColaborador,
  ] = useState<any>(null);

  const [
    empresas,
    setEmpresas,
  ] = useState(0);

  const [
    pendientes,
    setPendientes,
  ] = useState(0);

  const [
    completadas,
    setCompletadas,
  ] = useState(0);

  const [
    vencidas,
    setVencidas,
  ] = useState(0);

  const [
    cumpleanosHoy,
    setCumpleanosHoy,
  ] = useState(0);

  const [
    horasPorColaborador,
    setHorasPorColaborador,
  ] = useState<any[]>([]);

  const [
    horasMes,
    setHorasMes,
  ] = useState(0);

  const [
    valorFacturable,
    setValorFacturable,
  ] = useState(0);

  const [
    topColaborador,
    setTopColaborador,
  ] = useState("");

  const [
  horasEmpresas,
  setHorasEmpresas,
] = useState<any[]>([]);

  useEffect(() => {

    cargarDashboard();

  }, []);

  async function cargarDashboard() {

    // ===================================
    // USUARIO ACTUAL
    // ===================================

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const {
      data: colaboradorData,
    } = await supabase
      .from("colaboradores")
      .select("*")
      .eq(
        "email",
        session.user.email
      )
      .single();

    if (!colaboradorData) return;

    setColaborador(
      colaboradorData
    );

    // ===================================
    // EMPRESAS
    // SOLO ADMIN
    // ===================================

    if (
      colaboradorData.rol ===
      "admin"
    ) {

      const {
        count: empresasCount,
      } = await supabase
        .from("empresas")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("activa", true);

      setEmpresas(
        empresasCount || 0
      );
    }

    // ===================================
    // TAREAS
    // ===================================

    const {
      count: pendientesCount,
    } = await supabase
      .from("tareas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .neq(
        "estado",
        "completada"
      );

    setPendientes(
      pendientesCount || 0
    );

    const {
      count: completadasCount,
    } = await supabase
      .from("tareas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "estado",
        "completada"
      );

    setCompletadas(
      completadasCount || 0
    );

    const hoy =
      new Date()
      .toISOString()
      .split("T")[0];

    const {
      count: vencidasCount,
    } = await supabase
      .from("tareas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .lt(
        "fecha_limite",
        hoy
      )
      .neq(
        "estado",
        "completada"
      );

    setVencidas(
      vencidasCount || 0
    );

    const { data: trabajadoresCumpleanos } =
      await supabase
        .from("trabajadores_empresa")
        .select("fecha_nacimiento")
        .not("fecha_nacimiento", "is", null);

    const hoyFecha = new Date();
    const totalCumpleanosHoy =
      trabajadoresCumpleanos?.filter((trabajador: any) => {
        const fecha = new Date(
          `${trabajador.fecha_nacimiento}T00:00:00`
        );

        return (
          fecha.getDate() === hoyFecha.getDate() &&
          fecha.getMonth() === hoyFecha.getMonth()
        );
      }).length || 0;

    setCumpleanosHoy(totalCumpleanosHoy);

    // ===================================
// HORAS POR EMPRESA
// SOLO ADMIN
// ===================================

if (
  colaboradorData.rol ===
  "admin"
) {

  const inicioMes =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
    .toISOString()
    .split("T")[0];

  const {
    data: empresasData,
  } = await supabase
    .from("empresas")
    .select(`
      id,
      nombre,
      horas_contratadas
    `)
    .eq("activa", true)
    .order("nombre");

  const {
    data: actividadesEmpresa,
  } = await supabase
    .from(
      "actividades_realizadas"
    )
    .select(`
      empresa_id,
      horas
    `)
    .gte(
      "fecha",
      inicioMes
    );

  if (
    empresasData &&
    actividadesEmpresa
  ) {

    const resultado =
      empresasData.map(
        (empresa: any) => {

          const horasUsadas =
            actividadesEmpresa
              .filter(
                (
                  actividad: any
                ) =>

                  actividad
                  .empresa_id ===
                  empresa.id
              )
              .reduce(
                (
                  acc: number,
                  actividad: any
                ) =>

                  acc +
                  Number(
                    actividad.horas
                  ),

                0
              );

          const contratadas =
            Number(
              empresa.horas_contratadas
              || 0
            );

          const porcentaje =
            contratadas > 0
              ? (
                  horasUsadas
                  / contratadas
                ) * 100
              : 0;

          return {

            nombre:
              empresa.nombre,

            usadas:
              horasUsadas,

            contratadas,

            porcentaje,
          };
        }
      );

    setHorasEmpresas(
      resultado
    );
  }
}

    // ===================================
    // ACTIVIDADES
    // ===================================

    const inicioMes =
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
      .toISOString()
      .split("T")[0];

    let query =
      supabase
        .from(
          "actividades_realizadas"
        )
        .select(`
          horas,
          total_facturado,
          colaborador_id,
          colaboradores (
            nombre
          ),
          fecha
        `)
        .gte(
          "fecha",
          inicioMes
        );

    // ===================================
    // SI ES ASESOR
    // SOLO SUS DATOS
    // ===================================

    if (
      colaboradorData.rol !==
      "admin"
    ) {

      query =
        query.eq(
          "colaborador_id",
          colaboradorData.id
        );
    }

    const {
      data: actividadesData,
    } = await query;

    if (actividadesData) {

      const agrupadas:
        Record<
          string,
          number
        > = {};

      let totalHoras = 0;

      actividadesData.forEach(
        (actividad: any) => {

          const nombre =
            actividad
            .colaboradores
            ?.nombre ||
            "Sin nombre";

          const horas =
            Number(
              actividad.horas
            );

          agrupadas[nombre] =
            (
              agrupadas[nombre]
              || 0
            ) + horas;

          totalHoras += horas;
        }
      );

      const resultado =
        Object.entries(
          agrupadas
        ).map(
          ([nombre, horas]) => ({
            nombre,
            horas,
          })
        );

      setHorasPorColaborador(
        resultado
      );

      setHorasMes(
        totalHoras
      );

      // SOLO ADMIN VE FACTURACION

      if (
        colaboradorData.rol ===
        "admin"
      ) {

        const totalFacturacion =
          actividadesData.reduce(
            (
              acc: number,
              actividad: any
            ) =>

              acc +
              Number(
                actividad
                .total_facturado
                || 0
              ),

            0
          );

        setValorFacturable(
          totalFacturacion
        );

        const top =
          [...resultado]
          .sort(
            (a, b) =>
              b.horas -
              a.horas
          )[0];

        if (top) {

          setTopColaborador(
            `${top.nombre} (${top.horas}h)`
          );
        }
      }
    }
  }

  const esAdmin =
    colaborador?.rol ===
    "admin";

  return (

    <div className="
      max-w-[1200px]
    ">

      {/* HEADER */}

      <div className="
        mb-8
      ">

        <h1 className="
          text-4xl
          font-black
          tracking-tight
          mb-2
        ">

          Dashboard

        </h1>

        <p className="
          text-slate-500
          text-lg
        ">

          {
            esAdmin
            ? "Resumen operativo y financiero"
            : "Resumen operativo personal"
          }

        </p>

      </div>

      {/* CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

        <PremiumCard
          title="Urgente"
          value={vencidas}
          subtitle="tareas vencidas"
          href="/alertas?filtro=vencidas"
          color="red"
          icon={
            <AlertTriangle size={22} />
          }
        />

        <PremiumCard
          title="Pendientes"
          value={pendientes}
          subtitle="tareas pendientes"
          href="/tareas?filtro=pendientes"
          color="yellow"
          icon={
            <Clock3 size={22} />
          }
        />

        {esAdmin && (

          <PremiumCard
            title="Empresas"
            value={empresas}
            subtitle="empresas activas"
            href="/empresas"
            color="blue"
            icon={
              <Building2 size={22} />
            }
          />

        )}

        <PremiumCard
          title="Completadas"
          value={completadas}
          subtitle="tareas completadas"
          href="/tareas?filtro=completadas"
          color="green"
          icon={
            <CheckCircle2 size={22} />
          }
        />

        <PremiumCard
          title="Cumpleaños"
          value={cumpleanosHoy}
          subtitle="hoy"
          href="/cumpleanos"
          color="blue"
          icon={
            <Cake size={22} />
          }
        />

      </div>

      {/* MINI CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-4
        mt-6
      ">

        <PremiumMiniCard
          title="Horas del Mes"
          value={`${horasMes}h`}
          href="/horas"
          color="blue"
          icon={
            <Clock3 size={20} />
          }
        />

        {esAdmin && (

          <>
            <PremiumMiniCard
              title="Facturación"
              value={`$${valorFacturable.toLocaleString()}`}
              href="/reportes"
              color="green"
              icon={
                <DollarSign size={20} />
              }
            />

            <PremiumMiniCard
              title="Top"
              value={topColaborador || "-"}
              href="/colaboradores"
              color="yellow"
              icon={
                <Trophy size={20} />
              }
            />
          </>
        )}

      </div>

      {/* HORAS CONTRATADAS */}
{/* SOLO ADMIN */}

{esAdmin && (

  <div className="
    mt-8
  ">

    <h2 className="
      text-2xl
      font-bold
      mb-6
    ">

      Consumo de Horas por Empresa

    </h2>

    <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      gap-4
    ">

      {horasEmpresas.map(
        (empresa) => {

          const color =

            empresa.porcentaje >= 100

            ? "bg-red-500"

            : empresa.porcentaje >= 80

            ? "bg-yellow-500"

            : "bg-green-500";

          return (

            <div
              key={empresa.nombre}
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
              "
            >

              <div className="
                flex
                items-center
                justify-between
                mb-4
              ">

                <h3 className="
                  text-lg
                  font-bold
                ">

                  {empresa.nombre}

                </h3>

                <span className="
                  text-slate-500
                  text-sm
                ">

                  {empresa.usadas}h
                  /
                  {empresa.contratadas}h

                </span>

              </div>

              {/* BARRA */}

              <div className="
                w-full
                h-4
                rounded-full
                bg-slate-100
                overflow-hidden
              ">

                <div
                  className={`
                    h-full
                    ${color}
                  `}
                  style={{
                    width:
                      `${Math.min(
                        empresa.porcentaje,
                        100
                      )}%`,
                  }}
                />

              </div>

              {/* ESTADO */}

              <div className="
                mt-3
                text-sm
                font-medium
              ">

                {

                  empresa.porcentaje >= 100

                  ? (

                    <span className="
                      text-red-700
                    ">

                      Horas excedidas

                    </span>
                  )

                  : empresa.porcentaje >= 80

                  ? (

                    <span className="
                      text-amber-700
                    ">

                      Próximo al límite

                    </span>
                  )

                  : (

                    <span className="
                      text-emerald-700
                    ">

                      Dentro del rango

                    </span>
                  )
                }

              </div>

            </div>
          );
        }
      )}

    </div>

  </div>
)}



    </div>
  );
}

function PremiumCard({
  title,
  value,
  subtitle,
  href,
  color,
  icon,
}: {
  title: string
  value: number
  subtitle: string
  href: string
  color:
    | "red"
    | "yellow"
    | "blue"
    | "green"
  icon: React.ReactNode
}) {

  const styles = {

    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border:
        "border-red-100",
    },

    yellow: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border:
        "border-amber-100",
    },

    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border:
        "border-blue-100",
    },

    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border:
        "border-emerald-100",
    },
  };

  return (

    <Link
      href={href}
      aria-label={`Ver ${subtitle}`}
      className={`
      rounded-2xl
      border
      ${styles[color].border}
      bg-white
      p-5
      block
      shadow-sm
      transition
      hover:-translate-y-1
      hover:shadow-md
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-blue-200
    `}>

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
          ${styles[color].bg}
          ${styles[color].text}
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
        mb-2
        ${styles[color].text}
      `}>

        {value}

      </p>

      <p className="
        text-slate-500
      ">

        {subtitle}

      </p>

    </Link>
  );
}

function PremiumMiniCard({
  title,
  value,
  href,
  color,
  icon,
}: {
  title: string
  value: string
  href: string
  color:
    | "yellow"
    | "green"
    | "blue"
  icon: React.ReactNode
}) {

  const styles = {

    yellow:
      "text-amber-700 bg-amber-50",

    green:
      "text-emerald-700 bg-emerald-50",

    blue:
      "text-blue-700 bg-blue-50",
  };

  return (

    <Link
      href={href}
      aria-label={`Ver ${title}`}
      className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      block
      shadow-sm
      transition
      hover:-translate-y-1
      hover:shadow-md
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-blue-200
    ">

      <div className="
        flex
        items-center
        justify-between
        mb-6
      ">

        <h3 className="
          text-lg
          font-semibold
        ">

          {title}

        </h3>

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

      <p className={`
        text-3xl
        font-black

        ${color === "green"
          ? "text-emerald-700"

          : color === "yellow"
          ? "text-amber-700"

          : "text-blue-700"
        }
      `}>

        {value}

      </p>

    </Link>
  );
}
