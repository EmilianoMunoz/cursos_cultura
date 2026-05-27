import { DIAS_TALLER } from "../data/demoData.js";

export function normalizarEstado(estado) {
  return estado === "Presentacion" ? "AusenteJustificado" : estado;
}

export function etiquetaEstado(estado) {
  const value = normalizarEstado(estado);
  return value === "AusenteJustificado" ? "Ausente justificado" : value;
}

export function badgeVariant(value) {
  const estado = normalizarEstado(value);
  if (["Activo", "Presente"].includes(estado)) return "success";
  if (["Pausado", "Feriado"].includes(estado)) return "warning";
  if (["Finalizado", "Ausente"].includes(estado)) return "danger";
  if (estado === "AusenteJustificado") return "primary";
  return "secondary";
}

export function estadoClass(value) {
  const estado = normalizarEstado(value);
  if (["Activo", "Presente"].includes(estado)) return "is-ok";
  if (["Pausado", "Feriado", "Sin alumnos", "Asistencia pendiente"].includes(estado)) return "is-warn";
  if (["Finalizado", "Ausente", "Sin docente"].includes(estado)) return "is-danger";
  if (estado === "AusenteJustificado") return "is-info";
  return "is-neutral";
}

export function edad(fechaNacimiento) {
  if (!fechaNacimiento) return "-";
  const birth = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return "-";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday = now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : "-";
}

export function horariosOrdenados(taller) {
  return [...(taller?.horarios || [])].sort((a, b) => DIAS_TALLER.indexOf(a.dia) - DIAS_TALLER.indexOf(b.dia));
}

export function diasTexto(taller) {
  const abreviaturas = { Lunes: "Lun", Martes: "Mar", Miercoles: "Mie", Jueves: "Jue", Viernes: "Vie", Sabado: "Sab" };
  const horarios = horariosOrdenados(taller);
  if (!horarios.length) return "Sin dias";
  return horarios.map((h) => `${abreviaturas[h.dia] || h.dia} ${h.inicio}-${h.fin}`).join(", ");
}

export function horarioResumen(taller) {
  const horarios = horariosOrdenados(taller);
  if (!horarios.length) return "Sin horario";
  if (horarios.length > 1) return "Varios horarios";
  return `${horarios[0].inicio} - ${horarios[0].fin}`;
}

export function porcentaje(valor, total) {
  if (!total) return 0;
  return Math.round((valor * 100) / total);
}
