const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const inquirer = require('inquirer');
const { getConfigAndClient, clientCustom, show } = require('./public')

const shell = require('shelljs');
const child_process = require('child_process');
var PublishError = null;
/**
 *   Submit questions and answers
 */

/**
*  The Main Function
* @param {Object} program 
*/

async function publish(program) {
    if (program.show == true) {
        clientCustom('show', 'prod');
    } else if (program.delete == true) {
        clientCustom('delete', 'prod');
    } else {
        // 第一步查询模拟环境的规则
        // return { DomainConfig, ERConfigID, ESCount }
        let { AllDomianConfig, ESCount } = await clientCustom(null, 'dev');
        if (ESCount > 0) {
            show(AllDomianConfig,'dev');
            getConfirm();
        } else {
            getConfirm();
        }
       
    }
}

// 
function getConfirm() {
    inquirer.prompt([{
        type: 'confirm',
        name: 'test-publish',
        message: chalk.greenBright(`[EN] No test, no publish,The above configs are fully tested in staging environment? \n  [ZN] 无测试，不发布，您在模拟环境充分测试了吗？`),
    }]).then((answer) => {
        if (answer['test-publish']) {
            console.log(chalk.yellowBright(`On Publishing:发布中... \n`))
            TerminalProgressPublish();
        } else {
            console.log(' ');
            console.log(`please run this order in terminal:\n`);
            console.log(chalk.yellow(`curl -v 'http://${config.domain}' -x 42.123.119.50:80`));
        }
    })
}

/**
 * Gets the status of the commit
 *  
 */

async function GetPublishFlag() {
    let flag = null;
    let { params, requestOption, client } = getConfigAndClient();
    params["FunctionName"] = "edge_function";
    params['DomainNames'] = params['DomainName'];
    let result = await client.request('PublishStagingConfigToProduction', params, requestOption).catch((ex) => {
        flag = false
        PublishError = ex;
    });
    if (result !== undefined && result.hasOwnProperty('RequestId')) {
        flag = true
    }
    return flag;
}

function TerminalProgressPublish() {
    let { config, params, client, requestOption } = getConfigAndClient();
    if (config.buildTime !== null) {
    // if (true) {
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
                console.log(chalk.greenBright(`[EN] Configuration successed in production environment.`));
                console.log(chalk.greenBright(`[ZN] 生产环境规则配置成功.`));
                await shell.sed('-i', /buildTime:.*/, `buildTime:null`, path.resolve('config.js'));
                
                // 生产环境拷贝规则到模拟环境部分
                let { DomainConfig } = await clientCustom('show', 'prod');
                params['Functions'] = JSON.stringify(DomainConfig);
                requestOption.method = 'POST';
                let result = await client.request('SetCdnDomainStagingConfig', params, requestOption).catch((e) => {
                    console.log("TerminalProgressPublish -> e", e)
                    
                });
                if (result.RequestId) {
                    console.log('拷贝规则成功');
                }
                // -------
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

}

module.exports = publish

