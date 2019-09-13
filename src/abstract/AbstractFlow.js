import moment from "moment";
import config from "../config";
import ConsoleAction from "../items/ConsoleAction";
import { getObjectFromPath, getObjectClassName, logError } from "js-tools";


/**
 * 
 * props:
 *   Need to be defined
 *      createChain             - a function that returns a sequence of promise, func, request etc.
 * 
 *   Auto generated:
 *      chain                   - a sequence of promise, func, request etc.
 * 
 *   Other ideas:
 *      repo                    - an object of predefined functions (func) and data (data)
 *      promise, data           - a promise that sets 'data' in repo
 *      request                 - a server request
 */

function AbstractFlow(title) {
  let flowObject = {
    chain: [],
    cache: {}
  };

  flowObject.getCurrentItem = function() {
    return flowObject.chain[flowObject._index];
  }

  flowObject.readAll = function() {
    return flowObject.cache;
  }
  
  flowObject.read = function(propName) {
    return getObjectFromPath(flowObject.cache, propName);
  }

  flowObject.write = function(propName, value) {
    flowObject.cache[propName] = value;
    return flowObject;
  }

  flowObject.exec = () => {
    let chain = flowObject.createChain();
    flowObject.chain = chain;
    flowObject._index = 0;
    flowObject._generator = createGenerator(flowObject);

    // private case
    // if first item in flow is console.clear - execute it before printing any information here
    const itemOne = chain[0];
    if (itemOne instanceof ConsoleAction && itemOne.type == 'clear') {
      console.clear();
    }

    // give console.clear a bit of time
    setTimeout( () => {
      console.log(`%c${getTime()}%c[Starting] %c -------------------- Flow Starting ---------------------`, 'color: gray', 'color: yellow; font-weight: bold', 'font-weight: normal');
      console.log(` `)
      console.log(`                                   Test Flow "${title}"`);
      console.log(` `)


      // start first item
      flowObject.next();
    }, 10);
  }

  flowObject.next = () => {
    setTimeout(() => {
      let flowItem = flowObject.getCurrentItem();
      let result;
      try {
        result = flowObject._generator.next();
      } catch (error) {
        const details = getObjectClassName(flowItem);
        logError(`AbstractFlow::next()`, null, error, `While executing Flow item ${details}`);
      }},
      50
    );
  }

  flowObject.createChain = () => {
    throw new Error(`[AbstractFlow] createChain() needs to be defined in subclasses`)
  };

  return flowObject;
}


function* createGenerator(flowObject) {
  const { chain } = flowObject;
  let index = 0;
  let len = chain.length;

  while (index < len) {
    flowObject._index = index;
    const flowItem = chain[index];
    const type = getObjectClassName(flowItem);
    let { title, extraTitle } = flowItem;
    if (extraTitle == null) {
      extraTitle = '';
    }
    console.log(`%c${getTime()}%c[Running] %cFlow-Item ${index+1}/${len}       ${title}${extraTitle} (${type})`, 'color: gray', 'color: green; font-weight: bold', 'font-weight: normal');

    try {
      yield flowItem.exec();
    } catch (error) {
      const itemName = getObjectClassName(flowItem);
      logError(`${itemName}::exec()`, null, error);
    }
    index++;
  }

  console.log(' ')
  console.log(' ')
  console.log(`%c${getTime()}%c[Ending] %c -------------------- Flow Finished ---------------------`, 'color: gray', 'color: orange; font-weight: bold', 'font-weight: normal');
  console.log(' ')

}

function getTime() {
  const timeStr = `[${moment().format("HH:mm:ss.SSS")}] `;
  return timeStr;
}


export default AbstractFlow;