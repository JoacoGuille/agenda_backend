import "../config/env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 587,
  secure: false,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: "U-Proyect <onboarding@resend.dev>",
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("Email delivery error:", error.message);
    throw error;
  }
};