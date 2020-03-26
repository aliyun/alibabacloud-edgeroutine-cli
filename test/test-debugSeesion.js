const expect = require('expect.js');
const { DebugSession } = require('../src/debugger/lib/debug-session');
const assert = require('assert')

describe('DebugSession Core Test', function () {
    describe('DebugSession input Test', function () {
        it('should not pass Parmas', function () {
            expect(function () {
                new DebugSession();
            }).to.throwException('Cannot read property indexOf of undefined')
        })

    })

    describe('DebugSession output Test', function () {
        it('should output ok', function () {
            let write = {
                fatal: function (data) {
                    return data
                },
                incomming: function (data) {
                    return data;
                }
            }
            let onClose = function () {
                return 'close'
            }
            let connector = function () {
                return 'connector'
            }
            let debugSession = new DebugSession('127.0.0.1:8000', '00000', connector, write, onClose);
            expect(debugSession.lastHttpResponse()).to.be(undefined);
        })
    })
})