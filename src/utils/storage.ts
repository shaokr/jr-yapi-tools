/**
 * h5 本地存储
 */
import JSON from 'json5';
const { localStorage, sessionStorage, location } = window;
const KEY = () => location.pathname.replace(/\/interface\/api\/[0-9]+$/, '');
const getKEY = (key: string, G: boolean) => (G ? key : key);

class Storage {
  storage: globalThis.Storage;
  constructor(props: globalThis.Storage) {
    this.storage = props;
  }
  // 获取长度
  get longth() {
    let i = 0;
    for (const key in this.storage) {
      if (key.indexOf(KEY()) === 0) i++;
    }
    return i;
  }
  // 获取
  get(key: string, G = false) {
    return JSON.parse(this.storage.getItem(getKEY(key, G)) || 'null');
  }
  // 设置
  set(key: string, val: any, G = false) {
    this.storage.setItem(getKEY(key, G), JSON.stringify(val));
  }
  // 删除项
  remove(key: string, G = false) {
    this.storage.removeItem(getKEY(key, G));
  }
  // 清除全部
  clear(G = false) {
    if (G) {
      this.storage.clear();
    } else {
      for (const key in this.storage) {
        if (key.indexOf(KEY()) === 0) this.remove(key.replace(KEY(), ''));
      }
    }
  }
  has(key: string, G = false) {
    return this.storage.hasOwnProperty(getKEY(key, G));
  }
}

export const local = new Storage(localStorage);
export const session = new Storage(sessionStorage);

export default {
  local,
  session,
};
