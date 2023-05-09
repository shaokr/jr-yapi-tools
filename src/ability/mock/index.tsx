/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { QuestionCircleTwoTone } from '@ant-design/icons';
import { Checkbox, Form, InputNumber, Popover, Radio, Space, Typography } from 'antd';
import JSON from 'json5';
import _ from 'lodash';
import fp from 'lodash/fp';
import { makeAutoObservable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { CardTextArea } from '../../compts/card-text-area';
import CustomizeDrawer from '../../compts/customize-drawer';
import store from '../../store';
import mockGenerate from '../../utils/mock-generate';
import { local } from '../../utils/storage';

const { Text } = Typography;

const state = new (class {
  formValues = {
    mockConfig: {
      project: {},
      cat: {},
      interface: {},
    },
    activ: 'project' as 'project' | 'cat' | 'interface',
    isCompleteMockStr: true,
    urlRemoveLevel: 1,
  };
  get mockConfigName() {
    const { formValues } = this;
    let id: string | number;
    switch (formValues.activ) {
      case 'project':
        id = store.projectId as string;
        break;
      case 'cat':
        id = store.catId as string;
        break;
      case 'interface':
        id = store.interfaceId;
        break;
    }
    return ['mockConfig', formValues.activ, id];
  }
  get mockStr() {
    const { interfaceData } = store;
    let { schema2Data } = store;
    const { isCompleteMockStr, urlRemoveLevel } = this.formValues;
    try {
      const { mockConfig } = this;
      if (!fp.size(schema2Data)) {
        schema2Data = {
          code: '0000',
          message: '',
          data: {},
        };
      }
      const str = mockGenerate(schema2Data, mockConfig);

      if (isCompleteMockStr) {
        const urlKey = fp.flow(
          fp.split('/'),
          fp.compact,
          (data) => fp.slice(urlRemoveLevel, data.length, data),
          fp.join('/'),
        )(interfaceData.path);
        const key = fp.flow(fp.replace(/\//g, '-'), fp.camelCase)(urlKey);
        return [
          `import { MockAlias, MockBase, MockRequest, MockResponse } from '@flatjs/mock';`,
          `import _ from 'lodash';`,
          `import { mock, Random } from 'mockjs';`,
          ``,
          `/**`,
          ` * ${interfaceData.title}`,
          ` * @user ${interfaceData.username}`,
          ` * @url ${location.origin}${location.pathname}`,
          `*/`,
          `class MockService extends MockBase {`,
          `  @MockAlias('/${urlKey}')`,
          `  ${key}(_req: MockRequest, res: MockResponse): void {`,
          `    setTimeout(() => {`,
          `      res.json(`,
          `        mock(${str}),`,
          `      );`,
          `    }, 100);`,
          `  }`,
          `}`,
          `module.exports = new MockService();`,
        ].join('\n');
      }
      return str;
    } catch (e) {
      return `配置错误:\n${e}`;
    }
  }
  get mockConfig() {
    return fp.flow(
      fp.map((path: (string | number)[]) =>
        fp.flow(
          JSON.parse,
          fp.toPairs,
          fp.map(([key, valuse]) => {
            const [_key, ability] = key.split('|');
            return [_key, { valuse, ability }];
          }),
          fp.fromPairs,
        )(fp.getOr('{}', path, this.formValues.mockConfig)),
      ),
      fp.assignAll,
      fp.toPairs,
      fp.map(([key, { valuse, ability }]) => [`${key}${ability ? `|${ability}` : ''}`, valuse]),
      fp.fromPairs,
    )([
      ['project', `${store.projectId || 0}`],
      ['cat', `${store.catId || 0}`],
      ['interface', `${store.interfaceId || 0}`],
    ]) as Record<string, string>;
  }
  constructor() {
    makeAutoObservable(this);
  }
  onValuesChange = (value: object) => {
    _.merge(this.formValues, value);
    if (_.has(value, this.mockConfigName)) {
      const mockConfig: string = fp.get(this.mockConfigName)(value);
      try {
        JSON.parse(mockConfig);
        local.set('mockConfig', this.formValues.mockConfig);
      } catch (e) {
        console.error(e);
      }
    }
  };
  init() {
    this.onValuesChange({ mockConfig: local.get('mockConfig') || '{}' });
  }
})();
state.init();

reaction(
  () => store.pathname,
  () => {
    state.init();
  },
  { fireImmediately: true },
);

type Props = { visible: boolean; onClose: () => void };
export default observer(({ visible, onClose }: Props) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} onValuesChange={state.onValuesChange} initialValues={state.formValues}>
      <CustomizeDrawer title="mock" open={visible} onClose={onClose} isEmpty={!store.interfaceId}>
        <Contents />
      </CustomizeDrawer>
    </Form>
  );
});

const Contents = observer(() => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '10px' }}>
      <Form.Item name={state.mockConfigName} noStyle>
        <CardTextArea
          extra={
            <Form.Item name="activ" noStyle>
              <Radio.Group
                size="small"
                options={[
                  { label: '项目', value: 'project' },
                  { label: '分类', value: 'cat' },
                  { label: '接口', value: 'interface' },
                ]}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
          }
          title={
            <Space>
              配置
              <Popover
                content={
                  <Space direction="vertical">
                    {[
                      '支持配置正则和方法',
                      `正则: code: '/[0-9]{4}/'`,
                      `方法: code: 'F(){ return Random.id() }'`,
                    ].map((item, key) => (
                      <Text key={key}>{item}</Text>
                    ))}
                  </Space>
                }
                placement="bottom"
              >
                <QuestionCircleTwoTone />
              </Popover>
            </Space>
          }
          autoSize={{ minRows: 5 }}
        ></CardTextArea>
      </Form.Item>
      <CardTextArea
        title="mock"
        extra={
          <>
            <Form.Item noStyle name="urlRemoveLevel">
              <InputNumber addonBefore="url前面去掉层级" size="small" style={{ width: 180 }}></InputNumber>
            </Form.Item>
            <Form.Item noStyle name="isCompleteMockStr" valuePropName="checked">
              <Checkbox>完整代码</Checkbox>
            </Form.Item>
          </>
        }
        value={state.mockStr}
      ></CardTextArea>
    </div>
  );
});
