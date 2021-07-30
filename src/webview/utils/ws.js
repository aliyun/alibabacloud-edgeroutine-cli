const ws = require("ws");
const fs = require('fs');
const path = require('path');
const base64 = require('js-base64').Base64;
const chalk = require('chalk');
const dateConversion=require('./getNewDate');

module.exports = Server => {
    Server.on("connection", socket => {
        const wsServer = new ws("ws://debugger.ialicdn.com/", undefined, {
            perfMessageDeflate: false,
            headers: {"x-tworker-inspector": "debugger"}
        });
        let timerId = null;

        function keepAlive() {
            let timeout = 20000;
            if (wsServer.readyState === wsServer.OPEN) {
                wsServer.send('');
            }
            timerId = setTimeout(keepAlive, timeout);
        }

        function cancelKeepAlive() {
            if (timerId) {
                clearTimeout(timerId);
            }
        }

        wsServer.onopen = () => {
            let targetFilePath = path.resolve('edge.js');
            if (!fs.existsSync(targetFilePath)) {
                fs.writeFileSync(targetFilePath, `addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
async function handleRequest(request) {
    return new Response('Hello World!', {status: 200});
}`, 'utf8');
            }
            let templateStr = fs.readFileSync(targetFilePath, 'utf8');
            const body = base64.encode(templateStr);
            const data = `{
                          "name" : "setUserScriptContext",
                          "data" : {
                            "source": "${body}",
                            "origin": "debug"
                          }
                        }`;
            wsServer.send(`content-length: ${data.length}\r\n\r\n${data}`, () => {
            });
            socket.send(JSON.stringify({"name": "readScriptContext", data: templateStr, edgePath: targetFilePath}));
            keepAlive();
        };
        wsServer.onmessage = (evt) => {
            let jsonData = evt.data;
            if (jsonData.match("js.console")) {
                try {
                    let reg = /{(.+)/, textReg = /.*[\u4e00-\u9fa5]+.*/;
                    if (evt.data.match(reg)) {
                        let consoleData = JSON.parse(evt.data.match(reg)[0]);
                        let {columnNumber, level, lineNumber, message, stackTrace,} = consoleData.data;
                        let  [{value: {data, type}}]=message;
                        const dataStr = base64.decode(data);
                        //Message contains Chinese
                        if (typeof data==='string' && textReg.test(dataStr)) {
                            let sendConsoleData = {
                                data: {
                                    columnNumber: `${columnNumber}`,
                                    level: `${level}`,
                                    lineNumber: `${lineNumber}`,
                                    message: [{value: {data: `${dataStr}`, type: `${type}`}}],
                                    stackTrace: `${stackTrace}`
                                },
                                name: `${consoleData.name}`
                            };
                            socket.send(JSON.stringify(sendConsoleData));
                        } else {
                            socket.send(evt.data.match(reg)[0]);
                        }
                    }
                } catch (e) {
                    console.error(e)
                }
            } else if (jsonData.match("httpResponse")) {
                let reg = /{(.+)}/;
                if (jsonData.match(reg)) {
                    let bodyJSON = JSON.parse(jsonData.match(reg)[0]);
                    if (typeof bodyJSON.data !== 'undefined') {
                        let bodyStr = bodyJSON.data.body;
                        bodyJSON.data.body = base64.decode(bodyStr);
                    }
                    socket.send(JSON.stringify(bodyJSON));
                }
            } else {
                socket.send(evt.data);
            }
        };
        wsServer.onclose = (e) => {
            cancelKeepAlive();
            const date=dateConversion(new Date());
            console.log(chalk.red(`${date} closed state code：` + e.code));
            console.log(chalk.yellow('websocket closed!'));
            socket.send('websocket close');
        };
        wsServer.onerror = (e) => {
            console.log(chalk.red(e.error));
        }
        socket.send(JSON.stringify({"name": "connectionAlicdnWS", "data": "operation done"}));
        socket.onmessage = function (data) {
            let jsonStr = JSON.stringify(data);
            if (jsonStr.match('saveScriptContext')) {
                let jsonObj = JSON.parse(jsonStr);
                let nextJsonObj = JSON.parse(jsonObj.data);
                let targetFilePath = path.resolve('edge.js');
                fs.writeFileSync(targetFilePath, nextJsonObj.data.conTextCode, 'utf8');
                socket.send(JSON.stringify({"name": "saveScriptContext", "data": "operation done"}));
            } else if (jsonStr.match('setScriptContext')) {
                let jsonObj = JSON.parse(jsonStr);
                let nextJsonObj = JSON.parse(jsonObj.data);
                const body = base64.encode(nextJsonObj.data.conTextCode);
                const dataObj = `{
                          "name" : "setUserScriptContext",
                          "data" : {
                            "source": "${body}",
                            "origin": "debug"
                          }
                        }`;
                if (wsServer.readyState === 1) {
                    wsServer.send(`content-length: ${dataObj.length}\r\n\r\n${dataObj}`);
                } else if (wsServer.readyState === 0) {
                    console.log(`WebSocket is not open: readyState ${wsServer.readyState}`)
                }
            } else if (jsonStr.match('queryAlicdnData')) {
                let jsonObj = JSON.parse(jsonStr);
                let nextJsonObj = JSON.parse(jsonObj.data);
                let {queryObj: {method, url, handles, bodyData}} = nextJsonObj.data;
                const hdr = JSON.stringify(handles);
                const data = `{
                              "name" : "httpRequest",
                              "data" : {
                               "method" : "${method}",
                                "url" : "${url}",
                                "header" : ${hdr},
                                "body" : '${bodyData}',
                                "event" : "fetch"
                              }
                         }`;
                if (wsServer.readyState === 1) {
                    wsServer.send(`content-length: ${data.length}\r\n\r\n${data}`);
                } else if (wsServer.readyState === 0) {
                    console.log(`WebSocket is not open: readyState ${wsServer.readyState}`)
                }
            }
        }
        socket.on("close", function () {
            // console.info("request close");
        });
        socket.on("error", function (err) {
            console.info("request error", err);
        });
    });
    Server.on('error', (e) => {
        console.log(`服务不存在！请尝试重新启动！`);
    })
};
