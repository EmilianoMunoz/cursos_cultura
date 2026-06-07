# Cambios pendientes — Frontend

Documento de mejoras acordadas para alinear el frontend con el backend real y el flujo de autenticación definido en `back/back_talleres_municipales/DECISIONS.md`.

**Estado actual:** versión demo con datos en memoria (`demoData.js`). Login simulado con registro abierto por rol (pendiente de refactor).

**Objetivo:** preparar el front para integrarse con la API y respetar el sistema cerrado (sin registro público), con textos claros para el usuario final.

---

## Resumen de cambios

| # | Cambio | Estado | Prioridad |
|---|--------|--------|-----------|
| 1 | Email en gestión de docentes | ✅ Hecho | — |
| 2 | Varios horarios por taller (hasta 3 por día) | ✅ Hecho | — |
| 3 | Pantalla auth: **Ingresar** + **Registrarse** | ✅ Hecho (UI) | — |
| 4 | Lógica demo de registro cerrado (sin rol ni nombre) | Pendiente | Alta |
| 5 | Recordatorio de contacto Punto Digital | ✅ Hecho | — |
| 6 | Indicador cuenta activa / pendiente (docentes y alumnos) | Pendiente | Media |
| 7 | Gestión de cuentas admin (vista referente) | Pendiente | Media |
| 8 | Integración auth con backend (JWT, API) | Pendiente | Alta (cuando exista API) |
| 9 | Modo demo acotado (`VITE_USE_DEMO_AUTH`) | Pendiente | Baja |

---

## ✅ Completado

### 1. Email en docentes

- Campo email en alta, edición, tabla y ficha (`Teachers.jsx`).
- Validación de formato y duplicados.
- Emails en `demoData.js` (Paula Herrera → `paula.herrera@punto.digital`).

### 2. Varios horarios por taller

- Formulario con hasta **3 turnos por día** (`WorkshopForm.jsx`).
- Datos demo con ejemplos de doble turno.
- Ordenamiento por día y hora en `formatters.js`.

---

## Autenticación — decisiones de UX y flujo

### Nombres en pantalla (no usar "Activar cuenta")

| Pestaña | Texto visible | Uso real |
|---------|---------------|----------|
| Tab 1 | **Ingresar** | Email + contraseña. Usuario que ya completó su acceso. |
| Tab 2 | **Registrarse** | Primera vez: email + contraseña + confirmar. Por detrás es activación/registro cerrado. |

**Título pestaña Registrarse:** "Crear tu acceso" o "Registrarte por primera vez".

**Subtítulo:**
> Si Punto Digital ya cargó tus datos, completá tu email y elegí una contraseña.

**Recordatorio al pie (ambas pestañas o solo Registrarse):**
> **Recordá:** para ingresar o registrarte tenés que estar previamente cargado/a por Punto Digital.  
> Consultas: **2604-000000** · cultura@sanrafael.gob.ar *(reemplazar por contacto real)*

---

### Sistema cerrado — quién puede registrarse

Nadie elige rol ni completa nombre/apellido en el registro. El sistema deduce el rol según dónde exista el email.

| Rol | ¿Quién lo precarga? | ¿Usa Registrarse? | ¿Qué pasa por detrás? |
|-----|---------------------|-------------------|------------------------|
| **Docente** | Admin en vista Docentes (con email) | Sí | Se crea `usuario` vinculado a `docente_id` |
| **Alumno** | Admin en vista Alumnos (con email) | Sí | Se crea `usuario` vinculado a `alumno_id` |
| **Admin nuevo** | Referente en vista Usuarios del sistema | Sí | `usuario` admin ya existe sin contraseña → se completa en Registrarse |
| **Admin inicial (seed)** | Instalación / `.env` | **No** | Entra directo por **Ingresar** con pass inicial |

### Flujo por rol

