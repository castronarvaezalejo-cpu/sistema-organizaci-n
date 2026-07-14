import { Search } from "lucide-react";

import type { EmpresaOption } from "./types";

type TrabajadorFiltersProps = {
  busqueda: string;
  empresaId: string;
  estado: string;
  orden: string;
  empresas: EmpresaOption[];
  onBusquedaChange: (value: string) => void;
  onEmpresaChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onOrdenChange: (value: string) => void;
  onNuevo: () => void;
};

export default function TrabajadorFilters({
  busqueda,
  empresaId,
  estado,
  orden,
  empresas,
  onBusquedaChange,
  onEmpresaChange,
  onEstadoChange,
  onOrdenChange,
  onNuevo,
}: TrabajadorFiltersProps) {
  const inputClass =
    "h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0B4A92] focus:ring-4 focus:ring-blue-100";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_220px_160px_160px_auto] lg:items-center">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={busqueda}
            onChange={(event) => onBusquedaChange(event.target.value)}
            placeholder="Buscar por nombre, correo, cargo o empresa..."
            className={`${inputClass} w-full pl-9`}
          />
        </div>

        <select
          value={empresaId}
          onChange={(event) => onEmpresaChange(event.target.value)}
          className={`${inputClass} w-full`}
        >
          <option value="">Todas las empresas</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nombre}
            </option>
          ))}
        </select>

        <select
          value={estado}
          onChange={(event) => onEstadoChange(event.target.value)}
          className={`${inputClass} w-full`}
        >
          <option value="">Todos</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>

        <select
          value={orden}
          onChange={(event) => onOrdenChange(event.target.value)}
          className={`${inputClass} w-full`}
        >
          <option value="nombre">Nombre</option>
          <option value="empresa">Empresa</option>
          <option value="cargo">Cargo</option>
          <option value="fecha_ingreso">Fecha ingreso</option>
        </select>

        <button
          type="button"
          onClick={onNuevo}
          className="h-9 rounded-xl bg-[#0B4A92] px-4 text-sm font-semibold text-white transition hover:bg-[#0B75C9]"
        >
          Nuevo trabajador
        </button>
      </div>
    </div>
  );
}
