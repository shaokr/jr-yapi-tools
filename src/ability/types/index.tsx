import { useRef } from "react";
import { Button, Card, Drawer, Input, message } from "antd";
import { observer } from "mobx-react";
import { copy } from "clipboard";
import store from "../../store";
import { TextAreaRef } from "antd/lib/input/TextArea";
const { TextArea } = Input;

type Props = { visible: boolean; onClose: () => void };
export default observer(({ visible, onClose }: Props) => {
  const reqRef = useRef<TextAreaRef>(null);
  const resRef = useRef<TextAreaRef>(null);
  return (
    <Drawer
      title="请求和返回TS类型"
      visible={visible}
      width="80%"
      onClose={onClose}
      placement="left"
    >
      <div style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
        <Card
          title="请求"
          extra={
            <Button
              onClick={() =>
                copy(reqRef.current?.resizableTextArea?.textArea as any, {})
              }
            >
              复制
            </Button>
          }
        >
          <TextArea value={store.reqStr} autoSize ref={reqRef} />
        </Card>
        <Card
          title="返回"
          extra={
            <Button
              onClick={() => copy(resRef.current?.resizableTextArea?.textArea as any, {})}
            >
              复制
            </Button>
          }
        >
          <TextArea value={store.resStr} autoSize ref={resRef} />
        </Card>
      </div>
    </Drawer>
  );
});
