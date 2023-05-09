import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import ReactDOM from 'react-dom';
import App from './app';
import './index.less';
const div = document.createElement('div');
document.body.append(div);

ConfigProvider.config({
  prefixCls: 'yapi',
  iconPrefixCls: 'yapi',
});

ReactDOM.render(
  <ConfigProvider  locale={zhCN} prefixCls='yapi' >
    <App />
  </ConfigProvider>,
  div,
);
