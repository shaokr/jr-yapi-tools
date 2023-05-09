/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Key } from "antd/lib/table/interface";
import _ from "lodash";
import fp from "lodash/fp";
import { makeAutoObservable, reaction } from "mobx";
import { CatListData, InterfaceData, Store } from ".";
import { local } from "../utils/storage";

export default class TypeConfigClass {
  store: Store;
  /** 前缀 */
  prefix = "I";
  /** 是否添加url */
  prefixAddUrl = true;
  /** 添加url的位置 */
  prefixAddUrlIndex = -2;
  /** 请求后缀 */
  reqSuffix = "Req";
  /** 响应后缀 */
  resSuffix = "Res";
  isGetAllServices = false;
  checkedApiKeys: Key[] = [];
  splitter = "-";
  get catListData() {
    const { store, checkedApiKeys } = this;
    if (this.splitter) {
      return fp.flow(
        fp.groupBy(
          fp.flow(
            //
            fp.get("title"),
            fp.split(this.splitter),
            fp.head
          )
        ),
        (data) =>
          _.map(data, (item, key) => {
            return {
              title: key,
              key: key,
              children: item,
            };
          })
      )(store.catListData);
    }
    return store.catListData;
  }

  constructor(store: Store) {
    this.store = store;
    makeAutoObservable(this);
    this.setTypeConfig(local.get("typeConfig"));
    reaction(
      () => store.catListData,
      () => {
        this.setAllCheckedApiKeys();
      },
      { fireImmediately: true }
    );
  }
  // 获取前缀
  getPrefix = (interfaceData: InterfaceData | CatListData) => {
    const { prefix, prefixAddUrl, prefixAddUrlIndex, store } = this;
    return _.compact([
      prefix,
      prefixAddUrl
        ? store.getPathIndex(interfaceData, prefixAddUrlIndex)
        : false,
    ]).join("");
  };
  setTypeConfig = (data: Partial<TypeConfigClass>) => {
    _.merge(this, data);
    local.set(
      "typeConfig",
      fp.flow(
        fp.pick([
          "prefix",
          "prefixAddUrlIndex",
          "prefixAddUrl",
          "reqSuffix",
          "resSuffix",
        ]),
        fp.toPlainObject
      )(this)
    );
  };
  setAllCheckedApiKeys = (isClear?: boolean) => {
    this.setCheckedApiKeys(
      isClear ? [] : fp.map(fp.get("_id"), this.store.catListData)
    );
  };
  setCheckedApiKeys = (keys: Key[]) => {
    this.checkedApiKeys = keys;
  };
}
