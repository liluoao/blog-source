---
title: Golang接收上传文件
urlname: php-upload-file-to-go-server
date: 2020-10-23 16:47:45
category: 杂谈
tags: [php,golang,laravel]
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

## PHP 使用 SFTP 发送文件

虽然解决了这个问题，但是在考虑业务流程长度上，还是去掉了 Golang 服务这步，直接用 PHP 连接 SFTP 发文件

```php
$connection = ssh2_connect($this->host, $this->port);
ssh2_auth_password($connection, $this->user, $this->password);
Storage::put($filename, $csvFileContent);
$result = ssh2_scp_send(
    $connection,
    Storage::path($filename),
    $this->path.$filename,
    0644
);
ssh2_disconnect($connection);
Storage::delete($filename);
```

惊讶的是同一份代码在测试服务器上正常运行，在往对接公司的服务器上 SCP 就报错

**ssh2_scp_send(): Failure creating remote file: (-28)**

而用 IDE 自带的远程管理登录后，读写权限都是正常的

这神奇的 BUG 体质，又该请教大佬了，通过命令行测试：

```
scp -v -P whichPort localFile whoYouAre@address:remoteFile
...
exec request failed on channel 0
lost connection
```

改用 sftp 命令连接上再写文件是正常的，所以代码修改为

```php
$sftp = ssh2_sftp($connection);
$stream = @fopen("ssh2.sftp://$sftp$this->path/$filename", 'w+');
fwrite($stream, $fileContent);
fclose($stream);
```

## Laravel File Storage

Laravel 内置了 Flysystem 扩展包，能够使用简单的 API 来操作，未来需要更换驱动时也方便

> 在使用 SFTP 前需要下载依赖 league/flysystem-sftp ~1.0

在配置文件中增加此 “磁盘” 的配置：

```php config/filesystems.php
'disks' => [
    'remote' => [
        'driver'   => 'sftp',//Supported Drivers: "local", "ftp", "sftp", "s3"
        'host'     => env('REMOTE_HOST'),
        'port'     => env('REMOTE_PORT'),
        'username' => env('REMOTE_USER'),
        'password' => env('REMOTE_PASSWORD'),
        'root'     => env('REMOTE_PATH'),
    ],
],
```

使用门面来获取实例，以获取文件夹内所有文件名为例：

```php
$remoteDisk = Storage::disk('remote');
dd($remoteDisk->allFiles());
```

上面的业务逻辑通过简单的 2 个方法就能完成：

```php
Storage::disk('remote')->put($filename, self::TABLE_HEADER . PHP_EOL);

Storage::disk('remote')->append($filename, $content);
```
