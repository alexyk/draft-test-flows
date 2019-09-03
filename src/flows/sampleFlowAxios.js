import config from "../config";

import AbstractFlow from "../abstract/AbstractFlow";
import AxiosRequest from "../items/AxiosRequest";
import ConsoleAction from "../items/ConsoleAction";
import NavigationAction from "../items/NavigationAction";


let sampleFlowAxios = function () {
  let flow = AbstractFlow('sample-flow');

  let data = {
    url: 'https://beta.locktrip.com/api/regions/search?query=sof',
    screen: "WebviewScreen"
  }
  data.navParams = () => ({simpleParams: {url: data.url}});

  // prettier-ignore
  flow
    .createChain = () => [
      new ConsoleAction         ('clear console'          , flow, [], 'clear'),
      new ConsoleAction         ('start time calculation' , flow, [], 'time-start', 'guest-flow-duration'),

      new AxiosRequest          ('axios request'          , flow, ['data','error'], data.url, {}),

      new NavigationAction      ('open in webview'        , flow, [], data.screen, data.navParams),
      new ConsoleAction         ('end time calculation'   , flow, [], 'time-end', 'guest-flow-duration'),
  ];

  return flow;
}


export default sampleFlowAxios;