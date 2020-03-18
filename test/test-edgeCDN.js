const EdgeCDN = require('../src/edge/edgecdn')
const expect = require('expect.js');

describe('EdgeCDN Core', function () {
    // The test Class EdgeCDN 
    describe('EdgeCDN input test', function () {
        it('should pass into "config"', function () {
            expect(function () {
                new EdgeCDN();
            }).to.throwException('must pass "config"');
        })

        it('should pass into "config.accessKeyId"', function () {
            expect(function () {
                new EdgeCDN({});
            }).to.throwException('must pass "config.accessKeyId"');
        })

        it('should pass into "config.accessKeySecret"', function () {
            expect(function () {
                new EdgeCDN({
                    accessKeyId: 'accessKeyId'
                });
            }).to.throwException('must pass "config.accessKeySecret"');
        })

        it('should pass into "config.endpoint"', function () {
            expect(function () {
                new EdgeCDN({
                    accessKeyId: 'accessKeyId',
                    accessKeySecret: 'accessKeySecret'
                });
            }).to.throwException('must pass "config.endpoint"');
        })

        it('should pass into "config.domainName"', function () {
            expect(function () {
                new EdgeCDN({
                    accessKeyId: 'accessKeyId',
                    accessKeySecret: 'accessKeySecret',
                    endpoint: 'http://www.test.com'
                });
            }).to.throwException('must pass "config.domainName"');
        })

        it('should ok new EdgeCDN', function () {
            const edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            expect(edgecdn.endpoint).to.be('http://www.mochatest.com');
            expect(edgecdn.domainName).to.be('www.mocha.com');
        })
    })
    // The test _encode function
    describe('_encode test', function () {
        it('_encode is Function ok', function () {
            let edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            expect(edgecdn._encode).to.be.an("function");
        })

        it('_encode input test ok', function () {
            let edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            expect(edgecdn._encode()).to.be('undefined');
        })

        it('_encode output test ok', function () {
            let edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            expect(edgecdn._encode('!()')).to.equal('%21%28%29');
        })
    })

    // The test _flatParams function
    describe("_flatParams Test", function () {
        it('_flatParams is funtion ok', function () {
            let edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            expect(edgecdn._flatParams).to.be.an("function");
        })

        it('_flatParams input test ok', function () {
            let edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            expect(function () {
                edgecdn._flatParams();
            }).to.throwException('must pass "params"');
        })
        
        it('_flatParams output test ok', function () {
            let edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            expect(edgecdn._flatParams({})).to.be.empty();
            expect(edgecdn._flatParams({ 'moack': 'test' })).to.have.key('moack')
        })
    })

    describe('_buildParams Test', function () {
        it('_buildParams test ok', function () {
            const edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            const result = edgecdn._buildParams();
            expect(result).to.only.have.keys('Format', 'SignatureMethod',
                'SignatureNonce', 'SignatureVersion', 'Timestamp', 'AccessKeyId',
                'Version');
        })
    })

    describe('DescribeCdnService Test', function () {
        it("DescribeCdnService test ok", function () {
            const edgecdn = new EdgeCDN({
                accessKeyId: 'accessKeyId',
                accessKeySecret: 'accessKeySecret',
                endpoint: 'http://www.mochatest.com',
                domainName: "www.mocha.com"
            });
            const result = edgecdn.DescribeCdnService();
            expect(result).to.only.have.keys('url', 'headers');
            expect(result.url).to.not.be.empty();
            expect(result.headers).to.only.have.keys('x-sdk-client', 'user-agent');
        })
    })
})
