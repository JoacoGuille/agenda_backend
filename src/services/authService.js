import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Usuario ya existe");

  const hashed = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    password: hashed,
    verificationToken: token
  });

  return { user, token };
};

export const verifyAccount = async (token) => {
  const user = await User.findOne({ verificationToken: token });
  if (!user) throw new Error("Token inválido");

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
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
  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();

  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) throw new Error("Token inválido o expirado");

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();
};

export const resendVerification = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");
  if (user.isVerified) throw new Error("La cuenta ya está verificada");

  const token = crypto.randomBytes(32).toString("hex");
  user.verificationToken = token;
  await user.save();

  return { user, token };
};
