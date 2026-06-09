import React, { useMemo, useState } from "react";
import { Badge, Card, Form } from "react-bootstrap";
import { EmptyState } from "../components/common.jsx";

const fieldLabels = {
  nombre: "nombre",
  apellido: "apellido",
  dni: "DNI",
  telefono: "numero de telefono",
  email: "email",
  direccion: "direccion",
  fechaNacimiento: "fecha de nacimiento",
  sexo: "sexo",
  estado: "estado",
  docenteId: "docente asignado",
  horarios: "horarios",
  distrito: "distrito",
  categoria: "categoria"
};

const operationVariant = { CREATE: "success", UPDATE: "warning", DELETE: "danger" };
const fullName = (item) => [item?.nombre, item?.apellido].filter(Boolean).join(" ") || "Sin nombre";

function changedFields(anterior = {}, nuevo = {}) {
  return Object.keys(fieldLabels)
    .filter((key) => JSON.stringify(anterior?.[key]) !== JSON.stringify(nuevo?.[key]))
    .map((key) => ({ key, label: fieldLabels[key], before: anterior?.[key], after: nuevo?.[key] }));
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "sin dato";
  if (Array.isArray(value)) return value.map((item) => `${item.dia} ${item.inicio}-${item.fin}`).join(", ");
  if (typeof value === "boolean") return value ? "si" : "no";
  return String(value);
}

function eventText(h, alumnoName, tallerName) {
  const usuario = h.usuario || "Un usuario";
  const nuevo = h.nuevo || {};
  const anterior = h.anterior || {};
  if (h.entidad === "RegistroAsistencia") return `${usuario} cargo asistencia en ${nuevo.tallerNombre || tallerName(nuevo.tallerId)}${nuevo.registros ? ` (${nuevo.registros} registros)` : ""}.`;
  if (h.entidad === "Docente") {
    if (h.operacion === "CREATE") return `${usuario} agrego a ${fullName(nuevo)} como profesor${nuevo.tallerAsignado ? ` y lo asigno a ${nuevo.tallerAsignado}` : ""}.`;
    if (h.operacion === "DELETE") return `${usuario} elimino a ${fullName(anterior)} como profesor.`;
    if (nuevo.tallerAsignado) return `${usuario} asigno a ${fullName(nuevo)} como profesor de ${nuevo.tallerAsignado}.`;
    return `${usuario} modifico ${changedFields(anterior, nuevo).map((f) => f.label).join(", ") || "la ficha"} de ${fullName(nuevo || anterior)}.`;
  }
  if (h.entidad === "Alumno") {
    if (h.operacion === "CREATE") return `${usuario} agrego a ${fullName(nuevo)} como alumno.`;
    if (h.operacion === "UPDATE") return `${usuario} modifico ${changedFields(anterior, nuevo).map((f) => f.label).join(", ") || "la ficha"} de ${fullName(nuevo || anterior)}.`;
  }
  if (h.entidad === "Taller") {
    const nombre = nuevo.nombre || anterior.nombre || "un taller";
    if (h.operacion === "CREATE") return `${usuario} creo el taller ${nombre}.`;
    if (h.operacion === "DELETE") return `${usuario} elimino el taller ${nombre}.`;
    if (anterior.estado !== "Finalizado" && nuevo.estado === "Finalizado") return `${usuario} finalizo el taller ${nombre}.`;
    return `${usuario} modifico ${changedFields(anterior, nuevo).map((f) => f.label).join(", ") || "datos"} de ${nombre}.`;
  }
  if (h.entidad === "SolicitudInscripcion") {
    const nombre = nuevo.nombre || anterior.nombre || "una persona";
    const taller = nuevo.tallerNombre || anterior.tallerNombre || "un taller";
    if (h.operacion === "UPDATE") return `${usuario} marco la solicitud de ${nombre} para ${taller} como ${nuevo.estado}.`;
    return `${usuario} registro una solicitud de ${nombre} para ${taller}.`;
  }
  if (h.entidad === "Inscripcion") return `${usuario} registro una inscripcion de ${alumnoName(nuevo.alumnoId || anterior.alumnoId)} en ${tallerName(nuevo.tallerId || anterior.tallerId)}.`;
  return `${usuario} registro una accion sobre ${h.entidad}.`;
}

export function AuditLog({ historial, query, setQuery, alumnoName, tallerName }) {
  const [entityFilter, setEntityFilter] = useState("todos");
  const [operationFilter, setOperationFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");
  const events = useMemo(() => historial.map((h) => ({ ...h, texto: eventText(h, alumnoName, tallerName), cambios: changedFields(h.anterior, h.nuevo) })), [historial, alumnoName, tallerName]);
  const entities = [...new Set(historial.map((h) => h.entidad))].sort();
  const rows = events.filter((h) => {
    const matchesQuery = `${h.texto} ${h.usuario} ${h.rol} ${h.entidad} ${h.operacion}`.toLowerCase().includes(query.toLowerCase());
    const matchesEntity = entityFilter === "todos" || h.entidad === entityFilter;
    const matchesOperation = operationFilter === "todos" || h.operacion === operationFilter;
    const matchesDate = !dateFilter || h.fechaHora.slice(0, 10) === dateFilter;
    return matchesQuery && matchesEntity && matchesOperation && matchesDate;
  });

  return (
    <Card><Card.Body>
      <div className="section-head">
        <div>
          <h2>Historial</h2>
          <p className="text-muted mb-0">Trazabilidad de acciones con fecha, hora y usuario.</p>
        </div>
        <div className="audit-filters">
          <Form.Control placeholder="Buscar historial" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Form.Control type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          <Form.Select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
            <option value="todos">Todas las entidades</option>
            {entities.map((e) => <option key={e}>{e}</option>)}
          </Form.Select>
          <Form.Select value={operationFilter} onChange={(e) => setOperationFilter(e.target.value)}>
            <option value="todos">Todas las acciones</option>
            <option value="CREATE">Altas</option>
            <option value="UPDATE">Cambios</option>
            <option value="DELETE">Bajas</option>
          </Form.Select>
        </div>
      </div>
      <div className="history-list">
        {rows.map((h) => (
          <article className="history-event" key={h.id}>
            <div className="history-event-main">
              <p>{h.texto}</p>
              <span className="history-meta">{new Date(h.fechaHora).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}{h.rol ? ` · ${h.rol}` : ""}</span>
            </div>
            <Badge bg={operationVariant[h.operacion] || "secondary"}>{h.operacion}</Badge>
            {h.cambios.length ? <ul className="history-changes">{h.cambios.slice(0, 4).map((change) => <li key={change.key}><strong>{change.label}:</strong> {formatValue(change.before)} &rarr; {formatValue(change.after)}</li>)}</ul> : null}
          </article>
        ))}
        {!rows.length ? <EmptyState title="Sin movimientos" text="No hay movimientos para los filtros seleccionados." /> : null}
      </div>
    </Card.Body></Card>
  );
}
