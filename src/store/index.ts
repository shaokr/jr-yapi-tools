/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import _ from "lodash";
import fp from "lodash/fp";
import { makeAutoObservable, reaction, runInAction, set } from "mobx";
import TypeConfig from "./type-config";
import { version } from "~/package.json";
import { mock } from "mock-json-schema";

export class Store {
  // 记录下版本
  version = version;
  // 已经获取的接口数据
  _interfaceDataList: Record<string, InterfaceData> = {};
  // 当前的接口数据
  get interfaceData() {
    return _.get(
      this._interfaceDataList,
      this.interfaceId,
      {}
    ) as InterfaceData;
  }
  // 已经获取的mock用数据
  _schema2DataList: Record<string, any> = {};
  // 当前mock使用数据
  get schema2Data(): object {
    return _.get(this._schema2DataList, this.interfaceId);
  }
  // 项目列表内容信息
  _catListData: CatListData[] = [];
  // 项目数据
  _projectData: ProjectData = {} as any;
  // 用户信息
  _userData: Record<string, any> = {
    11: {
      add_time: 1536831626,
      email: "admin@admin.com",
      role: "admin",
      type: "site",
      uid: 11,
      up_time: 1536888942,
      username: "admin",
    },
  };
  typeConfig: TypeConfig;

  pathname = location.pathname;
  // 项目组的列表数据
  get catListData() {
    return fp.map(
      (item) => fp.assign(item, { key: item._id }),
      this._catListData
    );
  }
  // 当前接口id
  get interfaceId() {
    return fp.get(1, this.pathname.match(/interface\/api\/([0-9]+)/)) || "";
  }
  /** 项目id */
  get projectId() {
    return fp.get(1, this.pathname.match(/project\/([0-9]+)/));
  }
  /** 分组id */
  get groupId() {
    return (
      this._projectData.group_id ||
      fp.get(1, this.pathname.match(/group\/([0-9]+)/))
    );
  }
  /** 项目组id */
  get catId() {
    return (
      this.interfaceData?.catid ||
      fp.get(1, this.pathname.match(/api\/cat_([0-9]+)/))
    );
  }
  get key() {
    return this.getKey(this.interfaceData);
  }
  // 获取接口的key
  getKey = (interfaceData?: InterfaceData, isComplete?: boolean) => {
    return fp.flow(
      fp.split("/"),
      isComplete ? fp.join("_") : fp.last,
      fp.camelCase
    )(interfaceData?.path) as string;
  };
  getPathIndex = (interfaceData: InterfaceData | CatListData, index: number) => {
    return fp.flow(
      fp.split("/"),
      fp.nth(index),
      fp.upperFirst
    )(interfaceData.path);
  };
  // 当前接口请求key
  get reqKey() {
    return this.getReqKey(this.key);
  }
  // 获取请求key
  getReqKey = (key: string) => {
    return fp.upperFirst(`${key}${this.typeConfig.reqSuffix}`);
  };
  // 当前返回key
  get resKey() {
    return this.getResKey(this.key);
  }
  // 当前返回key
  getResKey = (key: string) => {
    return fp.upperFirst(`${key}${this.typeConfig.resSuffix}`);
  };

