import { AlertTwoTone } from "@ant-design/icons";
import { Button, Dropdown, App } from "antd";

import _ from "lodash";
import fp from "lodash/fp";
import { observable } from "mobx";
import { observer } from "mobx-react";
import AbilitySqlToJsonSchema from "./ability/sql-to-json-schema";
import AbilityMock from "./ability/mock";
import AbilityTypes from "./ability/types";
import AbilityWebServices from "./ability/web-services";
import styles from "./app.module.less";
import { useModalCustom } from "./compts/layout-modal";

const optionsConfig = [
  //
  { title: "请求和返回TS类型", content: AbilityTypes },
  { title: "mock", content: AbilityMock },
  { title: "webService", content: AbilityWebServices },
  { title: "生成json-schema", content: AbilitySqlToJsonSchema },
];

const state = observable({
  dropdownVisible: false,
  drawerVisibles: _.map(optionsConfig, fp.stubFalse) as boolean[],
  get selectedKeys() {
    return fp.flow(
      (data) => _.map(data, (item, index) => (item ? `${index}` : false)),
      fp.filter(fp.isString)
    )(this.drawerVisibles);
  },
  toggleVisible(index?: number) {
    this.drawerVisibles = _.map(this.drawerVisibles, fp.stubFalse);
    if (_.isNumber(index)) {
      this.drawerVisibles[index] = true;
    }
  },
  onVisibleChange(visible: boolean) {
    this.dropdownVisible = visible;
  },
});

export default observer(() => {
  const modalCustom = useModalCustom();
  return (
    <App className={styles.app}>
      <Dropdown
        menu={{
          items: _.map(optionsConfig, (item, index) => ({
            key: index,
            onClick: () => state.toggleVisible(index),
            label: item.title,
            style: { margin: 0 },
          })),
        }}
        open={state.dropdownVisible || _.some(state.drawerVisibles)}
        onOpenChange={(visible) => state.onVisibleChange(visible)}
        // overlayStyle={{margin:}}
        overlayStyle={{ width: 150 }}
      >
        <Button onClick={() => state.toggleVisible(0)}>
          <AlertTwoTone />
          额外功能
        </Button>
      </Dropdown>
      {_.map(optionsConfig, (item, index) => (
        <item.content
          key={index}
          visible={state.drawerVisibles[index]}
          onClose={() => state.toggleVisible()}
        />
      ))}
      {modalCustom}
    </App>
  );
});
