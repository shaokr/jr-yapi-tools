import JSON from 'json5';
import _ from 'lodash';
import Monitor from './monitor';

export default class {
  list: { regExp: RegExp; callback: any }[] = [];
  _onPeplaceState = new Monitor();
  _onPushState = new Monitor();
  constructor() {
    this._init();
  }
  _init = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const slef = this;
    const _wr = function (type: 'pushState' | 'replaceState' | 'back') {
      const orig = history[type];
      return function (this: any) {
        // eslint-disable-next-line prefer-rest-params
        const rv = orig.apply(this, arguments as any);
        const e = new Event(type);
        // eslint-disable-next-line prefer-rest-params
        (e as any).arguments = arguments;
        window.dispatchEvent(e);
        return rv;
      };
    };
    history.pushState = _wr('pushState');
    history.replaceState = _wr('replaceState');

    window.addEventListener('replaceState', function (e) {
      slef._onPeplaceState.go(e);
    });
    window.addEventListener('pushState', function (e) {
      slef._onPushState.go(e);
    });
  };
  _readystatechange(event: { target: any }) {
    const { target } = event;

    _.forEach(this.list, (val) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (val.regExp.test(target.responseURL)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        val.callback(JSON.parse(target.response));
      }
    });
  }
  onPeplaceState = this._onPeplaceState.on;
  onPushState = this._onPushState.on;
}
