import nodemailer from "nodemailer";
import { serverConfig as config } from "@shared/config/server.config";

// Helper function to send an email
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    host: config.env.smtp.host,
    port: config.env.smtp.port,
    name: config.env.smtp.fromName,
    secure: config.env.smtp.tls, // true for 465, false for other ports
    auth: {
      user: config.env.smtp.user,
      pass: config.env.smtp.pass,
    },
  });
  try {
    if (!transporter) {
      console.error("Email service not initialized");
      return false;
    }

    const info = await transporter.sendMail({
      from: `"${config.env.smtp.fromName}" <${config.env.smtp.from}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    console.log(`Email sent res: ${info.response}`);
    console.log(`Email sent to: ${to}`);

    // Log the URL where the email can be previewed (Ethereal only)
    // console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
