const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const popCore = require('@alicloud/pop-core');
const base64 = require('js-base64').Base64;
const shell = require('shelljs');
// get config and client 
function getConfigAndClient() {
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
    let params = {
        'RegionId': 'cn-hangzhou',
        'DomainName': config.domain,
    };
    const requestOption = {
        method: 'GET'
    };
    return { config, client, params, requestOption };
}

function show(AllDomianConfig, env) {
    // AllDomianConfig
    console.log(chalk.yellow(`[EN] ${AllDomianConfig.length} configurations in  ${env == 'dev' ? 'staging' : 'production'} environment:`));
    console.log(chalk.yellow(`[ZN] ${env == 'dev' ? '模拟环境' : '生产环境'}共有${AllDomianConfig.length}条配置:`));
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
                console.log(chalk.red('ES的配置规则做展示，如需修改请前往控制台操作，了解更多：https://help.aliyun.com/document_detail/141724.html'));
                console.log(chalk.red('Configs of ES is read only. if you need to modifly it please go to the console. learn more：https://help.aliyun.com/document_detail/141724.html'))
            }
        }
    }

}

// client request 
async function clientCustom(status, env) {
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
                AllDomianConfig.push(functionDict);
                if (functionDict['grammar'] == 'js') {
                    ERConfigID = config.ConfigId;
                    index = i;
                } else {
                    ESCount++
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

    if (status == 'show') {
        show(AllDomianConfig, env);
    } else if (status == 'build') {
        index != null ? result.DomainConfigs.splice(index, 1) : null
        DomainConfig = [...result.DomainConfigs];
    } else if (status == 'delete') {
        if (ERConfigID == null) {
            let text = env == 'dev' ? '模拟环境' : '生产环境'
            console.log(chalk.greenBright(`[EN] ${text} ER规则为空`));
            return
        };
        params["ConfigId"] = ERConfigID;
        let order = env == 'dev' ? 'DeleteSpecificStagingConfig' : 'DeleteSpecificConfig';
        let deleteEnv = env == 'dev' ? 'DeletedStaging' : 'DeletedProd';
        requestClient(order, params, requestOption, deleteEnv, env);
    } else if (status == 'rollback') {
        if (ERConfigID == null) {
            let text = env == 'dev' ? '模拟环境' : '生产环境';
            console.log(chalk.greenBright(`[EN] ${text} ER规则为空`));
            return
        };
        params["FunctionName"] = 'edge_function';
        requestClient('RollbackStagingConfig', params, requestOption, 'Rollbacked', env)
    }
    return { DomainConfig,AllDomianConfig, ERConfigID, ESCount }
}

// Build  Success or Delete or Rollback
function requestClient(url, params, requestOption, status, env) {
    let { client } = getConfigAndClient();
    client.request(url, params, requestOption).then(async (result) => {
        if (result.RequestId) {
            await clientCustom('show', env);
            if (status == 'Build') {
                let configPath = path.resolve('config.js');
                await shell.sed('-i', /buildTime:.*/, `buildTime:${parseInt(Date.now() / 1000)}`, configPath);
                console.log(chalk.greenBright(`[EN] Configuration succeeded in staging environment.`));
                console.log(chalk.greenBright(`[ZN] 模拟环境ER规则配置成功。`));
            } else if (status == 'DeletedStaging') {
                console.log(chalk.greenBright(`[EN] Configuration Deleted in staging environment.`));
                console.log(chalk.greenBright(`[ZN] 模拟环境ER规则删除成功。`));
            } else if (status == 'Rollbacked') {
                console.log(chalk.greenBright(`[EN] Configuration roll-back in staging environment.`));
                console.log(chalk.greenBright(`[ZN] 模拟环境ER规则回滚成功。`));
            } else if (status == 'DeletedProd') {
                console.log(chalk.greenBright(`[EN] Configuration Deleted in production environment.`));
                console.log(chalk.greenBright(`[ZN] 生产环境ER规则删除成功。`));
            }
        }
    }, (ex) => {
        console.log(ex);
        status == "Build" && console.log(chalk.red("Build failed, check exists or connect us..."));
    });
}


module.exports = { clientCustom, getConfigAndClient, requestClient,show }


