// middlewares/roles.middleware.js
export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado." });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        error: "No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
};

export const soloFuncionario = permitirRoles("FUNCIONARIO");
export const soloEstudiante = permitirRoles("ESTUDIANTE");
export const soloAdmin = permitirRoles("ADMIN");