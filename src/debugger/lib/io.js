'use strict';

const WebSocket = require("ws");
const Protocol = require("./protocol.js");

// Used to strips out the scheme if apaplicable. Indeed we |DON'T| allow user
// to set up full URL or other stuff. We only need is a hostname or staic ip and
// optionally a port number, ie authority in HTTP world.
function formatWSURL(frag) {
  const sIndex = frag.indexOf("://");
  if (sIndex === -1) {
    // It doesn't have scheme, just treat the whole shit as websocket URL
    return `ws://${frag}`;
  } else {
    const url = new URL(frag);
    const port = url.port;
    if (port == "") {
      return `ws://${url.hostname}`;
    } else {
      return `ws://${url.hostname}:${port}`;
    }
  }
}

// A simple wrapper around WebSocket library of node.js. The reason is orgnize
// the sender side with a queue to queue the message. This makes our sending
// code easier to manipulate and written.
class IO {
  constructor(url, onMessage, onConnect, onClose, onError) {
    this._webSocket = new WebSocket(formatWSURL(url),
      undefined,
      {perfMessageDeflate : false, headers: { "x-tworker-inspector" : "debugger" }});

    this._outQueue = [];
    this._connected = false;
    this._sending = false;
    this._onMessage = onMessage;
    this._decoder = new Protocol.IncrementalDecoder(
      (hdr, msg) => { this._onDecodedMessage(hdr, msg); });
    this._webSocket.onerror = onError;
    this._webSocket.onopen = () => {
      onConnect();
      this._connected = true;
      this._trySend();
    };
    this._webSocket.onclose = onClose;
    this._webSocket.onmessage = (msg) => {
      this._decoder.feed(msg.data);
    };
  }

  sendData(data) {
    this._outQueue.push(data)
    this._trySend();
  }

  _onDecodedMessage(hdr, msg) {
    this._onMessage(msg);
  }

  _trySend() {
    if (!this._connected) {
      return;
    }
    if (this._sending) {
      return;
    }
    if (this._outQueue.length != 0) {
      const data = this._outQueue[0];
      this._outQueue.splice(0, 1);
      this._sending = true;
      const wireData = Protocol.encode(data);
      this._webSocket.send(wireData, {binary: false, compress: false}, () => {
        this._sending = false;
        this._trySend();
      });
    }
  }

  close() {
    this._outQueue = [];
    this._webSocket.close(1000, "normal");
  }

  terminate() {
    this._outQueue = [];
    this._webSocket.terminate();
  }
};

module.exports = {
  IO
};
