import _ from 'lodash';
import fp from 'lodash/fp';

export const deepSortBy = (data?: object): object => {
  if (_.isObject(data)) {
    return fp.flow(fp.toPairs, fp.sortBy([0]), fp.fromPairs)(data);
  }
  return data || {};
};
