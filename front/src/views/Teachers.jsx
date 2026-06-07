import React, { useState } from "react";
import { Alert, Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { CuentaAccesoBadge, EmptyState } from "../components/common.jsx";

const emptyForm = { nombre: "", apellido: "", telefono: "", email: "", tallerId: "" };
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Teachers({ data, setData, pushHistory }) {
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const teacherWorkshops = (docenteId) => data.talleres.filter((t) => t.docenteId === docenteId);

  const validate = (payload, excludeId = null) => {
    if (!payload.nombre.trim() || !payload.apellido.trim() || !payload.telefono.trim() || !payload.email.trim()) {
      return "Completa nombre, apellido, telefono y email.";
    }
    if (payload.telefono.trim().length < 8) return "El telefono parece demasiado corto.";
    const email = payload.email.trim().toLowerCase();
    if (!emailRegex.test(email)) return "Revisa el formato del email.";
    const duplicado = data.docentes.some((d) => d.email?.toLowerCase() === email && d.id !== excludeId);
    if (duplicado) return "Ya existe un docente con ese email.";
    return "";
  };

  const submit = (event) => {
    event.preventDefault();
    const validation = validate(form);
    if (validation) {
      setError(validation);
      return;
    }
    const nuevo = {
      id: Date.now(),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim().toLowerCase()
    };
    const tallerAsignado = data.talleres.find((t) => t.id === Number(form.tallerId));
    setData((prev) => ({
      ...prev,
      docentes: [...prev.docentes, nuevo],
      talleres: form.tallerId ? prev.talleres.map((t) => t.id === Number(form.tallerId) ? { ...t, docenteId: nuevo.id } : t) : prev.talleres
    }));
    pushHistory("Docente", "CREATE", null, { ...nuevo, tallerAsignado: tallerAsignado?.nombre || "" });
    setForm(emptyForm);
    setError("");
  };

  const openProfile = (docente) => {
    setSelected(docente);
    setEditForm({
      nombre: docente.nombre,
      apellido: docente.apellido,
      telefono: docente.telefono,
      email: docente.email || "",
      tallerId: ""
    });
    setConfirmDelete(false);
    setError("");
  };

  const saveTeacher = () => {
    if (!selected) return;
    const validation = validate(editForm, selected.id);
    if (validation) {
      setError(validation);
      return;
    }
    const updated = {
      ...selected,
      nombre: editForm.nombre.trim(),
      apellido: editForm.apellido.trim(),
      telefono: editForm.telefono.trim(),
      email: editForm.email.trim().toLowerCase()
    };
    const tallerAsignado = data.talleres.find((t) => t.id === Number(editForm.tallerId));
    setData((prev) => ({
      ...prev,
      docentes: prev.docentes.map((d) => d.id === selected.id ? updated : d),
      talleres: editForm.tallerId
        ? prev.talleres.map((t) => t.id === Number(editForm.tallerId) ? { ...t, docenteId: selected.id } : t)
        : prev.talleres
    }));
    pushHistory("Docente", "UPDATE", selected, { ...updated, tallerAsignado: tallerAsignado?.nombre || "" });
    setSelected(updated);
    setError("");
  };

  const deleteTeacher = () => {
    if (!selected) return;
    setData((prev) => ({
      ...prev,
      docentes: prev.docentes.filter((d) => d.id !== selected.id),
      talleres: prev.talleres.map((t) => t.docenteId === selected.id ? { ...t, docenteId: null } : t)
    }));
    pushHistory("Docente", "DELETE", selected, null);
    setSelected(null);
    setConfirmDelete(false);
  };

  return (
    <>
      <Card><Card.Body>
        <h2>Docentes</h2>
        {error && !selected ? <Alert variant="danger" className="py-2">{error}</Alert> : null}
        <Form onSubmit={submit} className="toolbar-form">
          <Form.Control placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Form.Control placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          <Form.Control placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Form.Control type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Form.Select value={form.tallerId} onChange={(e) => setForm({ ...form, tallerId: e.target.value })}>
            <option value="">Sin taller</option>
            {data.talleres.filter((t) => !t.docenteId).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Form.Select>
          <Button variant="success" type="submit">Registrar</Button>
        </Form>
        <Table responsive hover>
          <thead><tr><th>Nombre</th><th>Email</th><th>Acceso</th><th>Telefono</th><th>Talleres</th><th></th></tr></thead>
          <tbody>
            {data.docentes.map((d) => (
              <tr key={d.id}>
                <td>{d.nombre} {d.apellido}</td>
                <td>{d.email || "-"}</td>
                <td><CuentaAccesoBadge data={data} email={d.email} /></td>
                <td>{d.telefono}</td>
                <td>{teacherWorkshops(d.id).map((t) => t.nombre).join(", ") || "-"}</td>
                <td className="text-end"><button type="button" className="table-action is-info" onClick={() => openProfile(d)}>Ver ficha</button></td>
              </tr>
            ))}
            {!data.docentes.length ? <tr><td colSpan={6}><EmptyState title="Sin docentes" text="Registra el primer docente para asignarlo a un taller." /></td></tr> : null}
          </tbody>
        </Table>
      </Card.Body></Card>

      <Modal show={Boolean(selected)} onHide={() => setSelected(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>{selected ? `${selected.nombre} ${selected.apellido}` : "Docente"}</Modal.Title></Modal.Header>
        <Modal.Body>
          {selected ? (
            <Row className="g-3">
              <Col md={5}>
                <Card><Card.Body>
                  <h3>Ficha</h3>
                  <p>Email: <strong>{selected.email || "-"}</strong></p>
                  <p>Acceso al sistema: <CuentaAccesoBadge data={data} email={selected.email} /></p>
                  <p>Telefono: <strong>{selected.telefono}</strong></p>
                  <p>Talleres: <strong>{teacherWorkshops(selected.id).length}</strong></p>
                  <div className="modal-actions justify-content-start">
                    <Button variant="danger" onClick={() => setConfirmDelete(true)}>Eliminar docente</Button>
                  </div>
                </Card.Body></Card>
              </Col>
              <Col md={7}>
                <Card><Card.Body>
                  <h3>Editar</h3>
                  {error ? <Alert variant="danger" className="py-2">{error}</Alert> : null}
                  <Form className="d-grid gap-2">
                    <Form.Control placeholder="Nombre" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
                    <Form.Control placeholder="Apellido" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} />
                    <Form.Control placeholder="Telefono" value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
                    <Form.Control type="email" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    <Form.Select value={editForm.tallerId} onChange={(e) => setEditForm({ ...editForm, tallerId: e.target.value })}>
                      <option value="">No asignar nuevo taller</option>
                      {data.talleres.filter((t) => !t.docenteId).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </Form.Select>
                    <Button variant="success" type="button" onClick={saveTeacher}>Guardar cambios</Button>
                  </Form>
                </Card.Body></Card>
              </Col>
            </Row>
          ) : null}
        </Modal.Body>
      </Modal>

      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
        <Modal.Header closeButton><Modal.Title>Eliminar docente</Modal.Title></Modal.Header>
        <Modal.Body>El docente quedara eliminado y sus talleres pasaran a estar sin docente asignado.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
          <Button variant="danger" onClick={deleteTeacher}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
