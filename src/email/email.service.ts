import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const host = process.env.NODEMAILER_HOST;
    const port = process.env.NODEMAILER_PORT;
    const user = process.env.NODEMAILER_AUTH_USER;
    const pass = process.env.NODEMAILER_AUTH_PASS;

    if (!host || !port || !user || !pass) {
      this.logger.error(
        'Missing Nodemailer environment variables (HOST, PORT, AUTH_USER, AUTH_PASS)',
      );
      throw new Error('Nodemailer configuration is incomplete.');
    }

    this.transporter = createTransport({
      host: host,
      port: parseInt(port, 10),
      secure: true,
      auth: {
        user: user,
        pass: pass,
      },
    });

    this.logger.log('Nodemailer transport created successfully.');
  }

  async sendMail({ to, subject, html }) {
    try {
      await this.transporter.sendMail({
        from: {
          name: '会议室预定系统',
          address: process.env.NODEMAILER_AUTH_USER!,
        },
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw error;
    }
  }
}
