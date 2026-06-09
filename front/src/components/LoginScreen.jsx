import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import logoMuni from "../../assets/logo_muni.jpg";
import { loginDemo } from "../utils/auth.js";

const PUNTO_DIGITAL_CONTACTO = {
  telefono: "2604-000000",
  email: "cultura@sanrafael.gob.ar"
};

const emptyLogin = { email: "", password: "" };

function AuthReminder() {
  return (
    <p className="auth-reminder">
      <strong>Recordá:</strong> para ingresar tenés que estar previamente cargado/a por el equipo de Cultura.
      {" "}Consultas: <strong>{PUNTO_DIGITAL_CONTACTO.telefono}</strong>
      {" "}· {PUNTO_DIGITAL_CONTACTO.email}
    </p>
  );
}

export function LoginScreen({ data, onLogin, embedded = false }) {
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [error, setError] = useState("");

  const submitLogin = (event) => {
    event.preventDefault();
    const result = loginDemo(data, loginForm.email, loginForm.password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onLogin(result.user);
  };

  const quickLogin = (email) => {
    const user = data.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return;
    setLoginForm({ email: user.email, password: user.password });
    setError("");
    onLogin(user);
  };

  return (
    <main className={embedded ? "auth-page auth-page-embedded" : "auth-page"}>
      <Card className="auth-card">
        <Row className="g-0">
          <Col md={5} className="auth-brand">
            <p className="auth-kicker">Municipalidad de San Rafael</p>
            <h1>Dirección de Cultura</h1>
            <div className="auth-logo-wrap">
              <img src={logoMuni} alt="Logo Municipalidad de San Rafael" />
            </div>
          </Col>
          <Col md={7}>
            <Card.Body className="auth-main">
              <Form className="auth-form" onSubmit={submitLogin}>
                <h2>Ingresar al sistema</h2>
                <p className="auth-lead">Ingresá con las credenciales asignadas por el equipo de Cultura.</p>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" required autoComplete="username" placeholder="usuario@municipio.gob.ar" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" required autoComplete="current-password" placeholder="Mínimo 6 caracteres" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                </Form.Group>
                {error ? <p className="auth-error">{error}</p> : null}
                <Button variant="success" type="submit">Ingresar</Button>
                <div className="demo-login-actions" aria-label="Accesos rapidos demo">
                  <Button type="button" variant="outline-primary" onClick={() => quickLogin("admin@punto.digital")}>Admin general</Button>
                  <Button type="button" variant="outline-primary" onClick={() => quickLogin("juan.operador@punto.digital")}>Admin común</Button>
                  <Button type="button" variant="outline-primary" onClick={() => quickLogin("paula.herrera@punto.digital")}>Docente</Button>
                  <Button type="button" variant="outline-primary" onClick={() => quickLogin("ana.gomez@punto.digital")}>Alumno</Button>
                </div>
                <p className="auth-demo">Accesos provisorios para revisar vistas por rol.</p>
                <AuthReminder />
              </Form>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </main>
  );
}
