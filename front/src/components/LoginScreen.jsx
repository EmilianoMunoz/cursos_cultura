import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import logoMuni from "../../assets/logo_muni.jpg";
import { demoUsers } from "../data/demoData.js";

const emptyLogin = { email: "", password: "" };
const emptyRegister = { nombre: "", email: "", password: "", role: "Alumno" };

export function LoginScreen({ onLogin }) {
  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [error, setError] = useState("");

  const submitLogin = (event) => {
    event.preventDefault();
    const email = loginForm.email.trim().toLowerCase();
    const user = demoUsers.find((u) => u.email.toLowerCase() === email && u.password === loginForm.password);
    if (!user) {
      setError("Credenciales invalidas.");
      return;
    }
    onLogin(user);
  };

  const quickLogin = (email) => {
    const user = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return;
    setLoginForm({ email: user.email, password: user.password });
    setError("");
    onLogin(user);
  };

  const submitRegister = (event) => {
    event.preventDefault();
    if (!registerForm.nombre.trim() || !registerForm.email.trim() || registerForm.password.length < 6) {
      setError("Completa nombre, email y una contrasena de al menos 6 caracteres.");
      return;
    }
    onLogin({
      id: Date.now(),
      nombre: registerForm.nombre.trim(),
      email: registerForm.email.trim().toLowerCase(),
      password: registerForm.password,
      role: registerForm.role
    });
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
                <button type="button" className={`btn auth-tab ${activeTab === "login" ? "active" : ""}`} onClick={() => { setActiveTab("login"); setError(""); }}>Login</button>
                <button type="button" className={`btn auth-tab ${activeTab === "register" ? "active" : ""}`} onClick={() => { setActiveTab("register"); setError(""); }}>Registro</button>
              </div>

              {activeTab === "login" ? (
                <Form className="auth-form" onSubmit={submitLogin}>
                  <h2>Ingresar al sistema</h2>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" required autoComplete="username" placeholder="usuario@municipio.gob.ar" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Contrasena</Form.Label>
                    <Form.Control type="password" required autoComplete="current-password" placeholder="Minimo 6 caracteres" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                  </Form.Group>
                  {error ? <p className="auth-error">{error}</p> : null}
                  <Button variant="success" type="submit">Iniciar sesion</Button>
                  <div className="demo-login-actions" aria-label="Accesos rapidos demo">
                    <Button type="button" variant="outline-primary" onClick={() => quickLogin("admin@punto.digital")}>Administrador</Button>
                    <Button type="button" variant="outline-primary" onClick={() => quickLogin("paula.herrera@punto.digital")}>Docente</Button>
                    <Button type="button" variant="outline-primary" onClick={() => quickLogin("ana.gomez@punto.digital")}>Alumno</Button>
                  </div>
                  <p className="auth-demo">Accesos provisorios para revisar vistas por rol.</p>
                </Form>
              ) : (
                <Form className="auth-form" onSubmit={submitRegister}>
                  <h2>Crear cuenta local</h2>
                  <Form.Group>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control required placeholder="Nombre y apellido" value={registerForm.nombre} onChange={(e) => setRegisterForm({ ...registerForm, nombre: e.target.value })} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" required placeholder="usuario@municipio.gob.ar" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Contrasena</Form.Label>
                    <Form.Control type="password" minLength={6} required placeholder="Minimo 6 caracteres" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Rol</Form.Label>
                    <Form.Select value={registerForm.role} onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}>
                      <option value="Administrador">Administrador</option>
                      <option value="Docente">Docente</option>
                      <option value="Alumno">Alumno</option>
                    </Form.Select>
                  </Form.Group>
                  {error ? <p className="auth-error">{error}</p> : null}
                  <Button variant="success" type="submit">Crear y entrar</Button>
                </Form>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </main>
  );
}
