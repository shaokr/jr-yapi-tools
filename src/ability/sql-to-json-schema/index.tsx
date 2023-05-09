/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Checkbox, Form, Radio, Space, Typography } from 'antd';
import _ from 'lodash';
import fp from 'lodash/fp';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react';
import { CardTextArea } from '../../compts/card-text-area';
import CustomizeDrawer from '../../compts/customize-drawer';
import store from '../../store';

const { Text } = Typography;

const state = new (class {
  formValues = {
    sql: '',
    // 内容类型
    contentType: 'res',
  };
  contentTypeOptions = [
    { label: '请求', value: 'req' },
    { label: '返回', value: 'res' },
  ];
  constructor() {
    makeAutoObservable(this);
  }
  onValuesChange = (value: any) => {
    _.merge(this.formValues, value);
  };
  get isRes() {
    const { contentType } = this.formValues;
    return contentType == 'res';
  }
  get jsonSchema() {
    const { isRes } = this;
    const { sql } = this.formValues;

    return fp.flow(
      (data: string) => data.match(/(`[\S]+` [a-z]+(\([0-9]+\))? [\s\S]+?',)/g),
      fp.map((item) => item.match(/((?<=`)([\S]+)(?=`)|([a-z]+)|NOT NULL|(?<=COMMENT ')(.+)(?='))/g)),
      fp.compact,
      (data) =>
        _.map(data, (item, index) => {
          const isRequired = fp.size(item) === 4;
          if (isRequired) item[2] = item[3];
          return [
            _.camelCase(_.get(item, 0, `${index}`)),
            {
              type: fp.cond([
                //
                [fp.eq('int'), fp.constant('number')],
                [fp.eq('tinyint'), fp.constant('number')],
                [fp.eq('bigint'), fp.constant('number')],
                [fp.stubTrue, fp.constant('string')],
              ])(item[1] || ''),
              description: _.get(item, 2, ''),
              required: isRequired,
            },
          ];
        }),
      fp.fromPairs,
      (data) => {
        const properties = fp.mapValues(fp.omit(['required']), data);
        const required = fp.flow(fp.toPairs, fp.filter(fp.get('1.required')), fp.fromPairs, fp.keys)(data);
        if (isRes) {
          return JSON.stringify(
            {
              type: 'object',
              title: 'empty object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                data: { type: 'object', properties },
                required: required,
              },
            },
            null,
            '  ',
          );
        }
        return JSON.stringify({ type: 'object', title: 'empty object', properties, required }, null, '  ');
      },
    )(sql);
  }
})();

type Props = { visible: boolean; onClose: () => void };
export default observer(({ visible, onClose }: Props) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} onValuesChange={state.onValuesChange} initialValues={state.formValues}>
      <CustomizeDrawer title="生成" visible={visible} onClose={onClose} isEmpty={!store.interfaceId}>
        <Contents />
      </CustomizeDrawer>
    </Form>
  );
});

const Contents = observer(() => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '10px' }}>
      <Form.Item name="sql" noStyle>
        <CardTextArea title={<Space>建表sql</Space>} autoSize={{ minRows: 5 }}></CardTextArea>
      </Form.Item>
      <CardTextArea
        title="生成内容"
        extra={
          <Space>
            <Form.Item name="contentType" noStyle>
              <Radio.Group optionType="button" size="small" options={state.contentTypeOptions} />
            </Form.Item>
          </Space>
        }
        value={state.jsonSchema}
      ></CardTextArea>
    </div>
  );
});
