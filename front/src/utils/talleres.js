export function talleresConAsistenciaPendiente(data, user, selectedDate) {
  const talleres = user.role === "Docente" ? data.talleres.filter((t) => t.docenteId === user.docenteId) : data.talleres;
  return talleres.filter((t) => {
    const ins = data.inscripciones.filter((i) => i.tallerId === t.id && i.estado === "Activo").length;
    const regs = data.asistencias.filter((a) => a.tallerId === t.id && a.fecha === selectedDate).length;
    return t.estado === "Activo" && ins > 0 && regs < ins;
  });
}
