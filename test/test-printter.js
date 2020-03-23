const expect = require('expect.js');
const create = require('../src/debugger/lib/printter');
const Chalk = require('chalk');
describe('Printter Core', function () {
    describe('SetUserScriptContextPrint Test', function () {
        it('SetUserScriptContextPrint title ok', function () {
            let msg = { name: 'setUserScriptContext' };
            let setUserScriptContext = create(msg);
            expect(setUserScriptContext.title()).to.be.equal('setUserScriptContext');
        })

        it('SetUserScriptContextPrint content ok', function () {
            let msg = { name: 'setUserScriptContext' };
            let setUserScriptContext = create(msg);
            expect(setUserScriptContext.content()).to.be.equal('user script context setup');
        })
    })

    describe('ConnectionSetUpPrint Test', function () {
        it('ConnectionSetUpPrint title ok', function () {
            let msg = { name: 'connectionSetUp' };
            let connectionSetUp = create(msg);
            expect(connectionSetUp.title()).to.be.equal('connectionSetUp');
        })

        it('ConnectionSetUpPrint title ok', function () {
            let msg = { name: 'connectionSetUp' };
            let connectionSetUp = create(msg);
            expect(connectionSetUp.content()).to.be.equal('debug session setup');
        })

    })

    describe('OperationDonePrint Test', function () {
        it('OperationDonePrint title ok', function () {
            let msg = { name: 'report' };
            let report = create(msg);
            expect(report.title()).to.be.equal('report');
        })

        it('OperationDonePrint content ok', function () {
            let msg = { name: 'report' };
            let report = create(msg);
            expect(report.content()).to.be.equal('operation done');
        })
    })

    describe('HttpResponsePrint Test', function () {
        it('HttpResponsePrint title ok', function () {
            let msg = {
                name: 'httpResponse',
                data: {
                    header: ['testCode', 'testToken'],
                    status: 200,
                    statusText: '200',
                    body: "The body test content"
                }
            };
            let httpResponse = create(msg);
            expect(httpResponse.title()).to.be.equal('http(response)');
        })

        it('HttpResponsePrint content ok', function () {
            let msg = {
                name: 'httpResponse',
                data: {
                    header: ['testCode', 'testToken'],
                    status: 200,
                    statusText: '200',
                    body: "The body test content"
                }
            };
            let httpResponse = create(msg);
            expect(httpResponse.content()).to.not.empty();
        })
    })

    describe('JSPromisePrint Test', function () {
        it('JSPromisePrint ok', function () {
            let msg = {
                name: 'js.promise',
                data: {
                    eventName: 'TestEvent',
                    stackTrace: 'N/A',

                }
            }
            let jsPromisePrint = create(msg);
            let result = jsPromisePrint.title();
            expect(result).to.be(Chalk.red('Promise(TestEvent)'));
        })
    })

    describe('JSConsolePrint Test', function () {
        it('jsConsolePrint level warning  ok', function () {
            let msg = {
                name: 'js.console',
                data: {
                    level: 'warning'
                }
            }
            let JSConsolePrint = create(msg);
            expect(JSConsolePrint.title()).to.be.equal(`console(${Chalk.yellow('warning')})`)
        })

        it('jsConsolePrint level error ok', function () {
            let msg = {
                name: 'js.console',
                data: {
                    level: 'error'
                }
            }
            let JSConsolePrint = create(msg);
            expect(JSConsolePrint.title()).to.be.equal(`console(${Chalk.red('error')})`)
        })

        it('jsConsolePrint level log ok', function () {
            let msg = {
                name: 'js.console',
                data: {
                    level: 'log'
                }
            }
            let JSConsolePrint = create(msg);
            expect(JSConsolePrint.title()).to.be.equal(`console(${Chalk.green('log')})`)
        })

    })

    describe('JSExceptionPrint Test', function () {
        it('JSExceptionPrint ok', function () {
            let msg = {
                name: 'js.exception',
                data: {
                    lineNumber: 10,
                    columnNumber: 20,
                }
            }
            let jsConsolePrint = create(msg);
            expect(jsConsolePrint.title()).to.be.equal(Chalk.red(`Uncaught Exception@10:20`));
        })
    })

    describe('JSAbortPrint Test', function () {
        it('JSAbortPrint title ok', function () {
            let msg = {
                name: 'js.abort',
                data: {
                    abortReason: 'jsAbort'
                }
            }
            let jsAbortPrint = create(msg);
            expect(jsAbortPrint.title()).to.be.equal(Chalk.red('VM abort(jsAbort)'));
        })

        it('JSAbortPrint ccontent ok', function () {
            let msg = {
                name: 'js.abort',
                data: {
                    info: 'infotest'
                }
            }
            let jsAbortPrint = create(msg);
            expect(jsAbortPrint.content()).to.be.a('string');
        })
    })

    describe('JSReportPrint Test', function () {
        it('JSReportPrint title ok', function () {
            let msg = {
                name: 'js.report',
                data: [1, 2],
            }
            let jsReportPrint = create(msg);
            expect(jsReportPrint.title()).to.be.equal('Report');
        })

        it('JSReportPrint content ok', function () {
            let msg = {
                name: 'js.report',
                data: [1, 2],
            }
            let jsReportPrint = create(msg);
            expect(jsReportPrint.content()).to.be.a('string');
        })
    })

    describe('VMAbortPrint Test', function () {
        it('VMAbortPrint title  ok', function () {
            let msg = {
                name: 'vm.abort',
            }
            let vmAbortPrint = create(msg);
            expect(vmAbortPrint.title()).to.be(Chalk.red('VM Reset'));
        })

        it('VMAbortPrint content  ok', function () {
            let msg = {
                name: 'vm.abort',
            }
            let vmAbortPrint = create(msg);
            expect(vmAbortPrint.content()).to.be(Chalk.red.bold("VM has been abortted due to memory resource quota violation"));
        })
    })

    describe('DefaultPrint Test', function () {
        it('DefaultPrint title  ok', function () {
            let msg = {
                name: 'DefaultPrint'
            }
            let defaultPrint = create(msg);
            expect(defaultPrint.title()).to.be('DefaultPrint');
        })

        it('DefaultPrint content  ok', function () {
            let msg = {
                name: 'DefaultPrint'
            }
            let defaultPrint = create(msg);
            expect(defaultPrint.content()).to.be.a('string');
        })
    })
})