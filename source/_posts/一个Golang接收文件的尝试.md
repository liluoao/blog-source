---
title: 一个Golang接收文件的尝试
urlname: golang-receive-upload-file
date: 2020-10-23 16:47:45
category: 工具
tags: golang
---

Go（又称Golang）是 Google 开发的一种静态强类型、编译型、并发型，并具有垃圾回收功能的编程语言

罗伯特·格瑞史莫（Robert Griesemer），罗布·派克（Rob Pike）及肯·汤普逊（Ken Thompson）于 2007 年 9 月开始设计 Go，稍后 Ian Lance Taylor、Russ Cox 加入项目

Go 是基于 Inferno 操作系统所开发的，于 2009 年 11 月正式宣布推出，成为开源项目，并在 Linux 及 Mac OS X 平台上进行了实现，后来追加了 Windows 系统下的实现

在 2016 年，Go 被软件评价公司 TIOBE 选为“TIOBE 2016 年最佳语言”

![K8Bmt.jpg](https://i.imgtg.com/2022/08/23/K8Bmt.jpg)

<!-- more -->

由于公司已经有个 Golang 实现的 SFTP 下载文件的服务，所以在它的基础上增加了上传功能

```go
func (s *Server) Upload(w http.ResponseWriter, r *http.Request) {

}
```

它的核心是接收文件名参数，在本地打开并复制到对方服务器的指定位置

```go
srcFile, _ := os.Open(fileName)
io.Copy(dstFile, io.LimitReader(srcFile, 3e9))
```

这肯定实现不了我们的需求，要把文件内容给发过来，所以改成了 POST 表单的方式

```php
Storage::put($filename, $fileContent);
$response = (new Client())->post($this->apiUrlRoot.'/upload', [
    'headers'   => [
        'token'    => $this->token,
    ],
    'multipart' => [
        [
            'name'     => 'xxx',
            'contents' => stream_for(Storage::readStream($filename)),
            'filename' => $filename,
        ],
    ],
]);
Storage::delete($filename);
```

在 Golang 中接收有多种写法

```go
file, handler, err := r.FormFile("xxx")
//老
err := r.ParseMultipartForm(0)
fileHeader := r.MultipartForm.File["xxx"][0]
```

这时 Golang 返回了一个错误：**multipart: NextPart: EOF**

在搜索解决方案时，都说是请求头不对，不要加

但是这个请求头是 GuzzleHttp 自己生成的，我手动改写后又返回了其它错误，例如 **no multipart boundary param in Content-Type**

我想，这种不行就换种吧，直接整个 body 放文件流

```php
$response = (new Client())->post($this->apiUrlRoot.'/upload', [
    'headers'   => [
        'token'    => $this->token,
        'filename' => $filename,
    ],
    'body'      => Storage::readStream($filename),
]);
```

在 Golang 中把请求放入文件

```go
_, _ = io.Copy(dstFile, r.Body)
```

再经过一次次的测试后，目标文件总是空的，打印请求的内容也是

陷入沉思，到底是哪出了问题（滑稽，所以在两种方法间横跳

回到表单方法，发到本地测试的 PHP 服务上，打印 `$_FILES`，成功显示

然后在网上各种搜 Golang 上传文件的例子看，也没看出有啥区别，所以就请教了公司大佬

我们一起排查问题，定位到是 URL 的问题，[Go web server is automatically redirecting POST requests](https://stackoverflow.com/questions/36316429/go-web-server-is-automatically-redirecting-post-requests)

由于在拼接地址时，多了一个 `/`，客户端使用 `//upload` POST 请求，Golang 会响应 301 到 `/upload`，并转为 GET 请求，不会重新发送 Body
