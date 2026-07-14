"use client";

import PageHeader from "@/components/ui/PageHeader";

export default function MisCapacitacionesPage() {
  return (
    <div>
      <PageHeader
        title="Mis Capacitaciones"
        description="Sección preparada para futuras capacitaciones del trabajador."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Próximamente podrás consultar aquí tus capacitaciones.
      </div>
    </div>
  );
}
