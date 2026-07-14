import type { Trabajador } from "./types";
import TrabajadorActions from "./TrabajadorActions";
import TrabajadorAvatar from "./TrabajadorAvatar";
import TrabajadorRow from "./TrabajadorRow";

type TrabajadorTableProps = {
  trabajadores: Trabajador[];
  onView: (trabajador: Trabajador) => void;
  onEdit: (trabajador: Trabajador) => void;
  onDelete: (trabajador: Trabajador) => void;
};

export default function TrabajadorTable({
  trabajadores,
  onView,
  onEdit,
  onDelete,
}: TrabajadorTableProps) {
  if (trabajadores.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No hay trabajadores para mostrar.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div
          className="
            grid
            grid-cols-[64px_minmax(220px,1.6fr)_minmax(160px,1fr)_minmax(130px,.8fr)_110px_128px]
            gap-3
            border-b
            border-slate-200
            bg-blue-50
            px-4
            py-2.5
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-slate-600
          "
        >
          <span>Foto</span>
          <span>Trabajador</span>
          <span>Empresa</span>
          <span>Cargo</span>
          <span>Estado</span>
          <span className="text-center">Acciones</span>
        </div>

        {trabajadores.map((trabajador) => (
          <TrabajadorRow
            key={trabajador.id}
            trabajador={trabajador}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="grid gap-3 lg:hidden">
        {trabajadores.map((trabajador) => (
          <div
            key={trabajador.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <TrabajadorAvatar
                nombre={trabajador.nombre}
                fotoUrl={trabajador.foto_url}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {trabajador.nombre}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {trabajador.correo || "-"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {trabajador.empresas?.nombre || "-"} · {trabajador.cargo || "-"}
                </p>
              </div>

              <span
                className={`
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  ${trabajador.estado === "Activo"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                  }
                `}
              >
                {trabajador.estado || "-"}
              </span>
            </div>

            <div className="mt-3 flex justify-end">
              <TrabajadorActions
                onView={() => onView(trabajador)}
                onEdit={() => onEdit(trabajador)}
                onDelete={() => onDelete(trabajador)}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
