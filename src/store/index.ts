import { makeAutoObservable, runInAction } from "mobx";
import _ from "lodash";
import fp from "lodash/fp";
import mockGenerate from "../utils/mock-generate";
import Capturing from "../utils/capturing";
import { local } from "../utils/storage";
import typesConvert from "../utils/types-convert";

const capturing = new Capturing();

const strToObj = (str: string) => {
  let obj;
  eval(`obj = ${str};`);
  return obj;
};

class Store {
  _schemaData: ISchemaData = {} as any;
  _schema2Data: any = {};
  get key() {
    return fp.flow(fp.split("/"), fp.last)(this._schemaData.path);
  }
  get reqStr() {
    return typesConvert(this._schemaData.req_body_other, `${this.key}Req`);
  }
  get resStr() {
    return typesConvert(this._schemaData.res_body, `${this.key}Res`);
  }
  isCompleteMockStr = true;
  get mockStr() {
    try {
      let str = mockGenerate(this._schema2Data, strToObj(this.mockConfig));
      const { _schemaData } = this;
      const key = _.last(_schemaData.path.split("/"));
      if (this.isCompleteMockStr) {
        str = `import { MockAlias, MockBase, MockRequest, MockResponse } from '@flatjs/mock';
import { mock, Random } from 'mockjs';

/** 
 * ${_schemaData.title}
 * @user ${_schemaData.username}
 * @url ${location.origin}${location.pathname}
*/
class MockService extends MockBase {
  @MockAlias('/${key}')
  ${key}(_req: MockRequest, res: MockResponse): void {
    setTimeout(() => {
      res.json(
        mock(${str}),
      );
    }, 100);
  }
}
module.exports = new MockService();
`;
      }
      return str;
    } catch (e) {
      return `配置错误:\n${e}`;
    }
  }
  mockConfig: string = "";
  constructor() {
    makeAutoObservable(this);
    capturing.onPushState(this.getData);
    this.getData();
    this.setMockConfig(JSON.stringify(local.get("mockConfig") || {}, null, 2));
  }
  getData = async () => {
    await this.getSchemaData();
    await this.getSchema2Data();
  };
  getSchemaData = async () => {
    const id = (_.last(location.pathname.split("/")) as unknown as number) * 1;
    if (!_.isNaN(id) && _.isNumber(id)) {
      const res = await fetch(
        `http://yapi.itcjf.com/api/interface/get?id=${id}`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
          },
          method: "GET",
        }
      ).then((res) => {
        return res.json();
      });
      let data = res.data;
      data = fp.assign(data, {
        req_body_other: JSON.parse(data.req_body_other),
        res_body: JSON.parse(data.res_body),
      });
      const key = fp.flow(fp.split("/"), fp.last)(data.path);
      runInAction(() => {
        this._schemaData = data;
      });
    }
  };
  getSchema2Data = async () => {
    const res = await fetch("http://yapi.itcjf.com/api/interface/schema2json", {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ schema: this._schemaData.res_body }),
      method: "POST",
    }).then((res) => {
      return res.json();
    });
    runInAction(() => {
      this._schema2Data = res;
    });
  };
  setMockConfig = (data: string) => {
    this.mockConfig = data;
    try {
      local.set("mockConfig", strToObj(data));
    } catch (e) {
      console.log(111111, e);
    }
  };
  setIsCompleteMockStr = (checked: boolean) => {
    this.isCompleteMockStr = checked;
  };
}
export default new Store();

interface ISchemaData {
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
  req_body_form: any[];
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
