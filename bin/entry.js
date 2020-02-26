const program = require('commander');

const build = require('../src/commands/build');
const config = require('../src/commands/config');
const init = require('../src/commands/init');
const publish = require('../src/commands/publish');
const dbg = require("../src/debugger/lib.js");

// Modify if we depoly our debugger into different places
const debuggerIp = "debugger.ialicdn.com";

program
    .version('0.1.1', '-v, --version')
    .on('--help', function() {
        console.log('');
        console.log('Examples:');
        console.log('  0. mkdir yourProject & cd yourProject    Prepare an empty directory');
        console.log('  1. edgeroutine-cli init                  Initialize and coding with edge.js');
        console.log('  2. edgeroutine-cli config                Config with your alicloud access');
        console.log('  3. edgeroutine-cli build                 Build code and you can test with gray env');
        console.log('  4. edgeroutine-cli publish               Publish code only when you are ready online');
    });

program
    .command('init')
    .description('Initialize project with the default sample')
    .action(init);

program
    .command('config')
    .option('-s, --show', 'show existed config')
    .description('Config project before build and publish')
    .action(config)

program
    .command('build')
    .option('-s, --show', 'show build configs')
    .option('-d, --delete', 'delete existed build')
    .option('-r, --rollback', 'rollback existed build')
    .description('Build code, check synax and publish to remote gray environment')
    .action(build)

program
    .command('publish')
    .option('-s, --show', 'show published code')
    .option('-d, --delete', 'delete published code')
    .description('Publish code to remote environment')
    .action(publish)

program
    .command('debugger [url] [id] [path] [origin]')
    .option('-u, --url', 'specify debugger endpoint', undefined, debuggerIp)
    .option('-i, --id', 'specify debugger user id', undefined, "debug")
    .option('-p, --path', 'specify debugged script path', undefined, undefined)
    .option('-o, --origin', 'specify debugged script origin', undefined, undefined)
    .description("launch edgeroutine interactive debugger")
    .action(function(url, id, path, origin, opt) {
        dbg({
            url: url || debuggerIp,
            uid: id || "debug",
            sourcePath: path,
            origin: origin
        });
    })

program.parse(process.argv);
