import React from "react";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import logoMuni from "../../assets/logo_muni.jpg";
import { demoUsers } from "../data/demoData.js";

export function LoginScreen({ onLogin }) {
  return (
    <main className="auth-page">
      <Card className="auth-card">
        <Row className="g-0">
          <Col md={5} className="auth-brand">
            <p className="eyebrow text-white-50">Municipalidad de San Rafael</p>
            <h1>GEM Punto Digital</h1>
            <img src={logoMuni} alt="Logo Municipalidad de San Rafael" />
          </Col>
          <Col md={7}>
            <Card.Body className="p-4">
              <h2>Ingresar al sistema</h2>
              <p className="text-muted">Accesos provisorios para revisar vistas por rol.</p>
              <Stack gap={2}>
                {demoUsers.map((user) => (
                  <Button key={user.id} variant={user.role === "Administrador" ? "primary" : "outline-primary"} onClick={() => onLogin(user)}>
                    Entrar como {user.role}
                  </Button>
                ))}
              </Stack>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </main>
  );
}
