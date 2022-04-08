import { useRef } from "react";
import { Button, Card, Checkbox, Drawer, Input, message, Space } from "antd";
import { observer } from "mobx-react";
import { copy } from "clipboard";
import store from "../../store";
import { TextAreaRef } from "antd/lib/input/TextArea";
const { TextArea } = Input;

type Props = { visible: boolean; onClose: () => void };

export default observer(({ visible, onClose }: Props) => {
  const mockRef = useRef<TextAreaRef>(null);
  const mockConfigRef = useRef<TextAreaRef>(null);
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
          title="配置"
          extra={
            <Button
              onClick={() =>
                copy(
                  mockConfigRef.current?.resizableTextArea?.textArea as any,
                  {}
                )
              }
            >
              复制
            </Button>
          }
        >
          <TextArea
            value={store.mockConfig}
            autoSize={{ minRows: 5 }}
            ref={mockConfigRef}
            onChange={({ target }) => store.setMockConfig(target.value)}
          />
        </Card>
        <Card
          title="mock"
          extra={
            <Space>
              <Checkbox
                checked={store.isCompleteMockStr}
                onChange={({ target }) => store.setIsCompleteMockStr(target.checked)}
              >
                完整代码
              </Checkbox>
              <Button
                onClick={() =>
                  copy(mockRef.current?.resizableTextArea?.textArea as any, {})
                }
              >
                复制
              </Button>
            </Space>
          }
        >
          <TextArea value={store.mockStr} autoSize ref={mockRef} />
        </Card>
      </div>
    </Drawer>
  );
});
