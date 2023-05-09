/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Tooltip,
  Tree,
} from "antd";
import { Observer, observer } from "mobx-react";
import { toJS } from "mobx";

import React, { useEffect, useState } from "react";
import store from "../store";
import TypeConfigClass from "../store/type-config";

const TypeConfig = observer(() => {
  const [from] = Form.useForm<TypeConfigClass>();
  const [apiModalVisible, setApiModalVisible] = useState(false);

  const { typeConfig } = store;

  useEffect(() => {
    from.setFieldsValue(store.typeConfig);
  }, [toJS(store.typeConfig)]);

  return (
    <Form
      form={from}
      layout="inline"
      size="small"
      // initialValues={store.typeConfig}
      onValuesChange={typeConfig.setTypeConfig}
    >
      <Space size="small">
        <Form.Item label="前缀" name="prefix" style={{ margin: 0 }}>
          <Input style={{ width: 80 }} />
        </Form.Item>
        <Form.Item name="prefixAddUrlIndex">
          <InputNumber
            addonBefore={
              <Tooltip title="前缀添加url，后面数字表示截取的url字段位">
                <Form.Item
                  name="prefixAddUrl"
                  valuePropName="checked"
                  style={{ margin: 0 }}
                >
                  <Checkbox />
                </Form.Item>
              </Tooltip>
            }
            precision={0}
            style={{ width: 90 }}
          />
        </Form.Item>
      </Space>
      <Form.Item label="请求后缀" name="reqSuffix">
        <Input style={{ width: 80 }} />
      </Form.Item>
      <Form.Item label="返回后缀" name="resSuffix">
        <Input style={{ width: 80 }} />
      </Form.Item>
      <Space align="baseline" size="small">
        <Tooltip title="获取全部接口">
          <Form.Item
            name="isGetAllServices"
            valuePropName="checked"
            style={{ margin: 0 }}
          >
            <Checkbox />
          </Form.Item>
        </Tooltip>

        <Button
          onClick={() => setApiModalVisible(true)}
          disabled={!typeConfig.isGetAllServices}
        >
          选择接口
        </Button>
      </Space>
      <Modal
        title="选择接口"
        open={apiModalVisible}
        onCancel={() => setApiModalVisible(false)}
        onOk={() => setApiModalVisible(false)}
        cancelButtonProps={{ hidden: true }}
        centered
      >
        <Observer>
          {() => (
            <>
              <Form.Item name="splitter" noStyle>
                <Input addonBefore="名称组分隔符"></Input>
              </Form.Item>
              <Space.Compact
                size="small"
                style={{ marginTop: 5, width: "100%" }}
              >
                <Button onClick={() => typeConfig.setAllCheckedApiKeys()}>
                  全选
                </Button>
                <Button onClick={() => typeConfig.setAllCheckedApiKeys(true)}>
                  清除
                </Button>
              </Space.Compact>

              <Tree
                style={{ height: 300, overflow: "auto" }}
                checkable
                checkedKeys={typeConfig.checkedApiKeys}
                onCheck={(keys) => typeConfig.setCheckedApiKeys(keys as any)}
                treeData={typeConfig.catListData as any}
              />
            </>
          )}
        </Observer>
      </Modal>
    </Form>
  );
});
export default TypeConfig;
