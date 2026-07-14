"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import TrabajadorDialog from "@/components/ui/trabajadores/TrabajadorDialog";
import TrabajadorFilters from "@/components/ui/trabajadores/TrabajadorFilters";
import TrabajadorStats from "@/components/ui/trabajadores/TrabajadorStats";
import TrabajadorTable from "@/components/ui/trabajadores/TrabajadorTable";
import type {
  EmpresaOption,
  Trabajador,
} from "@/components/ui/trabajadores/types";
import { supabase } from "@/lib/supabase";

export default function TrabajadoresPage() {
  const router = useRouter();

  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [orden, setOrden] = useState("nombre");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trabajadorEditando, setTrabajadorEditando] =
    useState<Trabajador | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const [trabajadoresResult, empresasResult] =
      await Promise.all([
        supabase
          .from("trabajadores_empresa")
          .select(`
            *,
            empresas (
              nombre
            )
          `)
          .order("nombre", { ascending: true }),
        supabase
          .from("empresas")
          .select("id, nombre")
          .eq("activa", true)
          .order("nombre", { ascending: true }),
      ]);

    if (trabajadoresResult.error) {
      console.error(trabajadoresResult.error);
      return;
    }

    if (empresasResult.error) {
      console.error(empresasResult.error);
      return;
    }

    setTrabajadores(trabajadoresResult.data || []);
    setEmpresas(empresasResult.data || []);
  }

  const trabajadoresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return [...trabajadores]
      .filter((trabajador) => {
        const coincideBusqueda =
          !texto ||
          [
            trabajador.nombre,
            trabajador.correo,
            trabajador.cargo,
            trabajador.empresas?.nombre,
          ]
            .filter(Boolean)
            .some((valor) =>
              String(valor).toLowerCase().includes(texto)
            );

        const coincideEmpresa =
          !empresaFiltro ||
          trabajador.empresa_id === empresaFiltro;

        const coincideEstado =
          !estadoFiltro ||
          trabajador.estado === estadoFiltro;

        return (
          coincideBusqueda &&
          coincideEmpresa &&
          coincideEstado
        );
      })
      .sort((a, b) => {
        if (orden === "empresa") {
          return (a.empresas?.nombre || "").localeCompare(
            b.empresas?.nombre || "",
            "es"
          );
        }

        if (orden === "cargo") {
          return (a.cargo || "").localeCompare(
            b.cargo || "",
            "es"
          );
        }

        if (orden === "fecha_ingreso") {
          return (a.fecha_ingreso || "").localeCompare(
            b.fecha_ingreso || ""
          );
        }

        return (a.nombre || "").localeCompare(
          b.nombre || "",
          "es"
        );
      });
  }, [
    trabajadores,
    busqueda,
    empresaFiltro,
    estadoFiltro,
    orden,
  ]);

  function abrirNuevoTrabajador() {
    setTrabajadorEditando(null);
    setDialogOpen(true);
  }

  function guardarEnEstado(trabajadorGuardado: Trabajador) {
    setTrabajadores((actuales) => {
      const existe = actuales.some(
        (trabajador) =>
          trabajador.id === trabajadorGuardado.id
      );

      if (existe) {
        return actuales.map((trabajador) =>
          trabajador.id === trabajadorGuardado.id
            ? trabajadorGuardado
            : trabajador
        );
      }

      return [...actuales, trabajadorGuardado].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es")
      );
    });
  }

  async function eliminarTrabajador(trabajador: Trabajador) {
    const confirmar = confirm(
      `¿Eliminar a ${trabajador.nombre}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("trabajadores_empresa")
      .delete()
      .eq("id", trabajador.id);

    if (error) {
      alert("No fue posible eliminar el trabajador.");
      console.error(error);
      return;
    }

    setTrabajadores((actuales) =>
      actuales.filter((item) => item.id !== trabajador.id)
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Trabajadores"
        description="Administración del personal registrado por empresa"
      />

      <TrabajadorStats trabajadores={trabajadores} />

      <TrabajadorFilters
        busqueda={busqueda}
        empresaId={empresaFiltro}
        estado={estadoFiltro}
        orden={orden}
        empresas={empresas}
        onBusquedaChange={setBusqueda}
        onEmpresaChange={setEmpresaFiltro}
        onEstadoChange={setEstadoFiltro}
        onOrdenChange={setOrden}
        onNuevo={abrirNuevoTrabajador}
      />

      <TrabajadorTable
        trabajadores={trabajadoresFiltrados}
        onView={(trabajador) =>
          router.push(`/trabajadores/${trabajador.id}`)
        }
        onEdit={(trabajador) => {
          setTrabajadorEditando(trabajador);
          setDialogOpen(true);
        }}
        onDelete={eliminarTrabajador}
      />

      <TrabajadorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        empresas={empresas}
        trabajador={trabajadorEditando}
        onCreated={cargarDatos}
        onSaved={guardarEnEstado}
      />
    </div>
  );
}
