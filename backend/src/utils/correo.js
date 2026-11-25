const correoAlumnoRegex = /^[^\s@]+@alumnos\.ubiobio\.cl$/i

export const esCorreoAlumno = (correo) =>
  typeof correo === 'string' && correoAlumnoRegex.test(correo.trim())
