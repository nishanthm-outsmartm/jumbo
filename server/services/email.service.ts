import nodemailer from "nodemailer";
import config from "../../client/src/lib/config";

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
    host: config.env.SMTP_HOST,
    port: config.env.SMTP_PORT,
    secure: config.env.SMTP_TLS, // true for 465, false for other ports
    auth: {
      user: config.env.SMTP_USER,
      pass: config.env.SMTP_PASS,
    },
  });
  try {
    if (!transporter) {
      console.error("Email service not initialized");
      return false;
    }

    const info = await transporter.sendMail({
      from: config.env.SMTP_FROM,
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
