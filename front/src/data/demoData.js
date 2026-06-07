export const DIAS_TALLER = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export const DISTRITOS_SAN_RAFAEL = [
  "Ciudad",
  "25 de Mayo",
  "Canada Seca",
  "Cuadro Benegas",
  "Cuadro Nacional",
  "El Cerrito",
  "El Nihuil",
  "El Sosneado",
  "Goudge",
  "La Llave",
  "Las Malvinas",
  "Las Paredes",
  "Monte Coman",
  "Punta del Agua",
  "Rama Caida",
  "Real del Padre",
  "Villa Atuel",
  "Villa 25 de Mayo"
];

export const demoUsers = [
  { id: 1, nombre: "Admin San Rafael", email: "admin@punto.digital", password: "admin123", role: "Administrador" },
  { id: 2, nombre: "Paula Herrera", email: "paula.herrera@punto.digital", password: "docente123", role: "Docente", docenteId: 1 },
  { id: 3, nombre: "Ana Gomez", email: "ana.gomez@punto.digital", password: "alumno123", role: "Alumno", alumnoId: 1 }
];

const getToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const nombresDocentes = [
  ["Paula", "Herrera"], ["Matias", "Roman"], ["Cristina", "Rojas"], ["Ruben", "Alvarez"], ["Carolina", "Vega"],
  ["Sebastian", "Molina"], ["Marcela", "Silva"], ["Federico", "Quiroga"], ["Noelia", "Castro"], ["Hernan", "Morales"],
  ["Gabriela", "Pereyra"], ["Diego", "Sosa"], ["Laura", "Navarro"], ["Javier", "Campos"], ["Natalia", "Godoy"],
  ["Emiliano", "Funes"], ["Mariana", "Luna"], ["Rodrigo", "Aguirre"], ["Daniela", "Ortega"], ["Pablo", "Ponce"],
  ["Valeria", "Bravo"], ["Sergio", "Suarez"], ["Andrea", "Roldan"], ["Gustavo", "Acosta"], ["Florencia", "Miranda"],
  ["Mauricio", "Cortez"], ["Patricia", "Ibarra"], ["Leandro", "Diaz"], ["Cecilia", "Torres"], ["Rocio", "Fernandez"],
  ["Lucas", "Romero"], ["Micaela", "Gimenez"], ["Martin", "Ferreyra"], ["Julieta", "Vargas"], ["Esteban", "Nunez"],
  ["Silvina", "Dominguez"], ["Adrian", "Benitez"], ["Lorena", "Mendez"], ["Nicolas", "Ojeda"], ["Claudia", "Carrizo"]
];

export const docentes = nombresDocentes.map(([nombre, apellido], index) => ({
  id: index + 1,
  nombre,
  apellido,
  telefono: `2604${String(550071 + index).padStart(6, "0")}`,
  email: index === 0
    ? "paula.herrera@punto.digital"
    : `${nombre.toLowerCase()}.${apellido.toLowerCase()}@punto.digital`
}));

const talleresBase = [
  ["Pintura Inicial", "Arte"], ["Carpinteria", "Oficios"], ["Guitarra", "Musica"], ["Circuitos Electricos", "Oficios"],
  ["Reparacion de Aires Acondicionados", "Oficios"], ["Danzas", "Arte"], ["Programacion Basica", "Tecnologia"], ["Robotica Educativa", "Tecnologia"],
  ["Fotografia Digital", "Comunicacion"], ["Diseno Grafico", "Tecnologia"], ["Ingles Inicial", "Idiomas"], ["Apoyo Escolar Primario", "Educacion"],
  ["Apoyo Escolar Secundario", "Educacion"], ["Cocina Saludable", "Oficios"], ["Panaderia Artesanal", "Oficios"], ["Costura y Molderia", "Oficios"],
  ["Peluqueria Inicial", "Oficios"], ["Maquillaje Social", "Oficios"], ["Huerta Urbana", "Ambiente"], ["Reciclado Creativo", "Ambiente"],
  ["Yoga Comunitario", "Salud"], ["Actividad Fisica Adultos", "Salud"], ["Folklore", "Arte"], ["Teatro Comunitario", "Arte"],
  ["Canto Coral", "Musica"], ["Percusion", "Musica"], ["Marketing Digital", "Tecnologia"], ["Excel para Gestion", "Tecnologia"],
  ["Alfabetizacion Digital", "Tecnologia"], ["Tramites Digitales", "Tecnologia"], ["Impresion 3D", "Tecnologia"], ["Electricidad Domiciliaria", "Oficios"],
  ["Soldadura Inicial", "Oficios"], ["Mecanica de Bicicletas", "Oficios"], ["Ceramica", "Arte"], ["Mosaiquismo", "Arte"],
  ["Jardineria", "Ambiente"], ["Primeros Auxilios", "Salud"], ["Emprendedurismo", "Gestion"], ["Administracion para Emprendedores", "Gestion"]
];

const direcciones = [
  "Av. Mitre 120", "Taller Municipal 4", "Casa de la Cultura", "SUM Rama Caida", "Centro Integrador",
  "Polideportivo 2", "Punto Digital Central", "Biblioteca Popular", "SUM Distrital", "Delegacion Municipal"
];

