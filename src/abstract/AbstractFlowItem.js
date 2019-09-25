import { isObject } from "js-tools";

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

    // extra options
    this.suppressLogging = false;
  }

  configure(nameOrObject, value=null) {
    if (isObject(nameOrObject)) {
      const object = nameOrObject;
      for (let prop in object) {
        this[prop] = object[prop];
      }
    } else {
      const name = nameOrObject;
      this[name] = value;
    }

    return this;
  }

  exec() {
    throw new Error('[AbstractFlowItem] exec() should be defined in subclasses');
  }
}

export default AbstractFlowItem;