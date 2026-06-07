import React, { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { DIAS_TALLER, DISTRITOS_SAN_RAFAEL } from "../data/demoData.js";

const MAX_SLOTS_PER_DAY = 3;

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildHorariosPorDia(initial) {
  return DIAS_TALLER.reduce((acc, dia) => {
    const slots = (initial?.horarios || [])
      .filter((h) => h.dia === dia)
      .map((h, index) => ({
        id: `${dia}-${slugify(h.inicio)}-${slugify(h.fin)}-${index}`,
        inicio: h.inicio || "",
        fin: h.fin || ""
      }));
    acc[dia] = slots;
    return acc;
  }, {});
}

export function WorkshopForm({ initial, docentes, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    nombre: initial?.nombre || "",
    tipo: initial?.tipo || "",
    direccion: initial?.direccion || "",
    distrito: initial?.distrito || "Ciudad",
    docenteId: initial?.docenteId || "",
    estado: initial?.estado || "Activo",
    horariosPorDia: buildHorariosPorDia(initial)
  }));
  const [error, setError] = useState("");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addSlot = (dia) => {
    setForm((prev) => {
      const slots = prev.horariosPorDia[dia] || [];
      if (slots.length >= MAX_SLOTS_PER_DAY) return prev;
      return {
        ...prev,
        horariosPorDia: {
          ...prev.horariosPorDia,
          [dia]: [...slots, { id: `${dia}-${Date.now()}`, inicio: "", fin: "" }]
        }
      };
    });
  };

  const removeSlot = (dia, slotId) => {
    setForm((prev) => ({
      ...prev,
      horariosPorDia: {
        ...prev.horariosPorDia,
        [dia]: prev.horariosPorDia[dia].filter((slot) => slot.id !== slotId)
      }
    }));
  };

  const updateSlot = (dia, slotId, patch) => {
    setForm((prev) => ({
      ...prev,
      horariosPorDia: {
        ...prev.horariosPorDia,
        [dia]: prev.horariosPorDia[dia].map((slot) => slot.id === slotId ? { ...slot, ...patch } : slot)
      }
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    const horarios = DIAS_TALLER.flatMap((dia) =>
      (form.horariosPorDia[dia] || []).map((slot) => ({ dia, inicio: slot.inicio, fin: slot.fin }))
    );

    if (!form.nombre.trim() || !form.tipo.trim() || !form.direccion.trim() || !form.distrito) {
      setError("Completa nombre, tipo, direccion y distrito.");
      return;
    }
    if (!horarios.length) {
      setError("Agrega al menos un horario.");
      return;
    }

    const exceso = DIAS_TALLER.find((dia) => (form.horariosPorDia[dia] || []).length > MAX_SLOTS_PER_DAY);
    if (exceso) {
      setError(`Cada dia admite hasta ${MAX_SLOTS_PER_DAY} horarios. Revisa ${exceso}.`);
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
      dias: [...new Set(horarios.map((h) => h.dia))],
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
      <details className="agenda-details mt-3" open>
        <summary><span>Dias y horarios</span><small>Hasta {MAX_SLOTS_PER_DAY} turnos por dia</small></summary>
        <div className="agenda-grid">
          {DIAS_TALLER.map((dia) => {
            const slots = form.horariosPorDia[dia] || [];
            return (
              <div className="agenda-day" key={dia}>
                <div className="agenda-day-head">
                  <strong>{dia}</strong>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline-primary"
                    disabled={slots.length >= MAX_SLOTS_PER_DAY}
                    onClick={() => addSlot(dia)}
                  >
                    + Horario
                  </Button>
                </div>
                {!slots.length ? (
                  <p className="agenda-day-empty">Sin horarios para este dia.</p>
                ) : (
                  slots.map((slot, index) => (
                    <div className="agenda-slot" key={slot.id}>
                      <span className="agenda-slot-label">Turno {index + 1}</span>
                      <Form.Control
                        type="time"
                        value={slot.inicio}
                        onChange={(e) => updateSlot(dia, slot.id, { inicio: e.target.value })}
                      />
                      <Form.Control
                        type="time"
                        value={slot.fin}
                        onChange={(e) => updateSlot(dia, slot.id, { fin: e.target.value })}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        onClick={() => removeSlot(dia, slot.id)}
                      >
                        Quitar
                      </Button>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </details>
      <div className="modal-actions">
        <Button variant="outline-secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="success" type="submit">Guardar</Button>
      </div>
    </Form>
  );
}
