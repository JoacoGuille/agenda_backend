const BRAND_NAME = "U-Proyect";
const BRAND_TEAM = "U-Proyect Team";

const bodyFont =
  "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Tahoma', sans-serif";
const headingFont = "'Georgia', 'Times New Roman', serif";

const paragraph = (text) =>
  `<p style="margin:0 0 12px 0; font-size:15px; line-height:1.6; color:#2b3445;">${text}</p>`;

const baseTemplate = ({
  preheader,
  title,
  greetingName,
  introLines,
  ctaText,
  ctaUrl,
  ctaColor,
  note,
  footer
}) => {
  const introHtml = introLines.map((line) => paragraph(line)).join("");
  const greetingHtml = greetingName
    ? paragraph(`Hola <strong>${greetingName}</strong>,`)
    : "";

  const noteHtml = note
    ? `
      <div style="margin:18px 0; padding:12px 14px; background:#f6f8fb; border:1px solid #e6ecf4; border-left:4px solid ${ctaColor}; border-radius:8px; font-size:13px; line-height:1.5; color:#4b5563;">
        ${note}
      </div>
    `
    : "";

  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <title>${title}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f7fb; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
      <span style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#f4f7fb; opacity:0;">
        ${preheader}
      </span>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background:#f4f7fb;">
        <tr>
          <td align="center" style="padding:28px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e6ecf4;">
              <tr>
                <td style="background:${ctaColor}; padding:22px 26px;">
                  <div style="font-family:${bodyFont}; font-size:18px; font-weight:700; color:#ffffff; letter-spacing:0.3px;">
                    ${BRAND_NAME}
                  </div>
                  <div style="font-family:${bodyFont}; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#e7f0ff; margin-top:4px;">
                    cuenta segura
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:26px 28px 10px 28px;">
                  <h1 style="margin:0 0 12px 0; font-family:${headingFont}; font-size:22px; font-weight:700; color:#1f2a37;">
                    ${title}
                  </h1>
                  ${greetingHtml}
                  ${introHtml}
                  <div style="text-align:center; margin:22px 0 18px 0;">
                    <a href="${ctaUrl}" style="background:${ctaColor}; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:10px; font-family:${bodyFont}; font-size:14px; font-weight:700; display:inline-block;">
                      ${ctaText}
                    </a>
                  </div>
                  ${noteHtml}
                  ${paragraph(
                    "Si el bot&oacute;n no funciona, copi&aacute; y peg&aacute; este enlace en tu navegador:"
                  )}
                  <p style="margin:0 0 16px 0; font-size:13px; line-height:1.5; color:${ctaColor}; word-break:break-all;">
                    ${ctaUrl}
                  </p>
                  <hr style="border:none; border-top:1px solid #edf1f7; margin:18px 0;" />
                  <p style="margin:0; font-size:12px; line-height:1.6; color:#7b8794;">
                    ${footer}
                  </p>
                </td>
              </tr>
            </table>
            <div style="margin-top:14px; font-family:${bodyFont}; font-size:12px; color:#9aa5b1;">
              ${BRAND_TEAM}
            </div>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

export const buildVerificationEmail = ({ name, url }) =>
  baseTemplate({
    preheader:
      "Confirm&aacute; tu cuenta para comenzar a usar U-Proyect en minutos.",
    title: "Confirm&aacute; tu cuenta",
    greetingName: name,
    introLines: [
      "Gracias por registrarte en U-Proyect. Para comenzar a usar tu cuenta, confirm&aacute; tu email.",
      "La verificaci&oacute;n ayuda a mantener tu cuenta segura."
    ],
    ctaText: "Confirmar cuenta",
    ctaUrl: url,
    ctaColor: "#1d9a6c",
    note:
      "Este enlace es v&aacute;lido por 24 horas. Si no creaste esta cuenta, pod&eacute;s ignorar este mensaje.",
    footer:
      "Si no solicitaste esta acci&oacute;n, no es necesario hacer nada. Tu cuenta seguir&aacute; protegida."
  });

export const buildResetEmail = ({ url }) =>
  baseTemplate({
    preheader:
      "Restablec&eacute; tu contrase&ntilde;a de U-Proyect en un solo paso.",
    title: "Restablecer contrase&ntilde;a",
    introLines: [
      "Recibimos una solicitud para restablecer tu contrase&ntilde;a.",
      "Si fuiste vos, cre&aacute; una nueva contrase&ntilde;a desde el bot&oacute;n de abajo."
    ],
    ctaText: "Restablecer contrase&ntilde;a",
    ctaUrl: url,
    ctaColor: "#e4572e",
    note:
      "Este enlace es v&aacute;lido por 1 hora. Si no solicitaste el cambio, pod&eacute;s ignorar este mensaje.",
    footer:
      "Por seguridad, no compartas este enlace con nadie."
  });
