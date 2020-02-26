const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const uuidv1 = require('uuid/v1');
const base64 = require('js-base64').Base64;
const popCore = require('@alicloud/pop-core');

module.exports = function(program) {
    let config = {};
    if (fs.existsSync(path.resolve('config.js'))) {
        config = require(path.resolve('config.js'));
    } else {
        console.log(chalk.red('Publish without config.js, run `edgeroutine-cli config`...'));
        process.exit(1);
    }

    var client = new popCore({
        accessKeyId: config.accessKeyID,
        accessKeySecret: config.accessKeySecret,
        endpoint: config.endpoint,
        apiVersion: config.apiVersion,
    });

    var params = {
        'RegionId': 'cn-hangzhou',
    }

    var requestOption = {
        method: 'GET'
    };

    if (program.show == true) {
        params["DomainName"] = config.domain;
        params["FunctionNames"] = 'edge_function';
        client.request('DescribeCdnDomainConfigs', params, requestOption).then((result) => {
            let domainConfigs = result.DomainConfigs;
            let domainConfig = domainConfigs["DomainConfig"];
            for (var d in domainConfig) {
                let config = domainConfig[d];
                if (config.FunctionName == "edge_function") {
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
            }
            console.log(chalk.red('Publish not exists...'));
        }, (ex) => {
            console.log(ex);
        })
        return 0;
    } else if (program.delete == true) {
        params["DomainName"] = config.domain;
        params["FunctionNames"] = 'edge_function';
        client.request('DescribeCdnDomainConfigs', params, requestOption).then((result) => {
            let domainConfigs = result.DomainConfigs;
            let domainConfig = domainConfigs["DomainConfig"];
            for (var d in domainConfig) {
                let config = domainConfig[d];
                if (config.FunctionName == "edge_function") {
                    params["ConfigId"] = config.ConfigId;
                    client.request('DeleteSpecificConfig', params, requestOption).then((result) => {
                        if (result.RequestId) {
                            console.log(chalk.green("Publish deleted..."))
                        }
                    }, (ex) => {
                        // console.log(ex);
                        console.log(chalk.red('Publish delete need build rollback first'))
                    })
                }
            }
        }, (ex) => {
            console.log(ex);
        });
    } else {
        params["DomainName"] = config.domain;
        params["FunctionName"] = "edge_function";

        client.request('PublishStagingConfigToProduction', params, requestOption).then((result) => {
            if (result.RequestId) {
                console.log(chalk.green('Publish succeed...'));
            }
        }, (ex) => {
            console.log(ex);
            console.log(chalk.red('Publish need build first or wait build success...'));
        });
    }
}
