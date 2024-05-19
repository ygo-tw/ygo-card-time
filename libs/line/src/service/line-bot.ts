import axios from 'axios';

export class LineBotService {
  private token = process.env.LINENOTIFY;
  private url = 'https://notify-api.line.me/api/notify';

  constructor() {}

  /**
   * 發送 LINE Notify 訊息
   * @param {string} message - 要發送的訊息
   * @param {string} [contentType='application/x-www-form-urlencoded'] - 內容類型
   * @returns {Promise<boolean>} 是否成功發送訊息
   * @throws {Error} 發送訊息失敗時拋出錯誤
   */
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
