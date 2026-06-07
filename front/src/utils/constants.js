export const permissions = {
  Administrador: ["dashboard", "talleres", "gestionTalleres", "docentes", "alumnos", "asistencia", "reportes", "historial"],
  Docente: ["dashboard", "talleres", "alumnos", "asistencia", "reportes"],
  Alumno: ["talleres"]
};

export const permisoReferente = "usuariosSistema";

export const views = [
  ["dashboard", "Tablero"],
  ["talleres", "Talleres"],
  ["gestionTalleres", "Gestion talleres"],
  ["docentes", "Docentes"],
  ["alumnos", "Alumnos"],
  ["asistencia", "Asistencia"],
  ["reportes", "Reportes"],
  ["historial", "Historial"],
  [permisoReferente, "Usuarios del sistema"]
];

export function permisosUsuario(user) {
  const base = permissions[user?.role] || [];
  if (user?.role === "Administrador" && user?.puedeGestionarUsuarios) {
    return [...base, permisoReferente];
  }
  return base;
}

export function etiquetaRol(user) {
  if (user?.role === "Administrador") {
    return user.puedeGestionarUsuarios ? "Admin general" : "Admin común";
  }
  return user?.role || "";
}

export function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const today = getToday();
export const asistenciaEstados = ["Presente", "Ausente", "AusenteJustificado", "Feriado"];
