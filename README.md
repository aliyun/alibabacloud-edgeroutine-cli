# alibabacloud-edgeroutine-cli

The nodejs CLI tool of @alicloud/edgeroutine API.

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![codecov][cov-image]][cov-url]

[npm-image]: https://npm.alibaba-inc.com/badge/v/@alicloud/pop-core.svg?version=1.7.7
[npm-url]: https://npm.alibaba-inc.com/package/@ali/edgeroutine-cli/v/1.0.0
[travis-image]: https://img.shields.io/travis/aliyun/openapi-core-nodejs-sdk/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/aliyun/openapi-core-nodejs-sdk
[cov-image]: https://codecov.io/gh/aliyun/openapi-core-nodejs-sdk/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/aliyun/openapi-core-nodejs-sdk

## Installation

Install it and run your CLI commands.

```sh
$ npm install @alicloud/edgeroutine-cli -g
```

## Prerequisite

Node.js >= 8.x

### Notes

You must know your `AK`(`accessKeyId/accessKeySecret`), and the cloud product's `endpoint` and `apiVersion`.

For example, The CDN OpenAPI(https://help.aliyun.com/document_detail/120427.html), the API version is `2018-05-10`.

And the endpoint list can be found at [here](https://help.aliyun.com/document_detail/120427.html), the center endpoint is cdn.aliyuncs.com. Add http protocol `http` or `https`, should be `http://cdn.aliyuncs.com/`.


## Usage

The CLI style tools:

### 1. Prepare an empty directory.
```sh
$ mkdir yourProject & cd yourProject
```

### 2. Initialize and coding with edge.js as example codes.
```sh
$ edgeroutine-cli init
```

```js
/**
 * Add the necessary event listener
 * @param {Event} fetch event, {Function} async function
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})

/**
 * Make a response to client
 * @param {Request} request
 */
async function handleRequest(request) {
  return new Response('Hello World!', { status: 200 });
}
```

### 3. Config with your alicloud access, fill in the prompts here.
```sh
$ edgeroutine-cli config
```

### 4. Build code and you can test with gray env [42.123.119.50/42.123.119.51].
```sh
$ edgeroutine-cli build
```

### 5. Test your code now, you can also show your codes and related config.
```sh
$ curl -v 'https://yourdomain.com/yourpath/' -x 42.123.119.50:80
```

```sh
$ edgeroutine-cli build -s
```

### 6. Publish code only when you are ready online after detailed tests.
```sh
$ edgeroutine-cli publish
```

### 7. Test your code online and check your service ok.
```sh
$ curl -v 'https://yourdomain.com/yourpath/'
```

```sh
$ edgeroutine-cli publish -s
```

### 8. Launch interactive debugger shell/cli
```sh
$ edgeroutine-cli debugger
```

### 9. Webview code and You can open the local browser test page  127.0.0.1:5888/  
```sh
$ edgeroutine-cli webview
```

You can read the WEBVIEW.md file and understand the instructions.

### 10. How to debugger in shell/cli
```
$ help()
$ source("./edge.js")
$ get("http://yourdomain.com")
```

The cli will show your "console.log()" in debugger, enjoy your coding and debugging.

## License
The MIT License
