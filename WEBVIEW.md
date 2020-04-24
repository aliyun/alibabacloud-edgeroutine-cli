# EdgeRoutine-cli webview

本web应用是基于EdgeRoutine cli 工具开发的一款应用于前后端测试的调试工具。

**支持语言**
+ Javascript

## 使用说明

根据edgeroutine-cli webview命令行启动web调试器

###  1. 代码编辑

代码编辑部分会有默认初始测试代码，您可根据需求编写代码进行调试，
代码编辑后点击 **导出** 还可下载到本地。

初始代码示例：

```
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
async function handleRequest(request) {
    return new Response('Hello World!', {status: 200});
}
```


###  2. 上传文件

上传本地JS文件，您也可选择上传 `edgeroutine-cli init` 创建的edge.js文件


### 3. 导出

点击 **导出** 按钮，可将文件下载到本地。

### 注意！！！
如需选择下载位置或覆盖已有的**edge.js**文件，可将浏览器设置打开，否则将直接下载 **test.js** 测试代码

> 1）：打开浏览器设置；

> 2）：高级设置>下载内容>"下载前询问每个文件夹"


### 4. 调试

+  http/get/post 内置函数进行http请求触发，收到回复的响应数据
+  code代码、url地址、请求方式必须传的参数
+ 本测试是JavaScript环境，您可以使用其他JavaScript的功能
+  支持get、post请求

#### GET请求
+ 可添加header头
+  输入测试的URL地址**Send**获取详细测试信息
示例代码如下：
```
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
async function handleRequest(request) {
    return new Response('Hello World!', {status: 200});
}
```


#### POST请求
+ 可携带body信息进行测试

示例代码如下：
```
addEventListener('fetch', (event) => {
  event.respondWith(h(event));
});

async function h(event) {
  return event.request.body;
}
```

**Console 的使用**
+  可根据console API，可在代码进行调试
+  执行下面代码，即可获取一个对象

代码示例：

```
async function handleRequest(request) {
  let response = await fetch(request)
  return response
}
addEventListener('fetch', event => {
  console.log(event.request);
  event.respondWith(handleRequest(event.request))
})
```

### 3. 渲染

+  渲染页面的使用和 **调试** 类似，仅支持get请求；
+  渲染页面input框输入符合规则的url地址，点击 Go 即可获取响应数据进行渲染html

示例代码:

```
async function handleRequest(request) {
  let response = await fetch(request)
  return response
}
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
```

## 帮助
帮助文档部分暂时仅支持内部员工使用，外部文档正在更新中，敬请关注！

>>





# EdgeRoutine-cli webview

This web application is a debugging tool based on the EdgeRoutine cli tool developed for front-end and back-end testing.

## Supported languages
+ Javascript

## Instructions for use

Start the web debugger according to the edgeroutine-cli webview command line

### 1. Code editing

There will be default initial test code in the code editing section, you can write code for debugging according to your needs,
After editing the code, click **Export** to download it locally.

Sample initial code:

```

addEventListener ('fetch', event => {
    event.respondWith (handleRequest (event.request));
});
async function handleRequest (request) {
    return new Response ('Hello World!', {status: 200});
}

```


### 2. Upload files

Upload the local JS file, you can also choose to upload the edge.js file created by `edgeroutine-cli init`


### 3. Export

Click the **Export** button to download the file to the local.

### Attention! ! !
If you need to select the download location or overwrite the existing **edge.js** file, you can open the browser settings, otherwise you will directly download **test.js** test code

> 1): Open the browser settings;

> 2): Advanced settings> Download content> "Ask each folder before downloading"


### 4. Debug

+ http / get / post built-in function to trigger http request and receive response data
+ Code code, url address, parameters that must be passed in the request method
+ This test is a JavaScript environment, you can use other JavaScript functions
+ Support get and post requests

#### GET request
+ Header can be added
+ Enter the test URL **Send** for detailed test information
The sample code is as follows:

```
addEventListener ('fetch', event => {
    event.respondWith (handleRequest (event.request));
});
async function handleRequest (request) {
    return new Response ('Hello World!', {status: 200});
}
```


#### POST request
+ Can carry body information for testing

The sample code is as follows:
```
addEventListener ('fetch', (event) => {
  event.respondWith (h (event));
});

async function h (event) {
  return event.request.body;
}

```

**Use of console**
+ Can be debugged in code according to console API
+ Execute the following code to get an object

Code example:

```
async function handleRequest (request) {
  let response = await fetch (request)
  return response
}
addEventListener ('fetch', event => {
  console.log (event.request);
  event.respondWith (handleRequest (event.request))
})

```

### 3. Rendering

+ The use of rendering pages is similar to **Debug**, only get requests are supported;
+ Enter the URL address that meets the rules in the input box of the rendering page, click Go to get the response data to render html

Sample code:

```
async function handleRequest (request) {
  let response = await fetch (request)
  return response
}
addEventListener ('fetch', event => {
  event.respondWith (handleRequest (event.request))
})

```

## Help
The help documentation section is currently only supported by internal employees.

The external documentation is being updated, so stay tuned!
