import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg
  }));

  return res.status(400).json({
    message: "Datos inválidos",
    errors
  });
};
