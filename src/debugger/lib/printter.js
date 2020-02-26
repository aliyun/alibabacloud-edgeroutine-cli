'use strict';

const Chalk = require("chalk");
const Util = require("util");
const CliTable = require("cli-table");

/** -------------------------------------------------
 * StackTrace pretty print
 * -------------------------------------------------*/

function parseLocation(line) {
  const start = line.lastIndexOf('(');
  const end = line.lastIndexOf(')');
  if (start == -1 || end == -1) {
    return { origin: "unknown", line: 0, column: 0};
  }
  const seg = line.substring(start+1, end);
  const v = seg.split(':');
  if (v.length < 3) {
    return { origin: "unknown", line: 0, column: 0};
  }

  const l = v[v.length-2];
  const c = v[v.length-1];

  return {
    origin: v.slice(0, v.length-2).join(":"),
    line: l,
    column: c
  };
}

function parseFunction(line) {
  const end = line.lastIndexOf('(');
  if (end == -1) {
    return line;
  }
  const sub = line.substring(0, end);
  if (sub.startsWith("at ")) {
    return sub.substring(3);
  }
  return sub;
}

function st(stackTrace) {
  if (stackTrace == "N/A") {
    return Chalk.red.bold("Backtrace: N/A");
  }

  let stackList = stackTrace.split("\n");
  stackList.splice(0, 1);

  const table = new CliTable({
    chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
      , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
      , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
      , 'right': '' , 'right-mid': '' , 'middle': ' ' },
    head: ["Frame", "Function", "ScriptOrigin", "Line", "Column"],
    colWidths: [10, 25, 25, 8, 8]
  });

  let idx = 0;
  for (const x of stackList) {
    const line = x.trim();
    const loc  = parseLocation(line);
    const func = parseFunction(line);
    table.push([`${idx}`, func, loc.origin, loc.line, loc.column]);
    ++idx;
  }
  return Chalk.red.bold("Backtrace:\n") + table.toString();
}

/** -------------------------------------------------
 * Value pretty print
 *
 *  Basically we still print value as a tree structure,
 *  but we make the tree print much more compact than
 *  the default JSON way which is too large and hard to
 *  inspect for the object internal
 *
 * -------------------------------------------------*/
class ValuePrintter {
  constructor(v) {}

  print(v, indent=0) {
    this._v = v;
    this._indent = indent;
    this._buffer = [];
    return this._doPrint();
  }

  _doPrint() {
    if (this._v.error) {
      return Chalk.red.bold(`value folding error: ${this._v.error}`);
    } else {
      const v = this._v.value;
      if (typeof v == "string" ||
          typeof v == "boolean"||
          typeof v == "number" ||
          v === null) {
        return Chalk.green.bold(JSON.stringify(v));
      } else {
        this._printAny(v);
      }
      return this._buffer.join("");
    }
  }

  _doIndent() {
    const indentChar = ' ';
    if (this._indent) {
      let b = [];
      for (let i = 0; i < this._indent; ++i) {
        b.push(indentChar);
      }
      return b.join("");
    }
    return "";
  }

  _lineBreak() { this._buffer.push("\n"); }

  _appendRaw(prefix, value, append=undefined) {
    const indent = this._doIndent();
    if (indent) {
      this._buffer.push(indent);
    }
    if (prefix) {
      this._buffer.push(prefix);
    }
    this._buffer.push(value);
    if (append) {
      this._buffer.push(append);
    }
  }
  _appendLine(prefix, value) {
    this._appendRaw(prefix, value, '\n');
  }
  _appendValue(value) {
    this._appendRaw(Chalk.bold('|= '), value, '\n');
  }
  _appendTypeTag(tag) {
    this._appendRaw(Chalk.bold('|* '), Chalk.magenta.italic(tag), '\n');
  }

  // Helpers
  _printKeyValueList(list) {
    if (list.length == 0) {
      this._appendRaw(Chalk.bold("- "), Chalk.green.bold("[]"), "\n");
    } else {
      let idx = 0;
      for (const kv of list) {
        this._appendRaw(Chalk.bold(`[${idx}] `),
          Chalk.red.bold(kv[0]) + " => " + Chalk.green.bold(kv[1]), "\n");
        ++idx;
      }
    }
  }

