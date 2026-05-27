import React from "react";
import { Card, Col, Row, Stack } from "react-bootstrap";
import { HorarioChips, MiniBar, StatCard } from "../components/common.jsx";
import { asistenciaEstados } from "../utils/constants.js";
import { horarioResumen, normalizarEstado } from "../utils/formatters.js";
import { talleresConAsistenciaPendiente } from "../utils/talleres.js";

export function Dashboard({ data, role, currentUser, visibleTalleres, visibleAlumnos, selectedDate, docenteName, setView }) {
  const activos = visibleTalleres.filter((t) => t.estado === "Activo");
  const pendientes = talleresConAsistenciaPendiente(data, currentUser, selectedDate);
  const sinDocente = data.talleres.filter((t) => t.estado === "Activo" && !t.docenteId);
  const registros = data.asistencias.filter((a) => a.fecha === selectedDate);
  const presentes = registros.filter((r) => normalizarEstado(r.estadoAsistencia) === "Presente").length;
  const statsHoy = asistenciaEstados.reduce((acc, estado) => {
    acc[estado] = registros.filter((r) => normalizarEstado(r.estadoAsistencia) === estado).length;
    return acc;
  }, {});
  const asistenciaCargada = (taller) => {
    const ins = data.inscripciones.filter((i) => i.tallerId === taller.id && i.estado === "Activo").length;
    const regs = data.asistencias.filter((a) => a.tallerId === taller.id && a.fecha === selectedDate).length;
    return ins > 0 && regs >= ins;
  };
  const actions = [
    ...pendientes.slice(0, 5).map((t) => ({ label: `${t.nombre}: asistencia pendiente`, meta: `${data.inscripciones.filter((i) => i.tallerId === t.id && i.estado === "Activo").length} alumnos`, view: "asistencia" })),
    ...(role === "Administrador" ? sinDocente.slice(0, 4).map((t) => ({ label: `${t.nombre}: sin docente`, meta: t.distrito, view: "gestionTalleres" })) : [])
  ];
  const distritoStats = activos.reduce((acc, taller) => {
    const current = acc[taller.distrito] || { distrito: taller.distrito, talleres: 0, alumnos: 0, pendientes: 0 };
    current.talleres += 1;
    current.alumnos += data.inscripciones.filter((i) => i.tallerId === taller.id && i.estado === "Activo").length;
    current.pendientes += pendientes.some((p) => p.id === taller.id) ? 1 : 0;
    acc[taller.distrito] = current;
    return acc;
  }, {});
  const distritos = Object.values(distritoStats).sort((a, b) => b.pendientes - a.pendientes || b.alumnos - a.alumnos).slice(0, 8);
  const pendientesPorDistrito = distritos.filter((d) => d.pendientes).slice(0, 3);
  const titulo = role === "Docente" ? "Panel docente" : role === "Alumno" ? "Mi panel" : "Operacion municipal de talleres";
  const subtitulo = role === "Docente" ? "Carga diaria, alumnos del taller y alertas simples." : "Estado diario, trazabilidad y pendientes operativos.";
  return (
    <Stack gap={3}>
      <Card className="hero-card">
        <Card.Body>
          <p className="eyebrow">Centro de control diario</p>
          <h2>{titulo}</h2>
          <p className="text-muted mb-0">{subtitulo}</p>
          <Row className="g-3 mt-2">
            <Col md={3}><StatCard label="Asistencia al dia" value={`${activos.length - pendientes.length}/${activos.length || 0}`} sub={`${pendientes.length} pendientes`} variant={pendientes.length ? "warning" : "success"} /></Col>
            <Col md={3}><StatCard label="Alumnos visibles" value={visibleAlumnos.length} /></Col>
            <Col md={3}><StatCard label="Talleres activos" value={activos.length} variant="success" /></Col>
            <Col md={3}><StatCard label={role === "Administrador" ? "Sin docente" : "Presentes hoy"} value={role === "Administrador" ? sinDocente.length : presentes} variant={role === "Administrador" && sinDocente.length ? "danger" : "success"} /></Col>
          </Row>
        </Card.Body>
      </Card>
      <div className="dashboard-grid">
        <Card className="dashboard-list">
          <Card.Body>
            <h3 className="dashboard-panel-title">Tablero diario</h3>
            {activos.map((t) => {
              const cargada = asistenciaCargada(t);
              return (
                <div className="daily-item" key={t.id}>
                  <div>
                    <p className="daily-title">{t.nombre}</p>
                    <HorarioChips taller={t} />
                    <p className="text-muted small mb-0">{horarioResumen(t)} · {docenteName(t.docenteId)}</p>
                  </div>
                  <span className={`status-pill ${cargada ? "is-ok" : "is-pending"}`}>{cargada ? "Cargada" : "Pendiente"}</span>
                </div>
              );
            })}
            {!activos.length ? <p className="text-muted mb-0">No hay talleres activos.</p> : null}
          </Card.Body>
        </Card>
        <Card className="dashboard-alerts">
          <Card.Body>
            <h3 className="dashboard-panel-title">Acciones pendientes</h3>
            <div className="pending-actions">
              {actions.length ? actions.map((a, i) => (
                <button key={i} type="button" className="action-pending" onClick={() => setView(a.view)}>
                  <span>{a.label}</span><small>{a.meta}</small>
                </button>
              )) : <p className="text-muted mb-0">No hay acciones pendientes para hoy.</p>}
            </div>
            <h3 className="dashboard-panel-title">Resumen visual</h3>
            <div className="chart-stack">
              <MiniBar label="Presentes" value={statsHoy.Presente || 0} total={registros.length || 1} variant="ok" />
              <MiniBar label="Ausentes" value={statsHoy.Ausente || 0} total={registros.length || 1} variant="danger" />
              <MiniBar label="Justificados" value={statsHoy.AusenteJustificado || 0} total={registros.length || 1} />
              <MiniBar label="Feriados" value={statsHoy.Feriado || 0} total={registros.length || 1} variant="warn" />
            </div>
            <div className="alert-list">
              <div className={`soft-alert ${pendientes.length ? "is-warn" : "is-ok"}`}>{pendientes.length ? `Hay ${pendientes.length} taller/es con asistencia pendiente.` : "Asistencias del dia completas."}</div>
              {sinDocente.length && role === "Administrador" ? <div className="soft-alert is-danger">{sinDocente.length} taller/es activo/s sin docente asignado.</div> : null}
              {pendientesPorDistrito.map((d) => <div className="soft-alert is-warn" key={d.distrito}>{d.distrito}: {d.pendientes} taller/es pendientes.</div>)}
            </div>
          </Card.Body>
        </Card>
      </div>
      <Card>
        <Card.Body>
          <h3 className="dashboard-panel-title">Distribucion por distrito</h3>
          <div className="taller-summary-grid district-summary-grid">
            {distritos.map((d) => (
              <article className="summary-card" key={d.distrito}>
                <div className="summary-card-head">
                  <div>
                    <p className="summary-title">{d.distrito}</p>
                    <p className="summary-sub">{d.talleres} taller/es · {d.alumnos} alumnos</p>
                  </div>
                  <span className={`state-chip ${d.pendientes ? "is-warn" : "is-ok"}`}>{d.pendientes ? `${d.pendientes} pendientes` : "Al dia"}</span>
                </div>
                <MiniBar label="Talleres" value={d.talleres} total={activos.length || 1} />
                <MiniBar label="Pendientes" value={d.pendientes} total={d.talleres || 1} variant={d.pendientes ? "warn" : "ok"} />
              </article>
            ))}
            {!distritos.length ? <p className="text-muted mb-0">No hay talleres activos.</p> : null}
          </div>
        </Card.Body>
      </Card>
    </Stack>
  );
}
