'use strict';

const Debugger = require("./debug-session.js");
const Cmd = require("./cmd.js");
const Repl = require("repl");
const Process = require("process");
const FS = require("fs");
const Chalk = require("chalk");
const CFonts= require("cfonts");
const createPrintter = require("./printter.js");
const OS = require("os");
const Path = require("path");

// Writer used for debug session to write data out
class TerminalWriter {
  constructor(shell) {
    this._count = 0;
    this._shell = shell;
  }
  _to(msg) {
    return Util.inspect(msg, {colors: true, depth:null});
  }
  _header() {
    console.log(Chalk.blue("\n------------------------------------------------"));
  }
  _footer() {
    console.log(Chalk.blue("------------------------------------------------"));
  }
  _printTitle(msg) {
    console.log(Chalk.bold(`*** ${this._count}. ${msg}`));
    console.log();
  }
  _prompt() {
    this._shell.displayPrompt(false);
  }

  incomming(data) {
    ++this._count;

    this._header();
    const printter = createPrintter(data);
    this._printTitle(printter.title());
    console.log(printter.content());
    this._footer();
    this._prompt();
  }
  outgoing(data) {
    ++this._count;

    this._header();
    const printter = createPrintter(data);
    this._printTitle(printter.title());
    console.log(printter.content());
    this._footer();
    this._prompt();
  }
  fatal(data) {
    this._header();
    const printter = createPrintter(data);
    console.log(Chalk.bold(printter.title()), '\n');
    console.log(printter.content());
    this._footer();
  }
};

function closer() {
  Process.exit(0);
}

function printLogo() {
  console.log("\n");
  console.log(Chalk.bold(CFonts.render("Edge|Routine", {
    font: "simple",
    align: "center"
  }).string));
  console.log(CFonts.render("Run your code anywhere!", {
    font: "chrome",
    align: "center"
  }).string);
  console.log("");
}

function onConnect() {
  printLogo();
}

function runDebugger(option={}) {
  const url = option.url || "localhost:8080";
  const uid = option.uid || "debug";
  const sourcePath = option.sourcePath;
  const origin = option.origin;

  const shell = Repl.start({
    prompt : "debugger> ",
    input  : Process.stdin,
    output : Process.stdout,
    terminal: true,
    ignoreUndefined : true,
    completer : (line) => {
      const hits = cmd.nameList().filter((x) => x.startsWith(line));
      return [hits.length ? hits : cmd.nameList(), line];
    }
  });

  const debugSession = new Debugger.DebugSession(
    url,
    uid,
    onConnect,
    new TerminalWriter(shell),
    closer);

  const cmd = new Cmd(debugSession);

  // Optionally set up the source if user specified the path from the command
  // line arguments
  if (sourcePath) {
    cmd.setScriptFile(sourcePath, origin);
  }

  // setup shell history accordingly
  const homedir = OS.homedir();
  const history_path = Path.join(homedir, ".edgeroutine-cli/");
  if (!FS.existsSync(history_path)) {
    FS.mkdirSync(history_path);
  }
  const history_file = Path.join(history_path, "history");
  if (!FS.existsSync(history_file)) {
    FS.closeSync(FS.openSync(history_file, "w"));
  }

  console.info(`debugger shell set homedir to: ${homedir}`);

  shell.setupHistory(history_file, (err, repl) => {});
  shell.on("exit", () => { closer(); });
  shell.defineCommand("cls", {
    "help" : "clearScreen",
    action(name) {
      console.clear();
      shell.displayPrompt(false);
    }
  });
  cmd.setUp(shell);
}

module.exports = runDebugger;
