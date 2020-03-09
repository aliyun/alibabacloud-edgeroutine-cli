const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');

// NOTES(dpeng): I add this for highlighting JavaScript syntax inside of terminal
const hi = require("../core/highlight.js")

function initEdgeJS(dirName) {
    figlet('edgeroutine-cli', async function(err, data) {
        if (err) {
            console.log(chalk.red('Some thing about figlet is wrong!'));
        }
        console.log(chalk.yellow(data));
        let templatePath = path.join(__dirname, '../templates/js/edge.js');
        let templateStr = fs.readFileSync(templatePath, 'utf8');
        if(dirName){
            if(!fs.existsSync(path.resolve(dirName))){
                fs.mkdirSync(path.resolve(dirName))
            }
        }else{
            dirName = ''
        }
        let targetFilePath = path.resolve(dirName,'edge.js');
        fs.writeFileSync(targetFilePath, templateStr, 'utf8');
        console.log(chalk.red('\nCoding...\n'));
        console.log(chalk.red('Initialize edge.js success... \n'));
        console.log(chalk.red('------------------------------\n'));
        console.log(hi(templateStr));
        process.exit(0);
    });
}

module.exports = function(dirName) {
    // 代码文件如果存在则提示是否覆盖
    if (fs.existsSync(path.resolve('edge.js'))) {
        // 连续提问
        inquirer.prompt([{
                name: 'init-confirm',
                type: 'confirm',
                message: `edge.js is already existed, are you sure to overwrite?`,
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
                    initEdgeJS();
                } else {
                    process.exit(0);
                }
            })
            .catch(err => {
                console.log(chalk.red(err));
            })
    } else {
        initEdgeJS(dirName);
    }
};