  // primitive type print
  // ie json type mapped to JS type directly
  _printNull(v) {
    this._appendValue(Chalk.yellow("null"));
  }
  _printNumber(v) {
    this._appendValue(Chalk.green(`${v}`));
  }
  _printString(v) {
    this._appendValue(Chalk.blue(JSON.stringify(v)));
  }
  _printStringBlob(v) {
    const decode = new Buffer.from(v, "base64").toString("utf-8");
    this._appendValue(Chalk.blue(JSON.stringify(decode)));
  }
  _printBoolean(v) {
    this._appendValue(Chalk.cyan(v ? "true" : "false"));
  }
  _printKey(key) {
    this._appendRaw(Chalk.bold("- "), key, "\n");
  }
  _printKeyValue(key, value) {
    this._printKey(key);
    {
      ++this._indent;
      this._printAny(value);
      --this._indent;
    }
  }

  // JS related type, or the type we are awared of
  _printRegExp(v) {
    this._appendTypeTag('#regex');
    this._printKeyValue("flags", v.flag);
    this._printKeyValue("source", v.source);
  }
  _printArrayBuffer(v) {
    this._appendTypeTag("#arrayBuffer");
    this._printKeyValue("byteLength", `${v.byteLength}`);
  }
  _printArrayBufferView(v) {
    this._appendTypeTag("#arrayBufferView");
    this._printKeyValue("byteLength", `${v.byteLength}`);
    this._printKeyValue("byteOffset", `${v.byteOffset}`);
  }
  _printBlob(v) {
    this._appendTypeTag("#blob");
    this._printKeyValue("size", `${v.size}`);
    this._printKeyValue("type", v.type);
  }
  _printFile(v) {
    this._appendTypeTag("#file");
    this._printKeyValue("size", `${v.size}`);
    this._printKeyValue("type", v.type);
    this._printKeyValue("filename", v.filename);
  }
  _printHeaders(v) {
    this._appendTypeTag("#headers")
    {
      ++this._indent;
      this._printKeyValueList(v);
      --this._indent;
    }
  }
  _printFormData(v) {
    this._appendTypeTag("#formData");
    {
      ++this._indent;
      let idx = 0;
      for (const e of v) {
        this._appendRaw(Chalk.bold(`|- ${idx}. `), "", "\n");
        this._printKeyValue("formType", e.formType);
        this._printKeyValue("name", e.name);
        this._printKeyValue("dispostionType", e.dispositionType);
        this._printKeyValue("encoding", e.encoding);
        this._printKeyValue("filename", e.filename);
        this._printKey("multipartHeader");
        {
          ++this._indent;
          this._printKeyValueList(e.multipartHeader);
          --this._indent;
        }
        this._lineBreak();

        ++idx;
      }
      --this._indent;
    }
  }
  _printArray(v) {
    this._appendTypeTag('#array');
    {
      ++this._indent;
      for (const x of v) {
        this._printAny(x);
      }
      --this._indent;
    }
  }
  _printObject(v) {
    this._appendTypeTag('#object');
    {
      ++this._indent;
      for (const x of v) {
        this._printKeyValue(x[0], x[1]);
      }
      --this._indent;
    }
  }
  _printTypeTag(v) {
    this._appendTypeTag(`#${v}`);
  }

  _printUnknownData(def) {
    this._appendRaw(Chalk.red.bold("<- unknown \n"),
      Util.inspect(def, {colors: true, depth: null}), '\n');
  }

  _printAny(v) {
    if (typeof v == "string") {
      this._printString(v);
    } else if(typeof v == "boolean") {
      this._printBoolean(v);
    } else if (typeof v == "number") {
      this._printNumber(v);
    } else if (v === null) {
      this._printNull(v);
    } else if (Array.isArray(v)) {
      this._printArray(v);
    } else if (typeof v == "object") {
      this._printCompound(v);
    } else {
      this._printUnknownData(v);
    }
  }

