import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export interface ActividadPDF {
  fecha: string;
  colaborador: string;
  descripcion: string;
  horas: number;
}

type DocConAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY?: number;
  };
};

export function dibujarTablaActividadesAutoTable(
  doc: jsPDF,
  actividades: ActividadPDF[],
  inicioY: number
) {
  autoTable(doc, {
    startY: inicioY,
    margin: {
      left: 18,
      right: 18,
      top: 18,
      bottom: 24,
    },
    head: [["Fecha", "Colaborador", "Actividad", "Horas"]],
    body: actividades.map((actividad) => [
      actividad.fecha || "-",
      actividad.colaborador || "-",
      actividad.descripcion || "-",
      `${actividad.horas} h`,
    ]),
    theme: "grid",
    showHead: "everyPage",
    tableWidth: 174,
styles: {
  font: "helvetica",
  fontSize: 8.3,
  textColor: [30, 41, 59],
  lineColor: [226, 232, 240],
  lineWidth: 0.2,

  cellPadding: {
    top: 4,
    right: 3,
    bottom: 4,
    left: 3,
  },

  overflow: "linebreak",
  valign: "top",
  minCellHeight: 10,
},
    headStyles: {
      fillColor: [11, 74, 146],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
      valign: "middle",
      lineColor: [11, 74, 146],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
0: {
  cellWidth: 22,
  halign: "left",
},
1: {
  cellWidth: 38,
  halign: "left",
},
2: {
  cellWidth: 90,
  halign: "justify",
},
3: {
  cellWidth: 16,
  halign: "center",
},
    },
  });
}

export function obtenerFinalAutoTable(doc: jsPDF) {
  return (doc as DocConAutoTable).lastAutoTable?.finalY || 158;
}