```
DOCENTE / ALUMNO
  Admin carga perfil (nombre, apellido, email, …)
    → persona va a Registrarse
    → email + contraseña + confirmar
    → sistema crea usuario y vincula perfil
    → puede usar Ingresar

ADMIN NUEVO (creado por referente)
  Referente crea cuenta (email + nombre, SIN contraseña)
    → persona va a Registrarse
    → email + contraseña + confirmar
    → sistema guarda contraseña en usuario admin existente
    → puede usar Ingresar

ADMIN INICIAL (seed)
  Instalación crea usuario con pass en .env
    → entra por Ingresar
    → cambia contraseña en primer acceso (futuro)
```

### Mensajes de error (Registrarse)

| Situación | Mensaje |
|-----------|---------|
| Email no está en docentes, alumnos ni admins pendientes | "Email no registrado en el sistema. Contactá a Punto Digital." |
| Email ya tiene cuenta activa | "Este email ya tiene acceso. Usá Ingresar." |
| Contraseñas no coinciden | "Las contraseñas no coinciden." |
| Contraseña &lt; 6 caracteres | "La contraseña debe tener al menos 6 caracteres." |

### Mensajes de error (Ingresar)

| Situación | Mensaje |
|-----------|---------|
| Credenciales incorrectas | "Email o contraseña incorrectos." |
| Cuenta desactivada | "Tu cuenta fue desactivada. Contactá a Punto Digital." |
| Cuenta sin completar registro | "Completá tu acceso en Registrarse." *(admin pendiente sin pass)* |

---

## 3. Pantalla Ingresar + Registrarse

### ✅ Completado (Paso A — UI)

- Pestañas **Ingresar** / **Registrarse**.
- Ingresar: email + contraseña + botones demo provisorios.
- Registrarse: email + contraseña + confirmar contraseña (sin nombre ni rol).
- Subtítulo contextual en cada pestaña.
- Recordatorio de contacto Punto Digital (`.auth-reminder`).
- Validación cliente en Registrarse (longitud, coincidencia, email ya activo en demo).

### Pendiente (Paso B — lógica demo)

- [ ] Lógica de registro cerrado contra docentes/alumnos/admins pendientes (ver sección 4).

**Formulario Registrarse — campos**

| Campo | Obligatorio |
|-------|-------------|
| Email | Sí |
| Contraseña | Sí (mín. 6) |
| Confirmar contraseña | Sí |

---

## 4. Lógica demo de registro cerrado (pendiente)

Mientras no exista backend, simular el flujo en memoria.

### Fuentes de datos

| Fuente | Uso |
|--------|-----|
| `data.docentes` | Email precargado → rol Docente |
| `data.alumnos` | Email precargado → rol Alumno |
| `demoUsers` / `data.usuariosPendientes` | Admins precargados por referente (sin pass) |
| `demoUsers` (con password) | Cuentas ya activadas → solo Ingresar |

### Algoritmo demo (Registrarse)

```
1. Normalizar email
2. Si ya existe en demoUsers con password → error "ya tiene acceso"
3. Si existe en docentes sin usuario → crear usuario Docente + docenteId
4. Si existe en alumnos sin usuario → crear usuario Alumno + alumnoId
5. Si existe en usuariosPendientes admin → completar password
6. Si no existe en ningún lado → error + recordatorio contacto
```

### Cambios en archivos

- [ ] `demoData.js`: array `usuariosPendientes` (admins creados por referente, sin password).
- [ ] `App.jsx`: pasar `data` a `LoginScreen` para validar emails en docentes/alumnos.
- [ ] `App.jsx`: persistir nuevos usuarios activados en estado (o `localStorage` para demo).
- [ ] Helper `utils/auth.js` con `loginDemo()` y `registerDemo()`.

---

## 5. Indicador cuenta activa / pendiente (pendiente)

