import { SendMailOptions } from 'nodemailer';

export const delay = async (time: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};

export const makeMailOptionsPayload = (
  now: string,
  result: object | [],
  html: string,
  filename: string
): SendMailOptions => {
  return {
    from: 'ygo.cardtime@gmail.com',
    to: 'f102041332@gmail.com,alex8603062000@gmail.com',
    subject: `爬蟲完成確認信件(${now})`,
    html,
    attachments: [
      {
        filename,
        content: JSON.stringify(result, null, 2),
      },
    ],
  };
};
