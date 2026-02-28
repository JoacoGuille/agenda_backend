import "../config/env.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "U-Proyect <Support@uproyect.com>",
      to,
      subject,
      html
    });

    console.log("Email enviado:", response);
  } catch (error) {
    console.error("Email delivery error:", error);
    throw error;
  }
};