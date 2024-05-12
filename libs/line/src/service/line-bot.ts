import axios from 'axios';
import 'dotenv/config';

export class LineBotService {
  private token = process.env.LINENOTIFY;
  private url = 'https://notify-api.line.me/api/notify';

  constructor() {}

  public async sendNotify(
    message: string,
    contentType: string = 'application/x-www-form-urlencoded'
  ) {
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': contentType,
    };

    try {
      await axios.post(this.url, `message=${message}`, { headers });
      return true;
    } catch (error) {
      console.error('Failed to send line notify:');
      throw error;
    }
  }
}
