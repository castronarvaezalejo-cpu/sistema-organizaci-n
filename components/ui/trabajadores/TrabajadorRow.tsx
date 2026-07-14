import type { Trabajador } from "./types";
import TrabajadorActions from "./TrabajadorActions";
import TrabajadorAvatar from "./TrabajadorAvatar";

type TrabajadorRowProps = {
  trabajador: Trabajador;
  onView: (trabajador: Trabajador) => void;
  onEdit: (trabajador: Trabajador) => void;
  onDelete: (trabajador: Trabajador) => void;
};

export default function TrabajadorRow({
  trabajador,
  onView,
  onEdit,
  onDelete,
}: TrabajadorRowProps) {
  const activo = trabajador.estado === "Activo";

  return (
    <div
      className="
        grid
        grid-cols-[64px_minmax(220px,1.6fr)_minmax(160px,1fr)_minmax(130px,.8fr)_110px_128px]
        items-center
        gap-3
        border-b
        border-slate-100
        px-4
        py-3
        text-sm
        transition
        hover:bg-blue-50/40
      "
    >
      <TrabajadorAvatar
        nombre={trabajador.nombre}
        fotoUrl={trabajador.foto_url}
      />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">
          {trabajador.nombre}
        </p>
        <p className="truncate text-xs text-slate-500">
          {trabajador.correo || "-"}
        </p>
      </div>

      <p className="truncate text-slate-600">
        {trabajador.empresas?.nombre || "-"}
      </p>

      <p className="truncate text-slate-600">
        {trabajador.cargo || "-"}
      </p>

      <span
        className={`
          inline-flex
          w-fit
          rounded-full
          px-2.5
          py-1
          text-xs
          font-semibold
          ${activo
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
          }
        `}
      >
        {trabajador.estado || "Sin estado"}
      </span>

      <TrabajadorActions
        onView={() => onView(trabajador)}
        onEdit={() => onEdit(trabajador)}
        onDelete={() => onDelete(trabajador)}
      />
    </div>
  );
}
