import React from "react";
import { Button, Card, Table } from "react-bootstrap";
import { StatusBadges } from "../components/common.jsx";
import { diasTexto } from "../utils/formatters.js";

export function WorkshopManagement({ data, docenteName, selectedDate, onCreate, onEdit, onFinalize, onDelete }) {
  return (
    <Card><Card.Body>
      <div className="section-head"><div><p className="eyebrow">Gestion municipal</p><h2>Talleres</h2></div><Button onClick={onCreate}>Nuevo taller</Button></div>
      <Table responsive hover className="align-middle">
        <thead><tr><th>Nombre</th><th>Dias</th><th>Docente</th><th>Estado</th><th></th></tr></thead>
        <tbody>{data.talleres.map((t) => <tr key={t.id}><td><strong>{t.nombre}</strong><div className="text-muted small">{t.tipo} · {t.distrito}</div></td><td>{diasTexto(t)}</td><td>{docenteName(t.docenteId)}</td><td><StatusBadges taller={t} inscripciones={data.inscripciones} asistencias={data.asistencias} selectedDate={selectedDate} /></td><td className="text-end"><div className="row-actions"><button type="button" className="table-action is-info" onClick={() => onEdit(t)}>Editar</button><button type="button" className="table-action is-warn" disabled={t.estado === "Finalizado"} onClick={() => onFinalize(t)}>Finalizar</button><button type="button" className="table-action is-danger" onClick={() => onDelete(t)}>Eliminar</button></div></td></tr>)}</tbody>
      </Table>
    </Card.Body></Card>
  );
}
