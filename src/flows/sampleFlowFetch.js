import config from "../config";

import AbstractFlow from "../abstract/AbstractFlow";
import FetchRequest from "../items/FetchRequest";
import ConsoleAction from "../items/ConsoleAction";
import NavigationAction from "../items/NavigationAction";


let sampleFlowFetch = function (data) {
  let flow = AbstractFlow('Sample Flow with fetch');

  // prettier-ignore
  flow
    .createChain = () => [
      new ConsoleAction         ('clear console'          , flow, [], 'clear'),
      new ConsoleAction         ('start time calculation' , flow, [], 'time-start', 'guest-flow-duration'),

      new FetchRequest          ('fetch request'          , flow, ['data','error'], data.url, {}),

      new NavigationAction      ('open in webview'        , flow, [], data.screen, data.navParams),
      new ConsoleAction         ('end time calculation'   , flow, [], 'time-end', 'guest-flow-duration'),
  ];

  return flow;
}


export default sampleFlowFetch;