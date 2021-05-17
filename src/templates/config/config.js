var config = {
    // @alicloud api version
    apiVersion: '2018-05-10',

    // CDN OpenAPI Endpoint
    endpoint: 'https://cdn.aliyuncs.com',

    // Your CDN Domain
    domain: "",

    // Edge jsConfig Master Config (Required)
    jsConfig: {
        "path": "edge.js", // path: [edge.js/path]  Edge.js will be delivered to all alibaba global edge nodes, you could replace it.
        "pos": "head", // pos: [head/foot] JavaScript code is executed before/after CDN business
        "pri": "0",   // The priority of head execution/tail execution is independent of each other  [0 high - 999 low] (The type must be a String)
        "jsmode": "redirect", // jsmode: [redirect/bypass]  Redirect/bypass requests to JavaScript code execution
        "jsttl": 1800 // jsttl: [>1800] JavaScript code timeout is default 1800 seconds, i.e.after 30 minutes your global variable will be emptied  (recommended for simple cache only)
    },

    // Edge jsOptions Optional
    // If there is any other configuration, you can apply for work order
    // jsoptions: [key: value]
    "jsOptions": {
        "gzip_enable": "on", //Gzip compression on by default, automatically recognized when responding Accept-Encoding/Content-Encoding
        "upstream_read_timeout": "5000", // Read timeout between the CDN load and EdgeRoutine, 5 seconds by default
        "upstream_write_timeout": "5000",// Write timeout between the CDN load and EdgeRoutine, 5 seconds by default
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
    accessKeyID: "", //Your aliYun account AccesskeyId
    accessKeySecret: "", // Your aliYun account AccessKeySecret
    // The build sucess current timestamp
    buildTime: null,
};

module.exports = config;
