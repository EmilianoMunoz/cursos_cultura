import React, { useState } from "react";
import { Alert, Button, Card, Form, Stack, Table } from "react-bootstrap";
import { EmptyState } from "../components/common.jsx";
import { today } from "../utils/constants.js";
import { edad } from "../utils/formatters.js";

const emptyForm = { nombre: "", apellido: "", dni: "", telefono: "", email: "", fechaNacimiento: "", sexo: "X", tallerInicialId: "" };

export function Students({ data, visibleAlumnos, visibleTalleres, query, setQuery, setData, pushHistory, openStudent }) {
  const [tallerFilter, setTallerFilter] = useState("todos");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const filtered = visibleAlumnos.filter((a) => {
    const talleresAlumno = data.inscripciones
      .filter((i) => i.alumnoId === a.id && i.estado === "Activo")
      .map((i) => data.talleres.find((t) => t.id === i.tallerId)?.nombre || "");
    const matchesQuery = `${a.nombre} ${a.apellido} ${a.dni} ${a.email} ${a.telefono} ${talleresAlumno.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesTaller = tallerFilter === "todos" || data.inscripciones.some((i) => i.alumnoId === a.id && i.estado === "Activo" && String(i.tallerId) === tallerFilter);
    return matchesQuery && matchesTaller;
  });

  const submit = (event) => {
    event.preventDefault();
    const clean = {
      ...form,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      dni: form.dni.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim()
    };
    if (!clean.nombre || !clean.apellido || !clean.dni) {
      setError("Completa nombre, apellido y DNI.");
      return;
    }
    if (data.alumnos.some((a) => a.dni === clean.dni)) {
      setError("Ya existe un alumno con ese DNI.");
      return;
    }
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
      setError("Revisa el formato del email.");
      return;
    }
    if (clean.telefono && clean.telefono.length < 8) {
      setError("El telefono parece demasiado corto.");
      return;
    }
    const nuevo = { ...clean, id: Date.now() };
    const ins = clean.tallerInicialId ? { alumnoId: nuevo.id, tallerId: Number(clean.tallerInicialId), fechaInscripcion: today, estado: "Activo", fechaBaja: null, motivoBaja: null } : null;
    setData((prev) => ({ ...prev, alumnos: [...prev.alumnos, nuevo], inscripciones: ins ? [...prev.inscripciones, ins] : prev.inscripciones }));
    pushHistory("Alumno", "CREATE", null, nuevo);
    setForm(emptyForm);
    setError("");
  };

  return (
    <Stack gap={3}>
      <Card><Card.Body>
        <h2>Registro de alumno</h2>
        {error ? <Alert variant="danger" className="py-2">{error}</Alert> : null}
        <Form onSubmit={submit} className="toolbar-form">
          <Form.Control placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Form.Control placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          <Form.Control placeholder="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
          <Form.Control placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Form.Control placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Form.Control type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
          <Form.Select value={form.tallerInicialId} onChange={(e) => setForm({ ...form, tallerInicialId: e.target.value })}>
            <option value="">Sin taller inicial</option>
            {visibleTalleres.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Form.Select>
          <Button variant="success" type="submit">Registrar</Button>
        </Form>
      </Card.Body></Card>
      <Card><Card.Body>
        <div className="section-head">
          <h2>Alumnos</h2>
          <div className="student-filters">
            <Form.Select value={tallerFilter} onChange={(e) => setTallerFilter(e.target.value)}>
              <option value="todos">Todos los talleres</option>
              {visibleTalleres.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </Form.Select>
            <Form.Control placeholder="Buscar alumno, DNI, telefono o taller" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <Table responsive hover>
          <thead><tr><th>Alumno</th><th>DNI</th><th>Email</th><th>Talleres</th><th></th></tr></thead>
          <tbody>
            {filtered.map((a) => <tr key={a.id}><td><strong>{a.nombre} {a.apellido}</strong><div className="text-muted small">{edad(a.fechaNacimiento)} años</div></td><td>{a.dni}</td><td>{a.email}</td><td>{data.inscripciones.filter((i) => i.alumnoId === a.id && i.estado === "Activo").map((i) => data.talleres.find((t) => t.id === i.tallerId)?.nombre).join(", ") || "-"}</td><td className="text-end"><Button size="sm" variant="outline-primary" onClick={() => openStudent(a)}>Ficha</Button></td></tr>)}
            {!filtered.length ? <tr><td colSpan={5}><EmptyState title="Sin alumnos" text="No hay alumnos para ese taller o busqueda." /></td></tr> : null}
          </tbody>
        </Table>
      </Card.Body></Card>
    </Stack>
  );
}
