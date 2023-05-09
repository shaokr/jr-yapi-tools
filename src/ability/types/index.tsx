import { Checkbox, Col, Form, Input, Row, Space } from "antd";
import _ from "lodash";
import fp from "lodash/fp";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";

import typesConvert, { ConvertConfigType } from "@/utils/types-convert";
import { CardTextArea } from "@/compts/card-text-area";
import CustomizeDrawer from "@/compts/customize-drawer";
import TypeConfig from "@/compts/type-config";
import store, { InterfaceData } from "@/store";

const state = new (class {
  // 是否减少层级
  isClearLayer = true;
  // 是否合并
  isMerge = true;
  reqDataPath = "";
  resDataPath = "data";
  // 是否禁用减少一层的功能
  getBody(body: any, type: "req" | "res") {
    if (this.isClearLayer) {
      const dataPath = fp.split(".")(
        type === "req" ? this.reqDataPath : this.resDataPath
      );
      const data = _.reduce(
        dataPath,
        (result, value) => {
          return (
            _.get(result, ["properties", value, "items"]) ||
            _.get(result, ["properties", value]) ||
            _.get(result, [value], result)
          );
        },
        _.cloneDeep(body)
      );
      return data;
    }
    return body;
  }
  get reqStr() {
    const { interfaceData, typeConfig } = store;
    return this._typesReqConvert(interfaceData);
  }
  get resStr() {
    const { interfaceData, typeConfig } = store;
    return this._typesResConvert(interfaceData);
  }
  get allReqStr() {
    return fp.flow(
      this._getKey,
      fp.map(([key, item]) => this._typesReqConvert(item)),
      fp.fromPairs
    )(this.filterInterfaceDatas);
  }
  get allResStr() {
    return fp.flow(
      this._getKey,
      fp.map(([key, item]: [string, InterfaceData]) =>
        this._typesResConvert(item)
      ),
      fp.join("\n")
    )(this.filterInterfaceDatas);
  }
  get allStr() {
    return fp.flow(
      this._getKey,
      fp.map(([key, item]: [string, InterfaceData]) =>
        [this._typesReqConvert(item), this._typesResConvert(item)].join("\n")
      ),
      fp.join("\n")
    )(this.filterInterfaceDatas);
  }
  /** 经过过滤后的数据 */
  get filterInterfaceDatas() {
    return fp.flow(
      fp.get("_interfaceDataList"),
      fp.filter((item: InterfaceData) =>
        fp.includes(item._id, store.typeConfig.checkedApiKeys)
      )
    )(store) as InterfaceData[];
  }
  constructor() {
    makeAutoObservable(this);
  }
  _getKey = (interfaceDataList: InterfaceData[]) => {
    return fp.flow(
      fp.map((item: InterfaceData) => [store.getKey(item), item]),
      (data) =>
        _.map(data, ([key, item]: [string, InterfaceData]) => {
          if (fp.filter(fp.flow(fp.head, fp.eq(key)), data).length > 1) {
            key = store.getKey(item, true);
          }
          return [key, item];
        })
    )(interfaceDataList) as unknown as [string, InterfaceData][];
  };
  _typesReqConvert = (interfaceData: InterfaceData) => {
    const { typeConfig } = store;
    const reqBody = this.getBody(interfaceData.req_body_other, "req");
    const key = store.getKey(interfaceData);
    return typesConvert(reqBody, {
      key: store.getReqKey(key),
      description: `/** ${interfaceData.title}请求参数 */`,
      defRequired: !_.has(interfaceData.req_body_other, "properties"),
      prefix: _.compact([
        typeConfig.prefix,
        typeConfig.prefixAddUrl
          ? store.getPathIndex(interfaceData, typeConfig.prefixAddUrlIndex)
          : false,
      ]).join(""),
    });
  };
  _typesResConvert = (interfaceData: InterfaceData) => {
    const { typeConfig } = store;
    const resBody = this.getBody(interfaceData.res_body, "res");
    const key = store.getKey(interfaceData);
    return typesConvert(resBody, {
      key: store.getResKey(key),
      description: `/** ${interfaceData.title}返回数据 */`,
      defRequired: !_.has(resBody, "properties"),
      prefix: _.compact([
        typeConfig.prefix,
        typeConfig.prefixAddUrl
          ? store.getPathIndex(interfaceData, typeConfig.prefixAddUrlIndex)
          : false,
      ]).join(""),
    });
  };
  setIsClearOneLayer = (checked: boolean) => {
    this.isClearLayer = checked;
  };
  onValuesChange = (data: any) => {
    _.merge(this, data);
    // local.set('typeConfig', fp.flow(fp.pick(['prefix', 'reqSuffix', 'resSuffix']), fp.toPlainObject)(this));
  };
})();

type Props = { visible: boolean; onClose: () => void };
export default observer(({ visible, onClose }: Props) => {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      initialValues={state}
      onValuesChange={state.onValuesChange}
    >
      {/* <Form.Item name="reqDataPath" hidden></Form.Item> */}
      <CustomizeDrawer
        title="请求和返回TS类型"
        open={visible}
        onClose={onClose}
        isEmpty={!store.interfaceId}
        footer={<TypeConfig />}
        extra={
          <Row style={{ width: "200px" }} justify="end">
            <Col>
              <Form.Item name="isMerge" valuePropName="checked" noStyle>
                <Checkbox>合并展示</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        }
      >
        <Contents />
      </CustomizeDrawer>
    </Form>
  );
});

const Contents = observer(() => {
  if (state.isMerge) {
    return (
      <CardTextArea
        title="请求/返回"
        extra={
          <>
            <Form.Item name="reqDataPath" noStyle>
              <Input
                disabled={!state.isClearLayer}
                style={{ width: 180 }}
                addonBefore="请求路径"
              ></Input>
            </Form.Item>
            <Form.Item name="resDataPath" noStyle>
              <Input
                disabled={!state.isClearLayer}
                style={{ width: 180 }}
                addonBefore="返回路径"
              ></Input>
            </Form.Item>
            <Form.Item name="isClearLayer" valuePropName="checked" noStyle>
              <Checkbox></Checkbox>
            </Form.Item>
          </>
        }
        value={
          store.typeConfig.isGetAllServices
            ? state.allStr
            : [state.reqStr, state.resStr].join("\n")
        }
      ></CardTextArea>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        columnGap: "10px",
      }}
    >
      <CardTextArea
        title="请求"
        extra={
          <>
            <Form.Item name="reqDataPath" noStyle label="路径">
              <Input
                disabled={!state.isClearLayer}
                style={{ width: 180 }}
                addonBefore="路径"
                addonAfter={
                  <Form.Item
                    name="isClearLayer"
                    valuePropName="checked"
                    noStyle
                  >
                    <Checkbox></Checkbox>
                  </Form.Item>
                }
              ></Input>
            </Form.Item>
          </>
        }
        value={
          store.typeConfig.isGetAllServices ? state.allReqStr : state.reqStr
        }
      ></CardTextArea>
      <CardTextArea
        title="返回"
        extra={
          <>
            <Form.Item name="resDataPath" noStyle label="路径">
              <Input
                disabled={!state.isClearLayer}
                style={{ width: 180 }}
                addonBefore="路径"
                addonAfter={
                  <Form.Item
                    name="isClearLayer"
                    valuePropName="checked"
                    noStyle
                  >
                    <Checkbox></Checkbox>
                  </Form.Item>
                }
              ></Input>
            </Form.Item>
          </>
        }
        value={
          store.typeConfig.isGetAllServices ? state.allResStr : state.resStr
        }
      ></CardTextArea>
    </div>
  );
});
