import fp from 'lodash/fp';

export default () => {
  return `
import { BizHttpRequest } from '@shared/service/core/biz-http-request';
import { $1, $2} from '@shared/types/$1';
  
class name_Service extends BizHttpRequest {
    public getMsgNoticeList(param: $2) {
      return this.$bizPost<$1>('$ajax_name', { ...param });
    }
}
  
export const name_Service = new name_Service();
`;
};
type WebServicesItemParams = {
  title: string;
  user: string;
  key: string;
  url: string;
  method: string;
  reqKey: string;
  resKey: string;
  path: string;
  isUrlExternalLocation?: boolean;
};
export const webServicesItem = ({
  title,
  user,
  key,
  url,
  method,
  reqKey,
  resKey,
  path,
  isUrlExternalLocation,
}: WebServicesItemParams) => {
  if (isUrlExternalLocation) {
    return [
      `/**`,
      ` * ${title}`,
      ` * @user ${user}`,
      ` * @url ${url}`,
      ` */`,
      `public ${key} = (param: ${reqKey}) => {`,
      `  return this.$biz${fp.capitalize(method)}<${resKey}>(this.${key}Url, { ...param });`,
      `}`,
      `${key}Url = '${path}'`,
    ].join('\n');
  }
  return [
    `/**`,
    ` * ${title}`,
    ` * @user ${user}`,
    ` * @url ${url}`,
    ` */`,
    `public ${key} = (param: ${reqKey}) => {`,
    `  return this.$biz${fp.capitalize(method)}<${resKey}>('${path}', { ...param });`,
    `}`,
  ].join('\n');
};
