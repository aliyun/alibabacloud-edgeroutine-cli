/**
 * This file contains a syntax highlighter that is able to highlight language
 * syntax inside of the terminal. It is based on the highlight.js and parse5.
 *
 * hightlight.js --> html --> parse5 --> use Chalk to colorize in terminal.
 *
 * The logic is heavily inspired by cli-highlight
 */

const Engine = require("highlight.js");
const Parser = require("parse5");
const ParserTreeAdapter = require("parse5-htmlparser2-tree-adapter");
const Chalk = require("chalk");

function plain(x) {
  return x;
}

// The following theme is based on library cli-highlight
const theme = {
  keyword: Chalk.blue,
  built_in: Chalk.cyan,
  type: Chalk.cyan.dim,
  literal: Chalk.blue,
  number: Chalk.green,
  regexp: Chalk.red,
  string: Chalk.red,
  subst: plain,
  symbol: plain,
  class: Chalk.blue,
  function: Chalk.yellow,
  title: plain,
  comment: Chalk.green,
  doctag: Chalk.green,
  meta: Chalk.grey,
  'meta-keyword': plain,
  'meta-string' : plain,
  section: plain,
  tag: Chalk.grey,
  name: Chalk.blue,
  'builtin-name': plain,
  attr: Chalk.cyan,
  attribute: plain,
  variable: plain,
  bullet: plain,
  code: plain,
  emphasis: Chalk.italic,
  strong: Chalk.bold,
  formula: plain,
  link: plain,
  quote: plain,
  'selector-tag': plain,
  'selector-id': plain,
  'selector-class': plain,
  'selector-attr': plain,
  'selector-pseudo': plain,
  'template-tag': plain,
  'template-variable': plain,
  addition: Chalk.green,
  deletion: Chalk.red
};

// try to colorize the node as parse5.AST node into buffer object
function colorizeInTerminal(buffer, node, apply) {
  switch (node.type) {
    case 'text': {
      const text = node.data;
      buffer.push((apply || plain)(text));
    }
    return;

    case 'tag': {
      const cls = /hljs-(\w+)/.exec(node.attribs.class);
      if (cls) {
        const tk = cls[1];
        const printter = theme[tk] || plain;
        for (const x of node.childNodes) {
          colorizeInTerminal(buffer, x, printter);
        }
      } else {
        for (const x of node.childNodes) {
          colorizeInTerminal(buffer, x, undefined);
        }
      }
    }
    return;
  }

  throw new Error("invalid node type(parse5/highlight.js): " + node.type);
}

function highlight(code, lang = "javascript") {
  const html = Engine.highlight(lang, code, true).value;
  const frg = Parser.parseFragment(html, {
      treeAdapter: ParserTreeAdapter
  });
  const buf = [];
  frg.childNodes.map((node) => { colorizeInTerminal(buf, node); });
  return buf.join("");
}

module.exports = highlight;
