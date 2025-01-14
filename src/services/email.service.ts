"use server";

import { createTransport, SendMailOptions } from "nodemailer";

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ success: boolean; message: string }> {
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  try {
    const mailOptions: SendMailOptions = {
      from: `"NextJS FnB" <${user}>`,
      to,
      subject,
      text,
      ...(html && { html }),
    };

    const sending = await transporter.sendMail(mailOptions);
    if (!sending) throw new Error("Failed to send email");
    return { success: true, message: "Success to send email" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
