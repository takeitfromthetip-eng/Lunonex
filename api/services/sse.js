function initArtifactStream() {
  global.artifactStream = {
    events: [],
    push: function(event) {
      this.events.push(event);
      if (this.events.length > 1000) this.events.shift();
    }
  };
}

function sseRoute(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const interval = setInterval(() => {
    if (global.artifactStream?.events?.length) {
      const event = global.artifactStream.events[global.artifactStream.events.length - 1];
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  }, 1000);

  req.on('close', () => clearInterval(interval));
}

module.exports = { initArtifactStream, sseRoute };
