import { formatearFecha, formatearPrioridad } from "./formato";

interface NuevaTareaProps {
  colaboradorNombre: string;
  empresaNombre: string;
  titulo: string;
  prioridad: string;
  fechaLimite: string;
}

export function crearMensajeNuevaTarea({
  colaboradorNombre,
  empresaNombre,
  titulo,
  prioridad,
  fechaLimite,
}: NuevaTareaProps) {
  return `📋 *NUEVA TAREA ASIGNADA*

Hola *${colaboradorNombre}* 👋

Has recibido una nueva tarea desde
*SEITON Soluciones Empresariales*.

━━━━━━━━━━━━━━━━━━

🏢 *Empresa*
${empresaNombre}

📝 *Tarea*
${titulo}

⚡ *Prioridad*
${formatearPrioridad(prioridad)}

📅 *Fecha límite*
${formatearFecha(fechaLimite)}

━━━━━━━━━━━━━━━━━━

✅ Recuerda completar esta tarea antes de la fecha límite.

Gracias por usar *SEITON Soluciones Empresariales* 💙`;
}