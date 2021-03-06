const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const popCore = require('@alicloud/pop-core');
const base64 = require('js-base64').Base64;
const inquirer = require('inquirer');

function getConfigAndClient() {
    let config = {};
    if (fs.existsSync(path.resolve('config.js'))) {
        config = require(path.resolve('config.js'));
    } else {
        console.log(chalk.red('[EN] Build without config.js, please run `edgeroutine-cli config` first to set config...'));
        console.log(chalk.red('[CN] 构建缺失 config.js, 请先执行如下命令： `edgeroutine-cli config` 创建配置文件...'));
        process.exit(1);
    }
    const client = new popCore({
        accessKeyId: config.accessKeyID,
        accessKeySecret: config.accessKeySecret,
        endpoint: config.endpoint,
        apiVersion: config.apiVersion,
    });
    let params = {
        'RegionId': 'cn-hangzhou',
        'DomainName': config.domain,
    };
    const requestOption = {
        method: 'GET'
    };
    return { config, client, params, requestOption };
}

function showRules(AllDomianConfig, env, isShow) {
    // AllDomianConfig
    if (isShow) {
        console.log(chalk.yellow(`[EN] ${AllDomianConfig.length} configurations in  ${env == 'dev' ? 'staging' : 'production'} environment:`));
        console.log(chalk.yellow(`[CN] ${env == 'dev' ? '模拟环境' : '生产环境'}共有${AllDomianConfig.length}条配置:`));
    }
    if (AllDomianConfig.length > 0) {
        for (let index = 0; index < AllDomianConfig.length; index++) {
            let ele = AllDomianConfig[index];
            console.log(" ")
            console.log(chalk.red(`[Config ${index + 1}]`));
            console.log(chalk.green(`Type: ${ele.grammar == "js" ? "ER" : "ES (Read Only)"}`));
            console.log(chalk.green(`Name: ${ele.name}`));
            console.log(chalk.green(`ConfigId: ${ele.ConfigId}`));
            console.log(chalk.green(`Rule:`));
            ele.grammar == 'js' ? console.log(chalk.blue(base64.decode(ele['rule']))) : console.log(chalk.blue(ele['rule']));
            console.log(" ")
            if (ele.grammar != "js") {
                console.log(chalk.red('ES的配置规则仅做展示，如需修改请前往控制台操作，了解更多：https://help.aliyun.com/document_detail/141724.html'));
                console.log(chalk.red('Configs of ES is read only. if you need to modifly it please go to the console. learn more：https://help.aliyun.com/document_detail/141724.html'))
            }
        }
    }
    console.log(' ')

}

// client request 
async function getStagingOrProductConfig(env) {
    let DomainConfig = [];
    let AllDomianConfig = [];
    let index = null;
    let ERConfigID = null;
    let ESCount = 0;
    let { client, params, requestOption } = getConfigAndClient();
    params["FunctionNames"] = 'edge_function';
    // 
    let environment = env == 'dev' ? "DescribeCdnDomainStagingConfig" : 'DescribeCdnDomainConfigs';
    let result = await client.request(environment, params, requestOption).catch(e => {
        console.log(e);
    })
    if (result) {
        let domainConfig = env == 'dev' ? result.DomainConfigs : result.DomainConfigs.DomainConfig;
        for (var i = 0; i < domainConfig.length; i++) {
            let config = domainConfig[i];
            Reflect.deleteProperty(config, 'Status');
            if (config['FunctionName'] == "edge_function") {
                let functionDict = {
                    ConfigId: config.ConfigId,
                }
                // 处理规则
                let FuncArg = env == 'dev' ? config.FunctionArgs : config.FunctionArgs.FunctionArg;
                for (var key in FuncArg) {
                    let funcArg = FuncArg[key];
                    functionDict[funcArg["ArgName"]] = funcArg["ArgValue"];
                }
                if (functionDict['grammar'] == 'js') {
                    ERConfigID = config.ConfigId;
                    index = i;
                    AllDomianConfig.unshift(functionDict)
                } else {
                    // 计算ES的数量
                    ESCount++
                    AllDomianConfig.push(functionDict);
                }
                if (env == 'prod') {
                    let func = {
                        FunctionArgs: FuncArg,
                        FunctionName: 'edge_function',
                    }
                    DomainConfig.push(func)
                }
            }
        }
    }
    // 
    if (env == 'dev') {
        index != null ? result.DomainConfigs.splice(index, 1) : null
        DomainConfig = [...result.DomainConfigs];
    }
    return { DomainConfig, AllDomianConfig, index, ERConfigID, ESCount }
}

