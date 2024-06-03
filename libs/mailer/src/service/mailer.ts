import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export class YGOMailer {
  private transporter: Transporter | undefined;

  constructor(user?: string, password?: string) {
    this.init(user, password);
  }

  /**
   * 初始化邮箱传输器
   * @private
   */
  private init(user?: string, password?: string) {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // SMTP 服务器
        port: 587, // SMTP 端口
        secure: false, // 如果端口为 465 则为 true，其他端口一般为 false
        auth: {
          user: user ?? process.env.EMAIL, // 你的邮箱账户
          pass: password ?? process.env.EPASSWORD, // 你的邮箱密码
        },
      });
    } catch (error) {
      console.error('Failed to initialize transporter:', error);
      throw new Error('Failed to initialize transporter');
    }
  }

  /**
   * 重新初始化邮箱传输器
   * @param {string} email - 新的邮箱账户
   * @param {string} password - 新的邮箱密码
   */
  public reInit(email: string, password: string) {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: email,
          pass: password,
        },
      });
    } catch (error) {
      console.error('Failed to reinitialize transporter:', error);
      throw new Error('Failed to reinitialize transporter');
    }
  }

  /**
   * 发送邮件
   * @param {SendMailOptions} options - 邮件发送选项
   * @returns {Promise<boolean>} 是否成功发送邮件
   * @throws {Error} 发送邮件失败时抛出错误
   */
  public async sendMail(options: SendMailOptions) {
    if (!this.transporter) {
      console.error('Transporter is not initialized');
      throw new Error('Transporter is not initialized');
    }
    try {
      await this.transporter.sendMail(options);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}
