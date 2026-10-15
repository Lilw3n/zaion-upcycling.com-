import nodemailer from "nodemailer";
import { company } from "./company";
import { ionosReady } from "./providers";

export async function sendMailboxMail(input: { to: string; subject: string; text: string }) {
  if (!ionosReady()) {
    return { sent: false as const, reason: "ionos" };
  }
  const port = Number(process.env.IONOS_SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.IONOS_SMTP_HOST || "smtp.ionos.fr",
    port,
    secure: port === 465,
    auth: {
      user: process.env.IONOS_SMTP_USER,
      pass: process.env.IONOS_SMTP_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: process.env.IONOS_SMTP_FROM || `${company.brand} <${process.env.IONOS_SMTP_USER}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
  return { sent: true as const };
}