function DeleteConfigs(env) {
    let environment = env == 'dev' ? 'DeleteSpecificStagingConfig' : 'DeleteSpecificConfig';
    let CN = env == 'dev' ? '模拟环境' : '生产环境'
    let EN = env == 'dev' ? 'staging' : 'production'
    inquirer.prompt([{
        type: 'confirm',
        name: 'delete',
        message: chalk.greenBright(`[EN] Delete ER config in ${EN} environment? \n  [CN] 确认删除${CN}中的 ER 配置？`),
    }]).then(async (answer) => {
        if (answer['delete']) {
            let { ERConfigID } = await getStagingOrProductConfig(env);
            if (ERConfigID == null) {
                console.log(' ')
                console.log(chalk.greenBright(`[EN] No configs in ${EN} environment`));
                console.log(chalk.greenBright(`[CN] ${CN} ER 规则为空`));
                return
            };
            let { client, params, requestOption } = getConfigAndClient();
            params["ConfigId"] = ERConfigID;
            let result = await client.request(environment, params, requestOption).catch(e => {
                if (e.code == 'ConfigurationConflicts') {
                    console.log(' ');
                    console.log(chalk.redBright(`[EN] You can not modify the configurations of production environment when the staging environment is not empty. Please rollback staging environment first.`));
                    console.log(chalk.redBright(`[CN] 当模拟环境有配置时不能直接修改生产环境的配置，您需要先回滚模拟环境。`));
                } else {
                    console.log("DeleteConfigs -> e", e);
                }
            });
            if (result) {
                let { AllDomianConfig, ESCount } = await getStagingOrProductConfig(env);
                if (ESCount > 0) {
                    console.log(chalk.greenBright(`[EN] ER config was removed success, ${AllDomianConfig.length} ES config left in staging environment`));
                    console.log(chalk.greenBright(`[CN] ER配置删除成功。模拟环境剩余 ${AllDomianConfig.length} 条ES规则`))
                    console.log(" ");
                    showRules(AllDomianConfig, env, false);
                } else {
                    console.log(' ')
                    console.log(chalk.greenBright(`[EN] Deleted success.`));
                    console.log(chalk.greenBright(`[CN] 删除成功`));
                }
            }
        } else {
            console.log(' ')
            console.log(chalk.greenBright(`[EN] undelete`));
            console.log(chalk.greenBright(`[CN] 取消删除`));
        }
    })
}


async function RollbackConfigs(env) {
    let { client, params, requestOption } = getConfigAndClient();
    let { AllDomianConfig } = await getStagingOrProductConfig(env);
    if (AllDomianConfig.length > 0) {
        showRules(AllDomianConfig, env, true);
    }
    inquirer.prompt([{
        type: 'confirm',
        name: 'rollback',
        message: chalk.greenBright(`[EN] The roll back operation will empty the configs of ES and ER. Please comfirm? \n  [CN] 回滚操作会将模拟环境的ES和ER配置清空，请确认回滚？`)
    }]).then(async (answer) => {
        if (answer['rollback']) {
            params["FunctionName"] = 'edge_function';
            let result = await client.request('RollbackStagingConfig', params, requestOption).catch(e => {
                if (e.code == 'StagingConfig.NotFound') {
                    console.log(' ')
                    console.log(chalk.greenBright('[EN] There is no config in staging environment to rollback.'));
                    console.log(chalk.greenBright('[CN] 模拟环境没有配置，无法回滚。'));
                } else {
                    console.log("RollbackConfigs -> e", e);
                }
            });
            if (result) {
                console.log(' ')
                console.log(chalk.greenBright('[EN] Roll back success. '));
                console.log(chalk.greenBright('[CN] 回滚成功'));
            }
        } else {
            console.log(' ')
            console.log(chalk.greenBright('[EN] Cancel the rollback'));
            console.log(chalk.greenBright('[CN] 取消回滚'));
        }
    })
}


module.exports = { getStagingOrProductConfig, getConfigAndClient, showRules, DeleteConfigs, RollbackConfigs }
