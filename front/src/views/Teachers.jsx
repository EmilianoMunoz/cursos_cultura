import React, { useState } from "react";
import { Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";

const emptyForm = { nombre: "", apellido: "", telefono: "", tallerId: "" };

export function Teachers({ data, setData, pushHistory }) {
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const teacherWorkshops = (docenteId) => data.talleres.filter((t) => t.docenteId === docenteId);

  const submit = (event) => {
    event.preventDefault();
    if (!form.nombre || !form.apellido || !form.telefono) return;
    const nuevo = { id: Date.now(), nombre: form.nombre, apellido: form.apellido, telefono: form.telefono };
    const tallerAsignado = data.talleres.find((t) => t.id === Number(form.tallerId));
    setData((prev) => ({
      ...prev,
      docentes: [...prev.docentes, nuevo],
      talleres: form.tallerId ? prev.talleres.map((t) => t.id === Number(form.tallerId) ? { ...t, docenteId: nuevo.id } : t) : prev.talleres
    }));
    pushHistory("Docente", "CREATE", null, { ...nuevo, tallerAsignado: tallerAsignado?.nombre || "" });
    setForm(emptyForm);
  };

  const openProfile = (docente) => {
    setSelected(docente);
    setEditForm({ nombre: docente.nombre, apellido: docente.apellido, telefono: docente.telefono, tallerId: "" });
  };

  const saveTeacher = () => {
    if (!selected || !editForm.nombre || !editForm.apellido || !editForm.telefono) return;
    const updated = { ...selected, nombre: editForm.nombre, apellido: editForm.apellido, telefono: editForm.telefono };
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
  };

  return (
    <>
      <Card><Card.Body>
        <h2>Docentes</h2>
        <Form onSubmit={submit} className="toolbar-form">
          <Form.Control placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Form.Control placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          <Form.Control placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Form.Select value={form.tallerId} onChange={(e) => setForm({ ...form, tallerId: e.target.value })}>
            <option value="">Sin taller</option>
            {data.talleres.filter((t) => !t.docenteId).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Form.Select>
          <Button variant="success" type="submit">Registrar</Button>
        </Form>
        <Table responsive hover>
          <thead><tr><th>Nombre</th><th>Telefono</th><th>Talleres</th><th></th></tr></thead>
          <tbody>{data.docentes.map((d) => <tr key={d.id}><td>{d.nombre} {d.apellido}</td><td>{d.telefono}</td><td>{teacherWorkshops(d.id).map((t) => t.nombre).join(", ") || "-"}</td><td className="text-end"><button type="button" className="table-action is-info" onClick={() => openProfile(d)}>Ver ficha</button></td></tr>)}</tbody>
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
                  <p>Telefono: <strong>{selected.telefono}</strong></p>
                  <p>Talleres: <strong>{teacherWorkshops(selected.id).length}</strong></p>
                  <div className="modal-actions justify-content-start">
                    <Button variant="danger" onClick={deleteTeacher}>Eliminar docente</Button>
                  </div>
                </Card.Body></Card>
              </Col>
              <Col md={7}>
                <Card><Card.Body>
                  <h3>Editar</h3>
                  <Form className="d-grid gap-2">
                    <Form.Control placeholder="Nombre" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
                    <Form.Control placeholder="Apellido" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} />
                    <Form.Control placeholder="Telefono" value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
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
    </>
  );
}
