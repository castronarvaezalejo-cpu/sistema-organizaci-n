export type TrabajadorCumpleanos = {
  id: string;
  empresa_id?: string | null;
  nombre: string;
  cargo?: string | null;
  correo?: string | null;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  foto_url?: string | null;
  empresas?: { nombre?: string | null } | null;
};

export type CumpleanosInfo = {
  proximaFecha: Date;
  edad: number;
  diasRestantes: number;
  fechaTexto: string;
  esHoy: boolean;
  esEstaSemana: boolean;
  esEsteMes: boolean;
};

const meses = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function fechaLocal(fecha?: string | null) {
  if (!fecha) return null;

  const [anio, mes, dia] = fecha
    .split("-")
    .map(Number);

  if (!anio || !mes || !dia) return null;

  return new Date(anio, mes - 1, dia);
}

export function obtenerInfoCumpleanos(
  fechaNacimiento?: string | null,
  base = new Date()
): CumpleanosInfo | null {
  const nacimiento = fechaLocal(fechaNacimiento);

  if (!nacimiento) return null;

  const hoy = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate()
  );

  let proximaFecha = new Date(
    hoy.getFullYear(),
    nacimiento.getMonth(),
    nacimiento.getDate()
  );

  if (proximaFecha < hoy) {
    proximaFecha = new Date(
      hoy.getFullYear() + 1,
      nacimiento.getMonth(),
      nacimiento.getDate()
    );
  }

  const diasRestantes = Math.ceil(
    (proximaFecha.getTime() - hoy.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const edad =
    proximaFecha.getFullYear() -
    nacimiento.getFullYear();

  return {
    proximaFecha,
    edad,
    diasRestantes,
    fechaTexto: `${proximaFecha.getDate()} ${
      meses[proximaFecha.getMonth()]
    }`,
    esHoy: diasRestantes === 0,
    esEstaSemana: diasRestantes >= 0 && diasRestantes <= 7,
    esEsteMes:
      proximaFecha.getMonth() === hoy.getMonth() &&
      proximaFecha.getFullYear() === hoy.getFullYear(),
  };
}

export function aplicarPlantillaCumpleanos(
  plantilla: string,
  trabajador: TrabajadorCumpleanos,
  info: CumpleanosInfo
) {
  return plantilla
    .replaceAll("{{nombre}}", trabajador.nombre || "")
    .replaceAll(
      "{{empresa}}",
      trabajador.empresas?.nombre || ""
    )
    .replaceAll("{{cargo}}", trabajador.cargo || "")
    .replaceAll("{{edad}}", String(info.edad))
    .replaceAll("{{fecha}}", info.fechaTexto);
}

export const plantillaCumpleanosDefault = `Hola {{nombre}}.

Todo el equipo de {{empresa}} te desea un muy feliz cumpleaños.

Esperamos que disfrutes este día.

SEITON`;
