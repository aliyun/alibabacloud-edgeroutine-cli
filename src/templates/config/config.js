var config = {
    // @alicloud api version
    apiVersion: '2018-05-10',

    // CDN openAPI endpoint
    endpoint: 'https://cdn.aliyuncs.com', // 阿里云CDN

    // CDN domain
    domain: "", // CDN目标域名

    // Edge jsConfig，主配置（必须要有）
    jsConfig: {
        "path": "edge.js", // path: [edge.js/path]，js代码所在的文件，建议当前目录
        "pos": "head", // pos: [head/foot]，js代码在CDN业务前/后执行
        "jsmode": "redirect", // jsmode: [redirect/bypass]，拦截/旁路请求到js代码执行
        "jsttl": 1800 // jsttl: [>1800]，js代码的失效时间，默认1800秒，即30分钟后你的全局变量（建议仅做简单cache用）会被清空
    },

    // Edge jsSession，选配，有需求请联系 @墨飏 确认
    // jssession: [key1, key2, key3]，Geo等其它信息
    "jsSession": [
        "remote_addr",
        "ip_country_id",
        "ip_country",
        "ip_region_id",
        "ip_region",
        "ip_city_id",
        "ip_city",
        "ip_isp_id",
        "ip_isp"
    ],

    // alicloud config
    accessKeyID: "", // 阿里云账号的access id
    accessKeySecret: "", // 阿里云账号的access secret
};

module.exports = config;