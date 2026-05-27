import React, { useState } from "react";
import { Button, Card, Form, Stack, Table } from "react-bootstrap";
import { today } from "../utils/constants.js";
import { edad } from "../utils/formatters.js";

export function Students({ data, visibleAlumnos, visibleTalleres, query, setQuery, setData, pushHistory, openStudent }) {
  const filtered = visibleAlumnos.filter((a) => `${a.nombre} ${a.apellido} ${a.dni} ${a.email}`.toLowerCase().includes(query.toLowerCase()));
  const [form, setForm] = useState({ nombre: "", apellido: "", dni: "", telefono: "", email: "", fechaNacimiento: "", sexo: "X", tallerInicialId: "" });
  const submit = (event) => {
    event.preventDefault();
    if (!form.nombre || !form.apellido || !form.dni) return;
    const nuevo = { ...form, id: Date.now() };
    const ins = form.tallerInicialId ? { alumnoId: nuevo.id, tallerId: Number(form.tallerInicialId), fechaInscripcion: today, estado: "Activo", fechaBaja: null, motivoBaja: null } : null;
    setData((prev) => ({ ...prev, alumnos: [...prev.alumnos, nuevo], inscripciones: ins ? [...prev.inscripciones, ins] : prev.inscripciones }));
    pushHistory("Alumno", "CREATE", null, nuevo);
    setForm({ nombre: "", apellido: "", dni: "", telefono: "", email: "", fechaNacimiento: "", sexo: "X", tallerInicialId: "" });
  };
  return <Stack gap={3}><Card><Card.Body><h2>Registro de alumno</h2><Form onSubmit={submit} className="toolbar-form"><Form.Control placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /><Form.Control placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} /><Form.Control placeholder="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} /><Form.Control placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /><Form.Control placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Form.Control type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} /><Form.Select value={form.tallerInicialId} onChange={(e) => setForm({ ...form, tallerInicialId: e.target.value })}><option value="">Sin taller inicial</option>{visibleTalleres.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</Form.Select><Button variant="success" type="submit">Registrar</Button></Form></Card.Body></Card><Card><Card.Body><div className="section-head"><h2>Alumnos</h2><Form.Control className="w-auto" placeholder="Buscar alumno" value={query} onChange={(e) => setQuery(e.target.value)} /></div><Table responsive hover><thead><tr><th>Alumno</th><th>DNI</th><th>Email</th><th>Talleres</th><th></th></tr></thead><tbody>{filtered.map((a) => <tr key={a.id}><td><strong>{a.nombre} {a.apellido}</strong><div className="text-muted small">{edad(a.fechaNacimiento)} años</div></td><td>{a.dni}</td><td>{a.email}</td><td>{data.inscripciones.filter((i) => i.alumnoId === a.id && i.estado === "Activo").map((i) => data.talleres.find((t) => t.id === i.tallerId)?.nombre).join(", ") || "-"}</td><td className="text-end"><Button size="sm" variant="outline-primary" onClick={() => openStudent(a)}>Ficha</Button></td></tr>)}</tbody></Table></Card.Body></Card></Stack>;
}
