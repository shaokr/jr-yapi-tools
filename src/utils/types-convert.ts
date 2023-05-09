/* eslint-disable @typescript-eslint/no-unsafe-argument */
import _ from "lodash";
import fp from "lodash/fp";
import { deepSortBy } from "./deep-sort-by";

type ConvertDataType =
  | any
  | {
      required:
        | _.Dictionary<string>
        | _.NumericDictionary<string>
        | null
        | undefined;
    };
export type ConvertConfigType = {
  key: string;
  prefix: string;
  description: string;
  defRequired?: boolean;
  reduceLayers?: number;
};
type PathsType = (string | number)[];

const convert = (
  data: ConvertDataType,
  config: ConvertConfigType | ((data: any) => ConvertConfigType)
) => {
  const obj: {
    key: string;
    str: string;
    data: ConvertDataType;
    paths: PathsType;
  }[] = [];

  const objKey: Record<string, number> = {};
  /** 净化处理 */
  const purifyData = (() => {
    return _.cloneDeepWith(_.cloneDeep(data), (value, key) => {
      if (_.isPlainObject(value)) {
        if (value.type) {
          delete value.description;
          delete value.required;
        }
      }
    });
  })();
  const internalConvert = (
    data: ConvertDataType,
    configFn: (data?: any) => ConvertConfigType,
    paths: PathsType = []
  ) => {
    let properties = data;
    if (fp.get("properties", data)) {
      properties = fp.get("properties", data);
      paths.push("properties");
    } else if (fp.get("items", data)) {
      properties = fp.get("items", data);
      paths.push("items");
    } else if (fp.get("data", data)) {
      properties = fp.get("data", data);
      paths.push("data");
    }
    const config = configFn(data);
    const { prefix, defRequired } = config;
    const reduceLayers = config.reduceLayers || 0;
    let _str = `${config.description}\nexport type ${prefix}${fp.upperFirst(
      config.key
    )} = {`;
    const arr: [...Parameters<typeof internalConvert>][] = [];

    if (fp.has("enum", properties)) {
      _str = [
        fp.flow(
          fp.get("enumDesc"),
          fp.split("\n"),
          fp.map((item) => ` * ${item}`),
          (data) => ["/**", ...data, " */"],
          fp.join("\n")
        )(properties),
        `enum ${prefix}${fp.upperFirst(config.key)} {`,
        ...fp.flow(
          fp.get("enum"),
          fp.map((item) => `  ${item} = ${item}`)
        )(properties),
        `}`,
      ].join("\n");
    } else {
      _.forEach(deepSortBy(properties), (item: any, key) => {
        let firstKey = fp.upperFirst(fp.camelCase(key));
        const isPush = !_.some(obj, (data) => {
          return (
            fp.eq(firstKey, data.key) &&
            JSON.stringify(deepSortBy(_.get(purifyData, [...paths, key]))) ===
              JSON.stringify(
                deepSortBy(
                  _.get(
                    purifyData,
                    _.take(
                      data.paths,
                      _.findLastIndex(data.paths, fp.eq(key)) + 1
                    )
                  )
                )
              )
          );
        });
        if (_.find(obj, { key: firstKey }) && isPush) {
          objKey[key] = (objKey[key] || 0) + 1;
          firstKey = `${firstKey}_${objKey[key]}`;
        }
        let description = "";
        if (item.description) {
          description = `/** ${item.description.replace(/\n/g, " ")} */`;
          _str += `\n   ${description}`;
        }
        const required = fp.get("required", data);
        if (required) {
          _str += `\n  ${key}${fp.includes(key, required) ? "" : "?"}: `;
        } else {
          if (defRequired) {
            _str += `\n  ${key}: `;
          } else {
            _str += `\n  ${key}?: `;
          }
        }

        let { type } = item;
        if (fp.isUndefined(type)) {
          type = fp.cond([
            [fp.isArray, fp.constant("array")],
            [fp.isObject, fp.constant("object")],
            [fp.stubTrue, (data) => typeof data],
          ])(item);
        }
        _str += fp.cond([
          [fp.eq("integer"), fp.constant("number")],
          [
            fp.eq("object"),
            () => {
              isPush &&
                arr.push([
                  item,
                  (data) => ({
                    ...configFn(data),
                    key: firstKey,
                    description,
                    reduceLayers: reduceLayers - 1,
                  }),
                  [...paths, key],
                ]);
              return ` ${prefix}${firstKey};`;
            },
          ],
          [
            fp.eq("array"),
            () => {
              const _type = fp.get("items.type", item);
              if (fp.get("items.type", item) === "object") {
                isPush &&
                  arr.push([
                    fp.getOr(item, "items", item),
                    (data) => ({
                      ...configFn(data),
                      key: firstKey,
                      description,
                      reduceLayers: reduceLayers - 1,
                    }),
                    [...paths, key, "items"],
                  ]);
                return ` ${prefix}${firstKey}[];`;
              }
              return ` ${_type}[];`;
            },
          ],
          [fp.stubTrue, (data) => ` ${data};`],
        ])(type);
      });
      _str += "\n}";
    }
    if (reduceLayers <= 0) {
      obj.push({
        key: config.key,
        str: _str,
        data,
        paths,
      });
    }
    _.forEach(arr, (item) => internalConvert(...item));
    // return obj.map(fp.get('str')).join('\n');
  };
  internalConvert(data, _.isFunction(config) ? config : _.constant(config));
  return fp.join("\n")(fp.map(fp.get("str"), obj));
};

export default convert;
