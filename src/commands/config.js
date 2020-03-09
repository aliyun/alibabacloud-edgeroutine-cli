const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const shell = require('shelljs');
const figlet = require('figlet');
const inquirer = require('inquirer');

async function setConfigJS(configPath) {
    const prompts = [{
        type: 'input',
        name: 'set-config-domain',
        message: 'set your domain: ',
        validate: function(input) {
            var regUrl = new RegExp();
            regUrl.compile("^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$");
            if (!regUrl.test(input)) {
                return 'Try again: must be domain format!';
            }
            shell.sed('-i', 'domain: ""', `domain: '${input}'`, configPath);
            return true;
        }
    }, {
        type: 'input',
        name: 'set-config-access-id',
        message: 'set your accessID: ',
        validate: function(input) {
            if (!input) {
                return 'Try again: must set accessID!';
            }
            shell.sed('-i', 'accessKeyID: ""', `accessKeyID: '${input}'`, configPath);
            return true;
        }
    }, {
        type: 'input',
        name: 'set-config-access-secret',
        message: 'set your accessSecret: ',
        validate: function(input) {
            if (!input) {
                return 'Try again: must set accessSecret!';
            }
            shell.sed('-i', 'accessKeySecret: ""', `accessKeySecret: '${input}'`, configPath);
            return true;
        }
    }];

    await inquirer.prompt(prompts);
}

function initConfigJS(dirName) {
    figlet('edgeroutine-cli', async function(err, data) {
        if (err) {
            console.log(chalk.red('Some thing about figlet is wrong!'));
        }
        console.log(chalk.yellow(data));
        let templatePath = path.join(__dirname, '../templates/config/config.js');
        let configStr = fs.readFileSync(templatePath, 'utf8');
        if(dirName){
            if(!fs.existsSync(path.resolve(dirName))){
                fs.mkdirSync(path.resolve(dirName))
            }
        }else{
            dirName = ''
        }
        let targetFilePath = path.resolve(dirName,'config.js');
        fs.writeFileSync(targetFilePath, configStr, 'utf8');
        console.log(chalk.red('\n Created default config.js, waiting init... \n'));
        await setConfigJS(targetFilePath);
        console.log(chalk.green('\n Initialize config.js success... \n'));
        process.exit(0);
    });
}

module.exports = function(dirName) {
    // 配置文件如果存在则提示是否覆盖
    if (fs.existsSync(path.resolve('config.js'))) {
        // 连续提问
        inquirer.prompt([{
                name: 'init-confirm',
                type: 'confirm',
                message: `config.js is already existed, are you sure to overwrite?`,
                validate: function(input) {
                    if (input.lowerCase !== 'y' && input.lowerCase !== 'n') {
                        return 'Please input y/n !'
                    } else {
                        return true;
                    }
                }
            }])
            .then(answers => {
                // y -> 覆盖, n -> 退出
                if (answers['init-confirm']) {
                    initConfigJS();
                } else {
                    process.exit(0);
                }
            })
            .catch(err => {
                console.log(chalk.red(err));
            })
    } else {
        initConfigJS(dirName);
    }
};