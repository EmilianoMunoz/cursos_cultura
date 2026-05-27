import React from "react";
import { Badge, Card, Stack } from "react-bootstrap";
import { estadoClass, horariosOrdenados, porcentaje } from "../utils/formatters.js";

export function HorarioChips({ taller }) {
  const abreviaturas = { Lunes: "Lunes", Martes: "Martes", Miercoles: "Miercoles", Jueves: "Jueves", Viernes: "Viernes", Sabado: "Sabado" };
  return (
    <div className="dias-inline">
      {horariosOrdenados(taller).map((h) => (
        <span className="dia-chip" key={`${h.dia}-${h.inicio}-${h.fin}`}>{abreviaturas[h.dia] || h.dia} {h.inicio}-{h.fin}</span>
      ))}
    </div>
  );
}

export function StatCard({ label, value, sub, variant = "light" }) {
  return (
    <Card className={`stat-card border-${variant === "light" ? "secondary-subtle" : variant}`}>
      <Card.Body>
        <div className="text-muted small">{label}</div>
        <div className="stat-value">{value}</div>
        {sub ? <div className="text-muted small">{sub}</div> : null}
      </Card.Body>
    </Card>
  );
}

export function StatusBadges({ taller, inscripciones, asistencias, selectedDate }) {
  const activos = inscripciones.filter((i) => i.tallerId === taller.id && i.estado === "Activo");
  const registros = asistencias.filter((a) => a.tallerId === taller.id && a.fecha === selectedDate);
  const badges = [<span key="estado" className={`state-chip ${estadoClass(taller.estado)}`}>{taller.estado}</span>];
  if (!taller.docenteId) badges.push(<span key="docente" className="state-chip is-danger">Sin docente</span>);
  if (!activos.length) badges.push(<span key="alumnos" className="state-chip is-warn">Sin alumnos</span>);
  if (taller.estado === "Activo" && activos.length && registros.length < activos.length) {
    badges.push(<span key="asis" className="state-chip is-warn">Asistencia pendiente</span>);
  }
  return <Stack direction="horizontal" gap={1} className="flex-wrap">{badges}</Stack>;
}

export function MiniBar({ label, value, total, variant = "info" }) {
  const pct = porcentaje(value, total);
  return (
    <div className={`mini-bar ${variant}`}>
      <div className="mini-bar-row"><span>{label}</span><strong>{value}</strong></div>
      <div className="mini-bar-track"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
