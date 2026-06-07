import React, { useMemo, useState } from "react";
import { Alert, Button, Card, Form, Table } from "react-bootstrap";
import { EmptyState } from "../components/common.jsx";
import { normalizeEmail } from "../utils/auth.js";

const emptyForm = { nombre: "", email: "" };
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function adminEstado(admin) {
  if (admin.estadoCuenta === "Pendiente") return "Pendiente";
  return admin.activo === false ? "Inactivo" : "Activo";
}

function estadoClass(estado) {
  if (estado === "Activo") return "is-ok";
  if (estado === "Pendiente") return "is-warn";
  return "is-danger";
}

export function AdminUsers({ data, setData, pushHistory, currentUser }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const admins = useMemo(() => {
    const activos = (data.usuarios || [])
      .filter((u) => u.role === "Administrador")
      .map((u) => ({ ...u, estadoCuenta: "Activo", origen: "usuario" }));
    const pendientes = (data.usuariosPendientes || []).map((u) => ({
      ...u,
      estadoCuenta: "Pendiente",
      origen: "pendiente"
    }));
    return [...activos, ...pendientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [data.usuarios, data.usuariosPendientes]);

  const emailEnUso = (email, exclude = {}) => {
    const normalized = normalizeEmail(email);
    const enUsuarios = (data.usuarios || []).some((u) => normalizeEmail(u.email) === normalized && u.id !== exclude.usuarioId);
    const enPendientes = (data.usuariosPendientes || []).some((u) => normalizeEmail(u.email) === normalized && u.id !== exclude.pendienteId);
    const enDocentes = (data.docentes || []).some((d) => normalizeEmail(d.email) === normalized);
    const enAlumnos = (data.alumnos || []).some((a) => normalizeEmail(a.email) === normalized);
    return enUsuarios || enPendientes || enDocentes || enAlumnos;
  };

  const validate = (payload) => {
    if (!payload.nombre.trim() || !payload.email.trim()) return "Completa nombre y email.";
    const email = normalizeEmail(payload.email);
    if (!emailRegex.test(email)) return "Revisa el formato del email.";
    if (emailEnUso(email)) return "Ese email ya esta en uso en el sistema.";
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
      email: normalizeEmail(form.email),
      role: "Administrador",
      activo: true,
      puedeGestionarUsuarios: false
    };
    setData((prev) => ({
      ...prev,
      usuariosPendientes: [...prev.usuariosPendientes, nuevo]
    }));
    pushHistory("Administrador", "CREATE", null, { ...nuevo, estadoCuenta: "Pendiente" });
    setForm(emptyForm);
    setError("");
  };

  const toggleActivo = (admin) => {
    if (admin.origen !== "usuario") return;
    if (admin.id === currentUser.id) {
      setError("No podes desactivar tu propia cuenta.");
      return;
    }
    const siguiente = admin.activo === false;
    setData((prev) => ({
      ...prev,
      usuarios: prev.usuarios.map((u) => u.id === admin.id ? { ...u, activo: siguiente } : u)
    }));
    pushHistory("Administrador", "UPDATE", admin, { ...admin, activo: siguiente });
    setError("");
  };

  const quitarPendiente = (admin) => {
    setData((prev) => ({
      ...prev,
      usuariosPendientes: prev.usuariosPendientes.filter((u) => u.id !== admin.id)
    }));
    pushHistory("Administrador", "DELETE", admin, null);
    setError("");
  };

  return (
    <Card><Card.Body>
      <div className="section-head">
        <div>
          <p className="eyebrow">Solo admin general</p>
          <h2>Usuarios del sistema</h2>
        </div>
      </div>
      <p className="text-muted mb-3">
        Crea cuentas de administrador común. La persona completa su acceso en Registrarse con el email que cargues acá.
      </p>
      {error ? <Alert variant="danger" className="py-2">{error}</Alert> : null}
      <Form onSubmit={submit} className="toolbar-form mb-3">
        <Form.Control placeholder="Nombre y apellido" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <Form.Control type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Button variant="success" type="submit">Crear administrador</Button>
      </Form>
      <Table responsive hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => {
            const estado = adminEstado(admin);
            const esGeneral = Boolean(admin.puedeGestionarUsuarios);
            return (
              <tr key={`${admin.origen}-${admin.id}`}>
                <td><strong>{admin.nombre}</strong></td>
                <td>{admin.email}</td>
                <td>{esGeneral ? "Admin general" : "Admin común"}</td>
                <td><span className={`state-chip ${estadoClass(estado)}`}>{estado}</span></td>
                <td className="text-end">
                  {admin.origen === "usuario" && !esGeneral ? (
                    <button
                      type="button"
                      className={`table-action ${admin.activo === false ? "is-info" : "is-warn"}`}
                      onClick={() => toggleActivo(admin)}
                      disabled={admin.id === currentUser.id}
                    >
                      {admin.activo === false ? "Activar" : "Desactivar"}
                    </button>
                  ) : null}
                  {admin.origen === "pendiente" ? (
                    <button type="button" className="table-action is-danger" onClick={() => quitarPendiente(admin)}>Quitar</button>
                  ) : null}
                  {esGeneral ? <span className="text-muted small">Referente</span> : null}
                </td>
              </tr>
            );
          })}
          {!admins.length ? (
            <tr><td colSpan={5}><EmptyState title="Sin administradores" text="Crea el primer administrador común para el equipo." /></td></tr>
          ) : null}
        </tbody>
      </Table>
    </Card.Body></Card>
  );
}
