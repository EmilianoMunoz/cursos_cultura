import React, { useState } from "react";
import { Button, ButtonGroup, Card, Form, Stack } from "react-bootstrap";
import { EmptyState } from "../components/common.jsx";
import { asistenciaEstados, getToday } from "../utils/constants.js";
import { badgeVariant, etiquetaEstado, normalizarEstado } from "../utils/formatters.js";

export function Attendance({ data, setData, visibleTalleres, selectedDate, setSelectedDate, selectedTaller, setSelectedTaller, pushHistory }) {
  const [draft, setDraft] = useState({});
  const [savedNotice, setSavedNotice] = useState("");
  const currentDay = getToday();
  const taller = visibleTalleres.find((t) => t.id === selectedTaller) || visibleTalleres[0];
  const inscriptos = taller ? data.inscripciones.filter((i) => i.tallerId === taller.id && i.estado === "Activo") : [];
  const isToday = selectedDate === currentDay;
  const isFutureDate = selectedDate > currentDay;

  const draftKey = (alumnoId) => `${taller?.id || "sin"}-${selectedDate}-${alumnoId}`;
  const existingRecord = (alumnoId) => data.asistencias.find((a) => a.alumnoId === alumnoId && a.tallerId === taller?.id && a.fecha === selectedDate);
  const canEditStudent = (alumnoId) => isToday && !existingRecord(alumnoId);

  const setEstado = (alumnoId, estado) => {
    if (!canEditStudent(alumnoId)) return;
    setDraft((prev) => ({ ...prev, [draftKey(alumnoId)]: estado }));
    setSavedNotice("");
  };

  const saveAttendance = () => {
    if (!taller) return;
    if (!isToday) {
      setSavedNotice("Las asistencias historicas son de solo lectura.");
      return;
    }
    const seleccionados = inscriptos
      .map((ins) => ({ alumnoId: ins.alumnoId, estado: draft[draftKey(ins.alumnoId)] }))
      .filter((item) => item.estado && !existingRecord(item.alumnoId));
    if (!seleccionados.length) {
      setSavedNotice("No hay cambios nuevos para guardar.");
      return;
    }
    setData((prev) => {
      const nuevos = seleccionados.map(({ alumnoId, estado }) => ({ alumnoId, tallerId: taller.id, fecha: selectedDate, estadoAsistencia: estado, docenteId: taller.docenteId }));
      return { ...prev, asistencias: [...prev.asistencias, ...nuevos] };
    });
    pushHistory("RegistroAsistencia", "CREATE", null, { tallerId: taller.id, tallerNombre: taller.nombre, fecha: selectedDate, registros: seleccionados.length });
    setDraft((prev) => {
      const next = { ...prev };
      seleccionados.forEach(({ alumnoId }) => delete next[draftKey(alumnoId)]);
      return next;
    });
    setSavedNotice(`Asistencia guardada para ${seleccionados.length} alumno/s.`);
  };

  if (!taller) return <Card><Card.Body><EmptyState title="Sin talleres visibles" text="No tenes talleres disponibles para cargar asistencia." /></Card.Body></Card>;

  const pendingCount = Object.keys(draft).filter((key) => key.startsWith(`${taller.id}-${selectedDate}-`)).length;
  const lockedCount = inscriptos.filter((ins) => existingRecord(ins.alumnoId)).length;
  const emptyCount = inscriptos.length - lockedCount;
  const readOnlyText = isFutureDate
    ? "No se puede cargar asistencia para fechas futuras."
    : !isToday
      ? "Consulta historica: las asistencias anteriores son de solo lectura."
      : lockedCount
        ? `${lockedCount} registro/s ya cargado/s no se pueden editar.`
        : "Selecciona estados y guarda la asistencia.";

  return (
    <Card><Card.Body>
      <div className="section-head">
        <div><h2>Asistencia</h2><p className="text-muted">{taller.nombre}</p></div>
        <Stack direction="horizontal" gap={2}>
          <Form.Control type="date" value={selectedDate} max={currentDay} onChange={(e) => { setSelectedDate(e.target.value); setSavedNotice(""); setDraft({}); }} />
          <Form.Select value={taller.id} onChange={(e) => { setSelectedTaller(Number(e.target.value)); setSavedNotice(""); setDraft({}); }}>{visibleTalleres.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</Form.Select>
        </Stack>
      </div>
      <div className="soft-alert mb-3">{savedNotice || readOnlyText}</div>
      <Stack gap={2}>
        {inscriptos.map((ins) => {
          const alumno = data.alumnos.find((a) => a.id === ins.alumnoId);
          const reg = existingRecord(ins.alumnoId);
          const estadoActual = draft[draftKey(ins.alumnoId)] || normalizarEstado(reg?.estadoAsistencia);
          const locked = !canEditStudent(ins.alumnoId);
          return (
            <Card key={ins.alumnoId} className="attendance-card">
              <Card.Body className="d-flex justify-content-between gap-3 flex-wrap">
                <div>
                  <strong>{alumno?.nombre} {alumno?.apellido}</strong>
                  <div className="text-muted small">DNI {alumno?.dni}{reg ? " · Cargada" : ""}</div>
                </div>
                <ButtonGroup className="flex-wrap">
                  {asistenciaEstados.map((estado) => <Button key={estado} size="sm" variant={estadoActual === estado ? badgeVariant(estado) : "outline-secondary"} disabled={locked} onClick={() => setEstado(ins.alumnoId, estado)}>{etiquetaEstado(estado)}</Button>)}
                </ButtonGroup>
              </Card.Body>
            </Card>
          );
        })}
        {!inscriptos.length ? <EmptyState title="Sin alumnos activos" text="Este taller no tiene alumnos activos para tomar asistencia." /> : null}
      </Stack>
      <div className="attendance-savebar">
        <span>{pendingCount ? `${pendingCount} cambio/s sin guardar` : `${emptyCount} alumno/s disponibles para cargar hoy`}</span>
        <Button variant="success" onClick={saveAttendance} disabled={!isToday || isFutureDate || !pendingCount}>Guardar asistencia</Button>
      </div>
    </Card.Body></Card>
  );
}
