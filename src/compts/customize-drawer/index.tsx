import { ConfigProvider, Drawer, DrawerProps, Empty } from 'antd';
import { observer } from 'mobx-react';

type Props = DrawerProps & {
  isEmpty?: boolean;
};
export default observer(({ children, isEmpty, visible, ...props }: Props) => {
  return (
    <Drawer
      width="80%"
      placement="left"
      open={visible}
      {...props}
      bodyStyle={{ padding: '10px' }}
      headerStyle={{ padding: '10px' }}
    >
      {isEmpty ? <Empty /> : <>{children}</>}
    </Drawer>
  );
});
