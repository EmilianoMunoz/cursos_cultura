# Sistema Punto Digital 

Aplicacion web de gestion para talleres municipales (Municipalidad de San Rafael), con foco en:

- Gestion de talleres, docentes y alumnos
- Registro y control de asistencia por rol
- Reportes exportables
- Interfaz moderna en React, Bootstrap y Vite

## Estructura principal

- `front/`: frontend React completo
- `docs/`: documentacion de relevamiento

## Como ejecutar

No requiere backend para esta version demo.

1. Entrar a `front/`.
2. Ejecutar `npm install` si todavia no estan instaladas las dependencias.
3. Ejecutar `npm run dev`.
4. Abrir la URL local que muestra Vite.
5. Cambiar de rol usando los botones provisorios de login.

                        
## Notas

- Es una version de frontend/demo sin base de datos real.
- Algunas reglas y datos estan simulados en memoria para mostrar flujo funcional.
- El prototipo HTML/CSS/JS anterior fue reemplazado por la version React.

## Usuarios de prueba (login)

Por ahora el login tiene botones provisorios por rol para facilitar la revision de vistas.

### Administrador

- **Email:** `admin@punto.digital`
- **Contraseña:** `admin123`

### Docente vigente (Paula Herrera)

- **Email:** `paula.herrera@punto.digital`
- **Contraseña:** `docente123`

Al iniciar sesion, Paula queda vinculada al docente `id: 1` del estado de la app (los talleres que el admin le asigne con ese docente en **Gestion talleres**, por defecto **Pintura Inicial**).

### Alumno (Ana Gomez)

- **Email:** `ana.gomez@punto.digital`
- **Contraseña:** `alumno123`

Queda vinculada al alumno demo del estado inicial.
