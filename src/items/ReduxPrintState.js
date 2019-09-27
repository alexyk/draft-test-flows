import AbstractFlowItem from "../abstract/AbstractFlowItem";
import config from "../config";
import { log } from "js-tools";


class ReduxPrintState extends AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames) {
    super(title, flowObject, cacheParamNames);
  }

  exec() {
    const { flowObject, cacheParamNames } = this;

    const reduxState = config.reduxStore.getState();
    let data = {};
    if (cacheParamNames != null && cacheParamNames.length > 0) {
      cacheParamNames.forEach(item => data[item] = getDataByPath(reduxState, item))
    } else {
      data = reduxState;
    }

    log(`[ReduxPrintState] Current redux state`, data);
    flowObject.next();
    
    return this;
  }
}

function getDataByPath(rootObject, path) {
  let result = rootObject;
  path
    .split(".")
    .forEach(item => (result = result[item]));

  return result;
}

export default ReduxPrintState;