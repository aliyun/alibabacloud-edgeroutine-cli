'use strict';
const crypto = require('crypto');
const assert = require('assert');
let EdgeCDN = class {
    /**
     * Use RAM credentials to construct a temporary client
     * @param {string} config.accessKeyId
     * @param {string} config.accessKeySecret
     * @param {string} config.endpoint e.g. 'oss-cn-beijing.aliyuncs.com'
     */
    constructor(config) {
        assert(config, "must pass 'config'");
        assert(config.accessKeyId, "must pass 'config.accessKeyId");
        assert(config.accessKeySecret, "must pass 'config.accessKeySecret");
        assert(config.endpoint, "must pass 'config.endpoint");
        assert(config.domainName, "must pass 'config.domainName");
        this.accessKeyId = config.accessKeyId;
        this.accessKeySecret = config.accessKeySecret;
        this.endpoint = config.endpoint;
        this.domainName = config.domainName;
    }

    _encode(str) {
        var result = encodeURIComponent(str);
        return result.replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }

    _flatParams(params) {
        assert(params, 'must pass "params"');
        var target = {};
        var keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = params[key];
            if (Array.isArray(value)) {
                replaceRepeatList(target, key, value);
            } else {
                target[key] = value;
            }
        }
        return target;
    }

    _normalize(params) {
        var list = [];
        var flated = this._flatParams(params);
        var keys = Object.keys(flated).sort();
        for (let i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = flated[key];
            list.push([this._encode(key), this._encode(value)]); //push []
        }
        return list;
    }

    _canonicalize(normalized) {
        var fields = [];
        for (var i = 0; i < normalized.length; i++) {
            var [key, value] = normalized[i];
            fields.push(key + '=' + value);
        }
        return fields.join('&');
    }

    _buildParams() {
        var defaultParams = {
            Format: 'JSON',
            SignatureMethod: 'HMAC-SHA1',
            SignatureNonce: Date.now(),
            SignatureVersion: '1.0',
            Timestamp: new Date().toISOString(),
            AccessKeyId: this.accessKeyId,
            Version: '2018-05-10',
        };
        return defaultParams;
    }

    /**
     * @param {String} accessKeySecret
     * @param {String} canonicalString
     */
    _computeSignature(canonicalString, accessKeySecret) {
        const signature = crypto.createHmac('sha1', accessKeySecret);
        return signature.update(Buffer.from(canonicalString, 'utf8')).digest('base64');
    }

    /**
     * create request params
     * See `request`
     * @api private
     */
    _createRequest(action, parameters = {}, opts = {}) {
        // 1. compose parameters and opts
        opts = Object.assign({
            headers: {
                'x-sdk-client': 'aliyun-sdk-nodejs/6.5.0 edgecdn.js',
                'user-agent': 'aliyun-sdk-nodejs/6.5.0 edgecdn.js'
            }
        }, this.opts, opts);

        // format params
        var method = (opts.method || 'GET').toUpperCase();
        var defaults = this._buildParams();
        var params = Object.assign({
            Action: action
        }, defaults, parameters);
        // 2. caculate signature
        var normalized = this._normalize(params);
        var canonicalized = this._canonicalize(normalized);
        // 2.1 get string to sign
        var stringToSign = `${method}&${this._encode('/')}&${this._encode(canonicalized)}`;
        // 2.2 get signature
        var signature = this._computeSignature(stringToSign, this.accessKeySecret + '&');
        // add signature
        normalized.push(['Signature', this._encode(signature)]);
        // 3. generate final url
        const url = opts.method === 'POST' ? `${this.endpoint}/` : `${this.endpoint}/?${this._canonicalize(normalized)}`;
        return {
            url: `http://${url}`,
            headers: opts.headers,
        };
    }

    /**
     * DescribeCdnService
     */
    DescribeCdnService(opts) {
        return this._createRequest('DescribeCdnService', {
            'DomainName': this.domainName
        }, opts);
    }
}

module.exports = EdgeCDN;