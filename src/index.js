import items from "./items";
import flows from "./flows";
import abstract from "./abstract";
import config, { setConfig } from "./config";

export default { ...items, ...abstract, setConfig, config, flows };

// named exports - abstract
import AbstractFlow from './abstract/AbstractFlow';
import AbstractFlowItem from './abstract/AbstractFlowItem';
export {
  AbstractFlow,
  AbstractFlowItem
}

// named exports - items
import FetchRequest from "./items/FetchRequest";
import AxiosRequest from "./items/AxiosRequest";
import NavigationAction from "./items/NavigationAction";
import PromiseResult from "./items/PromiseResult";
import RequestResult from "./items/RequestResult";
import ExecuteFunction from "./items/ExecuteFunction";
import PrintCache from "./items/PrintCache";
import DelayAction from "./items/DelayAction";
import ReduxPrintState from "./items/ReduxPrintState";
import ReduxDispatchAction from "./items/ReduxDispatchAction";
import ConsoleAction from "./items/ConsoleAction";
export {
  FetchRequest,
  AxiosRequest,
  NavigationAction,
  PromiseResult,
  RequestResult,
  ExecuteFunction,
  PrintCache,
  DelayAction,
  ReduxPrintState,
  ReduxDispatchAction,
  ConsoleAction
};

// named exports - flows
import sampleFlow from "./flows/sampleFlow";
import sampleFlowAxios from "./flows/sampleFlowAxios";
import sampleFlowFetch from "./flows/sampleFlowFetch";
export { 
  sampleFlow,
  sampleFlowAxios,
  sampleFlowFetch,
}


/**
 * TODO:
 *    1. Create README
 *    2. Create an example
 *    3. Clean & format code
 *    4. Write tests
 */