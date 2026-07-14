"use client";

import PageHeader from "@/components/ui/PageHeader";

export default function MisActividadesPage() {
  return (
    <div>
      <PageHeader
        title="Mis Actividades"
        description="Sección preparada para futuras actividades del trabajador."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Próximamente podrás consultar aquí tus actividades.
      </div>
    </div>
  );
}
