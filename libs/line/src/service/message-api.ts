import { messagingApi } from '@line/bot-sdk';
const { MessagingApiClient } = messagingApi;

export class MessageApiService {
  private client: messagingApi.MessagingApiClient;

  constructor(
    private readonly config: {
      channelAccessToken: string;
    }
  ) {
    this.client = new MessagingApiClient({
      channelAccessToken: this.config.channelAccessToken,
    });
  }

  /**
   * 發送訊息給特定用戶
   * @param userId 用戶ID
   * @param message 訊息
   */
  public async sendMessage(userId: string, message: string) {
    try {
      await this.client.pushMessage({
        to: userId,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      });
    } catch (error) {
      throw new Error(`Failed to send LINE message: ${JSON.stringify(error)}`);
    }
  }

  /**
   * 廣播訊息給所有訂閱者
   * @param message 訊息
   */
  public async broadcastMessage(message: string) {
    try {
      await this.client.broadcast({
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      });
    } catch (error) {
      throw new Error(
        `Failed to broadcast LINE message: ${JSON.stringify(error)}`
      );
    }
  }

  /**
   * 廣播訊息給所有訂閱者
   * @param userIds 訂閱者ID
   * @param message 訊息
   */
  public async sendMulticastMessage(userIds: string[], message: string) {
    try {
      await this.client.multicast({
        to: userIds,
        messages: [{ type: 'text', text: message }],
      });
    } catch (error) {
      throw new Error(
        `Failed to send LINE multicast message: ${JSON.stringify(error)}`
      );
    }
  }
}