const horariosModelos = [
  [
    { dia: "Lunes", inicio: "09:00", fin: "11:00" },
    { dia: "Lunes", inicio: "18:00", fin: "20:00" },
    { dia: "Miercoles", inicio: "18:30", fin: "20:00" }
  ],
  [
    { dia: "Martes", inicio: "10:00", fin: "12:00" },
    { dia: "Martes", inicio: "16:00", fin: "18:00" },
    { dia: "Jueves", inicio: "09:30", fin: "11:30" }
  ],
  [{ dia: "Viernes", inicio: "16:30", fin: "18:00" }],
  [{ dia: "Lunes", inicio: "14:00", fin: "16:00" }],
  [{ dia: "Sabado", inicio: "18:30", fin: "20:30" }],
  [{ dia: "Miercoles", inicio: "17:00", fin: "19:00" }, { dia: "Viernes", inicio: "18:00", fin: "20:00" }],
  [{ dia: "Martes", inicio: "15:00", fin: "17:00" }],
  [{ dia: "Jueves", inicio: "18:00", fin: "20:00" }],
  [{ dia: "Lunes", inicio: "09:00", fin: "11:00" }, { dia: "Jueves", inicio: "09:00", fin: "11:00" }],
  [{ dia: "Sabado", inicio: "10:00", fin: "12:00" }]
];

export const talleres = talleresBase.map(([nombre, tipo], index) => {
  const horarios = horariosModelos[index % horariosModelos.length];
  return {
    id: index + 1,
    nombre,
    tipo,
    direccion: direcciones[index % direcciones.length],
    distrito: DISTRITOS_SAN_RAFAEL[index % DISTRITOS_SAN_RAFAEL.length],
    dias: horarios.map((h) => h.dia),
    horarios,
    estado: "Activo",
    docenteId: index + 1
  };
});

const nombres = [
  ["Ana", "F"], ["Carlos", "M"], ["Lucia", "F"], ["Mateo", "M"], ["Sofia", "F"],
  ["Valentina", "F"], ["Agustin", "M"], ["Camila", "F"], ["Tomas", "M"], ["Martina", "F"],
  ["Joaquin", "M"], ["Emilia", "F"], ["Benjamin", "M"], ["Mia", "F"], ["Thiago", "M"],
  ["Juana", "F"], ["Santino", "M"], ["Delfina", "F"], ["Bautista", "M"], ["Catalina", "F"],
  ["Lautaro", "M"], ["Renata", "F"], ["Facundo", "M"], ["Olivia", "F"], ["Bruno", "M"],
  ["Malena", "F"], ["Ignacio", "M"], ["Abril", "F"], ["Franco", "M"], ["Victoria", "F"],
  ["Gael", "M"], ["Josefina", "F"], ["Pedro", "M"], ["Clara", "F"], ["Manuel", "M"],
  ["Bianca", "F"], ["Ramiro", "M"], ["Elena", "F"], ["Nicolas", "M"], ["Julieta", "F"]
];

const apellidos = [
  "Gomez", "Diaz", "Torres", "Fernandez", "Rojas", "Morales", "Castro", "Vega", "Navarro", "Sosa",
  "Romero", "Herrera", "Pereyra", "Quiroga", "Molina", "Silva", "Aguirre", "Campos", "Funes", "Luna",
  "Ortega", "Ponce", "Bravo", "Suarez", "Roldan", "Acosta", "Miranda", "Cortez", "Ibarra", "Godoy",
  "Gimenez", "Ferreyra", "Vargas", "Nunez", "Dominguez", "Benitez", "Mendez", "Ojeda", "Carrizo", "Lucero",
  "Barroso", "Bustos", "Escudero", "Correa", "Arce", "Sanchez", "Medina", "Vera", "Tapia", "Rivero"
];

const totalAlumnos = 500;

export const alumnos = Array.from({ length: totalAlumnos }, (_, index) => {
  const id = index + 1;
  const [nombreBase, sexo] = nombres[index % nombres.length];
  const apellidoBase = apellidos[(index * 7) % apellidos.length];
  const nombre = id === 1 ? "Ana" : nombreBase;
  const apellido = id === 1 ? "Gomez" : apellidoBase;
  const year = 1998 + (index % 16);
  const month = String((index % 12) + 1).padStart(2, "0");
  const day = String((index % 27) + 1).padStart(2, "0");
  return {
    id,
    nombre,
    apellido,
    dni: String(30000000 + index * 97).padStart(8, "0"),
    telefono: `2604${String(600000 + index).padStart(6, "0")}`,
    fechaNacimiento: `${year}-${month}-${day}`,
    email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${id}@demo.com`,
    sexo
  };
});

export const inscripciones = alumnos.map((alumno, index) => ({
  alumnoId: alumno.id,
  tallerId: (index % talleres.length) + 1,
  fechaInscripcion: `2026-03-${String((index % 24) + 1).padStart(2, "0")}`,
  estado: "Activo",
  fechaBaja: null,
  motivoBaja: null
}));

const estados = ["Presente", "Presente", "Presente", "Ausente", "AusenteJustificado", "Feriado"];
const fechaHoy = getToday();

export const asistencias = inscripciones
  .filter((_, index) => index % 4 !== 0)
  .map((inscripcion, index) => ({
    alumnoId: inscripcion.alumnoId,
    tallerId: inscripcion.tallerId,
    fecha: fechaHoy,
    estadoAsistencia: estados[index % estados.length],
    docenteId: talleres.find((t) => t.id === inscripcion.tallerId)?.docenteId || null
  }));

export const initialData = {
  docentes,
  talleres,
  alumnos,
  inscripciones,
  asistencias,
  historial: []
};
