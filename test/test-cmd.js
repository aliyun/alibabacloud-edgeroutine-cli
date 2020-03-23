
const expect = require('expect.js');
const Cmd = require('../src/debugger/lib/cmd');

describe('Cmd Core Test', function () {
    describe('Cmd test ', function () {

        it('the not inptu test', function () {
            let cmd = new Cmd();
            expect(cmd._session).to.be.equal(undefined);
        })

        it('shuold pass "session"', function () {
            let session = {}
            let cmd = new Cmd(session);
            expect(cmd._session).to.be.a(Object);
        })

        it('httpRequest test ok', function () {
            let session = {}
            let cmd = new Cmd(session);
            expect(cmd.httpRequest).to.be.a('function');
            expect(function () {
                cmd.httpRequest('Post', 'www.xxx.com', { ssToken: 'token' }, { ssCode: '[1,3,5]' });
            }).to.throwException('this._session.httpRequest is not a function');
        })

        it('httpGet test ok', function () {
            let session = {
                httpRequest: function (method, url, header, body, ev = "fetch") {
                    return { method, url, header, body, ev }
                }
            }
            let cmd = new Cmd(session);
            expect(cmd.httpGet).to.be.a('function');
            let result = cmd.httpGet('www.xxx.com', { ssToken: 'token' }, { ssCode: '[1,3,5]' });
            expect(result).to.not.be.empty();
        })

        it('cmdList test ok', function () {
            let cmd = new Cmd();
            let result = cmd.cmdList();
            expect(result).to.be.an('array');
            expect(result).to.not.be.empty();
        })

        it('nameList test ok', function () {
            let cmd = new Cmd();
            let result = cmd.nameList();
            expect(result).to.contain('http', 'get', 'post', 'lastHttpResponse', 'setScript', 'source', 'enableReport', 'disableReport', 'showBrowser');
        })
    })
})