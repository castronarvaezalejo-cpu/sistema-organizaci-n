export function formatearTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, "");

  return limpio.startsWith("57") ? limpio : `57${limpio}`;
}

export function formatearPrioridad(prioridad: string): string {
  switch (prioridad.toLowerCase()) {
    case "alta":
      return "🔴 Alta";

    case "media":
      return "🟡 Media";

    case "baja":
      return "🟢 Baja";

    default:
      return prioridad;
  }
}

export function formatearFecha(fecha: string): string {
  const date = new Date(fecha + "T00:00:00");

  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}