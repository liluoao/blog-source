---
title: Golang接收上传文件
urlname: golang-receive-upload-file
date: 2020-10-23 16:47:45
category: 杂谈
tags: golang
---

最近业务需要用 SFTP 发送文件到对接公司的服务器中，在实现时碰到了一些问题

<!-- more -->

## Golang 接收上传文件

一开始由于公司已经有个 Golang 实现的 SFTP 下载文件的服务，所以在它的基础上增加了上传功能

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

但是这个请求头是 Guzzlehttp 自己生成的，我手动改写后又返回了其它错误，例如 **no multipart boundary param in Content-Type**

我想，这种不行就换种吧，直接整个 body 放文件流

```php
$response = (new Client())->post($this->apiUrlRoot.'/upload', [
    'headers'   => [
        'token'    => $this->token,
        'filename' => $filename,
    ],
    'body'      => torage::readStream($filename),
]);
```

在 Golang 中把请求放入文件

```go
_, _ = io.Copy(dstFile, r.Body)
```

再经过一次次的测试后，目标文件总是空的，打印请求的内容也是

这让我陷入了思考，到底是哪出了问题（滑稽，所以在两种方法间横跳

回到表单方法，发到本地测试的 PHP 服务上，打印 $_FILES，成功显示

然后在网上各种搜 Golang 上传文件的例子看，也没看出有啥区别，所以就请教了公司大佬

我们一起排查问题，定位到是 URL 的问题，[Go web server is automatically redirecting POST requests
](https://stackoverflow.com/questions/36316429/go-web-server-is-automatically-redirecting-post-requests)

由于在拼接地址时，多了一个 `/`，客户端使用 `//upload` POST 请求，Golang 会响应 301 到 `/upload`，并转为 GET 请求，不会重新发送 Body
