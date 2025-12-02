import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  }

  async sendMail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: `"Wedding Booking" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html
      });
      console.log(`📧 Email sent to ${to}`);
    } catch (err) {
      console.error("Failed to send email:", err.message);
    }
  }
}

export default new EmailService();
