import React, { useMemo, useState } from "react";
import { Button, ButtonGroup, Card, Form, Modal, Stack, Table } from "react-bootstrap";
import { EmptyState } from "../components/common.jsx";
import { today } from "../utils/constants.js";

const estados = ["Pendiente", "Contactada"];

function estadoClass(estado) {
  if (estado === "Aceptada") return "is-ok";
  if (estado === "Rechazada") return "is-danger";
  if (estado === "Contactada") return "is-info";
  return "is-warn";
}

function fechaHora(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

function splitNombreCompleto(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { nombre: parts[0] || "Sin nombre", apellido: "" };
  return { nombre: parts[0], apellido: parts.slice(1).join(" ") };
}

export function EnrollmentRequests({ data, setData, pushHistory, visibleTalleres, role }) {
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("todos");
  const [distrito, setDistrito] = useState("todos");
  const [confirmAction, setConfirmAction] = useState(null);

  const canManageRequests = role === "Administrador" || role === "Docente";
  const visibleTallerIds = useMemo(() => new Set((visibleTalleres || data.talleres).map((t) => t.id)), [visibleTalleres, data.talleres]);
  const solicitudes = (data.solicitudesInscripcion || []).filter((s) => visibleTallerIds.has(s.tallerId));
  const distritos = useMemo(() => {
    const values = solicitudes.map((s) => data.talleres.find((t) => t.id === s.tallerId)?.distrito).filter(Boolean);
    return [...new Set(values)].sort();
  }, [solicitudes, data.talleres]);

  const filtered = solicitudes.filter((solicitud) => {
    const taller = data.talleres.find((t) => t.id === solicitud.tallerId);
    const text = `${solicitud.nombre} ${solicitud.dni} ${solicitud.telefono} ${solicitud.email || ""} ${solicitud.tallerNombre} ${taller?.distrito || ""}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesEstado = estado === "todos" || solicitud.estado === estado;
    const matchesDistrito = distrito === "todos" || taller?.distrito === distrito;
    return matchesQuery && matchesEstado && matchesDistrito;
  });

  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente").length;
  const cambiarEstado = (solicitud, nextEstado) => {
    if (!canManageRequests) return;
    if (solicitud.estado === nextEstado) return;
    const updated = { ...solicitud, estado: nextEstado, actualizadoEn: new Date().toISOString() };
    setData((prev) => ({
      ...prev,
      solicitudesInscripcion: (prev.solicitudesInscripcion || []).map((s) => (s.id === solicitud.id ? updated : s))
    }));
    pushHistory("SolicitudInscripcion", "UPDATE", solicitud, updated);
  };

  const aceptarSolicitud = (solicitud) => {
    if (!canManageRequests) return;
    const taller = data.talleres.find((t) => t.id === solicitud.tallerId);
    const existente = data.alumnos.find((a) => a.dni === solicitud.dni);
    const nombrePartes = splitNombreCompleto(solicitud.nombre);
    const alumno = existente || {
      id: Date.now(),
      ...nombrePartes,
      dni: solicitud.dni,
      telefono: solicitud.telefono,
      email: solicitud.email || "",
      fechaNacimiento: "",
      sexo: "X"
    };
    const yaInscripto = data.inscripciones.some((i) => i.alumnoId === alumno.id && i.tallerId === solicitud.tallerId && i.estado === "Activo");
    const inscripcion = yaInscripto ? null : {
      alumnoId: alumno.id,
      tallerId: solicitud.tallerId,
      fechaInscripcion: today,
      estado: "Activo",
      fechaBaja: null,
      motivoBaja: null
    };
    const solicitudAceptada = { ...solicitud, estado: "Aceptada", actualizadoEn: new Date().toISOString() };

    setData((prev) => ({
      ...prev,
      alumnos: existente ? prev.alumnos : [...prev.alumnos, alumno],
      inscripciones: inscripcion ? [...prev.inscripciones, inscripcion] : prev.inscripciones,
      solicitudesInscripcion: (prev.solicitudesInscripcion || []).filter((s) => s.id !== solicitud.id)
    }));
    pushHistory("SolicitudInscripcion", "UPDATE", solicitud, solicitudAceptada);
    if (!existente) pushHistory("Alumno", "CREATE", null, alumno);
    if (inscripcion) pushHistory("Inscripcion", "CREATE", null, { ...inscripcion, tallerNombre: taller?.nombre || solicitud.tallerNombre });
    setConfirmAction(null);
  };

  const rechazarSolicitud = (solicitud) => {
    if (!canManageRequests) return;
    const solicitudRechazada = { ...solicitud, estado: "Rechazada", actualizadoEn: new Date().toISOString() };
    setData((prev) => ({
      ...prev,
      solicitudesInscripcion: (prev.solicitudesInscripcion || []).filter((s) => s.id !== solicitud.id)
    }));
    pushHistory("SolicitudInscripcion", "UPDATE", solicitud, solicitudRechazada);
    setConfirmAction(null);
  };

  const confirmarAccion = () => {
    if (!confirmAction?.solicitud) return;
    if (confirmAction.type === "accept") aceptarSolicitud(confirmAction.solicitud);
    if (confirmAction.type === "reject") rechazarSolicitud(confirmAction.solicitud);
  };

  const confirmTitle = confirmAction?.type === "accept" ? "Aceptar solicitud" : "Rechazar solicitud";
  const confirmText = confirmAction?.type === "accept"
    ? "Se creara el alumno si no existe y quedara inscripto en el taller seleccionado. La solicitud saldra de esta lista."
    : "La solicitud se eliminara de la lista y quedara registrada en el historial como rechazada.";

  return (
    <>
      <Stack gap={3}>
        <Card className="hero-card">
          <Card.Body>
            <p className="eyebrow">Gestion de inscripciones</p>
            <h2>{role === "Docente" ? "Solicitudes de mis cursos" : "Solicitudes recibidas"}</h2>
            <p className="text-muted mb-0">
              {role === "Docente"
                ? "Revisa los pedidos enviados para los talleres que tenes asignados y registra el seguimiento."
                : "Revisa pedidos enviados desde la pagina publica y registra el seguimiento."}
            </p>
            <div className="request-stats">
              <span><strong>{pendientes}</strong> pendientes</span>
              <span><strong>{solicitudes.length}</strong> solicitudes totales</span>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="toolbar-form mb-3">
              <Form.Control placeholder="Buscar por nombre, DNI, telefono o taller" value={query} onChange={(e) => setQuery(e.target.value)} />
              <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="todos">Todos los estados</option>
                {estados.map((item) => <option key={item}>{item}</option>)}
              </Form.Select>
              <Form.Select value={distrito} onChange={(e) => setDistrito(e.target.value)}>
                <option value="todos">Todos los distritos</option>
                {distritos.map((item) => <option key={item}>{item}</option>)}
              </Form.Select>
            </div>

            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Alumno</th>
                  <th>Contacto</th>
                  <th>Taller</th>
                  <th>Distrito</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((solicitud) => {
                  const taller = data.talleres.find((t) => t.id === solicitud.tallerId);
                  return (
                    <tr key={solicitud.id}>
                      <td>{fechaHora(solicitud.fechaHora)}</td>
                      <td><strong>{solicitud.nombre}</strong><br /><span className="text-muted small">DNI {solicitud.dni}</span></td>
                      <td>{solicitud.telefono}<br /><span className="text-muted small">{solicitud.email || "Sin email"}</span></td>
                      <td>{solicitud.tallerNombre}</td>
                      <td>{taller?.distrito || "-"}</td>
                      <td><span className={`state-chip ${estadoClass(solicitud.estado)}`}>{solicitud.estado}</span></td>
                      <td className="text-end">
                        <ButtonGroup size="sm" className="request-actions">
                          <Button variant="outline-primary" disabled={solicitud.estado === "Contactada"} onClick={() => cambiarEstado(solicitud, "Contactada")}>Contactada</Button>
                          <Button variant="outline-success" onClick={() => setConfirmAction({ type: "accept", solicitud })}>Aceptar</Button>
                          <Button variant="outline-danger" onClick={() => setConfirmAction({ type: "reject", solicitud })}>Rechazar</Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length ? (
                  <tr><td colSpan={7}><EmptyState title="Sin solicitudes" text="No hay pedidos de inscripcion con los filtros actuales." /></td></tr>
                ) : null}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Stack>

      <Modal show={Boolean(confirmAction)} onHide={() => setConfirmAction(null)} centered>
        <Modal.Header closeButton><Modal.Title>{confirmTitle}</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>{confirmText}</p>
          {confirmAction?.solicitud ? (
            <div className="request-confirm-box">
              <strong>{confirmAction.solicitud.nombre}</strong>
              <span>DNI {confirmAction.solicitud.dni}</span>
              <span>{confirmAction.solicitud.tallerNombre}</span>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmAction(null)}>Cancelar</Button>
          <Button variant={confirmAction?.type === "accept" ? "success" : "danger"} onClick={confirmarAccion}>
            {confirmAction?.type === "accept" ? "Aceptar e inscribir" : "Rechazar y eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
