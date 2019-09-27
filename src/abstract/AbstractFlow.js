import moment from "moment";
import config from "../config";
import ConsoleAction from "../items/ConsoleAction";
import { getObjectFromPath, getObjectClassName, logError, config as jsToolsConfig, isFunction, log, isString } from "js-tools";


/**
 * 
 *   Optional props (AbstractFlowItem)
 *      waiting                 when set prevents next() from executing (set as props in AbstractFlowItem, used here)
 *      hidden                  prevents logging making the flow item appear as hidden (set as props in AbstractFlowItem, used here)
 *      if()                    a condition to check if in need to skip to the next flow item
 * 
 *   Need to be defined
 *      createChain()            a function that returns a sequence of promise, func, request etc.
 * 
 *   Auto generated:
 *      _aborted                flow is aborted
 *      _generator              the generator used for progressing the flow
 *      _index                  current flow item index
 *      currentItem                   
 *      chain                   a sequence of promise, func, request etc.
 *      cache                   
 * 
 *  Methods
 *      next()                  gives control to next flow item
 *      abort()
 *      continue()              sets waiting to false and calls next
 *
 *   -----------------------------------------------------------------------------------------------
 * 
 *   Other ideas:
 *      repo                    an object of predefined functions (func) and data (data)
 *      promise, data           a promise that sets 'data' in repo
 *      request                 a server request
 */

function AbstractFlow(title) {
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
    flowObject.currentItem = chain[0];
    flowObject._generator = createGenerator(flowObject);
    flowObject._index = 0;

    // private case
    // if first item in flow is console.clear - execute it before printing any information here
    const itemOne = chain[0];
    if (itemOne instanceof ConsoleAction && itemOne.type == 'clear') {
      console.clear();
    }

    // give console.clear a bit of time
    setTimeout( () => {
      log(`%c${getTime()}%c[Starting] %c -------------------- Flow Starting ---------------------`, 'color: gray', 'color: yellow; font-weight: bold', 'font-weight: normal');
      log(` `);
      log(`                                   Test Flow "${title}"`);
      log(` `)


      // start first item
      flowObject._generator.next();
    }, 10);
  }

  flowObject.next = () => {
    if (getObjectFromPath(flowObject, 'currentItem.waiting') && flowObject.currentItem.if()) {
      return flowObject;
    }
    setImmediate(() => {
      try {
        flowObject._generator.next();
      } catch (error) {
        const details = getObjectClassName(flowObject.currentItem);
        logError(`AbstractFlow::next()`, null, error, `While executing Flow item ${details}`);
      }}
    );
  }

  flowObject.abort = function (message) {
    flowObject._aborted = message;
  }

  flowObject.continue = function () {
    flowObject.currentItem.configure({waiting: false});
    flowObject.next();
  }

  flowObject.createChain = () => {
    throw new Error(`[AbstractFlow] createChain() needs to be defined in subclasses`)
  };

  return flowObject;
}


function* createGenerator(flowObject) {
  const { chain } = flowObject;
  let len = chain.length;
  flowObject._index = 0;

  while (flowObject._index < len) {
    let index = flowObject._index;
    const flowItem = chain[index];
    flowObject.currentItem = flowItem;
    const type = getObjectClassName(flowItem);
    let { title, extraTitle } = flowItem;
    if (isFunction(title)) {
      title = title();
    }
    
    const { _aborted } = flowObject;
    const { hidden } = flowItem;

    if (_aborted != null && _aborted != false) {
      title = chain[index > 0 ? index-1 : 0].title;
      if (isFunction(title)) {
        title = title();
      }
      log(`${getTime()}[Aborting]  Flow aborted by '${title}'` + (isString(_aborted) ? ` (${_aborted})` : ''));
      break;
    }
    if (extraTitle == null) {
      extraTitle = '';
    }


    if (!hidden && flowItem.if()) {
      log(`%c${getTime()}%c[Running]  %cFlow-Item ${index+1}/${len}       ${title}${extraTitle} (${type})`, 'color: gray', 'color: green; font-weight: bold', 'font-weight: normal');
      try {
        yield flowItem.exec();
        flowObject._index++;
      } catch (error) {
        const itemName = getObjectClassName(flowItem);
        if (jsToolsConfig.noObjects) {
          logError(null, null, error.toString(), `(${itemName}::exec())`);
        } else {
          logError(`${itemName}::exec()`, null, error);
        }
        break;
      }
    } else if (flowItem.waiting) {
      yield;
    } else {
      log(`%c${getTime()}%c[Skipping] %cFlow-Item ${index+1}/${len}       ${title}${extraTitle} (${type})`, 'color: gray', 'color: green; font-weight: bold', 'font-weight: normal');
      flowObject._index++;
      flowObject.next();
    }
  }

  log();
  log();
  log(`%c${getTime()}%c[Ending] %c -------------------- Flow Finished ---------------------`, 'color: gray', 'color: orange; font-weight: bold', 'font-weight: normal');
  log();

}

function getTime() {
  const timeStr = `[${moment().format("HH:mm:ss.SSS")}] `;
  return timeStr;
}


export default AbstractFlow;