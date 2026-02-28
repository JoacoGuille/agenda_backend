import * as authService from "../services/authService.js";
import { sendEmail } from "../utils/email.js";
import {
  buildResetEmail,
  buildVerificationEmail
} from "../utils/emailTemplates.js";

export const register = async (req, res) => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    const frontendBaseUrl =
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      `http://localhost:${process.env.PORT || 4000}`;
    const verificationLink = `${frontendBaseUrl}/verify?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Confirmá tu cuenta en U-Proyect",
      html: buildVerificationEmail({ name: user.name, url: verificationLink })
    });

    res.status(201).json({
      message: "Usuario creado. Revisá tu email para verificar la cuenta.",
      userId: user._id
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const token = req.query.token || req.params.token;
    if (!token) {
      return res.status(400).json({ message: "Token requerido" });
    }
    await authService.verifyAccount(token);
    res.json({ message: "Cuenta verificada correctamente" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const forgot = async (req, res) => {
  try {
    const resetToken = await authService.forgotPassword(req.body.email);

    const appBaseUrl =
      process.env.APP_URL ||
      process.env.API_URL ||
      `http://localhost:${process.env.PORT || 4000}`;
    const resetLink = `${appBaseUrl}/reset?token=${resetToken}`;

    await sendEmail({
      to: req.body.email,
      subject: "Restablecer contraseña - U-Proyect",
      html: buildResetEmail({ url: resetLink })
    });

    res.json({ message: "Email de recuperación enviado correctamente." });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const reset = async (req, res) => {
  try {
    const token = req.body.token || req.params.token;
    const newPassword = req.body.newPassword || req.body.password;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token y contraseña requeridos" });
    }

    await authService.resetPassword(token, newPassword);
    res.json({ message: "Password actualizada correctamente." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const { user, token } = await authService.resendVerification(email);

    const frontendBaseUrl =
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      `http://localhost:${process.env.PORT || 4000}`;
    const verificationLink = `${frontendBaseUrl}/verify?token=${token}`;

    sendEmail({
      to: user.email,
      subject: "Confirmá tu cuenta en U-Proyect",
      html: buildVerificationEmail({ name: user.name, url: verificationLink })
    }).catch((err) => {
      console.error("Error enviando email:", err.message);
    });

    res.json({ message: "Email de verificación reenviado" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
