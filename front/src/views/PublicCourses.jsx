import React, { useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, Modal, Row } from "react-bootstrap";
import logoMuni from "../../assets/logo_muni.jpg";
import { EmptyState, HorarioChips } from "../components/common.jsx";
import { diasTexto } from "../utils/formatters.js";

const imageByKeyword = [
  ["pintura", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80"],
  ["carpinteria", "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80"],
  ["guitarra", "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80"],
  ["danza", "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80"],
  ["programacion", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80"],
  ["robotica", "https://images.unsplash.com/photo-1564313094924-1cf18f69d6a2?auto=format&fit=crop&w=900&q=80"],
  ["fotografia", "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=900&q=80"],
  ["diseno", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"],
  ["ingles", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80"],
  ["cocina", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80"],
  ["panaderia", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"],
  ["costura", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80"],
  ["peluqueria", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80"],
  ["huerta", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80"],
  ["yoga", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80"],
  ["teatro", "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80"],
  ["canto", "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80"],
  ["electricidad", "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80"],
  ["soldadura", "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80"],
  ["jardineria", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80"]
];

const fallbackImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80";

function courseImage(taller) {
  const text = `${taller.nombre} ${taller.tipo}`.toLowerCase();
  return imageByKeyword.find(([keyword]) => text.includes(keyword))?.[1] || fallbackImage;
}

export function PublicCourses({ data, docenteName, onLoginClick, onRequest }) {
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [distrito, setDistrito] = useState("todos");
  const [showDistricts, setShowDistricts] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ nombre: "", dni: "", telefono: "", email: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [success, setSuccess] = useState(null);

  const activos = data.talleres.filter((t) => t.estado === "Activo");
  const tipos = useMemo(() => [...new Set(activos.map((t) => t.tipo))].sort(), [activos]);
  const distritos = useMemo(() => [...new Set(activos.map((t) => t.distrito))].sort(), [activos]);
  const tipoCounts = useMemo(() => activos.reduce((acc, taller) => {
    acc[taller.tipo] = (acc[taller.tipo] || 0) + 1;
    return acc;
  }, {}), [activos]);
  const featuredTipos = useMemo(() => tipos.slice(0, 8), [tipos]);
  const districtCounts = useMemo(() => activos.reduce((acc, taller) => {
    acc[taller.distrito] = (acc[taller.distrito] || 0) + 1;
    return acc;
  }, {}), [activos]);
  const filtered = activos.filter((t) => {
    const matchesQuery = `${t.nombre} ${t.tipo} ${t.distrito} ${docenteName(t.docenteId)}`.toLowerCase().includes(query.toLowerCase());
    const matchesTipo = tipo === "todos" || t.tipo === tipo;
    const matchesDistrito = distrito === "todos" || t.distrito === distrito;
    return matchesQuery && matchesTipo && matchesDistrito;
  });
  const perPage = 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const setDistrictFilter = (value) => {
    setDistrito(value);
    setPage(1);
    setShowDistricts(false);
  };
  const updateQuery = (value) => {
    setQuery(value);
    setPage(1);
  };
  const updateTipo = (value) => {
    setTipo(value);
    setPage(1);
  };

  const openRequest = (taller) => {
    setSelected(taller);
    setForm({ nombre: "", dni: "", telefono: "", email: "" });
    setError("");
  };

  const submit = (event) => {
    event.preventDefault();
    const clean = {
      nombre: form.nombre.trim(),
      dni: form.dni.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim()
    };
    if (!clean.nombre || !clean.dni || !clean.telefono) {
      setError("Completa nombre, DNI y telefono.");
      return;
    }
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
      setError("Revisa el formato del email.");
      return;
    }
    onRequest(selected, clean);
    const confirmation = { tallerId: selected.id, tallerNombre: selected.nombre, nombre: clean.nombre };
    setSent(confirmation);
    setSuccess(confirmation);
    setSelected(null);
    window.setTimeout(() => setSent(""), 5200);
  };

  return (
    <main className="public-page">
      <header className="public-topbar">
        <Container fluid="xl" className="public-topbar-inner">
          <div className="public-brand">
            <img src={logoMuni} alt="Municipalidad de San Rafael" />
            <span><strong>Cursos Dirección de Cultura</strong><small>Municipalidad de San Rafael</small></span>
          </div>
          <Button variant="outline-light" onClick={onLoginClick}>Ingresar al sistema</Button>
        </Container>
      </header>

      <section className="public-hero">
        <Container fluid="xl">
          <p className="eyebrow">Inscripciones abiertas</p>
          <h1>Cursos y talleres culturales</h1>
          <p>Descubrí propuestas para aprender algo nuevo, compartir con otras personas y sumarte a actividades cerca de tu comunidad.</p>
          <div className="public-hero-highlights" aria-label="Resumen de cursos disponibles">
            <span><strong>{activos.length}</strong> cursos activos</span>
            <span><strong>{distritos.length}</strong> distritos con propuestas</span>
            <span>Inscripción simple y gratuita</span>
          </div>
        </Container>
      </section>

      <Container fluid="xl" className="public-content">
        {sent ? (
          <div className="public-notice public-request-success" role="status">
            <strong>Solicitud enviada</strong>
            <span>{sent.nombre}, recibimos tu pedido para <b>{sent.tallerNombre}</b>. El equipo de Cultura se va a contactar con vos para confirmar la inscripción.</span>
          </div>
        ) : null}
        <section className="district-priority-filter">
          <button type="button" className="district-toggle" onClick={() => setShowDistricts((prev) => !prev)} aria-expanded={showDistricts}>
            <span>
              <small>Ubicación</small>
              <strong>{distrito === "todos" ? "Seleccioná tu distrito" : distrito}</strong>
            </span>
            <em>{distrito === "todos" ? "Todos los cursos" : `${districtCounts[distrito] || 0} curso/s`}</em>
          </button>
          {showDistricts ? (
            <div className="district-dropdown">
              <button type="button" className={`district-option ${distrito === "todos" ? "active" : ""}`} onClick={() => setDistrictFilter("todos")}>
                <strong>Todos los distritos</strong><small>{activos.length} cursos activos</small>
              </button>
              {distritos.map((item) => (
                <button type="button" className={`district-option ${distrito === item ? "active" : ""}`} key={item} onClick={() => setDistrictFilter(item)}>
                  <strong>{item}</strong><small>{districtCounts[item]} curso/s</small>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="public-category-strip" aria-label="Categorías destacadas">
          <div>
            <p className="eyebrow">Explorá propuestas</p>
            <h2>Categorías destacadas</h2>
          </div>
          <div className="public-category-actions">
            <button type="button" className={tipo === "todos" ? "active" : ""} onClick={() => updateTipo("todos")}>
              Todas <span>{activos.length}</span>
            </button>
            {featuredTipos.map((item) => (
              <button type="button" className={tipo === item ? "active" : ""} key={item} onClick={() => updateTipo(item)}>
                {item} <span>{tipoCounts[item]}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="public-secondary-filters">
          <Form.Control placeholder="Buscá guitarra, pintura, cocina..." value={query} onChange={(e) => updateQuery(e.target.value)} />
          <Form.Select value={tipo} onChange={(e) => updateTipo(e.target.value)}>
            <option value="todos">Todas las categorias</option>
            {tipos.map((item) => <option key={item}>{item}</option>)}
          </Form.Select>
        </div>
        <div className="public-results-head">
          <span>{filtered.length} curso/s encontrados</span>
          {filtered.length ? <small>Página {currentPage} de {totalPages}</small> : null}
        </div>

        <Row className="g-3">
          {paginated.map((taller) => (
            <Col md={6} xl={4} key={taller.id}>
              <Card className="public-course-card h-100">
                <div className="public-course-image" style={{ backgroundImage: `url("${courseImage(taller)}")` }}>
                  <span>{taller.tipo}</span>
                </div>
                <Card.Body>
                  <Card.Title>{taller.nombre}</Card.Title>
                  <p className="public-course-place">{taller.distrito} · {taller.direccion}</p>
                  <HorarioChips taller={taller} />
                  <p className="public-course-meta">{diasTexto(taller)} · {docenteName(taller.docenteId)}</p>
                  <Button variant={sent?.tallerId === taller.id ? "outline-success" : "success"} onClick={() => openRequest(taller)}>
                    {sent?.tallerId === taller.id ? "Solicitud enviada" : "Solicitar inscripción"}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {!filtered.length ? <Col><EmptyState title="Sin cursos disponibles" text="No hay cursos activos para los filtros seleccionados." /></Col> : null}
        </Row>
        {filtered.length > perPage ? (
          <nav className="public-pagination" aria-label="Paginación de cursos">
            <Button variant="outline-primary" disabled={currentPage === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Anterior</Button>
            <div>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                <button type="button" className={currentPage === item ? "active" : ""} key={item} onClick={() => setPage(item)}>{item}</button>
              ))}
            </div>
            <Button variant="outline-primary" disabled={currentPage === totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>Siguiente</Button>
          </nav>
        ) : null}
      </Container>

      <Modal show={Boolean(selected)} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton><Modal.Title>Solicitar inscripción</Modal.Title></Modal.Header>
        <Modal.Body>
          {selected ? <p className="text-muted">Curso: <strong>{selected.nombre}</strong></p> : null}
          {error ? <div className="form-error mb-2">{error}</div> : null}
          <Form className="d-grid gap-2" onSubmit={submit}>
            <Form.Control placeholder="Nombre y apellido" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Form.Control placeholder="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
            <Form.Control placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <Form.Control type="email" placeholder="Email opcional" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Button variant="success" type="submit">Enviar solicitud</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={Boolean(success)} onHide={() => setSuccess(null)} centered className="public-success-modal">
        <Modal.Body>
          <div className="success-confirmation">
            <div className="success-confirmation-icon">✓</div>
            <p className="eyebrow">Solicitud enviada</p>
            <h2>Recibimos tu pedido de inscripción</h2>
            {success ? (
              <p>
                {success.nombre}, tu solicitud para <strong>{success.tallerNombre}</strong> se envió correctamente.
                El equipo de Cultura se va a contactar con vos para confirmar la inscripción.
              </p>
            ) : null}
            <Button variant="success" onClick={() => setSuccess(null)}>Entendido</Button>
          </div>
        </Modal.Body>
      </Modal>
    </main>
  );
}
