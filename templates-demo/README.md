#  Edgeroutine-cli Demo

## 示例说明
### 事件说明
> Edgeroutine的客户需要调用addEventListener函数去注册一个事件回调，目前支持fetch事件；
  在fetch事件回调函数中，客户必须使用event.respondWith去注册一个异步函数，
  该异步函数将返回一个Promise对象，Promise在JavaScript中是ES6异步的核心，
  可以理解为，在将来这个对象会被解析成真正的响应内容返回给CDN甚至客户。
  几乎所有的程序的addEventListener都是如此调用。

**功能特点**

+ 支持Web标准API - Service Worker API
+ 提供完整JavaScript环境，支持ES6语法
+ 且大量的Node.js第三方库直接使用，也支持标准的JS开发模型

我们提供 edge.ialicdn.com 域名用来测试已默认配置的的 JavaScript Demo。

示例代码使用js构建不同代码片段用于解决各种常见场景，目前是15+场景。

为区分不同场景的示例，须在请求的body中携带json格式的kv对来将请求路由到不同的函数。

## Templates 

### Hello World
+  URL：http://edge.ialicdn.com/a/b?x=y
+  Method: POST
+  Body：'{"name": "helloworld"}'  

示例代码
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleHelloWorld(event));
});
async function _handleHelloWorld(event) {
    return new Response("Hello World!");
}
```
### GEO
+ URL：http://edge.ialicdn.com/a/b?x=y
+ Method: POST
+ Headers
+ **User-Agent**: Mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/81.0.4044.138 safari/537.36
+ Body：'{"name": "geo"}' 

示例代码
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleGeo(event));
});

async function _handleGeo(event) {
    const info = event.info;
    let remote_addr = info.remote_addr;
    let ip_isp_en = info.ip_isp_en;
    let ip_city_en = info.ip_city_en;
    let ip_region_en = info.ip_region_en;
    let ip_country_en = info.ip_country_en;
    let scheme = info.scheme;
    let detector_device = info.detector_device;
    let content = `Geo: ${remote_addr}, \
                      ${ip_isp_en},   \
                      ${ip_country_en},   \
                      ${ip_city_en},  \
                      ${ip_region_en},\
                      ${scheme},      \
                      ${detector_device}`;
    return new Response(content);
}
```

### Fetch
+  URL：http://edge.ialicdn.com/a/b?x=y
+  Method: POST
+  Body：'{"name": "fetch", "url": "http://a.hongxiaolong.com/xx"}'

示例代码
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleFetch(event));
});
async function _handleFetch(json) {
    let fetchURL = json.url;
    if (fetchURL) {
        return await fetch(fetchURL);
    }
    return fetch("http://default.ialicdn.com");
}
```

## Request
- URL：[http://edge.ialicdn.com/a/b?x=y](http://edge.ialicdn.com/a/b?x=y)
- Method: POST
- Headers
  - **aa**:bb
- Body：作为异步函数参数 json对象
  - {"name":"request", "headers":{"aa":"bb"}, "body":"Hello ER!"}

示例代码：
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleRequest(event));
});

async function _handleRequest(event,json) {
    let headers = json.headers;
    let body = json.body;
    const fetchInit = {
        body : body,
        headers: headers
    };
    return fetch("http://default.ialicdn.com", fetchInit);
}
```

## Response
- URL：[http://edge.ialicdn.com/?xx=yy](http://edge.ialicdn.com/?xx=yy)
- Method: POST
- Body：作为异步函数参数 json对象
  - '{"name":"response", "headers":{"ra":"rb"}}'

示例代码：
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleResponse(event));
});

async function _handleResponse(json) {
    let resp = await fetch("http://default.ialicdn.com");
    let headers = json.headers;
    for (var k in headers) {
        resp.headers.set(k, headers[k]);
    }
    return resp;
}
```

## AB test
- URL：[http://edge.ialicdn.com/?x=y](http://edge.ialicdn.com/?x=y)
- Method: POST
- Headers:
  - **user-agent**: a/canary-client/b
- Body：作为异步函数参数 json对象
  - '{"name":"ab-test"}'

示例代码：
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleABTest(event));
});
function _shouldDoABTest(request) {
    // (1) if request's user agent match a certain string
    {
        const ua = request.headers.get("user-agent");
        if (ua && ua.match(/canary-client/)) {
            return true;
        }
    }
    // (2) whether we have special header
    {
        return request.headers.has("x-ab-test");
    }
}
async function _handleABTest(event, json) {
    const fetchInit = {
        method : event.request.method,
        headers: event.request.headers,
        body : "empty"
    };
    if (_shouldDoABTest(event.request)) {
        return fetch("http://default.ialicdn.com/dev", fetchInit);
    } else {
        return fetch("http://default.ialicdn.com", fetchInit);
    }
}
```

