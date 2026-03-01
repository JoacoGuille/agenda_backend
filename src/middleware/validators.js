import { body, param, query } from "express-validator";
import mongoose from "mongoose";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const validateObjectIdParam = (name = "id") =>
  param(name).custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("ID inválido");
    }
    return true;
  });

export const authRegisterValidator = [
  body("name").trim().notEmpty().withMessage("Nombre requerido"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password mínimo 6 caracteres")
];

export const authLoginValidator = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("Password requerido")
];

export const authForgotValidator = [
  body("email").isEmail().withMessage("Email inválido")
];

export const authResetValidator = [
  body("token").optional().isString().withMessage("Token inválido"),
  body("newPassword")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password mínimo 6 caracteres"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password mínimo 6 caracteres")
];

export const authResendValidator = [
  body("email").isEmail().withMessage("Email inválido")
];

export const createCategoryValidator = [
  body("name").trim().notEmpty().withMessage("Nombre requerido")
];

export const updateCategoryValidator = [
  body("name").optional().trim().notEmpty().withMessage("Nombre requerido"),
  body("color").optional().isString().withMessage("Color inválido")
];

export const createTaskValidator = [
  body("title").trim().notEmpty().withMessage("Título requerido")
];

export const createEventValidator = [
  body("title").trim().notEmpty().withMessage("Título requerido"),
  body("categoryId")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("categoryId inválido");
      }
      return true;
    }),
  body("category")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("category inválido");
      }
      return true;
    }),
  body().custom((_, { req }) => {
    const payload = req.body || {};
    const hasStart =
      payload.startAt ||
      payload.start ||
      payload.startDate ||
      payload.date ||
      payload.fecha;
    if (!hasStart) {
      throw new Error("Inicio requerido");
    }
    return true;
  })
];

export const updateEventValidator = [
  body("title").optional().trim().notEmpty().withMessage("Título requerido"),
  body("categoryId")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("categoryId inválido");
      }
      return true;
    }),
  body("category")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("category inválido");
      }
      return true;
    })
];

export const inviteFriendValidator = [
  body().custom((_, { req }) => {
    const { email, userId } = req.body || {};
    if (!email && !userId) {
      throw new Error("Email o userId requerido");
    }
    if (userId && !isValidObjectId(userId)) {
      throw new Error("userId inválido");
    }
    return true;
  })
];

export const friendRequestValidator = [
  body("requestId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("requestId inválido");
    }
    return true;
  })
];

export const createGroupValidator = [
  body("name").trim().notEmpty().withMessage("Nombre requerido")
];

export const inviteGroupValidator = [
  body().custom((_, { req }) => {
    const { email, userId } = req.body || {};
    if (!email && !userId) {
      throw new Error("Email o userId requerido");
    }
    if (userId && !isValidObjectId(userId)) {
      throw new Error("userId inválido");
    }
    return true;
  })
];

export const updateGroupValidator = [
  body("name").optional().trim().notEmpty().withMessage("Nombre requerido")
];

export const joinGroupValidator = [
  query("token").optional().isString(),
  query("groupId")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("groupId inválido");
      }
      return true;
    }),
  body("token").optional().isString(),
  body("groupId")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("groupId inválido");
      }
      return true;
    }),
  body().custom((_, { req }) => {
    const token = req.body?.token ?? req.query.token;
    const groupId = req.body?.groupId ?? req.query.groupId ?? req.body?.id;
    if (!token || !groupId) {
      throw new Error("Token y grupo son obligatorios");
    }
    return true;
  })
];

export const notificationIdParamValidator = [
  validateObjectIdParam("id")
];

export const groupIdParamValidator = [
  validateObjectIdParam("id")
];

export const categoryIdParamValidator = [
  validateObjectIdParam("id")
];

export const eventIdParamValidator = [
  validateObjectIdParam("id")
];

export const friendIdParamValidator = [
  validateObjectIdParam("id")
];
