import Axios from "axios";
import AbstractFlowItem from "../abstract/AbstractFlowItem";
import { logGreen, logWarn } from "js-tools";


class AxiosRequest extends AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames, url, config) {
    super(title, flowObject, cacheParamNames);

    this.url = url;
    this.config = config;

    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
  }

  onSuccess(data) {
    logGreen(this, data);

    this.flowObject.write(this.cacheParamNames[0], data)
    this.flowObject.next();
  }

  onError(data) {
    logError(this, data)

    this.flowObject.write(this.cacheParamNames[1], data)
    this.flowObject.next();
  }

  exec() {
    const { flowObject, url, config, method="GET"} = this;
    const _this = this;

    const requestFunc = () => Axios[method.toLowerCase()](url, config);
    
    requestFunc()
      .then(_this.onSuccess)
      .catch(_this.onError);
  }
}

export default AxiosRequest;