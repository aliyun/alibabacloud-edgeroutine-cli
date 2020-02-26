const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const uuidv1 = require('uuid/v1');
const iconv = require('iconv-lite');
const request = require('request');
const rp = require('request-promise');
const base64 = require('js-base64').Base64;
const popCore = require('@alicloud/pop-core');
const edgeCDN = require('../edge/edgecdn.js');

function buildRules(config, client, params, requestOption, edgejsCode, ossjsCode) {
    // options: jsConfig + jsSession
    let options = ""
    // jsSession
    let jsSession = config.jsSession;
    if (jsSession && jsSession.length > 0) {
        options += " jssession=" + jsSession.join(",");
    }
    // mainConfig
    let jsConfig = config.jsConfig;
    // jsttl
    if (jsConfig.jsttl && jsConfig.jsttl > 600) {
        options += " jsttl=" + jsConfig.jsttl;
    }
    // jscode
    if (ossjsCode) {
        options += " jscode=" + ossjsCode;
        edgejsCode = "edgecode too large, do not show here!";
    }
    //console.log(`edgejsCode: ${edgejsCode}`);
    let functions = [{
        "functionArgs": [{
            "argName": "enable",
            "argValue": "on"
        }, {
            "argName": "name",
            "argValue": "edgejs"
        }, {
            "argName": "grammar",
            "argValue": "js"
        }, {
            "argName": "jsmode",
            "argValue": jsConfig.jsmode
        }, {
            "argName": "option",
            "argValue": options
        }, {
            "argName": "pri",
            "argValue": "0"
        }, {
            "argName": "pos",
            "argValue": jsConfig.pos
        }, {
            "argName": "rule",
            "argValue": base64.encode(edgejsCode)
        }],
        "functionId": 180,
        "functionName": "edge_function"
    }];
    params["Functions"] = JSON.stringify(functions);

    client.request('SetCdnDomainStagingConfig', params, requestOption).then((result) => {
        if (result.RequestId) {
            console.log(chalk.green('Build succeed...'));
        }
    }, (ex) => {
        console.log(ex);
        console.log(chalk.red("Build failed, check exists or connect us..."))
    });
}

function build(program) {
    let config = {};
    if (fs.existsSync(path.resolve('config.js'))) {
        config = require(path.resolve('config.js'));
    } else {
        console.log(chalk.red('Build without config.js, run `edgeroutine-cli config`...'));
        process.exit(1);
    }

    const client = new popCore({
        accessKeyId: config.accessKeyID,
        accessKeySecret: config.accessKeySecret,
        endpoint: config.endpoint,
        apiVersion: config.apiVersion,
    });

    const requestOption = {
        method: 'GET'
    };

    var params = {
        'RegionId': 'cn-hangzhou',
        'DomainName': config.domain,
    }

    if (program.show == true) {
        params["FunctionNames"] = 'edge_function';
        client.request('DescribeCdnDomainStagingConfig', params, requestOption).then((result) => {
            let domainConfig = result.DomainConfigs;
            for (var d in domainConfig) {
                let config = domainConfig[d];
                if (config.FunctionName == "edge_function") {
                    let functionArg = config.FunctionArgs;
                    let functionDict = {};
                    for (var f in functionArg) {
                        let funcArg = functionArg[f];
                        functionDict[funcArg["ArgName"]] = funcArg["ArgValue"];
                    }
                    console.log('');
                    console.log('[Show Configs]');
                    console.log('  ');
                    console.log(chalk.green('pos:    ' + '"' + functionDict["pos"] + '"'));
                    console.log(chalk.green('jsmode: ' + '"' + functionDict["jsmode"] + '"'));
                    console.log('');
                    console.log('[Show Codes]');
                    console.log('  ');
                    console.log(chalk.green(base64.decode(functionDict['rule'])));
                    return 0;
                }
            }
            console.log(chalk.red('Build not exists...'));
        }, (ex) => {
            console.log(ex);
        })
        return 0;
    } else if (program.delete == true) {
        params["FunctionNames"] = 'edge_function';
        client.request('DescribeCdnDomainStagingConfig', params, requestOption).then((result) => {
            let domainConfig = result.DomainConfigs;
            for (var d in domainConfig) {
                let config = domainConfig[d];
                if (config.FunctionName == "edge_function") {
                    params["ConfigId"] = config.ConfigId;
                    client.request('DeleteSpecificStagingConfig', params, requestOption).then((result) => {
                        if (result.RequestId) {
                            console.log(chalk.green("Build deleted..."));
                        }
                    }, (ex) => {
                        console.log(ex);
                    })
                }
            }
        }, (ex) => {
            console.log(ex);
        });
    } else if (program.rollback == true) {
        params["FunctionNames"] = 'edge_function';
        client.request('DescribeCdnDomainStagingConfig', params, requestOption).then((result) => {
            let domainConfig = result.DomainConfigs;
            for (var d in domainConfig) {
                let config = domainConfig[d];
                if (config.FunctionName == "edge_function") {
                    params["FunctionName"] = 'edge_function';
                    params["ConfigId"] = config.ConfigId;
                    client.request('RollbackStagingConfig', params, requestOption).then((result) => {
                        if (result.RequestId) {
                            console.log(chalk.green("Build rollbacked..."));
                        }
                    }, (ex) => {
                        console.log(ex);
                    })
                }
            }
        }, (ex) => {
            console.log(ex);
        });
    } else {
        let edgejsFile = path.resolve(config.jsConfig.path);
        let stats = fs.statSync(edgejsFile);
        let fileStr = fs.readFileSync(edgejsFile, {
            encoding: 'binary'
        });
        let buf = new Buffer(fileStr, 'binary');
        let edgejsCode = iconv.decode(buf, 'utf8');
        let ossjsCode = undefined;
        // edge.js > 4K will be put to oss
        if (stats["size"] > 4096) {
            const cdnClinet = new edgeCDN({
                accessKeyId: config.accessKeyID,
                accessKeySecret: config.accessKeySecret,
                endpoint: 'cdn.aliyuncs.com',
                domainName: config.domain
            });
            let r = cdnClinet.DescribeCdnService();
            let ossObjectName = `${config.domain}.${Date.now()}.js`;
            var rpOptions = {
                method: 'PUT',
                uri: `http://edgejs.ialicdn.com/cdn-edgejs/${ossObjectName}`,
                headers: {
                    'X-EdgeAccess-Url': r.url
                },
                body: edgejsCode,
                resolveWithFullResponse: true,
            };
            rp(rpOptions)
                .then(function(response, body) {
                    if (response.statusCode == 200) {
                        ossjsCode = ossObjectName;
                        buildRules(config, client, params, requestOption, edgejsCode, ossjsCode);
                    } else {
                        console.log("upload edgejs failed with response %d", response.statusCode);
                        return;
                    }
                }).catch(function(err) {
                    // Crawling failed...
                    console.log(`upload edgejs failed with err: ${err}`);
                    return;
                });
        } else {
            buildRules(config, client, params, requestOption, edgejsCode, ossjsCode);
        }
    }
}

module.exports = build;