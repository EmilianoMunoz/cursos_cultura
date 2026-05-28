import React, { useState } from "react";
import { Button, Card, Col, Form, Row, Stack } from "react-bootstrap";
import { diasTexto, edad, etiquetaEstado, normalizarEstado } from "../utils/formatters.js";

const formFromStudent = (alumno) => ({
  nombre: alumno.nombre || "",
  apellido: alumno.apellido || "",
  dni: alumno.dni || "",
  telefono: alumno.telefono || "",
  email: alumno.email || "",
  direccion: alumno.direccion || "",
  fechaNacimiento: alumno.fechaNacimiento || "",
  sexo: alumno.sexo || "X"
});

export function StudentProfile({ alumno, data, onSave, canEdit = true }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(formFromStudent(alumno));
  const [error, setError] = useState("");
  const inscripciones = data.inscripciones.filter((i) => i.alumnoId === alumno.id && i.estado === "Activo");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = (event) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim() || !form.dni.trim()) {
      setError("Completa nombre, apellido y DNI.");
      return;
    }
    if (data.alumnos.some((a) => a.id !== alumno.id && a.dni === form.dni.trim())) {
      setError("Ya existe otro alumno con ese DNI.");
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Revisa el formato del email.");
      return;
    }
    if (form.telefono.trim() && form.telefono.trim().length < 8) {
      setError("El telefono parece demasiado corto.");
      return;
    }
    const updated = {
      ...alumno,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      dni: form.dni.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      direccion: form.direccion.trim(),
      fechaNacimiento: form.fechaNacimiento,
      sexo: form.sexo
    };
    onSave(updated);
    setError("");
    setEditing(false);
  };

  return (
    <Row className="g-3">
      <Col md={5}>
        <Card><Card.Body>
          <div className="section-head compact">
            <h3>Datos</h3>
            {!editing && canEdit ? <Button size="sm" variant="outline-primary" onClick={() => setEditing(true)}>Editar</Button> : null}
          </div>
          {editing ? (
            <Form className="student-edit-form" onSubmit={save}>
              {error ? <div className="form-error">{error}</div> : null}
              <Form.Control placeholder="Nombre" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} />
              <Form.Control placeholder="Apellido" value={form.apellido} onChange={(e) => update("apellido", e.target.value)} />
              <Form.Control placeholder="DNI" value={form.dni} onChange={(e) => update("dni", e.target.value)} />
              <Form.Control placeholder="Telefono" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
              <Form.Control placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              <Form.Control placeholder="Direccion" value={form.direccion} onChange={(e) => update("direccion", e.target.value)} />
              <Form.Control type="date" value={form.fechaNacimiento} onChange={(e) => update("fechaNacimiento", e.target.value)} />
              <Form.Select value={form.sexo} onChange={(e) => update("sexo", e.target.value)}>
                <option value="X">Sin especificar</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </Form.Select>
              <div className="modal-actions">
                <Button variant="outline-secondary" type="button" onClick={() => { setForm(formFromStudent(alumno)); setError(""); setEditing(false); }}>Cancelar</Button>
                <Button variant="success" type="submit">Guardar cambios</Button>
              </div>
            </Form>
          ) : (
            <>
              <p>DNI: <strong>{alumno.dni}</strong></p>
              <p>Edad: <strong>{edad(alumno.fechaNacimiento)}</strong></p>
              <p>Telefono: <strong>{alumno.telefono || "-"}</strong></p>
              <p>Email: <strong>{alumno.email || "-"}</strong></p>
              <p>Direccion: <strong>{alumno.direccion || "-"}</strong></p>
            </>
          )}
        </Card.Body></Card>
      </Col>
      <Col md={7}>
        <Card><Card.Body>
          <h3>Talleres activos</h3>
          <Stack gap={2}>
            {inscripciones.map((ins) => {
              const taller = data.talleres.find((t) => t.id === ins.tallerId);
              const regs = data.asistencias.filter((a) => a.alumnoId === alumno.id && a.tallerId === ins.tallerId);
              const presentes = regs.filter((r) => normalizarEstado(r.estadoAsistencia) === "Presente").length;
              return (
                <div className="workshop-line" key={ins.tallerId}>
                  <strong>{taller?.nombre}</strong>
                  <small>{taller ? diasTexto(taller) : "-"} · {presentes}/{regs.length || 0} presentes</small>
                </div>
              );
            })}
            {!inscripciones.length ? <p className="text-muted mb-0">Sin talleres activos.</p> : null}
          </Stack>
        </Card.Body></Card>
        <Card className="mt-3"><Card.Body>
          <h3>Historial de asistencia</h3>
          <div className="attendance-history-list">
            {inscripciones.map((ins) => {
              const taller = data.talleres.find((t) => t.id === ins.tallerId);
              const regs = data.asistencias
                .filter((a) => a.alumnoId === alumno.id && a.tallerId === ins.tallerId)
                .sort((a, b) => b.fecha.localeCompare(a.fecha));
              return (
                <div className="attendance-history-course" key={`hist-${ins.tallerId}`}>
                  <strong>{taller?.nombre || "Taller"}</strong>
                  {regs.slice(0, 8).map((reg) => <span key={`${reg.fecha}-${reg.estadoAsistencia}`}>{reg.fecha} · {etiquetaEstado(reg.estadoAsistencia)}</span>)}
                  {!regs.length ? <span>Sin registros cargados.</span> : null}
                </div>
              );
            })}
            {!inscripciones.length ? <p className="text-muted mb-0">Sin historial disponible.</p> : null}
          </div>
        </Card.Body></Card>
      </Col>
    </Row>
  );
}