  _printCompound(v) {
    if (v.data) {
      if (v.type == "object") {
        this._printObject(v.data);
      } else if (v.type == "regExp") {
        this._printRegExp(v.data);
      } else if (v.type == "arrayBuffer") {
        this._printArrayBuffer(v.data);
      } else if (v.type == "arrayBufferView") {
        this._printArrayBufferView(v.data);
      } else if (v.type == "headers") {
        this._printHeaders(v.data);
      } else if (v.type == "formData") {
        this._printFormData(v.data);
      } else if (v.type == "file") {
        this._printFile(v.data);
      } else if (v.type == "blob") {
        this._printBlob(v.data);
      } else if (v.type == "array") {
        this._printArray(v.data);
      } else if (v.type == "stringBlob") {
        this._printStringBlob(v.data);
      } else {
        this._printUnknownData(v.data);
      }
    } else {
      this._printTypeTag(v.type);
    }
  }
};


class JSConsolePrint {
  constructor(msg) {
    this._msg = msg;
  }

  // Get the title of the console print
  title() {
    const level = this._msg.data.level;
    if (level == "warning") {
      return `console(${Chalk.yellow(level)})`;
    } else if (level == "error"  || level == "assert") {
      return `console(${Chalk.red(level)})`;
    } else {
      return `console(${Chalk.green(level)})`;
    }
  }

  content() {
    let stackTrace = st(this._msg.data.stackTrace);
    let message = null;

    {
      let printer = new ValuePrintter();
      let buf = [];
      let idx = 0;

      for (const x of this._msg.data.message) {
        buf.push(Chalk.green.bold(`@[${idx}]:`));
        buf.push(printer.print(x, 1));
        ++idx;
      }
      message = buf.join("\n");
    }
    return stackTrace + '\n\n' + message;
  }
};

class JSExceptionPrint {
  constructor(msg) {
    this._msg = msg;
  }

  title() {
    const line = this._msg.data.lineNumber;
    const col = this._msg.data.columnNumber;
    return Chalk.red(`Uncaught Exception@${line}:${col}`);
  }

  content() {
    const stackTrace = st(this._msg.data.stackTrace);
    const exception = new ValuePrintter().print(this._msg.data.exception, 1);
    return stackTrace + Chalk.red.bold('\n\nException:\n') + exception;
  }
};

class JSAbortPrint {
  constructor(msg) {
    this._msg = msg;
  }
  title() {
    return Chalk.red(`VM abort(${this._msg.data.abortReason})`);
  }

  content() {
    return Chalk.red(Util.inspect(this._msg.data.info, {
      colors: true,
      depth: null
    }));
  }
};

class JSPromisePrint {
  constructor(msg) {
    this._msg = msg;
  }
  title() {
    return Chalk.red(`Promise(${this._msg.data.eventName})`);
  }
  content() {
    const stackTrace = st(this._msg.data.stackTrace);
    const message = new ValuePrintter().print(this._msg.data.message);
    return stackTrace + Chalk.red.bold("\n\nRejectMessage:\n") + message;
  }
};

class JSReportPrint {
  constructor(msg) {
    this._msg = msg;
  }
  title() {
    return "Report";
  }
  _toPrintable(x) {
    if (x === undefined) {
      return "N/A";
    } else {
      return `${x}`;
    }
  }
  _toTitle(k) {
    return k.charAt(0).toUpperCase() + k.slice(1);
  }
  content() {
    if (this._msg.data) {
      const table = new CliTable({
        chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
          , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
          , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
          , 'right': '' , 'right-mid': '' , 'middle': ' ' },
        head: ["Metrics", "Value"],
        colWidths: [30, 40]
      });
      for (const k in this._msg.data) {
        table.push([this._toTitle(k), this._toPrintable(this._msg.data[k])]);
      }
      return table.toString();
    } else {
      return Chalk.red.bold("N/A");
    }
  }
};

