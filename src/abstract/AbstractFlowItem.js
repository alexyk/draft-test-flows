
/**
 * Requirements when creating a new subclass:
 * 
 *  1. override exec()
 *  2. end exec() with this.flowObject.next() call
 * 
 */
class AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames) {
    this.title = title;
    this.flowObject = flowObject;
    this.cacheParamNames = cacheParamNames;

    this.exec = this.exec.bind(this);
  }

  exec() {
    throw new Error('[AbstractFlowItem] exec() should be defined in subclasses');
  }
}

export default AbstractFlowItem;