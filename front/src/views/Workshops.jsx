import React from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { HorarioChips, MiniBar, StatusBadges } from "../components/common.jsx";
import { normalizarEstado } from "../utils/formatters.js";

export function Workshops({ data, talleres, selectedDate, setSelectedDate, query, setQuery, docenteName }) {
  const filtered = talleres.filter((t) => t.estado === "Activo" && `${t.nombre} ${t.tipo} ${t.distrito} ${docenteName(t.docenteId)}`.toLowerCase().includes(query.toLowerCase()));
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
      })}</Row>
    </Card.Body></Card>
  );
}
