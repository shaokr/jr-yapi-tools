import _ from "lodash";
import fp from "lodash/fp";
import { Button, Dropdown, Menu } from "antd";
import { observer, useLocalObservable } from "mobx-react";
import { AlertTwoTone } from "@ant-design/icons";

import AbilityTypes from "./ability/types";
import AbilityMock from "./ability/mock";

import styles from "./app.module.less";

const Overlay = observer(() => {
  const state = useLocalObservable(() => ({
    drawerTypesVisible: false,
    drawerMockVisible: false,
    toggleVisible(key: string) {
      const val = fp.get(key, this);
      if (fp.isBoolean(val)) {
        _.set(this, key, !val);
      }
      _.forEach(this, (item, _key) => {
        if (_key != key && item === true) {
          _.set(this, _key, false);
        }
      });
    },
  }));

  return (
    <>
      <Menu>
        <Menu.Item
          key="1"
          onClick={state.toggleVisible.bind(null, "drawerTypesVisible")}
        >
          请求和返回TS类型
        </Menu.Item>
        <Menu.Item
          key="3"
          onClick={state.toggleVisible.bind(null, "drawerMockVisible")}
        >
          mock
        </Menu.Item>
      </Menu>

      <AbilityTypes
        visible={state.drawerTypesVisible}
        onClose={state.toggleVisible.bind(null, "drawerTypesVisible")}
      />
      <AbilityMock
        visible={state.drawerMockVisible}
        onClose={state.toggleVisible.bind(null, "drawerMockVisible")}
      />
    </>
  );
});
const App = observer(() => {
  return (
    <div className={styles.app}>
      <Dropdown overlay={<Overlay></Overlay>}>
        <Button>
          <AlertTwoTone />
          额外功能
        </Button>
      </Dropdown>
    </div>
  );
});

export default App;
