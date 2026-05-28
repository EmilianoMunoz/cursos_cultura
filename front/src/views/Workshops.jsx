import React from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { EmptyState, HorarioChips, MiniBar, StatusBadges } from "../components/common.jsx";
import { diasTexto, etiquetaEstado, normalizarEstado } from "../utils/formatters.js";

export function Workshops({ data, talleres, selectedDate, setSelectedDate, query, setQuery, docenteName, role, currentUser }) {
  const filtered = talleres.filter((t) => t.estado === "Activo" && `${t.nombre} ${t.tipo} ${t.distrito} ${docenteName(t.docenteId)}`.toLowerCase().includes(query.toLowerCase()));
  if (role === "Alumno") {
    const alumno = data.alumnos.find((a) => a.id === currentUser?.alumnoId);
    return (
      <Card className="workshops-panel"><Card.Body>
        <div className="section-head workshops-head">
          <div>
            <p className="eyebrow">Mis cursos</p>
            <h2>{alumno ? `${alumno.nombre} ${alumno.apellido}` : "Curso actual e historial"}</h2>
            <p className="text-muted mb-0">Consulta simple de cursada actual y asistencias registradas.</p>
          </div>
        </div>
        <Row className="g-3">{filtered.map((t) => {
          const registros = data.asistencias
            .filter((a) => a.tallerId === t.id && a.alumnoId === currentUser?.alumnoId)
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
          const presentes = registros.filter((a) => normalizarEstado(a.estadoAsistencia) === "Presente").length;
          return (
            <Col md={6} xl={4} key={t.id}>
              <Card className="h-100 workshop-card">
                <Card.Body>
                  <Card.Title>{t.nombre}</Card.Title>
                  <p className="text-muted small">{t.tipo} · {t.distrito}</p>
                  <HorarioChips taller={t} />
                  <p className="workshop-meta">{docenteName(t.docenteId)} <span>{diasTexto(t)}</span></p>
                  <p className="student-course-ratio"><strong>{presentes}</strong><span>/{registros.length || 0} presentes</span></p>
                  <MiniBar label="Presentes" value={presentes} total={registros.length || 1} variant="ok" />
                  <div className="attendance-history-list mt-3">
                    <div className="attendance-history-course">
                      <strong>Historial</strong>
                      {registros.slice(0, 10).map((reg) => <span key={`${reg.fecha}-${reg.estadoAsistencia}`}>{reg.fecha} · {etiquetaEstado(reg.estadoAsistencia)}</span>)}
                      {!registros.length ? <span>Sin registros cargados.</span> : null}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
        {!filtered.length ? <Col><EmptyState title="Sin cursos activos" text="No hay cursos activos asociados a este alumno." /></Col> : null}
        </Row>
      </Card.Body></Card>
    );
  }
  return (
    <Card className="workshops-panel"><Card.Body>
      <div className="section-head workshops-head">
        <div>
          <p className="eyebrow">Consulta</p>
          <h2>Talleres disponibles al dia de la fecha</h2>
        </div>
        <div className="workshops-filters">
          <Form.Group>
            <Form.Label>Fecha</Form.Label>
            <Form.Control type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <Form.Control placeholder="Nombre, docente o distrito" value={query} onChange={(e) => setQuery(e.target.value)} />
          </Form.Group>
        </div>
      </div>
      <Row className="g-3">{filtered.map((t) => {
        const inscriptos = data.inscripciones.filter((i) => i.tallerId === t.id && i.estado === "Activo").length;
        const registros = data.asistencias.filter((a) => a.tallerId === t.id && a.fecha === selectedDate);
        const presentes = registros.filter((a) => normalizarEstado(a.estadoAsistencia) === "Presente").length;
        const ausentes = registros.filter((a) => normalizarEstado(a.estadoAsistencia) === "Ausente").length;
        const cargada = inscriptos > 0 && registros.length >= inscriptos;
        return (
          <Col sm={6} xl={3} key={t.id}>
            <Card className="h-100 workshop-card workshop-card-compact">
              <Card.Body>
                <div className="workshop-card-head">
                  <div>
                    <Card.Title>{t.nombre}</Card.Title>
                    <p className="text-muted small mb-0">{t.tipo} · {t.distrito}</p>
                  </div>
                  <span className={`status-pill ${cargada ? "is-ok" : "is-pending"}`}>{cargada ? "Cargada" : "Pendiente"}</span>
                </div>
                <HorarioChips taller={t} />
                <StatusBadges taller={t} inscripciones={data.inscripciones} asistencias={data.asistencias} selectedDate={selectedDate} />
                <p className="workshop-meta">{docenteName(t.docenteId)} <span>{inscriptos} alumnos</span></p>
                <div className="mini-metrics">
                  <MiniBar label="Presentes" value={presentes} total={inscriptos || 1} variant="ok" />
                  <MiniBar label="Ausentes" value={ausentes} total={inscriptos || 1} variant="danger" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
      {!filtered.length ? <Col><EmptyState title="Sin talleres" text="No hay talleres activos para la busqueda seleccionada." /></Col> : null}
      </Row>
    </Card.Body></Card>
  );
}
