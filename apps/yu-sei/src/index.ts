import figlet from 'figlet';
import { LineBotService } from '@ygo/line';

const main = async () => {
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  const lineBotService = new LineBotService();

  const res = await lineBotService.sendNotify('Hello, world!');
  console.log(res);
};

main();
