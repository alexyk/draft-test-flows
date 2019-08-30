import AbstractFlowItem from "../abstract/AbstractFlowItem";


class PrintCache extends AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames) {
    super(title, flowObject, cacheParamNames);
  }

  exec() {
    console.log(`[PrintCache] Printing current flow cache`, this.flowObject.readAll());
    this.flowObject.next();
  }
}

export default PrintCache;