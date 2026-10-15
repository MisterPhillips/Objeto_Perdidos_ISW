import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const usuarios = [
  {
    nombre: 'Administrador de prueba',
    correo: 'admin@admin.test',
    rol: 'ADMIN',
  },
  {
    nombre: 'Funcionario de prueba',
    correo: 'funcionario@funcionario.test',
    rol: 'FUNCIONARIO',
  },
  {
    nombre: 'Usuario de prueba',
    correo: 'usuario@usuario.test',
    rol: 'ESTUDIANTE',
  },
];

const main = async () => {
  const contrasenaDePrueba = await bcrypt.hash('login123', 10);

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { correo: usuario.correo },
      update: {
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: true,
        contrasena: contrasenaDePrueba,
      },
      create: {
        ...usuario,
        contrasena: contrasenaDePrueba,
      },
    });
  }

  console.log('Seed completada: usuarios de prueba creados o actualizados.');
  console.log('Contraseña para los tres usuarios: login123');
};

main()
  .catch((error) => {
    console.error('Error al ejecutar la seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
