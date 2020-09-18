const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const base64 = require('js-base64').Base64;
const popCore = require('@alicloud/pop-core');
const inquirer = require('inquirer');
const shell = require('shelljs');
const child_process = require('child_process');
var PublishError = null;
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
                    client.request('DeleteSpecificConfig', params, requestOption).then((result) => {
                        if (result.RequestId) {
                            console.log(chalk.green(`Publish Delete Success...`));
                        }
                    }, (ex) => {
                        console.log(chalk.red('Publish Delete Failed'));
                    });
                }
            }
        }
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

/**
 *   Submit questions and answers
 */

function getSolution() {
    let { config } = getConfigAndClient()
    inquirer.prompt([{
        type: 'confirm',
        name: 'grayscale-test-published',
        message: 'No grayscale test is not published, have you completed a grayscale test? \n（无灰度不发布,您进行灰度测试了吗？）: ',
    }]).then((answer) => {
        if (answer['grayscale-test-published']) {
            console.log(' ');

            if (config.buildTime !== null) {
                /**
                 * Get buildTime and publishTime 
                 */
                let buildTime = config.buildTime + 300 || 300;
                let publishTime = parseInt(Date.now() / 1000);
                let leadTime = buildTime - publishTime < 0 ? 180 : buildTime - publishTime;
                let thirtyPercentTime = leadTime * 0.3;
                let countDownTime = 1000;

                /**
                 *   Create a child process to load the task
                 */

                let pathString = path.resolve(__dirname, '../utils/child_process.js');
                const subprocess = child_process.fork(pathString);
                subprocess.send({ num: 0, total: leadTime, status: true, time: countDownTime });
                subprocess.on('close', async (value) => {
                    if (value) {
                        console.log(chalk.green(`Publish Succeed...`));
                        await shell.sed('-i', /buildTime:.*/, `buildTime:null`, path.resolve('config.js'));
                    } else {
                        if (PublishError !== null && PublishError.code == 'StagingConfig.Failed') {
                            console.log(chalk.red('Rules in staging are being configured, please try again later.(规则正在配置，请稍后再发布)'));
                        } else {
                            console.log(PublishError);
                        }
                    }
                    process.exit(0);
                });

                /**
                 * Timing acquisition status
                 */
                let setFunction = async (count) => {
                    let isPublishOK = await GetPublishFlag();
                    if (isPublishOK) {
                        subprocess.send({ num: parseInt(leadTime * (count / 10)), total: leadTime, status: true, time: 100 })
                    } else {
                        if (count == 7) {
                            subprocess.send({ num: parseInt(leadTime * (count / 10)), total: leadTime, status: false, time: 50 })
                        } else {
                            setTimeout(setFunction, thirtyPercentTime * countDownTime, 7)
                        }
                    }
                }
                setTimeout(setFunction, thirtyPercentTime * countDownTime, 3);
            } else {
                console.log(chalk.red('Publish need build first or wait build Succeed ...'));
            }
        } else {
            console.log(' ');
            console.log(`please run this order in terminal:\n`);
            console.log(chalk.yellow(`curl -v 'http://${config.domain}' -x 42.123.119.50:80`));
        }
    }).catch((err) => {
        console.log(chalk.red(err));
    })
}

/**
 * Gets the status of the commit
 *  
 */

async function GetPublishFlag() {
    let flag = null;
    let { config, params, requestOption, client } = getConfigAndClient();
    params["DomainName"] = config.domain;
    params["FunctionName"] = "edge_function";
    let result = await client.request('PublishStagingConfigToProduction', params, requestOption).catch((ex) => {
        flag = false
        PublishError = ex;
    });
    if (result !== undefined && result.hasOwnProperty('RequestId')) {
        flag = true
    }
    return flag
}

/**
 *  The Main Function
 * @param {Object} program 
 */

function publish(program) {
    if (program.show == true) {
        clientCustom('show');
    } else if (program.delete == true) {
        clientCustom('delete');
    } else {
        getSolution()
    }
}

module.exports = publish


