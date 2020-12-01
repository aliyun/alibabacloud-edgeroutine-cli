const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const shell = require('shelljs');
const child_process = require('child_process');
const { getConfigAndClient, getStagingOrProductConfig, showRules, DeleteConfigs } = require('./public')
var PublishError = null;

/**
*  The Main Function
* @param {Object} program 
*/
async function publish(program) {
    if (program.show == true) {
        let { AllDomianConfig } = await getStagingOrProductConfig('prod');
        showRules(AllDomianConfig, 'prod', true);
    } else if (program.delete == true) {
        DeleteConfigs('prod');
    } else {
        // 第一步查询模拟环境的规则
        let { AllDomianConfig, ESCount } = await getStagingOrProductConfig('dev');
        if (ESCount > 0) {
            showRules(AllDomianConfig, 'dev', true);
            getConfirm();
        } else {
            getConfirm();
        }
    }
}

// 
function getConfirm() {
    let { config } = getConfigAndClient()
    inquirer.prompt([{
        type: 'confirm',
        name: 'test-publish',
        message: chalk.greenBright(`[EN] Please make sure the configs have been tested fully in staging environment?\n  [CN] 您确认在模拟环境充分测试了吗？`),
    }]).then((answer) => {
        if (answer['test-publish']) {
            console.log(" ");
            TerminalProgressPublish();
        } else {
            console.log(' ');
            console.log(chalk.redBright(`[EN] Please test fully in staging environment，for example:`));
            console.log(chalk.redBright(`[CN] 请充分测试, 下面是测试路径示例:`));
            console.log(' ');
            console.log(chalk.yellow(`curl -v 'http://${config.domain}' -x 42.123.119.50:80`));
        }
    })
}

function TerminalProgressPublish() {
    let { config, params, client, requestOption } = getConfigAndClient();
    if (config.buildTime !== null) {
        /**
         * Get buildTime and publishTime 
         */
        let buildTime = config.buildTime + 20 || 20;
        let publishTime = parseInt(Date.now() / 1000);
        let leadTime = buildTime - publishTime > 0 ? 20 : 1;
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
                console.log(chalk.greenBright(`[CN] 生产环境规则配置成功.`));
                await shell.sed('-i', /buildTime:.*/, `buildTime:null`, path.resolve('config.js'));

                // 生产环境拷贝规则到模拟环境部分
                let { DomainConfig } = await getStagingOrProductConfig('prod');
                params['Functions'] = JSON.stringify(DomainConfig);
                requestOption.method = 'POST';
                await client.request('SetCdnDomainStagingConfig', params, requestOption);
                // ------- 
            } else {
                if (PublishError !== null && PublishError.code == 'StagingConfig.Failed') {
                    console.log(chalk.redBright('[EN] Config is building, you can publish after build success.'));
                    console.log(chalk.redBright('[CN] 规则正在配置，请稍后再发布生产环境'));
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
        console.log(" ")
        console.log(chalk.greenBright('[EN] Please build and test in staging environment before publish.'));
        console.log(chalk.greenBright('[CN] 请先build并在模拟环境中测试，再发布至生产环境。'));
    }

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
    if(result != undefined){
        result = JSON.parse(JSON.stringify(result))
    }
    if (result instanceof Object && Reflect.has(result,"RequestId") ) {
        flag = true
    }
    return flag;
}

module.exports = publish

