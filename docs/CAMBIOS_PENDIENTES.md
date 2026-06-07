# Cambios pendientes — Frontend

Documento de mejoras acordadas para alinear el frontend con el backend real y el flujo de autenticación definido en `back/back_talleres_municipales/DECISIONS.md`.

**Estado actual:** versión demo con datos en memoria (`demoData.js`), login simulado y registro abierto por rol.

**Objetivo:** preparar el front para integrarse con la API y respetar el sistema cerrado (sin registro público).

---

## Resumen de cambios

| # | Cambio | Prioridad | Archivos principales |
|---|--------|-----------|----------------------|
| 1 | Agregar email en gestión de docentes | Alta | `Teachers.jsx`, `demoData.js` |
| 2 | Reemplazar "Registro" por "Activar cuenta" | Alta | `LoginScreen.jsx` |
| 3 | Conectar login y activación al backend | Alta | `LoginScreen.jsx`, nuevo `api/` o servicios |
| 4 | Gestión de cuentas admin (varias cuentas + baja) | Media | Nueva vista `AdminUsers.jsx`, `App.jsx` |
| 5 | Indicador de cuenta activada en docentes/alumnos | Media | `Teachers.jsx`, `StudentProfile.jsx` |
| 6 | Mantener demo provisoria para desarrollo | Baja | `LoginScreen.jsx`, `demoData.js` |

---

## 1. Email en docentes

### Situación actual

- **Alumnos:** ya tienen campo email en alta, tabla, búsqueda y ficha (`Students.jsx`, `StudentProfile.jsx`).
- **Docentes:** solo nombre, apellido y teléfono (`Teachers.jsx`). Los datos demo tampoco incluyen email.

### Por qué hace falta

El flujo de activación del backend exige que el admin cargue el email del docente **antes** de que esa persona pueda crear su usuario:

```
Admin registra docente (con email)  →  docente existe, sin usuario
Docente va a Activar cuenta         →  se crea usuario vinculado al docente
```

Sin email en el formulario de docentes, el docente nunca podría activar su cuenta.

### Cambios a realizar

**`front/src/views/Teachers.jsx`**

- [ ] Agregar `email` a `emptyForm` y `editForm`.
- [ ] Campo email en formulario de alta (toolbar).
- [ ] Campo email en modal de edición.
- [ ] Validación de formato (misma regex que en `Students.jsx`).
- [ ] Validar que no se repita email entre docentes.
- [ ] Mostrar email en la tabla de docentes (nueva columna).
- [ ] Mostrar email en la ficha del docente.
- [ ] Opcional: badge **Cuenta activada** / **Pendiente de activación** (cuando exista integración con backend).

**`front/src/data/demoData.js`**

- [ ] Agregar email a cada docente demo (ej. `paula.herrera@punto.digital` para id 1).
- [ ] Alinear el email del docente demo con `demoUsers` (Paula Herrera → `docenteId: 1`).

### Referencia backend

Ver `DECISIONS.md` → *Flujo de creación de cuentas (dos pasos)*.

> Nota: conviene agregar `email` al modelo `Docente` en el backend si aún no está (hay una inconsistencia en `DECISIONS.md`: la tabla de campos no lo lista, pero el flujo de activación sí lo requiere).

---

## 2. Login: de "Registro" a "Activar cuenta"

### Situación actual

`LoginScreen.jsx` tiene dos pestañas:

- **Login:** email + contraseña (correcto para producción).
- **Registro:** nombre, email, contraseña y **selector de rol** (Administrador / Docente / Alumno).

El registro actual es abierto: cualquiera puede crear una cuenta con cualquier rol. Eso es solo para la demo.

### Por qué cambiar

El sistema es **cerrado**: nadie se registra libremente. Solo pueden activar cuenta quienes el admin ya cargó en docentes o alumnos.

Los administradores **no** usan activación: sus cuentas se crean por seed o por el referente del área (ver sección 4).

### Cambios a realizar

**`front/src/components/LoginScreen.jsx`**

- [ ] Renombrar pestaña "Registro" → **"Activar cuenta"**.
- [ ] Quitar campos: nombre, selector de rol.
- [ ] Formulario de activación: **email** + **contraseña nueva** + **confirmar contraseña**.
- [ ] Mensajes de error alineados con el backend:
  - "Email no registrado en el sistema"
  - "La cuenta ya fue activada"
  - "Las contraseñas no coinciden"
- [ ] Mantener botones de acceso rápido demo **solo en desarrollo** (opcional: ocultar con variable de entorno).
- [ ] Eliminar la lógica que crea usuarios en memoria con rol elegido (`submitRegister` actual).

### Flujo esperado (producción)

```
Usuario ingresa email + elige contraseña
  → POST /auth/activar
  → Backend valida email en docentes/alumnos
  → Crea usuario y vincula docente_id o alumno_id
  → Redirige a login o inicia sesión directamente
```

---

## 3. Integración con el backend (auth)

### Situación actual

El login busca credenciales en `demoUsers` (array en memoria). No hay llamadas a la API.

### Cambios a realizar

- [ ] Crear capa de servicios API (ej. `front/src/api/auth.js` o `services/auth.js`).
- [ ] `POST /auth/login` — email + password → JWT + datos del usuario.
- [ ] `POST /auth/activar` — email + password → crea cuenta vinculada.
- [ ] Guardar token (sessionStorage o localStorage; definir estrategia).
- [ ] Enviar token en headers de requests protegidas.
- [ ] Manejar expiración / cierre de sesión.
- [ ] Mantener modo demo: flag `VITE_USE_DEMO_AUTH=true` para seguir probando sin backend.

