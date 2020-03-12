const expect = require('expect.js');
const { buildRules } = require('../src/commands/build');
const config = require('../src/templates/config/config');

describe('BuildRules Test', function () {
    describe('BuildRules input test', function () {
        it('buildRules is Function', function () {
            expect(buildRules).to.be.a('function');
        })

        it('should pass "config"', function () {
            expect(function () {
                buildRules();
            }).to.throwException('must pass "config"');
        })

        it('should pass "params"', function () {
            expect(function () {
                buildRules(config);
            }).to.throwException('must pass "params"');
        })
        
        it('should pass "edgejsCode"', function () {
            let params = {
                'RegionId': 'cn-hangzhou',
                'DomainName': config.domain,
            };
            expect(function () {
                buildRules(config, params);
            }).to.throwException('must pass "edgejsCode"');
        })
    })

    describe('BuildRusle output test', function () {
        it('should ok the first', function () {
            config.domain = 'www.mocoktest.com'
            let params = {
                'RegionId': 'cn-hangzhou',
                'DomainName': config.domain,
            };
            let ossjsCode = undefined;
            let edgejsCode = `function handleRequest(request) { console.log(request)}`;
            let result = buildRules(config, params, edgejsCode, ossjsCode);
            expect(result).to.only.have.keys('RegionId', 'DomainName', 'Functions');
            expect(result.RegionId).to.be('cn-hangzhou');
            expect(result.DomainName).to.be('www.mocoktest.com');
            expect(JSON.parse(result.Functions)).to.be.an('array');
        })

        it('should ok the seconed', function () {
            config.domain = 'www.mocoktest.com'
            let params = {
                'RegionId': 'cn-hangzhou',
                'DomainName': config.domain,
            };
            let edgejsCode = `function handleRequest(request) {console.log(request)}`;
            let ossjsCode = 'function handle(request){ console.log(request)}';
            let result = buildRules(config, params, edgejsCode, ossjsCode);
            expect(result).to.only.have.keys('RegionId', 'DomainName', 'Functions');
            expect(result.RegionId).to.be('cn-hangzhou');
            expect(result.DomainName).to.be('www.mocoktest.com');
            expect(JSON.parse(result.Functions)).to.be.an('array');
        })
    })
})