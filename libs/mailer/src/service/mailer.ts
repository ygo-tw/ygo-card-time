import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export class YGOMailer {
  private transporter: Transporter | undefined;

  constructor() {
    this.init();
  }

  /**
   * 初始化邮箱传输器
   * @private
   */
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

  /**
   * 重新初始化邮箱传输器
   * @param {string} email - 新的邮箱账户
   * @param {string} password - 新的邮箱密码
   */
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

  /**
   * 发送邮件
   * @param {SendMailOptions} options - 邮件发送选项
   * @returns {Promise<boolean>} 是否成功发送邮件
   * @throws {Error} 发送邮件失败时抛出错误
   */
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
