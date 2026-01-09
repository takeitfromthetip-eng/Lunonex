class QueueController {
  constructor() {
    this.queues = {};
  }

  createQueue(name) {
    this.queues[name] = [];
  }

  enqueue(name, item) {
    if (!this.queues[name]) this.createQueue(name);
    this.queues[name].push(item);
  }

  dequeue(name) {
    return this.queues[name]?.shift();
  }

  size(name) {
    return this.queues[name]?.length || 0;
  }
}

module.exports = new QueueController();
