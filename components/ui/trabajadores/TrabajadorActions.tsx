import { Eye, Pencil, Trash2 } from "lucide-react";

type TrabajadorActionsProps = {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TrabajadorActions({
  onView,
  onEdit,
  onDelete,
}: TrabajadorActionsProps) {
  const baseClass =
    "relative flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200";

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={onView}
        title="Ver"
        aria-label="Ver trabajador"
        className={`${baseClass} bg-blue-50 text-blue-700 hover:bg-blue-100`}
      >
        <Eye size={15} />
      </button>

      <button
        type="button"
        onClick={onEdit}
        title="Editar"
        aria-label="Editar trabajador"
        className={`${baseClass} bg-amber-50 text-amber-700 hover:bg-amber-100`}
      >
        <Pencil size={15} />
      </button>

      <button
        type="button"
        onClick={onDelete}
        title="Eliminar"
        aria-label="Eliminar trabajador"
        className={`${baseClass} bg-red-50 text-red-700 hover:bg-red-100`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
