/**
 * 事件监听
 * Created by zombie on 2017/1/19.
 */
let keyCount = 1;
type Fun<T, T2, T3, T4, T5, T6, T7, T8, T9> = (
  arg: T,
  arg2?: T2,
  arg3?: T3,
  arg4?: T4,
  arg5?: T5,
  arg6?: T6,
  arg7?: T7,
  arg8?: T8,
  arg9?: T9,
) => void;
export default class Monitor<
  T = any,
  T2 = any,
  T3 = any,
  T4 = any,
  T5 = any,
  T6 = any,
  T7 = any,
  T8 = any,
  T9 = any,
> {
  list: { [key: string]: any } = {};
  // 注册
  on = (fun: Fun<T, T2, T3, T4, T5, T6, T7, T8, T9>) => {
    const key = `key-${keyCount++}-${+new Date()}`;
    this.list[key] = fun;
    return {
      key,
      off: () => {
        this.off(key);
      },
    };
  };
  // 注册一次执行后关闭
  once = (fn: Fun<T, T2, T3, T4, T5, T6, T7, T8, T9>) => {
    const _id = this.on((res) => {
      _id.off();
      return fn(res);
    });
    return _id;
  };
  // // 删除
  off = (key: string | number) => {
    delete this.list[key];
    return true;
  };
  go = (...res: any[]) => {
    const resList: any[] = [];
    for (const key in this.list) {
      try {
        resList.push(this.list[key](...res));
      } catch (e: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        resList.push(new Error(e));
      }
    }
    return resList;
  };
  // // 删除所有事件注册
  offAll = () => {
    this.list = {};
    return true;
  };
}
