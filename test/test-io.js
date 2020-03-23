const expect = require('expect.js');
const { IO } = require('../src/debugger/lib/io');

describe('IO Core Test', function () {
    describe("IO", function () {
        it('should not pass Parmas', function () {
            expect(function () {
                new IO();
            }).to.throwException('Cannot read property indexOf of undefined');
        })

        it('should pass url', async function () {
            let io = new IO('127.0.0.1:8000');
            io._webSocket.onerror = function (err) {
                return err
            }
            expect(function () {
                throw io._webSocket.onerror();
            }).to.throwException();
        })

        it('should pass onMessage', async function () {
            let onMessage = function () {
                return false
            }
            let io = new IO('127.0.0.1:8000', onMessage);
            io._webSocket.onerror = function (err) {
                return err
            }
            expect(io._onMessage).to.be.a('function');
            expect(io._onMessage()).to.be(false);
        })

        it('should pass onConnect', async function () {
            let onMessage = function () {
                return false
            }
            let onConnect = function () {
                return false
            }
            let io = new IO('127.0.0.1:8000', onMessage, onConnect);
            io._webSocket.onerror = function (err) {
                return err
            }
            io._webSocket.onopen();
            expect(io._connected).to.be(true);
        })

        it('should pass onClose', async function () {
            let onMessage = function () {
                return false
            }
            let onConnect = function () {
                return false
            }
            let onClose = function () {
                return 'io close'
            }
            let io = new IO('127.0.0.1:8000', onMessage, onConnect, onClose);
            io._webSocket.onerror = function (err) {
                return err
            }
            let result = io._webSocket.onclose();
            expect(result).to.be('io close');
        })

        it('should pass onError', async function () {
            let onMessage = function () {
                return false
            }
            let onConnect = function () {
                return false
            }
            let onClose = function () {
                return 'io close'
            }
            let onError = function (err) {
                return err
            }
            let io = new IO('127.0.0.1:8000', onMessage, onConnect, onClose, onError);
            let result = io._webSocket.onerror();
            expect(result).to.be(undefined);
        })
    })
})