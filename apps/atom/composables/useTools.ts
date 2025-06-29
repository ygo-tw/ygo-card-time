/**
 * 是否為行動裝置
 * 註：iPad Safari 獲取的 ua 與 Mac Safari 一致，需獨立判斷
 * @returns {boolean} 是否為行動裝置
 */
export const isPhone = (): boolean => {
  const ua = navigator.userAgent;
  const agents = [
    'Android',
    'iPhone',
    'SymbianOS',
    'Windows Phone',
    'iPad',
    'iPod',
  ];
  const isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Version') !== -1;
  const isIPhone = ua.indexOf('iPhone') !== -1 && ua.indexOf('Version') !== -1;
  const isIPad = isSafari && !isIPhone && 'ontouchend' in document;
  let mobile = false;
  if (isIPad) {
    mobile = true;
  } else {
    for (let i = 0, len = agents.length; i < len; i++) {
      if (ua.indexOf(agents[i]) > 0) {
        mobile = true;
        break;
      }
    }
  }
  return mobile;
};
