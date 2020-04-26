var config = {
    // @alicloud api version
    apiVersion: '2018-05-10',

    // Aliyun CDN OpenAPI Endpoint
    endpoint: 'https://cdn.aliyuncs.com', 

    // Your CDN Domain
    domain: "",

    // Edge jsConfig Master Config (Required)
    jsConfig: {
        "path": "edge.js", // path: [edge.js/path]  edge.js will be delivered to all alibaba global edge nodes, you could replace it.
        "pos": "head", // pos: [head/foot] JavaScript code is executed before/after CDN business
        "jsmode": "redirect", // jsmode: [redirect/bypass]  redirect/bypass requests to javaScript code execution
        "jsttl": 1800 // jsttl: [>1800] JavaScript code timeout is default 1800 seconds, i.e.after 30 minutes your global variable will be emptied  (recommended for simple cache only) 
    },

    // Edge jsSession Optional 
    // If there is any other configuration, you can apply for work order
    // jssession: [key1, key2, key3]
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

    // Alicloud Config
    accessKeyID: "", //  Your aliyun account AccesskeyId
    accessKeySecret: "", // Your aliyun account AccessKeySecret

    // The build sucess current timestamp
    buildTime:null,
};

module.exports = config;