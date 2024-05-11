import figlet from 'figlet';
import { DataAccessService } from '@ygo/mongo-server';

const main = async () => {
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  const daService = new DataAccessService();
  await daService.init();

  const da = await daService.find('admin', { type: 0 });
  console.log(da);
};

main();
