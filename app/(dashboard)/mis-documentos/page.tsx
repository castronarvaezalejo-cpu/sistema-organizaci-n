"use client";

import PageHeader from "@/components/ui/PageHeader";

export default function MisDocumentosPage() {
  return (
    <div>
      <PageHeader
        title="Mis Documentos"
        description="Sección preparada para documentos, certificados y soportes."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Próximamente podrás gestionar aquí tus documentos.
      </div>
    </div>
  );
}
