import _ from "lodash";
import fp from "lodash/fp";

const convert = (
  data: {
    required:
      | _.Dictionary<string>
      | _.NumericDictionary<string>
      | null
      | undefined;
  },
  key = "",
  str = ""
) => {
  const properties =
    fp.get("properties", data) ||
    fp.get("items", data) ||
    fp.get("data", data) ||
    data;
  let _str = `export type I${fp.upperFirst(key)} = {`;
  _.forEach(properties, (item, key) => {
    const firstKey = fp.upperFirst(key);
    if (item.description) {
      _str += `\n   /** ${item.description} */`;
    }
    _str += `\n  ${key}${fp.includes(key, data.required) ? "" : "?"}: `;
    let { type } = item;
    if (type == "object") {
      _str += ` I${firstKey};`;
      str = convert(item, firstKey, str);
      return;
    }
    if (type == "array") {
      _str += ` I${firstKey}[];`;
      str = convert(item.items, firstKey, str);
      return;
    }
    _str += ` ${type};`;
  });
  _str += "\n}";
  str = `\n${_str}` + str;
  return str;
};

export default convert;
