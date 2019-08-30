import AbstractFlowItem from "../abstract/AbstractFlowItem";


class ConsoleAction extends AbstractFlowItem {
  constructor(title, flowObject, cacheParamNames, type, payload) {
    super(title, flowObject, cacheParamNames);

    this.type = type;
    this.payload = payload;
  }

  exec() {
    const { type, payload, flowObject } = this;

    switch (type) {
      case 'clear':
        // private case
        // if first item in flow is console.clear - execute it in AbstractFlow instead and skip here:
        if (flowObject._index > 0) {
          console.clear();
        }
        break;

      case 'log':
        console.log.apply(console, payload);
        break;

      case 'info':
        console.info.apply(console, payload);
        break;

      case 'warn':
        console.warn.apply(console, payload);
        break;
    
      case 'time-start':
        console.time(...payload);
        break;
    
      case 'time-end':
        console.timeEnd(...payload);
        break;
    
      default:
        console.log(`[ConsoleAction] Unknown type '${type}'`, {payload});
        break;
    }

    flowObject.next();
  }
}


export default ConsoleAction;