  constructor() {
    makeAutoObservable(this);
    this.typeConfig = new TypeConfig(this);
    setInterval(this.setPathname, 1000);
    // 项目id发生变化
    reaction(
      () => this.projectId,
      () => {
        void this.getProjectData();
        void this.getProjectUser();
      },
      {
        fireImmediately: true,
      }
    );
    // 当前接口发生变化
    reaction(
      () => this.interfaceId,
      async (interfaceId) => {
        void this.getInterfaceData(interfaceId);
      },
      {
        fireImmediately: true,
      }
    );
    // 当前接口数据发生变化
    reaction(
      () => this.interfaceData,
      (interfaceData) => {
        void this.getSchema2Data(interfaceData);
      }
    );
    reaction(
      () => this.groupId,
      () => {
        void this.getGroupUser();
      }
    );
    reaction(
      () => ({
        catId: this.catId,
        isGetAllServices: this.typeConfig.isGetAllServices,
      }),
      ({ isGetAllServices, catId }) => {
        if (
          isGetAllServices &&
          _.filter(this._interfaceDataList, { catid: catId as any }).length ===
            1
        ) {
          void this.getInterfaceDataList();
        }
      },
      { fireImmediately: true }
    );
  }
  /** 获取项目数据 */
  getProjectData = async () => {
    const { projectId } = this;
    if (!projectId) return;
    const res = await fetch(
      `//yapi.itcjf.com/api/project/get?id=${this.projectId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "GET",
        credentials: "include",
      }
    ).then((res) => res.json());
    runInAction(() => {
      this._projectData = res.data;
    });
  };
  /** 获取接口数据 */
  getInterfaceData = async (interfaceId?: string | number) => {
    if (!interfaceId) return;
    const res = await fetch(
      `//yapi.itcjf.com/api/interface/get?id=${interfaceId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
        },
        method: "GET",
      }
    ).then((res) => res.json());
    let data = res.data as InterfaceData;
    if (data.req_body_type === "form") {
      data = fp.assign(data, {
        req_body_other: {
          properties: _(data.req_body_form)
            .mapKeys(fp.get("name"))
            .mapValues((item) => ({
              type: item.type === "text" ? "string" : "File",
              description: item.desc,
            }))
            .value(),
          required: _(data.req_body_form)
            .filter((item) => item.required === "1")
            .map(fp.get("name"))
            .value(),
        },
      });
    } else {
      data = fp.assign(data, {
        req_body_other: JSON.parse(data.req_body_other || "{}"),
      });
    }
    data = fp.assign(data, {
      res_body: JSON.parse(data.res_body || "{}"),
    });
    runInAction(() => {
      this._interfaceDataList[data._id] = data;
    });
  };
  getSchema2Data = async (interfaceData: InterfaceData) => {
    //
    const { res_body, _id } = interfaceData;
    if (!res_body) return;
    runInAction(() => {
      this._schema2DataList[_id] = mock(res_body);
    });
    return;
    const res = await fetch("//yapi.itcjf.com/api/interface/schema2json", {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ schema: res_body }),
      method: "POST",
    }).then((res) => res.json());
    runInAction(() => {
      this._schema2DataList[_id] = res;
    });
  };
  /** 获取项目用户信息 */
  getProjectUser = async () => {
    const { projectId } = this;
    if (!projectId) return;
    const res = await fetch(
      `//yapi.itcjf.com/api/project/get_member_list?id=${projectId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
        },
        method: "GET",
      }
    ).then((res) => res.json());

    runInAction(() => {
      _.assign(
        this._userData,
        _.mapKeys(res.data, (val) => val.uid)
      );
    });
  };
  /** 获取组中用户信息 */
  getGroupUser = async () => {
    const { groupId } = this;
    if (!groupId) return;
    const res = await fetch(
      `//yapi.itcjf.com/api/group/get_member_list?id=${groupId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
        },
        method: "GET",
      }
    ).then((res) => res.json());

    runInAction(() => {
      _.assign(
        this._userData,
        _.mapKeys(res.data, (val) => val.uid)
      );
    });
  };
  /** 获取当前列表数据 */
  getCatList = async () => {
    const { catId } = this;
    if (!catId) return;
    const res = await fetch(
      `//yapi.itcjf.com/api/interface/list_cat?page=1&limit=200000&catid=${catId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
        },
        method: "GET",
      }
    ).then((res) => res.json());
    runInAction(() => {
      set(this, "_catListData", res.data.list);
    });
  };
  /** 获取接口数据列表 */
  getInterfaceDataList = async () => {
    await this.getCatList();
    const { _catListData } = this;
    for (const val of _catListData) {
      await this.getInterfaceData(val._id);
    }
  };
  /** 设置 */
  setPathname = () => {
    this.pathname = location.pathname;
  };
}
export default new Store();

export interface InterfaceData {
  query_path: Querypath;
  edit_uid: number;
  status: string;
  type: string;
  req_body_is_json_schema: boolean;
  res_body_is_json_schema: boolean;
  api_opened: boolean;
  index: number;
  tag: any[];
  _id: number;
  method: string;
  catid: number;
  title: string;
  path: string;
  project_id: number;
  req_params: any[];
  res_body_type: string;
  req_query: any[];
  req_headers: Reqheader[];
  req_body_form: {
    desc: string;
    example: string;
    name: string;
    required: string;
    type: string;
    _id: string;
  }[];
  desc: string;
  markdown: string;
  req_body_other: any;
  req_body_type: string;
  res_body: any;
  uid: number;
  add_time: number;
  up_time: number;
  __v: number;
  username: string;
}

interface Reqheader {
  required: string;
  _id: string;
  name: string;
  value: string;
}

interface Querypath {
  path: string;
  params: any[];
}

export interface CatListData {
  edit_uid: number;
  status: string;
  api_opened: boolean;
  tag: any[];
  _id: number;
  method: string;
  catid: number;
  title: string;
  path: string;
  project_id: number;
  uid: number;
  add_time: number;
}

interface ProjectData {
  switch_notice: boolean;
  is_mock_open: boolean;
  strice: boolean;
  is_json5: boolean;
  _id: number;
  name: string;
  desc: string;
  basepath: string;
  project_type: string;
  uid: number;
  group_id: number;
  icon: string;
  color: string;
  add_time: number;
  up_time: number;
  env: Env[];
  tag: Tag[];
  cat: Cat[];
  role: string;
}

interface Cat {
  index: number;
  _id: number;
  name: string;
  project_id: number;
  desc?: string;
  uid: number;
  add_time: number;
  up_time: number;
  __v: number;
}

interface Tag {
  _id: string;
  name: string;
  desc: string;
}

interface Env {
  header: any[];
  global: any[];
  _id: string;
  name: string;
  domain: string;
}
