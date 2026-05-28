const diasPorIndice = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export function diaDeFecha(fecha) {
  const [year, month, day] = String(fecha).split("-").map(Number);
  if (!year || !month || !day) return "";
  return diasPorIndice[new Date(year, month - 1, day).getDay()];
}

export function tallerTieneClaseEnFecha(taller, fecha) {
  const dia = diaDeFecha(fecha);
  const horarios = Array.isArray(taller.horarios) ? taller.horarios : [];
  if (horarios.length) return horarios.some((h) => h.dia === dia);
  return Array.isArray(taller.dias) && taller.dias.includes(dia);
}

export function talleresConAsistenciaPendiente(data, user, selectedDate) {
  const talleres = user.role === "Docente"
    ? data.talleres.filter((t) => t.docenteId === user.docenteId)
    : user.role === "Alumno"
      ? data.talleres.filter((t) => data.inscripciones.some((i) => i.alumnoId === user.alumnoId && i.tallerId === t.id && i.estado === "Activo"))
      : data.talleres;
  return talleres.filter((t) => {
    const ins = data.inscripciones.filter((i) => i.tallerId === t.id && i.estado === "Activo").length;
    const regs = data.asistencias.filter((a) => a.tallerId === t.id && a.fecha === selectedDate).length;
    return t.estado === "Activo" && tallerTieneClaseEnFecha(t, selectedDate) && ins > 0 && regs < ins;
  });
}
