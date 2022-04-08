import React from "react";
import ReactDOM from "react-dom";
import { ConfigProvider } from "antd";
import "./main.less";
import App from "./app";

const div = document.createElement("div");
setTimeout(() => {
  document.body.append(div);

  ReactDOM.render(
    <ConfigProvider prefixCls="skr" iconPrefixCls="skricon" >
      <App />
    </ConfigProvider>,
    div
  );
}, 1000);
