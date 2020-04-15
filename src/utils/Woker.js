let slog = require('single-line-log').stdout;
let chalk = require('chalk')
const { parentPort,workerData } = require('worker_threads');
const TerminalProgress = require('../utils/TerminalProgress');
const terminalProgress = new TerminalProgress('On Publishing', workerData-30);
var Timer = null;
parentPort.on('message', (value) => {
    let num = value.num;
    let total = value.total;
    let status = value.status
    let time = value.time
    if (Timer) {
        clearInterval(Timer)
    }
    
    Timer = setInterval(() => {
        if (num <= total) {
            let  {description,complete,uncomplete,progressNum} = terminalProgress.renderOption({ completed: num, total: total })
            if(status){
                let renderString  = `${description}: ${chalk.green(complete)}${uncomplete}  ${progressNum} \n\n`
                slog(renderString) 
            }else{
                let renderString  = `${description}: ${complete}${uncomplete}  ${progressNum} \n\n`
                slog(chalk.red(renderString))
            }
            
            num++
        } else {
            clearInterval(Timer)
            parentPort.postMessage(status)        
            process.exit(0)
        }
    }, time)
});