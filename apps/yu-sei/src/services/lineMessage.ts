import { MessageApiService } from '@ygo/line';
export class LineMessageService {
  private lineService: MessageApiService;

  constructor(
    private readonly config: {
      channelAccessToken: string;
    },
    private readonly userIds: string[] | undefined
  ) {
    this.lineService = new MessageApiService({
      channelAccessToken: this.config.channelAccessToken,
    });
  }

  /**
   * 發送訊息
   * @param msg 訊息
   */
  public async sendMsg(msg: string) {
    if (this.userIds && this.userIds.length > 0) {
      await this.lineService.sendMulticastMessage(this.userIds, msg);
    } else {
      await this.lineService.broadcastMessage(msg);
    }
  }
}
