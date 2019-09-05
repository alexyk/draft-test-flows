import moment from "moment";
import config from "../config";
import ConsoleAction from "../items/ConsoleAction";
import { getObjectFromPath, getObjectClassName } from "js-tools";


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
  let retries = 0;
  let flowObject = {
    chain: [],
    cache: {}
  };

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
      try {
        flowObject._generator.next();
        retries = 0;
      } catch (error) {
        retries++;
        console.warn(`[AbstractFlow] Error: ${error.message}. Retrying ... (${retries})`)
        setTimeout(() => flowObject.next(), 50);
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
    console.log(`%c${getTime()}%c[Running] %cFlow Item ${index+1}/${len}                        ${title}${extraTitle} (${type})`, 'color: gray', 'color: green; font-weight: bold', 'font-weight: normal');

    try {
      yield flowItem.exec();
    } catch (error) {
      console.warn(
        `%c${getTime()} %c[Error] [${type}] [Item ${index+1}] `+
        `%cWhile executing '${title}${extraTitle}' - %c ${error.message}`,
        "color: gray",
        "color: normal; font-weight: bold",
        "font-weight: normal",
        "font-weight: bold"
      );
    }
    index++;
  }

  console.log(' ')
  console.log(' ')
  console.log(`%c${getTime()}%c[Ending] %c -------------------- Flow Finished ---------------------`, 'color: gray', 'color: orange; font-weight: bold', 'font-weight: normal');
  console.log(' ')

}

function getTime() {
  const timeStr = `${moment().format("HH:mm:ss.SSS")} `;
  return timeStr;
}


export default AbstractFlow;