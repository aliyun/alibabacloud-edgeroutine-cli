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


###  3. 导出

点击 **导出** 按钮，可将文件下载到本地。

### 注意！！！
如需选择下载位置或覆盖已有的**edge.js**文件，可将浏览器设置打开，否则将直接下载 **test.js** 测试代码

> 1）：打开浏览器设置；

> 2）：高级设置>下载内容>"下载前询问每个文件夹"


### 4. 调试

+  http/get/post 内置函数进行http请求触发，收到回复的响应数据
+  code代码、url地址、请求方式必须传的参数
+  本测试是JavaScript环境，您可以使用其他JavaScript的功能
+  支持get、post请求

#### GET请求
+  可添加header头
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

**Console的使用**
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
帮助文档暂时仅支持内部员工使用，外部文档正在更新中，敬请关注！




# EdgeRoutine-cli webview

  This web application is a debugging tool based on the EdgeRoutine cli tool developed for front-end and back-end testing.

## Supported Languages
+ Javascript

## Instructions 

  Run edgeroutine-cli webview command

### 1. Editing

	You can write code for debugging according to your needs and click **Export** to download it locally.

example:

```

addEventListener ('fetch', event => {
    event.respondWith (handleRequest (event.request));
});
async function handleRequest (request) {
    return new Response ('Hello World!', {status: 200});
}

```


### 2. Upload Files

Upload the local JS file, you can also choose to upload the edge.js file created by `edgeroutine-cli init`.


### 3. Export

Click the **Export** button to download the file to the local.

### Notes
If you need to select the download location or overwrite the existing **edge.js** file, you can open the browser settings.

> 1): Open the browser settings;

> 2): Advanced > Downloads > "Ask where to save each file before downloading"


### 4. Debug

+ http/get/post request and get response data
+ Code, url, Request method (required)
+ You can use other JavaScript functions
+ Support get/post requests

#### GET Request
+ Add Headers
+ Enter the test URL **Send** and get response

example:

```
addEventListener ('fetch', event => {
    event.respondWith (handleRequest (event.request));
});
async function handleRequest (request) {
    return new Response ('Hello World!', {status: 200});
}
```


#### POST Request
+ Add body

example:
```
addEventListener ('fetch', (event) => {
  event.respondWith (h (event));
});

async function h (event) {
  return event.request.body;
}

```

**Console**
+ According to Console API debugging
+ Run the following code to get an object

example:

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

+ Only supports GET requests
+ Enter the url to get the response data

example:

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

Only for internal employees.

We are always adding more functionality, so stay tuned!




