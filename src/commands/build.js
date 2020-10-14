const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const iconv = require('iconv-lite');
const rp = require('request-promise');
const edgeCDN = require('../edge/edgecdn.js');
const base64 = require('js-base64').Base64;
const assert = require('assert');

const { getConfigAndClient, clientCustom, requestClient } = require('./public');


// get build rules 
function buildRules(config, edgejsCode, ossjsCode) {
    assert(config, 'must pass "config"');
    assert(edgejsCode, 'must pass "edgejsCode"');
    // options: jsConfig + jsSession
    let options = "";

     // jsOptions
     let jsOptions = config.jsOptions;
     let opts = [];
     for (var k in jsOptions) {
         opts.push(k + ":" + jsOptions[k]);
     }
     if (opts && opts.length > 0) {
         options = "jsconfig=" + opts.join(",");
     }
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

    let functions = {
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
            "argValue": jsConfig.pri
        }, {
            "argName": "pos",
            "argValue": jsConfig.pos
        }, {
            "argName": "rule",
            "argValue": base64.encode(edgejsCode)
        }],
        // "functionId": 180,
        "functionName": "edge_function",
    };
    return functions;
}

async function DomainStagingConfig(edgejsCode, ossjsCode) {
    console.log(chalk.greenBright(`[EN] edge.js is configuring in staging environemt....`))
    console.log(chalk.greenBright(`[ZN] ER代码edge.js在模拟环境配置中...`))
    let { config, params, requestOption } = getConfigAndClient();
    let { DomainConfig, ERConfigID } = await clientCustom('build', 'dev');
    let params_result = buildRules(config, edgejsCode, ossjsCode);
    // 设置configId
    if (ERConfigID != null) {
        params_result["ConfigId"] = ERConfigID;
    }
    params['Functions'] = null;
    params['Functions'] = JSON.stringify([...[params_result], ...DomainConfig]);
    requestOption.method = 'POST';
    requestClient('SetCdnDomainStagingConfig', params, requestOption, 'Build','dev');
}

// program build   
async function build(program) {
    let { config } = getConfigAndClient();
    if (program.show == true) {
        clientCustom('show', 'dev');
    } else if (program.delete == true) {
        clientCustom('delete', 'dev');
    } else if (program.rollback == true) {
        clientCustom('rollback', 'dev');
    } else {
        let edgejsFile = path.resolve(config.jsConfig.path);
        let stats = fs.statSync(edgejsFile);
        let fileStr = fs.readFileSync(edgejsFile, {
            encoding: 'binary'
        });
        let buf = Buffer.from(fileStr, 'binary');
        let edgejsCode = iconv.decode(buf, 'utf8');
        let ossjsCode = undefined;

        // edge.js > 45K will be put to oss
        if (stats["size"] > 46080) {
            console.log("build -> size", stats["size"])
            // Initialize edgeCDN
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
            rp(rpOptions).then(function (response) {
                if (response.statusCode == 200) {
                    ossjsCode = ossObjectName;
                    DomainStagingConfig(edgejsCode, ossjsCode)
                } else {
                    console.log(chalk.redBright(`[EN] upload edgejs failed with response ${response.statusCode}`));
                    return;
                }
            }, function (resp) {
                let headers = resp.response.headers;
                let statusCode = resp.response.statusCode;
                console.log(chalk.redBright(`[EN] upload edgejs failed with statusCode: ${statusCode},via:${headers['via']},eagleid:${headers['eagleid']}`));
                return;
            })
        } else {
            DomainStagingConfig(edgejsCode, ossjsCode)
        }
    }
}

module.exports = { build, buildRules }


