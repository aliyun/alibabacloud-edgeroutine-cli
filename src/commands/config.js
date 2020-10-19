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
        // message: 'set your domain: ',
        message:chalk.greenBright('Enter your domain (设置您的域名):'),
        validate: function (input) {
            var regUrl = new RegExp();
            regUrl.compile("^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$");
            if (!regUrl.test(input)) {
                return 'Try again: must be domain format! (在试一次,必须是域名)';
            }
            shell.sed('-i', 'domain: ""', `domain: '${input}'`, configPath);
            return true;
        }
    }, {
        type: 'input',
        name: 'set-config-access-id',
        // message: 'set your accessID: ',
        message:chalk.greenBright('Enter your accessID (设置您的AK): '),
        validate: function (input) {
            if (!input) {
                return 'Try again: must set accessID!';
            }
            shell.sed('-i', 'accessKeyID: ""', `accessKeyID: '${input}'`, configPath);
            return true;
        }
    }, {
        type: 'input',
        name: 'set-config-access-secret',
        // message: 'set your accessSecret: ',
        message:chalk.greenBright('Enter your accessSecret (设置您的SK): '),
        validate: function (input) {
            if (!input) {
                return 'Try again: must set accessSecret!';
            }
            shell.sed('-i', 'accessKeySecret: ""', `accessKeySecret: '${input}'`, configPath);
            return true;
        }
    }];

    await inquirer.prompt(prompts);
}

function initConfigJS() {
    figlet('edgeroutine-cli', async function (err, data) {
        if (err) {
            console.log(chalk.red('Some thing about figlet is wrong!'));
        }
        console.log(chalk.yellow(data));
        let templatePath = path.join(__dirname, '../templates/config/config.js');
        let configStr = fs.readFileSync(templatePath, 'utf8');
        let targetFilePath = path.resolve('config.js');
        fs.writeFileSync(targetFilePath, configStr, 'utf8');
        console.log('');
        console.log(chalk.greenBright("[EN] config.js Initializing..."));
        console.log(chalk.greenBright("[CN] 代码文件 config.js初始化中...\n"));
        await setConfigJS(targetFilePath);
        console.log('');
        console.log(chalk.greenBright('[EN] config.js Initialization success.'));
        console.log(chalk.greenBright('[CN] 配置文件 config.js 初始化完毕。 \n'));
        process.exit(0);
    });
}

 function config() {
    // 配置文件如果存在则提示是否覆盖
    if (fs.existsSync(path.resolve('config.js'))) {
        // 连续提问
        inquirer.prompt([{
            name: 'init-confirm',
            type: 'confirm',
            message:chalk.greenBright('[EN] config.js is already existed, are you sure to overwrite? \n  [CN] config.js 文件已经存在,您确定要覆盖吗？'),
            validate: function (input) {
                if (input.lowerCase !== 'y' && input.lowerCase !== 'n') {
                    return 'Please input y/n !'
                } else {
                    return true;
                }
            }
        }]).then(answers => {
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
        initConfigJS();
    }
};

module.exports = config;