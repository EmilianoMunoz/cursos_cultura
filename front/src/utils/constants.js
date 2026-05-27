export const permissions = {
  Administrador: ["dashboard", "talleres", "gestionTalleres", "docentes", "alumnos", "asistencia", "reportes", "historial"],
  Docente: ["dashboard", "talleres", "alumnos", "asistencia", "reportes"],
  Alumno: ["dashboard", "talleres", "reportes"]
};

export const views = [
  ["dashboard", "Tablero"],
  ["talleres", "Talleres"],
  ["gestionTalleres", "Gestion talleres"],
  ["docentes", "Docentes"],
  ["alumnos", "Alumnos"],
  ["asistencia", "Asistencia"],
  ["reportes", "Reportes"],
  ["historial", "Historial"]
];

export function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const today = getToday();
export const asistenciaEstados = ["Presente", "Ausente", "AusenteJustificado", "Feriado"];
