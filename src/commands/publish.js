const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const uuidv1 = require('uuid/v1');
const base64 = require('js-base64').Base64;
const popCore = require('@alicloud/pop-core');

// get config and Client 
function getConfigAndClient() {
    let config = {};
    if (fs.existsSync(path.resolve('config.js'))) {
        config = require(path.resolve('config.js'));
    } else {
        console.log(chalk.red('Publish without config.js, run `edgeroutine-cli config`...'));
        process.exit(1);
    };
    var client = new popCore({
        accessKeyId: config.accessKeyID,
        accessKeySecret: config.accessKeySecret,
        endpoint: config.endpoint,
        apiVersion: config.apiVersion,
    });
    var params = {
        'RegionId': 'cn-hangzhou'
    };
    var requestOption = {
        method: 'GET'
    };
    return { config, client, params, requestOption };
}

function clientCustom(status) {
    let { config, client, params, requestOption } = getConfigAndClient();
    params["DomainName"] = config.domain;
    params["FunctionNames"] = 'edge_function';
    client.request('DescribeCdnDomainConfigs', params, requestOption).then((result) => {
        let domainConfigs = result.DomainConfigs;
        let domainConfig = domainConfigs["DomainConfig"];
        for (var d in domainConfig) {
            let config = domainConfig[d];
            if (config.FunctionName == "edge_function") {
                if (status == 'show') {
                    show(config);
                } else if (status == 'delete') {
                    params["ConfigId"] = config.ConfigId;
                    requestClient('DeleteSpecificConfig', params, requestOption, 'Deleted');
                }
            }
        }
        status == 'show' && console.log(chalk.red('Publish not exists...'));
    }, (ex) => {
        console.log(ex);
    });
}

// Publish show
function show(config) {
    let functionArgs = config.FunctionArgs;
    let functionArg = functionArgs["FunctionArg"];
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

//
function requestClient(url, params, requestOption, stats) {
    let { client } = getConfigAndClient()
    client.request(url, params, requestOption).then((result) => {
        if (result.RequestId) {
            console.log(chalk.green(`Build ${stats}...`));
        }
    }, (ex) => {
        stats == 'Deleted' && console.log(chalk.red('Publish delete need build rollback first'));
        stats == "Publish" && (() => {
            console.log(ex);
            console.log(chalk.red('Publish need build first or wait build success...'));
        })();
    });
}


function publish(program) {
    let { config, params, requestOption } = getConfigAndClient()
    if (program.show == true) {
        clientCustom('show');
    } else if (program.delete == true) {
        clientCustom('delete');
    } else {
        params["DomainName"] = config.domain;
        params["FunctionName"] = "edge_function";
        requestClient('PublishStagingConfigToProduction', params, requestOption, 'Publish');
    }
}

module.exports = publish