- [ ] Ficha docente (`Teachers.jsx`): badge según si email tiene usuario activo.
- [ ] Ficha alumno (`StudentProfile.jsx`): mismo badge.
- [ ] Demo: cruzar email con `demoUsers` / usuarios en sesión.

---

## 6. Gestión de cuentas administrador (pendiente)

### Decisión acordada

- **No** cuenta compartida para los ~4 admins de Punto Digital.
- **Sí** cuenta individual por persona.
- **Un referente** gestiona altas y bajas.
- Baja = `activo = false` (no cambiar contraseñas de todos).
- **Admins nuevos** creados por referente **sí usan Registrarse** (referente no define su contraseña).

### Bootstrap primer admin (backend, futuro)

```env
ADMIN_EMAIL=admin@cultura.gob.ar
ADMIN_INITIAL_PASSWORD=cambiar-en-primer-despliegue
```

Ese admin entra por **Ingresar**, no por Registrarse.

### Front pendiente

- [ ] Vista `AdminUsers.jsx` (solo referente).
- [ ] Alta admin: email + nombre (sin contraseña).
- [ ] Desactivar / activar cuenta.
- [ ] Menú en `App.jsx`: "Usuarios del sistema".

---

## 7. Integración backend (pendiente — cuando exista API)

- [ ] `front/src/api/auth.js` — `POST /auth/login`, `POST /auth/registrar` (o `/auth/activar`).
- [ ] JWT en sessionStorage/localStorage.
- [ ] `VITE_USE_DEMO_AUTH=true` para seguir sin backend en desarrollo.

---

## Próxima implementación en front (sin backend)

Orden propuesto para el siguiente PR / sesión de trabajo:

### ~~Paso A~~ — `LoginScreen.jsx` + estilos ✅
1. ~~Pestañas **Ingresar** / **Registrarse**.~~
2. ~~Formulario Registrarse: email + pass + confirmar (sin nombre ni rol).~~
3. ~~Subtítulo + recordatorio de contacto Punto Digital.~~
4. ~~Mensajes de error de validación cliente.~~

### Paso B — Lógica demo (siguiente)
5. Crear `utils/auth.js` con validación de registro cerrado.
6. Pasar `data` desde `App.jsx` a `LoginScreen`.
7. Agregar `usuariosPendientes` en `demoData.js` (ej. un admin sin activar).
8. Persistir usuarios registrados en la sesión demo.

### Paso C — Indicadores
9. Badge "Cuenta activa" / "Pendiente" en ficha docente y alumno.

### No incluido en esta tanda (requiere backend o más alcance)
- Vista `AdminUsers.jsx`.
- Conexión real a API.
- Ocultar botones demo con variable de entorno (opcional en Paso A).

---

## Checklist por archivo

### `LoginScreen.jsx`
- [x] Ingresar / Registrarse (UX)
- [x] Registro sin rol ni nombre (UI)
- [x] Recordatorio contacto
- [x] Validación cliente (pass, confirmar, email ya activo)
- [ ] Lógica demo registro cerrado (Paso B)
- [ ] API (futuro)

### `Teachers.jsx`
- [x] Email (alta, edición, tabla, ficha)
- [ ] Badge cuenta activada

### `WorkshopForm.jsx`
- [x] Múltiples horarios por día

### `StudentProfile.jsx`
- [ ] Badge cuenta activada

### `demoData.js`
- [x] Email en docentes
- [ ] `usuariosPendientes` para demo de admin

### `App.jsx`
- [ ] Pasar data a LoginScreen
- [ ] Menú Usuarios del sistema (futuro)

### Nuevos
- [ ] `utils/auth.js`
- [ ] `AdminUsers.jsx` (futuro)
- [ ] `api/auth.js` (futuro)

---

## Referencias

- Backend: `back/back_talleres_municipales/DECISIONS.md`
- Demo usuarios: `front/README.md`
- Login actual: `front/src/components/LoginScreen.jsx`
- Docentes: `front/src/views/Teachers.jsx`
