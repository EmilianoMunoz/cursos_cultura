import React from "react";
import { Card, Col, Row, Stack } from "react-bootstrap";
import { diasTexto, edad, normalizarEstado } from "../utils/formatters.js";

export function StudentProfile({ alumno, data }) {
  const inscripciones = data.inscripciones.filter((i) => i.alumnoId === alumno.id && i.estado === "Activo");
  return (
    <Row className="g-3">
      <Col md={5}>
        <Card><Card.Body><h3>Datos</h3><p>DNI: <strong>{alumno.dni}</strong></p><p>Edad: <strong>{edad(alumno.fechaNacimiento)}</strong></p><p>Telefono: <strong>{alumno.telefono}</strong></p><p>Email: <strong>{alumno.email}</strong></p></Card.Body></Card>
      </Col>
      <Col md={7}>
        <Card><Card.Body><h3>Talleres activos</h3><Stack gap={2}>{inscripciones.map((ins) => { const taller = data.talleres.find((t) => t.id === ins.tallerId); const regs = data.asistencias.filter((a) => a.alumnoId === alumno.id && a.tallerId === ins.tallerId); const presentes = regs.filter((r) => normalizarEstado(r.estadoAsistencia) === "Presente").length; return <div className="workshop-line" key={ins.tallerId}><strong>{taller?.nombre}</strong><small>{taller ? diasTexto(taller) : "-"} · {presentes}/{regs.length || 0} presentes</small></div>; })}</Stack></Card.Body></Card>
      </Col>
    </Row>
  );
}
