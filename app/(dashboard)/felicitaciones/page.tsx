import PageHeader from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"

import {
  CalendarDays,
  Gift,
  Cake,
  Building2,
} from "lucide-react"

export default function FelicitacionesPage() {

  return (

    <div className="space-y-8">

      {/* HEADER */}
<PageHeader
  title="🎉 Felicitaciones"
  description="Gestiona cumpleaños y felicitaciones automáticas de los colaboradores."
/>
      {/* TARJETAS */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-5">

  <StatCard
    title="Cumpleaños hoy"
    value="0"
    subtitle="No hay cumpleaños registrados."
    icon={<Cake size={18} />}
    tone="blue"
  />

  <StatCard
    title="Esta semana"
    value="0"
    subtitle="Próximos cumpleaños."
    icon={<CalendarDays size={18} />}
    tone="amber"
  />

  <StatCard
    title="Este mes"
    value="0"
    subtitle="Cumpleaños del mes."
    icon={<Gift size={18} />}
    tone="green"
  />

  

</div>


<Card className="mt-8 p-6">

  <div className="flex items-center gap-3 mb-6">

    <CalendarDays
      size={24}
      className="text-[#0B4A92]"
    />

    <h2 className="text-xl font-bold text-slate-800">
      Próximos cumpleaños
    </h2>

  </div>

  <div
    className="
      flex
      flex-col
      items-center
      justify-center
      py-14
      text-center
    "
  >

    <CalendarDays
      size={60}
      className="text-slate-300"
    />

    <h3
      className="
        mt-5
        text-lg
        font-semibold
        text-slate-700
      "
    >
      No hay próximos cumpleaños
    </h3>

    <p
      className="
        mt-2
        text-slate-500
        max-w-lg
      "
    >
      Cuando registres la fecha de nacimiento de los colaboradores,
      aquí aparecerán automáticamente los próximos cumpleaños.
    </p>

    <button
      className="
        mt-6
        bg-[#0B4A92]
        hover:bg-[#08396f]
        transition
        text-white
        px-5
        py-3
        rounded-xl
        font-medium
      "
    >
      Ir a Colaboradores
    </button>

  </div>

</Card>

<Card className="p-6">

  <div className="flex items-center gap-3 mb-6">

    <Building2
      size={24}
      className="text-[#0B4A92]"
    />

    <h2 className="text-xl font-bold text-slate-800">
      Empresas
    </h2>

  </div>

  <div
    className="
      flex
      flex-col
      items-center
      justify-center
      py-14
      text-center
    "
  >

    <Building2
      size={60}
      className="text-slate-300"
    />

    <h3 className="mt-5 text-lg font-semibold text-slate-700">
      No hay empresas con cumpleaños próximos
    </h3>

    <p className="mt-2 text-slate-500 max-w-lg">
      Aquí aparecerán automáticamente las empresas que tengan
      colaboradores próximos a cumplir años.
    </p>

  </div>

</Card>

      </div>





  )


  
}


