import AbstractFlowItem from "../abstract/AbstractFlowItem";


class ExecuteFunction extends AbstractFlowItem {
  /**
   * 
   * @param {String} title 
   * @param {Object} flowObject 
   * @param {Array} cacheParamNames 
   * @param {Function} functionObject 
   * @param {Array} params 
   * @param {Object} thisObject 
   */
  constructor(title, flowObject, cacheParamNames, functionObject, params, thisObject = null) {
    super(title, flowObject, cacheParamNames);

    this.functionToExecute = functionObject;
    this.functionParams = params;
    this.thisObject = thisObject;
  }


  exec() {
    const { thisObject, functionToExecute, functionParams, flowObject } = this;
    
    functionToExecute.apply(thisObject, functionParams);

    flowObject.next();
  }
}

export default ExecuteFunction;