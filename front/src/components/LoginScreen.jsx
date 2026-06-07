import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import logoMuni from "../../assets/logo_muni.jpg";
import { loginDemo, registerDemo, validateRegisterInput } from "../utils/auth.js";

const PUNTO_DIGITAL_CONTACTO = {
  telefono: "2604-000000",
  email: "cultura@sanrafael.gob.ar"
};

const emptyLogin = { email: "", password: "" };
const emptyRegister = { email: "", password: "", confirmPassword: "" };

function AuthReminder() {
  return (
    <p className="auth-reminder">
      <strong>Recordá:</strong> para ingresar o registrarte tenés que estar previamente cargado/a por Punto Digital.
      {" "}Consultas: <strong>{PUNTO_DIGITAL_CONTACTO.telefono}</strong>
      {" "}· {PUNTO_DIGITAL_CONTACTO.email}
    </p>
  );
}

export function LoginScreen({ data, onLogin, onRegister }) {
  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [error, setError] = useState("");

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError("");
  };

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

  const submitRegister = (event) => {
    event.preventDefault();
    const validation = validateRegisterInput(registerForm);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    const result = registerDemo(data, validation.email, registerForm.password);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    onRegister(result);
    setRegisterForm(emptyRegister);
    setError("");
  };

  return (
    <main className="auth-page">
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
              <div className="auth-tabs">
                <button type="button" className={`btn auth-tab ${activeTab === "login" ? "active" : ""}`} onClick={() => switchTab("login")}>Ingresar</button>
                <button type="button" className={`btn auth-tab ${activeTab === "register" ? "active" : ""}`} onClick={() => switchTab("register")}>Registrarse</button>
              </div>

              {activeTab === "login" ? (
                <Form className="auth-form" onSubmit={submitLogin}>
                  <h2>Ingresar al sistema</h2>
                  <p className="auth-lead">Usá el email y la contraseña que elegiste al registrarte.</p>
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
                  <p className="auth-demo">Probar Registrarse: docente <strong>matias.roman@punto.digital</strong>, alumno <strong>carlos.quiroga2@demo.com</strong>, admin <strong>maria.lopez@punto.digital</strong>.</p>
                  <AuthReminder />
                </Form>
              ) : (
                <Form className="auth-form" onSubmit={submitRegister}>
                  <h2>Crear tu acceso</h2>
                  <p className="auth-lead">Si Punto Digital ya cargó tus datos, completá tu email y elegí una contraseña.</p>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" required autoComplete="username" placeholder="usuario@municipio.gob.ar" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control type="password" minLength={6} required autoComplete="new-password" placeholder="Mínimo 6 caracteres" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <Form.Control type="password" minLength={6} required autoComplete="new-password" placeholder="Repetí tu contraseña" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} />
                  </Form.Group>
                  {error ? <p className="auth-error">{error}</p> : null}
                  <Button variant="success" type="submit">Registrarse</Button>
                  <AuthReminder />
                </Form>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </main>
  );
}
