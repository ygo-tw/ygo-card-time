import { YGOMailer } from './mailer';
import nodemailer, { Transporter } from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('YGOMailer', () => {
  let mailer: YGOMailer;
  let mockTransport: jest.Mocked<Transporter>;
  let originalConsoleError: (...data: any[]) => void;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    const sendMailMock = jest.fn();
    mockTransport = {
      sendMail: sendMailMock as any,
      close: jest.fn(),
      verify: jest.fn(),
      use: jest.fn(),
    } as unknown as jest.Mocked<Transporter>;

    mockedNodemailer.createTransport.mockReturnValue(mockTransport);

    mailer = new YGOMailer();
  });

  afterEach(() => {
    console.error = originalConsoleError; // 恢复 console.error
  });

  describe('constructor', () => {
    it('should initialize transporter successfully', () => {
      expect(mockedNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EPASSWORD,
        },
      });
    });

    it('should log an error and throw if transporter initialization fails', () => {
      const error = new Error('Initialization failed');
      mockedNodemailer.createTransport.mockImplementationOnce(() => {
        throw error;
      });

      expect(() => new YGOMailer()).toThrow('Failed to initialize transporter');
      expect(console.error).toHaveBeenCalledWith(
        'Failed to initialize transporter:',
        error
      );
    });
  });

  describe('reInit method', () => {
    it('should reinitialize the transporter with new credentials', () => {
      const newEmail = 'new@example.com';
      const newPassword = 'newpassword123';
      mailer.reInit(newEmail, newPassword);
      expect(mockedNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: newEmail,
          pass: newPassword,
        },
      });
    });

    it('should log an error and throw if reinitialization fails', () => {
      const error = new Error('Reinitialization failed');
      mockedNodemailer.createTransport.mockImplementationOnce(() => {
        throw error;
      });

      expect(() => mailer.reInit('new@example.com', 'newpassword123')).toThrow(
        'Failed to reinitialize transporter'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Failed to reinitialize transporter:',
        error
      );
    });
  });

  describe('sendMail method', () => {
    it('should return true when email is sent successfully', async () => {
      const mailOptions = {
        from: 'test@example.com',
        to: 'receiver@example.com',
        subject: 'Test',
        text: 'This is a test email',
      };
      const result = await mailer.sendMail(mailOptions);
      expect(result).toBe(true);
      expect(mockTransport.sendMail).toHaveBeenCalledWith(mailOptions);
    });

    it('should throw an error when sending email fails', async () => {
      const mailOptions = {
        from: 'test@example.com',
        to: 'receiver@example.com',
        subject: 'Test',
        text: 'This is a test email',
      };
      const errorMessage = 'Failed to send email';
      mockTransport.sendMail.mockRejectedValue(new Error(errorMessage));
      await expect(mailer.sendMail(mailOptions)).rejects.toThrow(errorMessage);
    });

    it('should throw an error if transporter is not initialized', async () => {
      mailer = new YGOMailer();
      mailer['transporter'] = undefined; // Simulate transporter being undefined

      const mailOptions = {
        from: 'test@example.com',
        to: 'receiver@example.com',
        subject: 'Test',
        text: 'This is a test email',
      };

      await expect(mailer.sendMail(mailOptions)).rejects.toThrow(
        'Transporter is not initialized'
      );
    });
  });
});
