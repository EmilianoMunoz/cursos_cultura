import React, { useMemo, useState } from "react";
import { Button, Container, Form, Modal, Nav, Navbar, Stack } from "react-bootstrap";
import * as XLSX from "xlsx";
import logoMuni from "../assets/logo_muni.jpg";
import { LoginScreen } from "./components/LoginScreen.jsx";
import { StudentProfile } from "./components/StudentProfile.jsx";
import { WorkshopForm } from "./components/WorkshopForm.jsx";
import { initialData } from "./data/demoData.js";
import { Attendance } from "./views/Attendance.jsx";
import { AuditLog } from "./views/AuditLog.jsx";
import { Dashboard } from "./views/Dashboard.jsx";
import { Reports } from "./views/Reports.jsx";
import { Students } from "./views/Students.jsx";
import { Teachers } from "./views/Teachers.jsx";
import { WorkshopManagement } from "./views/WorkshopManagement.jsx";
import { Workshops } from "./views/Workshops.jsx";
import { permissions, today, views } from "./utils/constants.js";
import { etiquetaEstado, normalizarEstado } from "./utils/formatters.js";
import { talleresConAsistenciaPendiente } from "./utils/talleres.js";

export default function App() {
  const [data, setData] = useState(initialData);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedAttendanceTaller, setSelectedAttendanceTaller] = useState(2);
  const [filters, setFilters] = useState({ taller: "todos", estado: "todos", docente: "todos" });
  const [studentQuery, setStudentQuery] = useState("");
  const [workshopQuery, setWorkshopQuery] = useState("");
  const [auditQuery, setAuditQuery] = useState("");
  const [workshopModal, setWorkshopModal] = useState({ show: false, taller: null });
  const [studentModal, setStudentModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const role = currentUser?.role || "Administrador";
  const allowed = permissions[role] || [];
  const docenteId = currentUser?.docenteId;
  const alumnoId = currentUser?.alumnoId;

  const docenteName = (id) => {
    const docente = data.docentes.find((d) => d.id === id);
    return docente ? `${docente.nombre} ${docente.apellido}` : "Sin asignar";
  };
  const alumnoName = (id) => {
    const alumno = data.alumnos.find((a) => a.id === id);
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno";
  };
  const tallerName = (id) => data.talleres.find((t) => t.id === id)?.nombre || "Taller";

  const visibleTalleres = useMemo(() => {
    if (role === "Administrador") return data.talleres;
    if (role === "Docente") return data.talleres.filter((t) => t.docenteId === docenteId);
    const ids = new Set(data.inscripciones.filter((i) => i.alumnoId === alumnoId && i.estado === "Activo").map((i) => i.tallerId));
    return data.talleres.filter((t) => ids.has(t.id));
  }, [data, role, docenteId, alumnoId]);

  const visibleAlumnos = useMemo(() => {
    if (role === "Administrador") return data.alumnos;
    if (role === "Docente") {
      const tallerIds = new Set(visibleTalleres.map((t) => t.id));
      const ids = new Set(data.inscripciones.filter((i) => i.estado === "Activo" && tallerIds.has(i.tallerId)).map((i) => i.alumnoId));
      return data.alumnos.filter((a) => ids.has(a.id));
    }
    return data.alumnos.filter((a) => a.id === alumnoId);
  }, [data, role, alumnoId, visibleTalleres]);

  const pushHistory = (entidad, operacion, anterior, nuevo) => {
    setData((prev) => ({
      ...prev,
      historial: [
        { id: Date.now() + Math.random(), fechaHora: new Date().toISOString(), usuario: currentUser.nombre, rol: currentUser.role, entidad, operacion, anterior, nuevo },
        ...prev.historial
      ]
    }));
  };

  const login = (user) => {
    setCurrentUser(user);
    const nextView = user.role === "Docente" && talleresConAsistenciaPendiente(data, user, selectedDate).length ? "asistencia" : "dashboard";
    setView(nextView);
  };

  const saveWorkshop = (workshop) => {
    setData((prev) => {
      const exists = prev.talleres.some((t) => t.id === workshop.id);
      const next = exists
        ? prev.talleres.map((t) => (t.id === workshop.id ? workshop : t))
        : [...prev.talleres, { ...workshop, id: Date.now() }];
      return { ...prev, talleres: next };
    });
    pushHistory("Taller", workshop.id ? "UPDATE" : "CREATE", workshop.id ? data.talleres.find((t) => t.id === workshop.id) : null, workshop);
    setWorkshopModal({ show: false, taller: null });
  };

  const finalizeWorkshop = (id) => {
    const taller = data.talleres.find((t) => t.id === id);
    if (!taller) return;
    setData((prev) => ({ ...prev, talleres: prev.talleres.map((t) => (t.id === id ? { ...t, estado: "Finalizado" } : t)) }));
    pushHistory("Taller", "UPDATE", taller, { ...taller, estado: "Finalizado" });
  };

  const deleteWorkshop = (id) => {
    const taller = data.talleres.find((t) => t.id === id);
    setData((prev) => ({
      ...prev,
      talleres: prev.talleres.filter((t) => t.id !== id),
      inscripciones: prev.inscripciones.filter((i) => i.tallerId !== id),
      asistencias: prev.asistencias.filter((a) => a.tallerId !== id)
    }));
    pushHistory("Taller", "DELETE", taller, null);
    setConfirmDelete(null);
  };

  const reportRows = () => data.asistencias.filter((a) => {
    const taller = data.talleres.find((t) => t.id === a.tallerId);
    if (!taller) return false;
    if (filters.taller !== "todos" && String(a.tallerId) !== filters.taller) return false;
    if (filters.estado !== "todos" && normalizarEstado(a.estadoAsistencia) !== filters.estado) return false;
    if (filters.docente !== "todos" && String(taller.docenteId || "") !== filters.docente) return false;
    if (role === "Docente" && taller.docenteId !== docenteId) return false;
    if (role === "Alumno" && a.alumnoId !== alumnoId) return false;
    return true;
  });

  const exportExcel = () => {
    const rows = reportRows().map((r) => {
      const alumno = data.alumnos.find((a) => a.id === r.alumnoId);
      const taller = data.talleres.find((t) => t.id === r.tallerId);
      return {
        Alumno: `${alumno?.nombre || ""} ${alumno?.apellido || ""}`,
        DNI: alumno?.dni || "",
        Taller: taller?.nombre || "",
        Fecha: r.fecha,
        Estado: etiquetaEstado(r.estadoAsistencia),
        Docente: docenteName(taller?.docenteId)
      };
    });
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte-punto-digital.xlsx");
  };

  if (!currentUser) return <LoginScreen onLogin={login} />;

  const openStudentFromSearch = (value) => {
    const q = value.trim().toLowerCase();
    const alumno = visibleAlumnos.find((a) => `${a.dni} ${a.nombre} ${a.apellido} ${a.email}`.toLowerCase().includes(q));
    if (alumno) setStudentModal(alumno);
  };

  return (
    <>
      <Navbar expand="lg" className="app-topbar" variant="dark">
        <Container fluid="xl">
          <Navbar.Brand className="brand-block">
            <img src={logoMuni} alt="Municipalidad de San Rafael" />
            <span><strong>Sistema Punto Digital</strong><small>Municipalidad de San Rafael</small></span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Form className="global-search ms-lg-auto my-2 my-lg-0" onSubmit={(e) => { e.preventDefault(); openStudentFromSearch(e.currentTarget.elements.studentSearch.value); e.currentTarget.reset(); }}>
              <Form.Control name="studentSearch" list="students-list" placeholder="Buscar alumno por DNI o nombre" />
              <datalist id="students-list">{visibleAlumnos.map((a) => <option key={a.id} value={`${a.dni} ${a.nombre} ${a.apellido}`} />)}</datalist>
            </Form>
            <Stack direction="horizontal" gap={2} className="ms-lg-3 align-items-center flex-wrap">
              <div className="session-pill"><span>{currentUser.nombre}</span><small>{currentUser.role}</small></div>
              <Button size="sm" variant="outline-light" onClick={exportExcel}>Exportar</Button>
              <Button size="sm" variant="light" onClick={() => setCurrentUser(null)}>Salir</Button>
            </Stack>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid="xl" className="app-layout">
        <aside className="sidebar-nav">
          <Nav variant="pills" className="flex-lg-column flex-nowrap">
            {views.filter(([id]) => allowed.includes(id)).map(([id, label]) => (
              <Nav.Item key={id}>
                <Nav.Link active={view === id} onClick={() => setView(id)}>{label}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </aside>
        <main className="content-shell">
          {view === "dashboard" && <Dashboard data={data} role={role} currentUser={currentUser} visibleTalleres={visibleTalleres} visibleAlumnos={visibleAlumnos} selectedDate={selectedDate} docenteName={docenteName} setView={setView} />}
          {view === "talleres" && <Workshops data={data} talleres={visibleTalleres} selectedDate={selectedDate} setSelectedDate={setSelectedDate} query={workshopQuery} setQuery={setWorkshopQuery} docenteName={docenteName} />}
          {view === "gestionTalleres" && <WorkshopManagement data={data} docenteName={docenteName} selectedDate={selectedDate} onCreate={() => setWorkshopModal({ show: true, taller: null })} onEdit={(taller) => setWorkshopModal({ show: true, taller })} onFinalize={finalizeWorkshop} onDelete={setConfirmDelete} />}
          {view === "docentes" && <Teachers data={data} setData={setData} pushHistory={pushHistory} />}
          {view === "alumnos" && <Students data={data} visibleAlumnos={visibleAlumnos} visibleTalleres={visibleTalleres} query={studentQuery} setQuery={setStudentQuery} setData={setData} pushHistory={pushHistory} openStudent={setStudentModal} />}
          {view === "asistencia" && <Attendance data={data} setData={setData} visibleTalleres={visibleTalleres} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedTaller={selectedAttendanceTaller} setSelectedTaller={setSelectedAttendanceTaller} pushHistory={pushHistory} />}
          {view === "reportes" && <Reports data={data} rows={reportRows()} filters={filters} setFilters={setFilters} visibleTalleres={visibleTalleres} role={role} docenteName={docenteName} />}
          {view === "historial" && <AuditLog historial={data.historial} query={auditQuery} setQuery={setAuditQuery} alumnoName={alumnoName} tallerName={tallerName} />}
        </main>
      </Container>

      <Modal show={workshopModal.show} onHide={() => setWorkshopModal({ show: false, taller: null })} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{workshopModal.taller ? `Editar ${workshopModal.taller.nombre}` : "Nuevo taller"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <WorkshopForm initial={workshopModal.taller} docentes={data.docentes} onSubmit={saveWorkshop} onCancel={() => setWorkshopModal({ show: false, taller: null })} />
        </Modal.Body>
      </Modal>

      <Modal show={Boolean(studentModal)} onHide={() => setStudentModal(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>{studentModal ? `${studentModal.nombre} ${studentModal.apellido}` : "Alumno"}</Modal.Title></Modal.Header>
        <Modal.Body>{studentModal ? <StudentProfile alumno={studentModal} data={data} /> : null}</Modal.Body>
      </Modal>

      <Modal show={Boolean(confirmDelete)} onHide={() => setConfirmDelete(null)} centered>
        <Modal.Header closeButton><Modal.Title>Eliminar taller</Modal.Title></Modal.Header>
        <Modal.Body>Se eliminaran el taller y sus inscripciones/asistencias asociadas.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => deleteWorkshop(confirmDelete?.id)}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