class VMAbortPrint {
  constructor(msg) {
    this._msg = msg;
  }
  title() {
    return Chalk.red("VM Reset");
  }
  content() {
    return Chalk.red.bold(
      "VM has been abortted due to memory resource quota violation");
  }
};

class OperationDonePrint {
  constructor(msg) {
    this._msg = msg;
    this._info = "operation done";
  }
  title() {
    if (this._msg.error) {
      return Chalk.red(this._msg.name);
    } else {
      return this._msg.name;
    }
  }
  content() {
    if (this._msg.error) {
      return Chalk.red(this._msg.error);
    } else {
      return this._info;
    }
  }
};

class ConnectionSetUpPrint extends OperationDonePrint {
  constructor(msg) {
    super(msg);
    this._info = "debug session setup";
  }
};

class SetUserScriptContextPrint extends OperationDonePrint {
  constructor(msg) {
    super(msg);
    this._info = "user script context setup";
  }
};

class HttpResponsePrint {
  constructor(msg) {
    this._msg = msg;
  }

  title() {
    if (this._msg.error) {
      return Chalk.red("http(response)");
    } else {
      return "http(response)";
    }
  }

  _statusCode() {
    if (this._msg.data.status >= 200 && this._msg.data.status <= 299) {
      return Chalk.green(this._msg.data.status);
    }
    if (this._msg.data.status >= 300 && this._msg.data.status <= 399) {
      return Chalk.yellow(this._msg.data.status);
    }
    return Chalk.red.bold(this._msg.data.status);
  }

  _header() {
    let buf = [];
    for (const kv of this._msg.data.header) {
      buf.push("  " + Chalk.red.bold(`${kv[0]}`) + " => " + Chalk.green.bold(kv[1]));
    }
    return buf.join("\n");
  }

  _bodyFull() {
    let header = "body:\n";
    const data = Buffer.from(this._msg.data.body, "base64").toString("utf-8");
    if (data.length >= 1024) {
      header = Chalk.yellow(`body(length: ${data.length}, too large to show):\n`);
    }
    return header + this._body(data);
  }

  _body(data) {
    const bodyLen = data.length;

    // If it is larger than 1k, then there's not too much point for showing it
    // up in the terminal since it is too large for us indeed
    if (bodyLen >= 1024) {
      return Chalk.green(data.substring(0, 1024)) +
        Chalk.red.bold(" ......(truncated)");
    } else {
      return Chalk.green(data);
    }
  }

  content() {
    if (this._msg.data) {
      let buf = [
        "status: " + this._statusCode(),
        "statusText: " + this._msg.data.statusText,
        "header:\n" + this._header(),
        this._bodyFull()
      ];
      return Chalk.bold(buf.join("\n\n"));
    } else {
      return Chalk.red(this._msg.error);
    }
  }
};

class DefaultPrint {
  constructor(msg) {
    this._msg = msg;
  }
  title() {
    return this._msg.name;
  }
  content() {
    if (this._msg.error) {
      return Chalk.red(this._msg.error);
    } else {
      return Util.inspect(this._msg, {colors: true, depth: null});
    }
  }
};

function create(msg) {
  if (msg.name == "setUserScriptContext") {
    return new SetUserScriptContextPrint(msg);
  } else if (msg.name == "connectionSetUp") {
    return new ConnectionSetUpPrint(msg);
  } else if (msg.name == "report") {
    return new OperationDonePrint(msg);
  } else if (msg.name == "httpResponse") {
    return new HttpResponsePrint(msg);
  } else if (msg.name == "js.promise") {
    return new JSPromisePrint(msg);
  } else if (msg.name == "js.console") {
    return new JSConsolePrint(msg);
  } else if (msg.name == "js.exception") {
    return new JSExceptionPrint(msg);
  } else if (msg.name == "js.abort") {
    return new JSAbortPrint(msg);
  } else if (msg.name == "js.report") {
    return new JSReportPrint(msg);
  } else if (msg.name == "vm.abort") {
    return new VMAbortPrint(msg);
  } else {
    return new DefaultPrint(msg);
  }
}

module.exports = create;
