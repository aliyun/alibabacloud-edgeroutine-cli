var config = {
    // @alicloud api version
    apiVersion: '2018-05-10',

    // Aliyun CDN OpenAPI Endpoint
    endpoint: 'https://cdn.aliyuncs.com', 

    // Your CDN Domain
    domain: "",

    // Edge jsConfig Master Config (must have)
    jsConfig: {
        "path": "edge.js", // path: [edge.js/path] Js code in the file, suggest the current directory
        "pos": "head", // pos: [head/foot] js code is executed before/after CDN service
        "jsmode": "redirect", // jsmode: [redirect/bypass]  redirect/bypass requests to js code execution
        "jsttl": 1800 // jsttl: [>1800] Js code expires in 1800 seconds by default, 30 minutes after your global variables (recommended for simple cache use only) are cleared
    },

    // Edge jsSession Optional 
    // If there is any other configuration, please pass the work order
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