const EventEmitter = require('events');

class PolicyEngine extends EventEmitter {
  constructor() {
    super();
    this.policies = {};
  }

  setPolicy(type, key, value) {
    const version = Date.now();
    const oldValue = this.policies[`${type}.${key}`];
    this.policies[`${type}.${key}`] = { value, version };
    this.emit('policy:changed', { type, key, value, oldValue, version, ts: new Date() });
  }

  getPolicy(type, key) {
    return this.policies[`${type}.${key}`]?.value;
  }
}

module.exports = new PolicyEngine();
