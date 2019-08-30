let config = {};
export function setConfig(values) {
  for (const prop in values) {
    config[prop] = values[prop];
  }
}

export default config;