import _ from "lodash";

const keyRegConfig = [
  { reg: /Time$/, value: "@datetime", ability: "" },
  { reg: /Name$/, value: "@cname", ability: "" },
  { reg: /(Id$|^id$)/, value: 1, ability: "|+1" },
  { reg: /^code$/, value: "0000", ability: '' },
];

export default (originalData: any, _config: any = {}) => {
  _config = _.mapValues(_config, (value, key) => ({
    key: _.last(key.split(".")),
    value,
    _key: key,
  }));
  _config = _.orderBy(_config, (item) => item._key.split(".").length, ["desc"]);
  var transform = (data: any, path: string[] = []) => {
    const _path = path.join(".");
    return _.transform(data, (result: any, value: any, key: string) => {
      const _configItem = _.find(_config, (item) =>
        _.endsWith(`${_path}.${key}`, item._key.split("|")[0])
      );
      if (_configItem) {
        const _kev = _.last(_configItem.key.split(".")) as string;
        result[_kev] = _configItem.value;
        return;
      }

      const _regVal = _.find(keyRegConfig, (val) => val.reg.test(key));
      if (_regVal) {
        result[`${key}${_regVal.ability}`] = _regVal.value;
        return;
      }
      if (_.isString(value) || _.isNil(value)) {
        result[`${key}`] = "@name";
        return;
      }
      if (_.isNumber(value)) {
        result[`${key}|1-1000`] = 1;
        return;
      }
      if (_.isPlainObject(value)) {
        result[key] = transform(value, [...path, key]);
        return;
      }
      if (_.isArray(value)) {
        result[`${key}|10`] = [transform(value[0], [...path, key])];
        return;
      }
    });
  };

  var _transform = transform(originalData);
  return JSON.stringify(_transform, (key, val) => {
    if (_.isFunction(val)) {
      return val.toString().replace(/[\S]+/, "F()").replace(/\n/g, "");
    }
    return val;
  }).replace(/"([\S]+)":"F(\(\)[^"]+)"/, "$1$2");
};
