export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function findActivatedUser(usuarios, email) {
  const normalized = normalizeEmail(email);
  return (usuarios || []).find((u) => normalizeEmail(u.email) === normalized) || null;
}

export function validateRegisterInput({ email, password, confirmPassword }) {
  const normalized = normalizeEmail(email);
  if (!normalized) return { ok: false, error: "Completa tu email." };
  if ((password || "").length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  if (password !== confirmPassword) return { ok: false, error: "Las contraseñas no coinciden." };
  return { ok: true, email: normalized };
}

export function loginDemo(data, email, password) {
  const normalized = normalizeEmail(email);
  const user = findActivatedUser(data.usuarios, normalized);

  if (!user) {
    const pendiente = (data.usuariosPendientes || []).find((u) => normalizeEmail(u.email) === normalized && u.activo !== false);
    if (pendiente) {
      return { ok: false, error: "Tu acceso esta pendiente. Contactá al equipo de Cultura." };
    }
    return { ok: false, error: "Email o contraseña incorrectos." };
  }

  if (user.activo === false) {
    return { ok: false, error: "Tu cuenta fue desactivada. Contactá a Punto Digital." };
  }

  if (user.password !== password) {
    return { ok: false, error: "Email o contraseña incorrectos." };
  }

  return { ok: true, user };
}

export function registerDemo(data, email, password) {
  const normalized = normalizeEmail(email);

  if (findActivatedUser(data.usuarios, normalized)) {
    return { ok: false, error: "Este email ya tiene acceso. Usá Ingresar." };
  }

  const docente = (data.docentes || []).find((d) => normalizeEmail(d.email) === normalized);
  if (docente) {
    return {
      ok: true,
      user: {
        id: Date.now(),
        nombre: `${docente.nombre} ${docente.apellido}`.trim(),
        email: normalized,
        password,
        role: "Docente",
        docenteId: docente.id,
        activo: true
      },
      source: "docente"
    };
  }

  const alumno = (data.alumnos || []).find((a) => normalizeEmail(a.email) === normalized);
  if (alumno) {
    return {
      ok: true,
      user: {
        id: Date.now(),
        nombre: `${alumno.nombre} ${alumno.apellido}`.trim(),
        email: normalized,
        password,
        role: "Alumno",
        alumnoId: alumno.id,
        activo: true
      },
      source: "alumno"
    };
  }

  const pendiente = (data.usuariosPendientes || []).find((u) => normalizeEmail(u.email) === normalized);
  if (pendiente) {
    if (pendiente.activo === false) {
      return { ok: false, error: "Tu cuenta fue desactivada. Contactá a Punto Digital." };
    }
    return {
      ok: true,
      user: {
        id: pendiente.id,
        nombre: pendiente.nombre,
        email: normalized,
        password,
        role: "Administrador",
        puedeGestionarUsuarios: Boolean(pendiente.puedeGestionarUsuarios),
        activo: true
      },
      source: "admin-pendiente",
      pendienteId: pendiente.id
    };
  }

  return { ok: false, error: "Email no registrado en el sistema. Contactá a Punto Digital." };
}

export function cuentaActivaPorEmail(data, email) {
  const user = findActivatedUser(data.usuarios, email);
  return Boolean(user && user.activo !== false);
}

export function estadoCuentaAcceso(data, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return { estado: "sin-email", label: "Sin email", className: "is-neutral" };
  }
  const user = findActivatedUser(data.usuarios, normalized);
  if (user) {
    if (user.activo === false) {
      return { estado: "inactiva", label: "Cuenta inactiva", className: "is-danger" };
    }
    return { estado: "activa", label: "Cuenta activa", className: "is-ok" };
  }
  return { estado: "pendiente", label: "Pendiente de activacion", className: "is-warn" };
}
