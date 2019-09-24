import AbstractFlowItem from "../abstract/AbstractFlowItem";
import { logGreen, logWarn, getConditionsByPath, config as jsToolsConfig, isFunction, logError } from "js-tools";


class FetchRequest extends AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames, url, dataConfig, id, customOnSuccess=null, customOnError=null, customParse=null, customRecaptcha=null) {
    super(title, flowObject, cacheParamNames);

    this.id = id;
    this.url = url;
    this.dataConfig = dataConfig;

    this.checkStatus = this.checkStatus.bind(this);
    this.parseResponse = ( customParse != null ? customParse.bind(this) : this.parseResponse.bind(this));
    this.checkForRecaptcha = (customRecaptcha != null ? customRecaptcha.bind(this) : this.checkForRecaptcha.bind(this));
    this.onSuccess = (customOnSuccess != null ? customOnSuccess.bind(this) : this.onSuccess.bind(this));
    this.onError = (customOnError != null ? customOnError.bind(this) : this.onError.bind(this));
  }

  checkStatus(response) {
    if (!jsToolsConfig.noObjects) {
      logGreen(this, {response});
    }
    if (response.ok) {
      return response.text();
    } else {
      return Promise.reject({error: new Error('Response not ok'), response});
    }
  }
  
  parseResponse(textData) {
    if (!jsToolsConfig.noObjects) {
      logGreen(this, {textData});
    }
    const jsonData = JSON.parse(textData);

    return Promise.resolve({jsonData,textData});
  }

  checkForRecaptcha(textData, response, error) {
    const { conditions: recaptchaConditions, comparisonResult } = getConditionsByPath(response, "response._bodyInit._data.type", "text/html");
    const isRecaptcha = ( 
      comparisonResult == true
        && textData != null
        && textData.includes("Please complete the security check to access")
    );
    
    logGreen(this,
      {
        isRecaptcha,
        textDataTruncated: textData ? textData.substr(0, 100) : "n/a",
        response: (jsToolsConfig.noObjects ? null : response)
      },
      "started: ", "Checking if the response is a case of a recaptcha triggered"
    );

    if (isRecaptcha) {
      logGreen(this, '', 'ended:', 'Yes - recaptcha recognized');
      this.flowObject.write({goto: this.url});
    } else {
      //logWarn(this, {isRecaptcha, recaptchaConditions}, 'ended: Response seems to be different from a recaptcha case');
    }
    this.flowObject.next();
  }

  onSuccess({jsonData, textData}) {
    if (!jsToolsConfig.noObjects) {
      logGreen(this, {jsonData});
    }
    this.flowObject.next();
  }

  onError(errorData) {
    const { error, response } = errorData;

    if (!response) {
      if (!jsToolsConfig.noObjects) {
        logGreen(this, {errorData});
      }
      return;
    }

    response
      .text()
      .then(textData => this.checkForRecaptcha(textData, response, error));

    this.flowObject.next();
  }

  exec() {
    let { url, dataConfig, checkStatus, parseResponse, onSuccess, onError } = this;

    if (isFunction(url)) {
      url = url();
    }
    if (isFunction(dataConfig)) {
      dataConfig = dataConfig();
    }

    logGreen(this, {dataConfig}, 'Loading', `${url}`);
    
    fetch(url, dataConfig)
      .then(checkStatus)
      .then(parseResponse)
      .then(onSuccess)
      .catch(onError);
  }
}

export default FetchRequest;