## Multi origin
- URL：[http://edge.ialicdn.com/?x=y](http://edge.ialicdn.com/?x=y)
- Method: POST
- Body：'{"name":"multi-origin"}'

示例代码：
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleMultipleOriginConcate(event));
});

async function _handleMultipleOriginConcate(event, json) {
    const respInit = {
        headers: event.request.headers,
        body : json.body
    };
    // (1) We try to concate www.baidu.com and www.tmall.com together
    let {readable, writable} = new TransformStream();
    async function controller() {
        let r1 = await fetch("http://www.baidu.com");
        let r2 = await fetch("https://www.tmall.com");
        await r1.body.pipeTo(writable, {preventClose: true});
        await r2.body.pipeTo(writable);
    }
    controller();
    return new Response(readable, respInit);
}
```

## Precache/Prefetch
- URL：[http://edge.ialicdn.com/](http://edge.ialicdn.com/)
- Method: POST
- Body：作为异步函数参数 json对象
  - '{"name": "prefetch", "prefetch": ["http://a.hongxiaolong.com/prefetch", "http://b.hongxiaolong.com/prefetch"]}'

示例代码：
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handlePrefetch(event));
});
async function _fetchAndIgnore(url) {
    try {
        // Specify cdnProxy flag to make sure the request goes through the CDN
        let resp = await fetch(url);//, {cdnProxy: true});
        // Make sure to ignore the content otherwise the cache may not be valid
        await resp.ignore();
    } catch (e) {
        console.error("invalid URL: %s", url);
    }
}
async function _doPrefetchURLAsync(prefetchURL, event) {
    for (const url of prefetchURL) {
        event.waitUntil(_fetchAndIgnore(url));
    }
}
async function _handlePrefetch(event, json) {
    {
        const prefetchURL = json.prefetch;
        if (prefetchURL) {
            // Do not await it and let it run in background
            _doPrefetchURLAsync(prefetchURL, event);
            return new Response("Done Prefetch");
        }
    }
    return new Response("Miss Prefetch");
}
```

## Race
- URL：[http://edge.ialicdn.com/?x=y](http://edge.ialicdn.com/?x=y)
- Method: POST
- Body：作为异步函数参数 json对象
  - '{"name":"race", "fetchList" : [ "https://www.taobao.com", "https://www.tmall.com", "https://www.baidu.com" ]}'

示例代码：
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleRace(event));
});

async function _handleRace(event, json) {
    let fetchList = json.fetchList;
    if (fetchList) {
        return Promise.race(fetchList.map((x) => fetch(x)));
    } else {
        return "forget to include fetchList field in your JSON";
    }
}
```

## ESI 

- URL：[http://edge.ialicdn.com/](http://edge.ialicdn.com/?x=y)
- Method: POST
- Body：作为异步函数参数 json对象
  - '{"name":"esi","esi" : "<esi:include src=@http://www.baidu.com@> This is after the ESI for www.baidu.com"}'

示例代码：
```javascript
addEventListener("fetch", function (event) {
    event.respondWith(_handleESI(event));
});
async function subRequests(target) {
    const init = {method: 'GET'};
    let response = await fetch(target, init);
    let text = await response.text();
    return text;
}
async function handleTemplate(encoder, templateKey) {
    const linkRegex = new RegExp("esi:include.*src=@(.*)@.*", 'gm');
    let result = linkRegex.exec(templateKey);
    let esi = "unknown";
    if (!result) {
        return encoder.encode(`<${templateKey}>`);
    }
    if (result[1]) {
        esi = await subRequests(result[1]);
    }
    return encoder.encode(`${esi}`);
}
async function translate(chunks) {
    const decoder = new TextDecoder();
    let templateKey = chunks.reduce(
        (accumulator, chunk) =>
            accumulator + decoder.decode(chunk, {stream: true}), "");
    templateKey += decoder.decode();
    return handleTemplate(new TextEncoder(), templateKey);
}
async function streamTransformBody(readable, writable) {
    const startTag = "<".charCodeAt(0);
    const endTag = ">".charCodeAt(0);
    let reader = readable.getReader();
    let writer = writable.getWriter();
    let templateChunks = null;
    while (true) {
        let {done, value} = await reader.read();
        if (done) break;
        while (value.byteLength > 0) {
            if (templateChunks) {
                let end = value.indexOf(endTag);
                if (end === -1) {
                    templateChunks.push(value);
                    break;
                } else {
                    templateChunks.push(value.subarray(0, end));
                    await writer.write(await translate(templateChunks));
                    templateChunks = null;
                    value = value.subarray(end + 1);
                }
            }
            let start = value.indexOf(startTag);
            if (start === -1) {
                await writer.write(value);
                break;
            } else {
                await writer.write(value.subarray(0, start));
                value = value.subarray(start + 1);
                templateChunks = [];
            }
        }
    }
    await writer.close();
}

