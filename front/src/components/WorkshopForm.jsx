import React, { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { DIAS_TALLER, DISTRITOS_SAN_RAFAEL } from "../data/demoData.js";

export function WorkshopForm({ initial, docentes, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    nombre: initial?.nombre || "",
    tipo: initial?.tipo || "",
    direccion: initial?.direccion || "",
    distrito: initial?.distrito || "Ciudad",
    docenteId: initial?.docenteId || "",
    estado: initial?.estado || "Activo",
    horarios: DIAS_TALLER.reduce((acc, dia) => {
      const actual = initial?.horarios?.find((h) => h.dia === dia);
      acc[dia] = { activo: Boolean(actual), inicio: actual?.inicio || "", fin: actual?.fin || "" };
      return acc;
    }, {})
  }));
  const [error, setError] = useState("");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateHorario = (dia, patch) => {
    setForm((prev) => ({ ...prev, horarios: { ...prev.horarios, [dia]: { ...prev.horarios[dia], ...patch } } }));
  };

  const submit = (event) => {
    event.preventDefault();
    const horarios = DIAS_TALLER
      .filter((dia) => form.horarios[dia].activo)
      .map((dia) => ({ dia, inicio: form.horarios[dia].inicio, fin: form.horarios[dia].fin }));
    if (!form.nombre.trim() || !form.tipo.trim() || !form.direccion.trim() || !form.distrito) {
      setError("Completa nombre, tipo, direccion y distrito.");
      return;
    }
    if (!horarios.length) {
      setError("Selecciona al menos un dia y horario.");
      return;
    }
    const invalido = horarios.find((h) => !h.inicio || !h.fin || h.inicio >= h.fin);
    if (invalido) {
      setError(`Revisa inicio y fin para ${invalido.dia}.`);
      return;
    }
    onSubmit({
      ...initial,
      nombre: form.nombre.trim(),
      tipo: form.tipo.trim(),
      direccion: form.direccion.trim(),
      distrito: form.distrito,
      docenteId: Number(form.docenteId) || null,
      estado: form.estado,
      dias: horarios.map((h) => h.dia),
      horarios
    });
  };

  return (
    <Form onSubmit={submit}>
      {error ? <Alert variant="danger" className="py-2">{error}</Alert> : null}
      <Row className="g-3">
        <Col md={6}><Form.Group><Form.Label>Nombre</Form.Label><Form.Control value={form.nombre} onChange={(e) => update("nombre", e.target.value)} /></Form.Group></Col>
        <Col md={6}><Form.Group><Form.Label>Tipo</Form.Label><Form.Control value={form.tipo} onChange={(e) => update("tipo", e.target.value)} /></Form.Group></Col>
        <Col md={6}><Form.Group><Form.Label>Direccion</Form.Label><Form.Control value={form.direccion} onChange={(e) => update("direccion", e.target.value)} /></Form.Group></Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Distrito</Form.Label>
            <Form.Select value={form.distrito} onChange={(e) => update("distrito", e.target.value)}>
              {DISTRITOS_SAN_RAFAEL.map((d) => <option key={d}>{d}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Docente</Form.Label>
            <Form.Select value={form.docenteId} onChange={(e) => update("docenteId", e.target.value)}>
              <option value="">Sin asignar</option>
              {docentes.map((d) => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Select value={form.estado} onChange={(e) => update("estado", e.target.value)}>
              {["Activo", "Pausado", "Finalizado"].map((e) => <option key={e}>{e}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <details className="agenda-details mt-3">
        <summary><span>Dias y horarios</span><small>Configurar agenda del taller</small></summary>
        <div className="agenda-grid">
          {DIAS_TALLER.map((dia) => (
            <div className="agenda-row" key={dia}>
              <Form.Check type="checkbox" label={dia} checked={form.horarios[dia].activo} onChange={(e) => updateHorario(dia, { activo: e.target.checked })} />
              <Form.Control type="time" value={form.horarios[dia].inicio} onChange={(e) => updateHorario(dia, { inicio: e.target.value })} disabled={!form.horarios[dia].activo} />
              <Form.Control type="time" value={form.horarios[dia].fin} onChange={(e) => updateHorario(dia, { fin: e.target.value })} disabled={!form.horarios[dia].activo} />
            </div>
          ))}
        </div>
      </details>
      <div className="modal-actions">
        <Button variant="outline-secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="success" type="submit">Guardar</Button>
      </div>
    </Form>
  );
}
