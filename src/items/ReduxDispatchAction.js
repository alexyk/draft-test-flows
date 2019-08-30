import AbstractFlowItem from "../abstract/AbstractFlowItem";
import config from "../config";


class ReduxDispatchAction extends AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames, actionName, payload) {
    super(title, flowObject, cacheParamNames);

    this.actionName = actionName;
    this.payload = payload;
  }

  exec() {
    const { actionName, payload, flowObject } = this;

    config.reduxStore.dispatch({type: actionName, payload});

    flowObject.next();
  }
}

export default ReduxDispatchAction;