'use strict';

const FS = require("fs");
const Chalk = require("chalk");
const Open = require("open");
const Temp = require("tempfile");

class Cmd {
  constructor(session) {
    this._session = session;
    this._cmdList = [
      {
        name : "http",
        entry: this.httpRequest,
        help :`
  http:
    perform a http request directly to debugged edge routine script previously
    set by command "source"

    @arg1: string to represent method, ie GET/POST/DELETE etc...
    @arg2: string to represent full URL as if requested by client...
    @arg3: a Object represents headers provided
    @arg4: a string represents body provided
    @arg5: a string represents the trigger event, default to be fetch
`,
      },
      {
        name : "get",
        entry: this.httpGet,
        help :`
  get:
    perform a GET request directly to debugged edge routine script previously
    set by command "source"

    @arg1: string to represent a full URL
    @arg2: a optional Object represents headers provided
    @arg3: a optional string represents body posted
    @arg4: a optional string represents event name, default to be fetch
`
      },
      {
        name : "post",
        entry: this.httpPost,
        help : `
  post:
    perform a POST request directly to debugged edge routine script previously
    set by command "source"

    @arg1: string to represent a full URL
    @arg2: a optional Object represents headers provided
    @arg3: a optional string represents body posted
    @arg4: a optional string represents event name, default to be fetch
`
      },
      {
        name : "lastHttpResponse",
        entry: this.lastHttpResponse,
        help : `
  lastHttpResponse:
    get previously issued http request's full response object, if no previously
    issued http request, then returns undefined
`
      },
      {
        name : "setScript",
        entry: this.setScript,
        help : `
  setScript:
    set debugged script for debugging/inspection purpose.

    @arg1: string to represent the JavaScript source code
    @arg2: a optional string to provided as script's origin
`
      },
      {
        name : "source",
        entry: this.setScriptFile,
        help : `
  source:
    set debugged script for debugging/inspection purpose from file

    @arg1: string to represent path to the JavaScript want to test
    @arg2: a optional string to provided as script's origin
`
      },
      {
        name : "enableReport",
        entry: this.enableReport,
        help : `
  enableReport:
    enable debugger to generate a report/summary for each http request
`
      },
      {
        name : "disableReport",
        entry: this.disableReport,
        help : `
  disableReport:
    disable debugger to generate a report/summary for each http request
`
      },
      {
        name : "showBrowser",
        entry: this.showBrowser,
        help: `
  showBrowser:
    launch a browser to show a html pages. If no argument specified, then
    just launch the browser to show body stored inside of last http response.
    Otherwise treat the input as a string representing html pages and show this
    html inisde of the browser. Must be able to find at least one browser locally
`
      }
    ];

    this._nameList = [];
    for (const k of this._cmdList) {
      this._nameList.push(k.name);
    }
  }

  httpRequest(method, url, header, body, ev = "fetch") {
    return this._session.httpRequest(method, url, header, body, ev);
  }
  httpGet(url, header = {}, body = "", ev = "fetch") {
    return this.httpRequest("GET", url, header, body, ev);
  }
  httpPost(url, header = {}, body = "", ev = "fetch") {
    return this.httpRequest("POST", url, header, body, ev);
  }
  setScript(source = undefined, origin="debug") {
    return this._session.setUserScriptContext(source, origin);
  }
  setScriptFile(path = undefined, origin="debug") {
    if (path !== undefined) {
      return this.setScript(FS.readFileSync(path, "utf-8", "r+"), path);
    } else {
      return this.setScript(path, origin);
    }
  }
  enableReport() {
    return this._session.setReport(true);
  }
  disableReport() {
    return this._session.setReport(false);
  }
  help(name = "") {
    for (const v of this._cmdList) {
      if (v.name == name) {
        console.log(Chalk.red(v.help));
        return;
      }
    }
    for (const v of this._cmdList) {
      console.log(Chalk.red(v.help));
    }
  }
  lastHttpResponse() {
    return this._session.lastHttpResponse();
  }
  showBrowser(arg = undefined) {
    let data = arg;
    if (!data) {
      data = this.lastHttpResponse().body;
    }
    const fname = Temp(".html");

    {
      FS.writeFileSync(fname, data);
    }
    Open(`file://${fname}`);
  }
  cmdList() {
    return this._cmdList;
  }
  nameList() {
    return this._nameList;
  }
  setUp(replServer) {
    replServer.context.help = this.help.bind(this);
    for (const entry of this._cmdList) {
      replServer.context[entry.name] = entry.entry.bind(this);
    }
  }
};

module.exports = Cmd;
