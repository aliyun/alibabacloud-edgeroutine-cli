'use strict';

const Hi = require("../../core/highlight.js");
const IO = require("./io.js");
const Chalk = require("chalk");

// A class represents a single debug session and also exposes all the needed
// guts into the external REPL shell for interactive working with the debugger
// session internally.
class DebugSession {
  constructor(url, user_id, connector, writer, closer) {
    this._connector = connector;
    this._writer = writer;
    this._closer = closer;
    this._io = new IO.IO(url, (data) => { this._onMessage(data); },
                              () => { this._onConnect(); },
                              () => { this._onClose(); },
                              (e)=> { this._onError(e); });
  }

  _resetContextWhenVMAbort() {
    if (this._currentSource) {
      this.setUserScriptContext(this._currentSource, this._currentOrigin || "debug");
    }
  }

  _onMessage(data) {
    this._writer.incomming(data);
    if (data.name == "vm.abort") {
      this._resetContextWhenVMAbort();
    }
    if (data.name == "httpResponse") {
      if (data.data) {
        this._lastHttpResponse = {
          body: Buffer.from(data.data.body, "base64").toString("utf-8"),
          header: data.data.header,
          status: data.data.status,
          statusText: data.data.statusText
        }
      } else {
        this._lastHttpResponse = data.error;
      }
    }
  }
  _onConnect() {
    this._connector();
  }
  _onClose() {
    this._writer.incomming({
      "name" : "connectionCloseByPeer",
      "error": "session closed by testing server"
    });
    this._closer();
  }
  _onError(e) {
    this._writer.fatal({
      "name" : "ioError",
      "error": "websocket error: " + e.message
    });
    this._closer();
  }

  // Used for materializing different types of functionalities
  setUserScriptContext(source, origin) {
    if (source) {
      if (source.length >= 1024*1024) {
        console.log(Chalk.red.bold("The script you submitted is too large!!"));
        return;
      }

      this._currentSource = source;
      this._currentOrigin = origin;
      const data = 
        `{
          "name" : "setUserScriptContext",
          "data" : {
            "source": "${Buffer.from(source).toString('base64')}",
            "origin": "${origin}"
          }
        }`;
      this._io.sendData(data);
    } else {
      if (this._currentSource) {
        // Print out the current source code in a highlighted way
        console.log(Chalk.bold("origin: "), Chalk.bold.red(this._currentOrigin));
        console.log("");
        console.log(Hi(this._currentSource));
      } else {
        console.log(Chalk.bold.red("N/A"));
      }
    }
  }

  lastHttpResponse() {
    return this._lastHttpResponse;
  }

  httpRequest(method, url, header, body, ev = "fetch") {
    let temp = [];
    for (const k in header) {
      temp.push([k, header[k]]);
    }
    const hdr = JSON.stringify(temp);
    const data = 
      `{
        "name" : "httpRequest",
        "data" : {
          "method" : "${method}",
          "url" : "${url}",
          "header" : ${hdr},
          "body" : ${JSON.stringify(body)},
          "event" : "${ev}"
        }
      }`;
    this._io.sendData(data);
  }

  setReport(enable) {
    this._io.sendData(`{"name": "report", "data": ${enable}}`);
  }
};

module.exports = {
  DebugSession
}
