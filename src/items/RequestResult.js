import { serverRequest, requester } from "../config";
import AbstractFlowItem from "../abstract/AbstractFlowItem";


class RequestResult extends AbstractFlowItem {
  /**
   * 
   * @param {String} title The title to show while debugging
   * @param {Object} flowObject The object of the flow - with cache, next() etc.
   * @param {Array} cacheParamNames The cache params to set - it is supposed to be one in this case
   * @param {String} requestName The name of the request (for example 'getSearchResults')
   * @param {Array} params Parameters for the request
   */
  constructor(title, flowObject, cacheParamNames, requestName, params) {
    super(title, flowObject, cacheParamNames);

    this.requestName = requestName;
    this.params = params;

    this.onRequestSuccess = this.onRequestSuccess.bind(this);
    this.onRequestError = this.onRequestError.bind(this);
  }

  onRequestSuccess(data) {
    const { flowObject, cacheParamNames } = this;
    flowObject.write(cacheParamNames[0], {data});
    flowObject.next();
  }
  
  onRequestError(errorData, errorCode) {
    const { flowObject, cacheParamNames } = this;
    flowObject.write(cacheParamNames[0], {errorData, errorCode});
    flowObject.next();
  }

  exec() {
    const { requestName, params, onRequestSuccess, onRequestError } = this;
    serverRequest(this, requester[requestName], params, onRequestSuccess, onRequestError);
  }
}

export default RequestResult;