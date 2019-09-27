import AbstractFlowItem from "../abstract/AbstractFlowItem";
import { logGreen, logWarn, getConditionsByPath, config as jsToolsConfig, isFunction, logError, isObject } from "js-tools";
import { isString } from "util";


class FetchRequest extends AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames, url, dataConfig, id, customOnSuccess=null, customOnError=null, customParse=null, customRecaptcha=null) {
    super(title, flowObject, cacheParamNames);

    this.id = id;
    this.url = url;
    this.dataConfig = dataConfig;

    this.checkStatus = this.checkStatus.bind(this);
    this.parseResponse = ( customParse != null ? customParse.bind(this) : this.parseResponse.bind(this));
    this.checkForRecaptcha = (customRecaptcha != null ? customRecaptcha.bind(this) : this.checkForRecaptcha.bind(this));
    this.customOnError = (customOnError ? customOnError.bind(this) : null);
    this.customOnSuccess = (customOnSuccess ? customOnSuccess.bind(this) : null);
    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
  }

  checkStatus(response) {
    if (!jsToolsConfig.noObjects) {
      logGreen(this, {response});
    }
    if (response.ok) {
      if (jsToolsConfig.noObjects) {
        logGreen(null, null, `checkStatus`.padEnd(20, ' ') + 'response ok' );
      }
      return response.text();
    } else {
      if (jsToolsConfig.noObjects) {
        const { statusText, status } = response;
        const statusString = `${status} ${statusText}`;
        logGreen(null, null, `checkStatus`.padEnd(20, ' ') + statusString );
      }
      const error = new Error('Response not ok');

      try {
        response.text().then(textData => this.checkForRecaptcha(textData, response, error));
      } catch (error2) {
        Promise.reject({error,error2,response})
      }
    }
  }


  checkForRecaptcha(textData, response, error) {
    const isRecaptcha = (textData != null && textData.includes("g-recaptcha"));

    if (!jsToolsConfig.noObjects) {
      logGreen(this,
        {
          isRecaptcha,
          textDataTruncated: textData ? textData.substr(0, 100) : "n/a",
          response: (jsToolsConfig.noObjects ? null : response)
        },
        "started: ", "Checking if the response is a case of a recaptcha triggered"
      );
    }

    let result;

    if (isRecaptcha) {
      this.flowObject.write({goto: this.url});
      result = {jsonData: null, textData, error, isRecaptcha};
    } else {
      // logWarn(this, {isRecaptcha, recaptchaConditions}, 'ended: Response seems to be different from a recaptcha case');
      result = {error2: new Error('Response not ok - not recaptcha'), response, error, textData};
    }

    if (jsToolsConfig.noObjects) {
      logGreen(null, null, `checkForRecaptcha`.padEnd(20, ' ') +  `${isRecaptcha ? 'is recaptcha' : 'not recaptcha'}` );
    }

    return result;
  }

  
  parseResponse(data) {
    let jsonData;
    let resultData = {};

    let {textData, isRecaptcha, error, error2} = data || {};
    if (isString(data)) {
      textData = data;
    } else {
      resultData = {...data}
    }
    if (jsToolsConfig.noObjects) {
      logGreen(null, null, `parseResponse`.padEnd(20, ' ') + `(${textData ? textData.length : 'n/a'} characters long) ` + (error || error2?'Has error: '+(error2 || error || ''):''));
    } else {
      logGreen(this, {textData});
    }
    try {
      jsonData = JSON.parse(textData);
      Object.assign(resultData, {jsonData});
    } catch (jsonError) {
      Object.assign(resultData, {jsonError})
      return Promise.reject(resultData);
    }

    if (error && !isRecaptcha) {
      return Promise.reject(resultData);
    } else {
      return Promise.resolve(resultData);
    }
  }


  onSuccess(data) {
    const { jsonData, isRecaptcha } = data || {};

    let skipNext = false;
    if (this.customOnSuccess) {
      skipNext = this.customOnSuccess(data || {});
    } else {
      if (jsToolsConfig.noObjects) {
        logGreen(null, null, `onSuccess: (${isRecaptcha ? 'recaptcha found' : '...'})`);
      } else {
        logGreen(this, {jsonData});
      }
    }

    if (!skipNext) {
      this.flowObject.next();
    }
  }

  onError(errorData) {
    let { response, error, message } = errorData || {};
    if (errorData instanceof Error) {
      error = errorData;
    }

    if (!response) {
      if (this.customOnError) {
        this.customOnError(errorData);
      } else {
        if (jsToolsConfig.noObjects) {
          logWarn(null, null, 'onError:'.padEnd(20, ' ') + (error || 'n/a'));
        } else {
          logWarn(this, {errorData});
        }  
      }
  
      return;
    }

    let skipNext = false;
    if (this.customOnError) {
      skipNext = this.customOnError(errorData);
    }
    if (!skipNext) {
      this.flowObject.next();
    }
  }

  exec() {
    let { url, dataConfig, checkStatus, parseResponse, onSuccess, onError } = this;

    if (isFunction(url)) {
      url = url();
    }
    if (isFunction(dataConfig)) {
      dataConfig = dataConfig();
    }
    if (isObject(dataConfig) && !dataConfig.hasOwnProperty('headers')) {
      dataConfig = {
        headers: this.flowObject.read('headers'),
        method: "POST",
        body: JSON.stringify(dataConfig)
      }
    }

    if (jsToolsConfig.noObjects) {
      logGreen(null, null, 'Request URL'.padEnd(19, ' '), `${url}`);
    } else {
      logGreen(this, {dataConfig}, 'Request', `${url}`);
    }
    
    fetch(url, dataConfig)
      .then(checkStatus)
      .then(parseResponse)
      .then(onSuccess)
      .catch(onError);
  }
}

export default FetchRequest;