/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Checkbox, Form, Input } from 'antd';
import _ from 'lodash';
import fp from 'lodash/fp';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { CardTextArea } from '../../compts/card-text-area';
import CustomizeDrawer from '../../compts/customize-drawer';
import TypeConfig from '../../compts/type-config';
import store, { CatListData } from '../../store';
import { webServicesItem } from '../../utils/web-services';

const { TextArea } = Input;

const state = new (class {
  formValues = {
    isUrlExternalLocation: false,
  };
  get webServiceStr() {
    const { key, resKey, reqKey, interfaceData, typeConfig } = store;
    const _resKey = `${typeConfig.getPrefix(interfaceData)}${resKey}`;
    const _reqKey = `${typeConfig.getPrefix(interfaceData)}${reqKey}`;
    const {
      formValues: { isUrlExternalLocation },
    } = this;
    return webServicesItem({
      title: interfaceData.title,
      user: interfaceData.username,
      url: `${location.origin}${location.pathname}`,
      key,
      reqKey: _reqKey,
      resKey: _resKey,
      method: interfaceData.method,
      path: interfaceData.path,
      isUrlExternalLocation,
    });
  }
  get servicesStr() {
    const { typeConfig, _userData, _catListData } = store;
    const {
      formValues: { isUrlExternalLocation },
    } = this;
    return fp.flow(
      fp.filter((item: CatListData) => fp.includes(item._id, store.typeConfig.checkedApiKeys)),
      fp.map((item: CatListData) => {
        const key = fp.flow(fp.split('/'), fp.last)(item.path);
        const reqKey = typeConfig.getPrefix(item) + fp.upperFirst(`${key}${typeConfig.reqSuffix}`);
        const resKey = typeConfig.getPrefix(item) + fp.upperFirst(`${key}${typeConfig.resSuffix}`);
        return {
          title: item.title,
          user: fp.get([item.uid, 'username'], _userData),
          url: `${location.origin}/project/${item.project_id}/interface/api/${item._id}`,
          key,
          path: item.path,
          reqKey,
          resKey,
          method: item.method,
          isUrlExternalLocation,
        };
      }),
      fp.map(webServicesItem),
      fp.join('\n'),
    )(_catListData);
  }
  constructor() {
    makeAutoObservable(this);
  }
  onValuesChange = (data: any) => {
    this.formValues = _.merge(this.formValues, data);
  };
})();

type Props = { visible: boolean; onClose: () => void };
export default observer(({ visible, onClose }: Props) => {
  const [form] = Form.useForm();
  useEffect(() => {
    void store.getCatList();
    // void store.getInterfaceListData();
    void store.getGroupUser();
    void store.getProjectUser();
  }, [store.catId]);
  return (
    <Form form={form} initialValues={state.formValues} onValuesChange={state.onValuesChange}>
      <CustomizeDrawer
        title="web-services"
        open={visible}
        onClose={onClose}
        footer={<TypeConfig />}
        isEmpty={!store.catId}
      >
        <Contents />
      </CustomizeDrawer>
    </Form>
  );
});
const Contents = observer(() => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto' }}>
      <CardTextArea
        title="请求"
        extra={
          <Form.Item name="isUrlExternalLocation" valuePropName="checked" noStyle>
            <Checkbox>url位置放外部</Checkbox>
          </Form.Item>
        }
        value={store.typeConfig.isGetAllServices ? state.servicesStr : state.webServiceStr}
      />
    </div>
  );
});
