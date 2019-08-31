import AbstractFlowItem from "../abstract/AbstractFlowItem";
import { logGreen, getConditionsByPath } from "../tools";


class FetchRequest extends AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames, url, dataConfig) {
    super(title, flowObject, cacheParamNames);

    this.url = url;
    this.dataConfig = dataConfig;

    this.checkStatus = this.checkStatus.bind(this);
    this.parseResponse = this.parseResponse.bind(this);
    this.checkForRecaptcha = this.checkForRecaptcha.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
  }

  checkStatus(response) {
    logGreen(this, {response});
    if (response.ok) {
      return response.text();
    } else {
      return Promise.reject({error: new Error('Response not ok'), response});
    }
  }
  
  parseResponse(textData) {
    logGreen(this, {textData});
    return new Promise (() => textData);
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
        response
      },
      "started: ", "Checking if the response is a case of a recaptcha triggered"
    );

    if (isRecaptcha) {
      logGreen(this, '', 'ended:', 'Yes - recaptcha recognized');
      this.flowObject.write({goto: this.url});
    } else {
      logWarn(this, {isRecaptcha, recaptchaConditions}, 'ended: Response seems to be different from a recaptcha case');
    }
    this.flowObject.next();
  }

  onSuccess(jsonData) {
    logGreen(this, {jsonData});
    this.flowObject.next();
  }

  onError(errorData) {
    logGreen(this, {errorData});
    const { error, response } = errorData;

    response
      .text()
      .then(textData => this.checkForRecaptcha(textData, response, error));

    this.flowObject.next();
  }

  exec() {
    const { url, dataConfig, checkStatus, parseResponse, onSuccess, onError } = this;

    logGreen(this, {dataConfig}, 'Loading', `${url}`);
    
    fetch(url, dataConfig)
      .then(checkStatus)
      .then(parseResponse)
      .then(onSuccess)
      .catch(onError);
  }
}

export default FetchRequest;