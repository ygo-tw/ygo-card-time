import 'dotenv/config';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export class YGOMailer {
  private transporter: Transporter | undefined;

  constructor() {
    this.init();
  }

  private init() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // SMTP 服务器
      port: 587, // SMTP 端口
      secure: false, // 如果端口为 465 则为 true，其他端口一般为 false
      auth: {
        user: process.env.EMAIL, // 你的邮箱账户
        pass: process.env.EPASSWORD, // 你的邮箱密码
      },
    });
  }

  public reInit(email: string, password: string) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
    });
  }

  public async sendMail(options: SendMailOptions) {
    if (!this.transporter) return false;
    try {
      await this.transporter.sendMail(options);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}
