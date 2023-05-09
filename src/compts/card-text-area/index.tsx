/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Button, Card, CardProps, Space } from 'antd';
import TextArea, { TextAreaProps, TextAreaRef } from 'antd/lib/input/TextArea';
import { copy } from 'clipboard';
import { useRef } from 'react';
console.log(1111111)
type CardTextAreaProps = CardProps & {
  value?: TextAreaProps['value'];
  autoSize?: TextAreaProps['autoSize'];
  onChange?: TextAreaProps['onChange'];
};
export const CardTextArea = ({ autoSize, value, onChange, extra, ...props }: CardTextAreaProps) => {
  const txtRef = useRef<TextAreaRef | any>(null);

  return (
    <Card
      {...props}
      size="small"
      extra={
        <Space size="small" direction="horizontal">
          {extra}
          <Button onClick={() => copy(txtRef.current?.resizableTextArea?.textArea, {})}>复制</Button>
        </Space>
      }
    >
      <TextArea value={value} autoSize={autoSize} ref={txtRef} onChange={onChange} />
    </Card>
  );
};
CardTextArea.defaultProps = { autoSize: true };
