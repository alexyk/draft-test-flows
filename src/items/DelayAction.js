import AbstractFlowItem from "../abstract/AbstractFlowItem";


class DelayAction extends AbstractFlowItem {
  /**
   * 
   * @param {String} title 
   * @param {Object} flowObject 
   * @param {Array} cacheParamNames 
   * @param {Number} delayInSeconds 
   */
  constructor(title, flowObject, cacheParamNames, delayInSeconds) {
    super(title, flowObject, cacheParamNames);

    this.delayInSeconds = delayInSeconds;
    this.extraTitle = ` - ${delayInSeconds}s`;
  }

  exec() {
    const { delayInSeconds, flowObject } = this;
    
    setTimeout(() => flowObject.next(), delayInSeconds * 1000);
  }
}

export default DelayAction;