import "../config/env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,        
  secure: true,       
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4           
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error.message);
  } else {
    console.log("SMTP listo");
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"U-Proyect Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("Email delivery error:", error.message);
    throw error;
  }
};