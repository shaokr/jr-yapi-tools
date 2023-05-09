/* eslint-disable @typescript-eslint/no-unsafe-argument */
import JSON from 'json5';
import _ from 'lodash';
import fp from 'lodash/fp';

import { deepSortBy } from './deep-sort-by';

const keyRegConfig = [
  { reg: /[tT]ime$/, value: '@datetime', ability: '' },
  { reg: /[nN]ame$/, value: '@cword(3,10)', ability: '' },
  { reg: /(Id$|^id$)/, value: 1, ability: '|+1' },
  { reg: /^code$/, value: '0000', ability: '' },
  { reg: /^value$/, value: -1, ability: '|+1' },
  {
    reg: /^label$/,
    value: "F(){ return `${mock('@cname')}-${this.value}`; }",
    ability: '',
  },
  {
    reg: /[Rr]emark/,
    value: '@cparagraph',
    ability: '',
  },
];

export default (originalData: any, config: Record<string, string> = {}) => {
  let _config = _.map(config, (value, key) => ({
    key: _.last(key.split('.')) as string,
    value,
    _key: key,
  }));
  _config = _.orderBy(_config, (item) => item._key.split('.').length, ['desc']);
  const transform = (data: any, path: string[] = []) => {
    const _path = path.join('.');
    return _.transform(deepSortBy(data), (result: any, value: any, key: string) => {
      const _configItem = _.find(_config, (item) => _.endsWith(`${_path}.${key}`, item._key.split('|')[0]));
      if (_configItem) {
        const _key = _.last(_configItem.key.split('.')) as string;
        result[_key] = _configItem.value;
        return;
      }

      const _regVal = _.find(keyRegConfig, (val) => val.reg.test(key));
      if (_regVal) {
        result[`${key}${_regVal.ability}`] = _regVal.value;
        return;
      }
      if (_.isString(value) || _.isNil(value)) {
        result[`${key}`] = '@word(3,10)';
        return;
      }
      if (_.isNumber(value)) {
        result[`${key}|1-1000`] = 1;
        return;
      }
      if (_.isBoolean(value)) {
        result[`${key}`] = '@boolean';
        return;
      }
      if (_.isPlainObject(value)) {
        result[key] = transform(value, [...path, key]);
        return;
      }
      if (_.isArray(value)) {
        const _value = fp.cond([
          //
          [fp.isString, fp.constant('@word(3,10)')],
          [fp.isBoolean, fp.constant('@boolean')],
          [fp.isNumber, fp.constant('@integer(1,100)')],
          [fp.stubTrue, (data) => transform(data, [...path, key])],
        ])(value[0]);
        result[`${key}|10`] = [_value];
        return;
      }
    });
  };
  return fp.flow(
    (data) => transform(data),
    (data) =>
      JSON.stringify(data, (key, val) => {
        if (_.isFunction(val)) {
          return val.toString().replace(/.+/, 'F(){').replace(/\n/g, '').replace(/_this/g, 'this');
        }
        return val;
      }),
    fp.replace(/["']?([^"']+?)["']?:["'](?:F|f|function)(\(\).+?})["']/g, '$1$2'),
    fp.replace(/['"](\/.+?\/[igms]*)['"](?=,?)/g, (_, v1) => v1.replace(/\\\\/g, '\\')),
  )(originalData);
};
