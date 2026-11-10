import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma.js';

const usuariosSeed = [
  {
    nombre: 'Administrador de prueba',
    rut: '11111111-1',
    correo: 'admin@admin.cl',
    contrasena: 'admin123',
    rol: 'ADMIN',
  },
  {
    nombre: 'Funcionario de prueba',
    rut: '22222222-2',
    correo: 'funcionario@funcionario.cl',
    contrasena: 'funcionario123',
    rol: 'FUNCIONARIO',
  },
  {
    nombre: 'Estudiante de prueba',
    rut: '33333333-3',
    correo: 'estudiante@estudiante.cl',
    contrasena: 'estudiante123',
    rol: 'ESTUDIANTE',
  },
];

const categoriasSeed = [
  {
    nombre: 'Electrónica',
    descripcion: 'Dispositivos y accesorios electrónicos.',
  },
  {
    nombre: 'Accesorios personales',
    descripcion: 'Accesorios de uso personal.',
  },
];

const puntosRetiroSeed = [
  {
    nombre: 'FACE',
    facultad: 'FACE',
    habilitado: true,
    latitud: -36.8217798015008,
    longitud: -73.0110812187195,
  },
  {
    nombre: 'GANTES',
    facultad: 'GANTES',
    habilitado: true,
    latitud: -36.82180556691236,
    longitud: -73.014053106308,
  },
  {
    nombre: 'SALAS AB',
    facultad: 'SALAS AB',
    habilitado: true,
    latitud: -36.82229618163532,
    longitud: -73.01141917705537,
  },
  {
    nombre: 'SALA AC',
    facultad: 'SALA AC',
    habilitado: true,
    latitud: -36.82256510587649,
    longitud: -73.01114290952684,
  },
];

const objetosSeed = [
  {
    descripcion: 'Notebook negro de prueba',
    categoria: 'Electrónica',
    puntoRetiro: 'FACE',
  },
  {
    descripcion: 'Llavero azul de prueba',
    categoria: 'Accesorios personales',
    puntoRetiro: 'GANTES',
  },
];

const obtenerOCrearObjeto = async (datos, registradoPorId) => {
  const [categoria, puntoRetiro] = await Promise.all([
    prisma.categoria.findUnique({ where: { nombre: datos.categoria } }),
    prisma.puntoRetiro.findUnique({ where: { nombre: datos.puntoRetiro } }),
  ]);

  if (!categoria || !puntoRetiro) {
    throw new Error(`No se encontraron relaciones para el objeto "${datos.descripcion}".`);
  }

  const objetoExistente = await prisma.objeto.findFirst({
    where: { descripcion: datos.descripcion, registradoPorId },
  });

  if (objetoExistente) {
    return prisma.objeto.update({
      where: { id: objetoExistente.id },
      data: {
        categoriaId: categoria.id,
        puntoRetiroId: puntoRetiro.id,
      },
    });
  }

  return prisma.objeto.create({
    data: {
      descripcion: datos.descripcion,
      categoriaId: categoria.id,
      puntoRetiroId: puntoRetiro.id,
      registradoPorId,
    },
  });
};

const seed = async () => {
  const contrasenasHasheadas = new Map(
    await Promise.all(
      usuariosSeed.map(async (usuario) => [usuario.correo, await bcrypt.hash(usuario.contrasena, 10)]),
    ),
  );

  const usuarios = {};
  for (const datos of usuariosSeed) {
    const contrasena = contrasenasHasheadas.get(datos.correo);
    usuarios[datos.rol] = await prisma.usuario.upsert({
      where: { correo: datos.correo },
      update: {
        nombre: datos.nombre,
        rut: datos.rut,
        contrasena,
        rol: datos.rol,
        activo: true,
      },
      create: {
        nombre: datos.nombre,
        rut: datos.rut,
        correo: datos.correo,
        contrasena,
        rol: datos.rol,
      },
    });
  }

  for (const datos of categoriasSeed) {
    await prisma.categoria.upsert({
      where: { nombre: datos.nombre },
      update: {
        descripcion: datos.descripcion,
        activa: true,
      },
      create: datos,
    });
  }

  for (const datos of puntosRetiroSeed) {
    await prisma.puntoRetiro.upsert({
      where: { nombre: datos.nombre },
      update: {
        facultad: datos.facultad,
        habilitado: datos.habilitado,
        latitud: datos.latitud,
        longitud: datos.longitud,
      },
      create: datos,
    });
  }

  for (const datos of objetosSeed) {
    await obtenerOCrearObjeto(datos, usuarios.FUNCIONARIO.id);
  }

  console.log('Seed de desarrollo ejecutada correctamente.');
};

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
