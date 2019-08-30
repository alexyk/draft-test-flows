
import AbstractFlowItem from "../abstract/AbstractFlowItem";

/**
 * Executes a promise and sets cache
 */
class PromiseResult extends AbstractFlowItem {
  /**
   * 
   * @param {Object} flowObject The flowObject object, where cache is
   * @param {Promise} promise The promise to handle
   * @param {Array} cacheParamNames Array of strings - the data to set
   */
  constructor(title, flowObject, cacheParamNames, promise) {
    super(title, flowObject, cacheParamNames);

    this.promise = promise;
  }
  
  exec() {
    const { promise, cacheParamNames, flowObject } = this;
    const _this = this;

    promise()
      .then((...data) => {
        data.forEach( (item, index) => {
          const propName = cacheParamNames[index];
          const value = data[index];

          // console.log(`    > [PromiseResult] Setting cache - ${propName}`, {propName, value});
          flowObject.write(propName, value);
        });
        flowObject.next();
      })
      .catch( error => {
        console.error(`[PromiseResult] Error executing '${_this.title}'`, error)
      })

  }
}

export default PromiseResult;