import React from "react";
import { Badge, Card, Form } from "react-bootstrap";

const fieldLabels = {
  nombre: "nombre",
  apellido: "apellido",
  telefono: "numero de telefono",
  direccion: "direccion",
  estado: "estado",
  docenteId: "docente asignado",
  horarios: "horarios",
  distrito: "distrito",
  categoria: "categoria"
};

const operationVariant = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "danger"
};

const fullName = (item) => [item?.nombre, item?.apellido].filter(Boolean).join(" ") || "Sin nombre";

function changedFields(anterior = {}, nuevo = {}) {
  return Object.keys(fieldLabels)
    .filter((key) => JSON.stringify(anterior?.[key]) !== JSON.stringify(nuevo?.[key]))
    .map((key) => ({
      key,
      label: fieldLabels[key],
      before: anterior?.[key],
      after: nuevo?.[key]
    }));
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

  if (h.entidad === "RegistroAsistencia") {
    const taller = nuevo.tallerNombre || tallerName(nuevo.tallerId);
    const cantidad = nuevo.registros ? ` (${nuevo.registros} registros)` : "";
    return `${usuario} cargo asistencia en ${taller}${cantidad}.`;
  }

  if (h.entidad === "Docente") {
    if (h.operacion === "CREATE") {
      const asignacion = nuevo.tallerAsignado ? ` y lo asigno a ${nuevo.tallerAsignado}` : "";
      return `${usuario} agrego a ${fullName(nuevo)} como profesor${asignacion}.`;
    }
    if (h.operacion === "DELETE") return `${usuario} elimino a ${fullName(anterior)} como profesor.`;
    if (nuevo.tallerAsignado) return `${usuario} asigno a ${fullName(nuevo)} como profesor de ${nuevo.tallerAsignado}.`;
    const fields = changedFields(anterior, nuevo).map((f) => f.label).join(", ") || "la ficha";
    return `${usuario} modifico ${fields} de ${fullName(nuevo || anterior)}.`;
  }

  if (h.entidad === "Alumno") {
    if (h.operacion === "CREATE") return `${usuario} agrego a ${fullName(nuevo)} como alumno.`;
    if (h.operacion === "UPDATE") {
      const fields = changedFields(anterior, nuevo).map((f) => f.label).join(", ") || "la ficha";
      return `${usuario} modifico ${fields} de ${fullName(nuevo || anterior)}.`;
    }
  }

  if (h.entidad === "Taller") {
    const nombre = nuevo.nombre || anterior.nombre || "un taller";
    if (h.operacion === "CREATE") return `${usuario} creo el taller ${nombre}.`;
    if (h.operacion === "DELETE") return `${usuario} elimino el taller ${nombre}.`;
    if (anterior.estado !== "Finalizado" && nuevo.estado === "Finalizado") return `${usuario} finalizo el taller ${nombre}.`;
    const fields = changedFields(anterior, nuevo).map((f) => f.label).join(", ") || "datos";
    return `${usuario} modifico ${fields} de ${nombre}.`;
  }

  if (h.entidad === "Inscripcion") {
    const alumno = alumnoName(nuevo.alumnoId || anterior.alumnoId);
    const taller = tallerName(nuevo.tallerId || anterior.tallerId);
    return `${usuario} registro una inscripcion de ${alumno} en ${taller}.`;
  }

  return `${usuario} registro una accion sobre ${h.entidad}.`;
}

export function AuditLog({ historial, query, setQuery, alumnoName, tallerName }) {
  const events = historial.map((h) => ({
    ...h,
    texto: eventText(h, alumnoName, tallerName),
    cambios: changedFields(h.anterior, h.nuevo)
  }));
  const rows = events.filter((h) => `${h.texto} ${h.usuario} ${h.rol} ${h.entidad} ${h.operacion}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Card><Card.Body>
      <div className="section-head">
        <div>
          <h2>Historial</h2>
          <p className="text-muted mb-0">Trazabilidad de acciones con fecha, hora y usuario.</p>
        </div>
        <Form.Control className="w-auto" placeholder="Buscar historial" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="history-list">
        {rows.map((h) => (
          <article className="history-event" key={h.id}>
            <div className="history-event-main">
              <p>{h.texto}</p>
              <span className="history-meta">
                {new Date(h.fechaHora).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                {h.rol ? ` · ${h.rol}` : ""}
              </span>
            </div>
            <Badge bg={operationVariant[h.operacion] || "secondary"}>{h.operacion}</Badge>
            {h.cambios.length ? (
              <ul className="history-changes">
                {h.cambios.slice(0, 4).map((change) => (
                  <li key={change.key}>
                    <strong>{change.label}:</strong> {formatValue(change.before)} &rarr; {formatValue(change.after)}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
        {!rows.length ? <div className="empty-state">No hay movimientos para mostrar.</div> : null}
      </div>
    </Card.Body></Card>
  );
}
