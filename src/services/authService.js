import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  createUser,
  findUserByEmail,
  findUserByResetToken,
  findUserByVerificationToken,
  updateUserById
} from "../repositories/userRepository.js";

export const registerUser = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Usuario ya existe");

  const hashed = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  const user = await createUser({
    name,
    email,
    password: hashed,
    verificationToken: token
  });

  return { user, token };
};

export const verifyAccount = async (token) => {
  const user = await findUserByVerificationToken(token);
  if (!user) throw new Error("Token inválido");

  await updateUserById(user._id, {
    isVerified: true,
    verificationToken: null
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Credenciales inválidas");
  if (!user.isVerified) throw new Error("Cuenta no verificada");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Credenciales inválidas");

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
};

export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Usuario no encontrado");

  const resetToken = crypto.randomBytes(32).toString("hex");

  await updateUserById(user._id, {
    resetPasswordToken: resetToken,
    resetPasswordExpires: Date.now() + 3600000
  });

  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  const user = await findUserByResetToken(token);

  if (!user) throw new Error("Token inválido o expirado");

  const hashed = await bcrypt.hash(newPassword, 10);
  await updateUserById(user._id, {
    password: hashed,
    resetPasswordToken: null,
    resetPasswordExpires: null
  });
};

export const resendVerification = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Usuario no encontrado");
  if (user.isVerified) throw new Error("La cuenta ya está verificada");

  const token = crypto.randomBytes(32).toString("hex");
  await updateUserById(user._id, { verificationToken: token });

  return { user, token };
};
