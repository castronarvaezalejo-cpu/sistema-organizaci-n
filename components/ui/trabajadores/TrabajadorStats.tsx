import { Building2, UserCheck, UserX, Users } from "lucide-react";

import type { Trabajador } from "./types";

type TrabajadorStatsProps = {
  trabajadores: Trabajador[];
};

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
        {icon}
      </div>
      <p className="text-xs font-semibold text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default function TrabajadorStats({
  trabajadores,
}: TrabajadorStatsProps) {
  const activos =
    trabajadores.filter((trabajador) => trabajador.estado === "Activo").length;

  const inactivos =
    trabajadores.filter((trabajador) => trabajador.estado === "Inactivo").length;

  const empresas =
    new Set(trabajadores.map((trabajador) => trabajador.empresa_id)).size;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        title="Total"
        value={trabajadores.length}
        icon={<Users size={17} />}
        tone="bg-blue-50 text-blue-700"
      />
      <StatCard
        title="Activos"
        value={activos}
        icon={<UserCheck size={17} />}
        tone="bg-emerald-50 text-emerald-700"
      />
      <StatCard
        title="Inactivos"
        value={inactivos}
        icon={<UserX size={17} />}
        tone="bg-red-50 text-red-700"
      />
      <StatCard
        title="Empresas"
        value={empresas}
        icon={<Building2 size={17} />}
        tone="bg-amber-50 text-amber-700"
      />
    </div>
  );
}
