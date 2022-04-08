import _ from "lodash";
import Monitor from "./monitor";

export default class {
  list: { regExp: RegExp; callback: any }[] = [];
  _onPeplaceState = new Monitor();
  _onPushState = new Monitor();
  constructor() {
    this._init();
  }
  _init = () => {
    const slef = this;
    const _wr = function (type: "pushState" | "replaceState") {
      const orig = history[type];
      return function (this: any) {
        const rv = orig.apply(this, arguments as any);
        const e = new Event(type);
        (e as any).arguments = arguments;
        window.dispatchEvent(e);
        return rv;
      };
    };
    history.pushState = _wr("pushState");
    history.replaceState = _wr("replaceState");

    window.addEventListener("replaceState", function (e) {
      slef._onPeplaceState.go(e);
    });
    window.addEventListener("pushState", function (e) {
      slef._onPushState.go(e);
    });
  };
  _readystatechange(event: { target: any }) {
    const { target } = event;

    _.forEach(this.list, (val) => {
      if (val.regExp.test(target.responseURL)) {
        val.callback(JSON.parse(target.response));
      }
    });
  }
  onPeplaceState = this._onPeplaceState.on;
  onPushState = this._onPushState.on;
}
