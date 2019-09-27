import { isObject } from "js-tools";

/**
 * Requirements when creating a new subclass:
 * 
 *  1. override exec()
 *  2. end exec() with this.flowObject.next() call
 * 
 *   Optional props (modified by configure)
 *      waiting               skip internal next() and do it explicitly at a custom moment (set here with configure, used in AbstractFlow)
 *      hidden                prevents flow item title logging on next() (set here with configure, used in AbstractFlow)
 *      if()                  a condition to check if need to skip exec() of this flow item (used in AbstractFlow)
 *
 *  Methods
 *      configure()           returns itself (for currying)
 *      if()                  returns true if can run, otherwise skipping
 *      exec()
 * 
*/
class AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames) {
    this.title = title;
    this.flowObject = flowObject;
    this.cacheParamNames = cacheParamNames;

    this.exec = this.exec.bind(this);

    // extra options
    this.hidden = false;
    this.waiting = false;
  }

  if () {
    return true;
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