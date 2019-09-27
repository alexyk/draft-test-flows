import config from "../config";

import PrintCache from "../items/PrintCache";
import DelayAction from "../items/DelayAction";
import AbstractFlow from "../abstract/AbstractFlow";
import NavigationAction from "../items/NavigationAction";
import ExecuteFunction from "../items/ExecuteFunction";
import ReduxPrintState from "../items/ReduxPrintState";
import ReduxDispatchAction from "../items/ReduxDispatchAction";
import ConsoleAction from "../items/ConsoleAction";
import { isArray, log } from "js-tools";

/**
 * Needed configs:
 * 
 *  Step 1: Using setConfig
 *  Set the following props with setConfig:
 *    getParams(flow)(name)       a function with param 'flow' that returns a function - with param 'name' of param
 *    reduxAction                 dispatch-action taken from props
 * 
 *  Step 2:
 *  Definitions in getParams
 *      For ReduxPrintState:
 *          redux1,2                property paths to get from redux state when printing it
 *          redux-exec-payload      payload for the executed function (dispatch-action)
 * 
 *      For ReduxDispatchAction:
 *          redux-action-type       what is the name of the action to dispatch
 *          redux-action-payload    payload for the action
 * 
 *      For NavigationAction:
 *          nav-screen              screen name
 *          nav-params              navigation params to send to switching screen ()
 *      
 */

let sampleFlow = function (selectedIndexes) {
  let flow = AbstractFlow('Sample Flow - with exec, redux and navigation flow items');
  log('get params', config)
  let getParams = config.getParams(flow);

  // chain of commands
  // prettier-ignore
  flow
    .createChain = () => [
      new ConsoleAction         ('clear console'          , flow, [], 'clear'),
      new ConsoleAction         ('start time calculation' , flow, [], 'time-start', 'guest-flow-duration'),

      new ReduxPrintState       ('redux initial state'    , flow, []),

      // execute redux action from config (see config.js -> setConfig)
      new ReduxPrintState       ('redux state - before exec'                            , flow, getParams('redux1')),    
      new ExecuteFunction       ('set redux data (with an action set with setConfig)'   , flow, [], config.reduxAction, getParams('redux-exec-payload'), null),
      new ReduxPrintState       ('redux state - after exec'                             , flow, getParams('redux1')),

      // executing a redux action directly with store.dispatch
      new ReduxPrintState       ('redux state - before action'    , flow, getParams('redux2')),
      new ReduxDispatchAction   ('dispatch a redux action'        , flow, [], getParams('redux-action-type'), getParams('redux-action-payload')),
      new ReduxPrintState       ('redux state - after after'      , flow, getParams('redux2')),
      
      new DelayAction           ('delay'                  , flow, [], 0.7),

      // navigating to a screen - sending params
      new ConsoleAction         ('pint nav params'        , flow, [], 'log', getParams('nav-params')),
      new NavigationAction      ('navigate'               , flow, [], getParams('nav-screen'), getParams('nav-params')),
      new PrintCache            ('print cache'            , flow),


      new ConsoleAction         ('end time calculation'   , flow, [], 'time-end', 'guest-flow-duration'),
  ];

  if (isArray(selectedIndexes)) {
    const origFunc = flow.createChain;
    flow.createChain = () => {
      let chain = origFunc();
      let newChain = [];
      while (selectedIndexes.length > 0) {
        let i1 = selectedIndexes.shift();
        let i2 = selectedIndexes.shift();
        if (i2 != null) {
          newChain = newChain.concat(chain.slice(i1, i2));
        } else {
          newChain = newChain.concat(chain.slice(i1));
        }
      }
      return newChain;
    }
  }

  return flow;
}


export default sampleFlow;