### Estado de sesión

Tras login exitoso, el front debe conocer:

| Campo | Uso |
|-------|-----|
| `rol` | Mostrar menú y vistas por rol |
| `docente_id` | Vincular sesión docente con sus talleres |
| `alumno_id` | Vincular sesión alumno con sus inscripciones |
| `nombre` | Mostrar en header / perfil |

---

## 4. Gestión de cuentas administrador

### Decisión acordada

- **No** usar una sola cuenta compartida para los ~4 admins de Punto Digital.
- **Sí** usar una cuenta individual por persona.
- **Un referente** del área gestiona altas y bajas de cuentas admin.
- Si alguien renuncia o lo echan: **desactivar su cuenta** (`activo = false`), no cambiar contraseñas de todos.

### Por qué no una cuenta única

| Problema | Con cuenta compartida |
|----------|----------------------|
| Auditoría | No se sabe quién hizo cada acción |
| Alguien se va | Hay que cambiar la pass de todos |
| Riesgo | Un ex-empleado puede cambiar la pass y bloquear al equipo |
| Seguridad | Cuatro personas conocen la misma credencial |

### Bootstrap del primer admin (backend)

La primera cuenta admin se crea al instalar el sistema:

- Email y contraseña inicial vienen de variables de entorno (`.env`), **no** hardcodeadas en código.
- El backend hashea la contraseña y la guarda en `usuarios`.
- El referente cambia la contraseña en el primer acceso.

```env
# .env (ejemplo — no commitear valores reales)
ADMIN_EMAIL=admin@cultura.gob.ar
ADMIN_INITIAL_PASSWORD=cambiar-en-primer-despliegue
```

### Cambios a realizar en el front

**Nueva vista: gestión de usuarios admin** (solo para referente)

- [ ] Crear vista `AdminUsers.jsx` (o sección en configuración).
- [ ] Listar usuarios con rol `Administrador`.
- [ ] Alta: email + nombre (sin contraseña — la persona la elige al activar, o se envía pass temporal).
- [ ] Acción **Desactivar / Activar** cuenta.
- [ ] Mostrar estado: activo / inactivo.
- [ ] Restringir acceso: solo admins con permiso `puede_gestionar_usuarios` (referente).

**`App.jsx`**

- [ ] Agregar ruta/menú "Usuarios del sistema" (visible solo para referente admin).
- [ ] Ocultar para docentes y alumnos.

### Flujo operativo (equipo Punto Digital)

```
1. Instalación → seed crea cuenta del referente
2. Referente entra → crea cuentas de los otros 3 admins
3. Cada uno activa / define su contraseña
4. Alguien se va → referente desactiva esa cuenta
5. Entra alguien nuevo → referente crea cuenta nueva
```

---

## 5. Indicador de cuenta activada (docentes y alumnos)

### Situación actual

No se muestra si un docente o alumno ya activó su cuenta de acceso al sistema.

### Cambios a realizar

- [ ] En ficha de docente: badge **Cuenta activa** / **Pendiente de activación**.
- [ ] En ficha de alumno (`StudentProfile.jsx`): mismo indicador.
- [ ] Fuente del dato: backend (existencia de `usuario` vinculado con `activo = true`).
- [ ] En demo: simular con flag local o cruzar con `demoUsers` por email.

---

## 6. Demo provisoria (mantener durante desarrollo)

Mientras el backend no esté listo, conviene conservar la capacidad de probar vistas por rol.

### Recomendación

- Variable `VITE_USE_DEMO_AUTH=true` en `.env.local` del front.
- Si está activa: botones de acceso rápido (Administrador / Docente / Alumno) y `demoUsers`.
- Si está inactiva: solo login real y activación contra API.

Los botones provisorios y el registro abierto **no deben ir a producción**.

---

## Checklist por archivo

### `LoginScreen.jsx`
- [ ] Pestaña Activar cuenta (reemplaza Registro)
- [ ] Quitar selector de rol y registro abierto
- [ ] Integrar `POST /auth/login` y `POST /auth/activar`
- [ ] Botones demo condicionados a entorno

### `Teachers.jsx`
- [ ] Campo email (alta, edición, tabla, ficha)
- [ ] Validación de email
- [ ] Indicador cuenta activada (cuando haya API)

### `Students.jsx` / `StudentProfile.jsx`
- [ ] Indicador cuenta activada (email ya existe)
- [ ] Sin cambios estructurales en email de alumnos

### `demoData.js`
- [ ] Email en docentes demo
- [ ] Coherencia con `demoUsers`

### `App.jsx`
- [ ] Ruta y menú "Usuarios del sistema" (referente)
- [ ] Protección de rutas según rol y permisos

### Nuevo: `AdminUsers.jsx` + `api/auth.js`
- [ ] Vista gestión admins
- [ ] Servicios de autenticación

---

## Orden sugerido de implementación

1. **Email en docentes** — cambio local, no depende del backend.
2. **Activar cuenta en login** — UI lista antes de conectar API.
3. **Integración auth con backend** — cuando existan endpoints.
4. **Gestión de admins** — cuando exista endpoint de usuarios.
5. **Indicadores de activación** — cuando el backend devuelva estado de cuenta.

---

## Referencias

- Backend: `back/back_talleres_municipales/DECISIONS.md` (autenticación, roles, activación, modelo `Usuario`)
- Demo actual: `front/README.md` (usuarios de prueba)
- Alumnos con email: `front/src/views/Students.jsx`
- Docentes sin email: `front/src/views/Teachers.jsx`
- Login actual: `front/src/components/LoginScreen.jsx`
