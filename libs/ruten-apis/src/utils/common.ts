export const isIllegalProductChar = (txt: string) =>
  !/搜(?=[a-zA-Z])|搜:|防雷|請勿下標|福袋|卡磚|壓克力|單螺絲卡夾|全新未拆|參考|非 |非(?=[A-Za-z\s])/.test(
    txt
  );

export const isFanMode = (txt: string) => !/同人|DIY/.test(txt);

export const isUnopenedPackProduct = (txt: string) =>
  txt.indexOf('未拆包') === -1;