async function _handleESI(json) {
    let {readable, writable} = new TransformStream();
    let newResponse = new Response(readable);
    if (!json.esi) {
        return "forget to include template field in your JSON";
    }
    streamTransformBody(new BufferStream(json.esi), writable);
    return newResponse;
}

```

## Log
- URL：[http://edge.ialicdn.com/](http://edge.ialicdn.com/?x=y)
- Method: POST
- Body： '{"name":"log"}'

示例代码：
```javascript
addEventListener("fetch", function (event) {
    event.respondWith(_handleEdgeLog(event));
});

async function _doEdgeLog(data, writer) {
    let resp = await fetch("http://default.ialicdn.com/log",
        {
            method: "POST",
            body: data,
            headers: [["content-type", "application/json"]]
        });
    console.log("logged");
    {
        let stream = new BufferStream("++++++++++++++++++++++++++++++\n");
        await stream.pipeTo(writer, {preventClose: true});
    }
    await resp.body.pipeTo(writer);
}

async function _handleEdgeLog(event, json) {
    let start = Date.now();
    let resp = await fetch("http://default.ialicdn.com", {
        method: event.request.method,
        headers: event.request.headers,
        body: json.body
    });
    // Get a promise that is fired when we send out everything
    let {readable, writable} = new TransformStream();
    // (1) first let the fetch request's response goes back and then we post
    //     the log back as well internally
    let endPromise = resp.body.pipeTo(writable, {preventClose: true});
    // (2) wait for endPromise to be fired to make sure that the body has been
    //     piped back to the client, and then we do the log
    event.waitUntil(endPromise.then(
        (v) => {
            let end = Date.now();
            let diff = (end - start);
            try {
                // You have to await your async promise since wait until is not
                // usable currently maybe. User can use wait until only before
                // returning the main request for now
                event.waitUntil(_doEdgeLog(`{ "cost(millisecond)" : ${diff} }`, writable));
            } catch (e) {
                console.error(`${e}`);
            }
        },
        (v) => {
            writable.abort();
            console.error("failed");
        }));
    console.error("XXXX");
    // return the response back
    return new Response(readable, {
        status: resp.status,
        headers: resp.headers
    });
}
```
## 3xx

- URL：[http://edge.ialicdn.com/](http://edge.ialicdn.com/?x=y)
- Method: POST
- Body： '{"name":"3xx"}'

示例代码：
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleRedirect3XX(event));
});

async function _handleRedirect3XX(event, json) {
    return fetch("http://www.taobao.com", {redirect: "follow"});
}
```

## Redirect
- URL：[http://edge.ialicdn.com/a/b?x=y](http://edge.ialicdn.com/a/b?x=y)
- Method: POST
- Body:  '{"name": "redirect"}'

示例代码：
```javascript
addEventListener("fetch", function (event) {
    event.respondWith(_handleRedirectGeneral(event));
});

async function _handleRedirectGeneral(event, json) {
    const fetchInit = {
        method: event.request.method,
        body: json.body,
        headers: event.request.headers
    };
    {
        const ua = event.request.headers.get("user-agent");
        if (ua && ua.match(/firefox/i)) {
            return fetch("http://default.ialicdn.com/firefox", fetchInit);
        }
        if (ua && ua.match(/safari/i)) {
            return fetch("http://default.ialicdn.com/safari", fetchInit);
        }
    }
    {
        if (event.info.detect_device && event.info.detect_device.match(/iphone/)) {
            return fetch("http://default.ialicdn.com/iphone", fetchInit);
        }
    }
    return new Response("unknown request", {status: 403});
}
```

## Deny bot
- URL：[http://edge.ialicdn.com](http://edge.ialicdn.com/a/b?x=y)
- Method: POST
- Headers:
  - **user-agent**: xxxspider
- Body: '{"name":"deny-bot"}' 

示例代码：
```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleDenyBot(event));
});

async function _handleDenyBot(event, json) {
    {
        const ua = event.request.headers.get("user-agent");
        if (ua && ua.match(new RegExp("xxxspider", "i"))) {
            return new Response("Forbidden", {status: 403});
        }
    }
    return fetch("http://default.ialicdn.com");
}
```

## WAF
- URL：[http://edge.ialicdn.com](http://edge.ialicdn.com/a/b?x=y)
- Method: POST
- Body:  '{"name":"waf", "city":"Hangzhou"}' 

示例代码：

```javascript
addEventListener("fetch", function(event) {
    event.respondWith(_handleWAF(event));
});

async function _handleWAF(event, json) {
    let city = json.city;
    if (event.info.ip_city_en === city) {
        return new Response("Forbidden", {status: 403});
    }
    // back to origin
    return (JSON.stringify(event.info));
}
```
