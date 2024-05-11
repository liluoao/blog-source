---
title: 用SFTP传个文件
urlname: use-sftp-send-file
date: 2020-10-25 16:47:45
category: Laravel
---

SFTP 全名SSH文件传输协议 Secret File Transfer Protocol，是一种数据流连线档案存取、传输和管理功能的网络传输协议

与 FTP相比，SFTP 使用了加密技术，保证了数据在传输过程中的安全性。同时，SFTP 也提供了丰富的文件操作功能，如文件上传、下载、删除等

因此，SFTP 被广泛应用于各种需要安全文件传输的场景，如远程服务器备份、数据同步等

![SFTP](https://i.imgtg.com/2022/08/23/K85bX.png)

<!-- more -->

使用 SFTP 进行文件传输前，需要进行登录操作。SFTP 登录过程包括以下步骤：

客户端向服务器发起连接请求，指定服务器的 IP 地址和 SFTP 端口号（默认为 22）

服务器收到连接请求后，会向客户端发送 SSH 协议的密钥，用于建立加密连接

客户端使用 SSH 协议对服务器进行身份验证，验证成功后，会创建一个安全的加密通道

在安全通道上，客户端使用 SFTP 协议进行文件传输

## PHP 使用 SFTP 发送文件

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

惊讶的是同一份代码在测试服务器上正常运行，在对方的服务器上 SCP 就报错

> ssh2_scp_send(): Failure creating remote file: (-28)

而用 IDE 自带的远程管理登录后，读写权限都是正常的

这神奇的 BUG 体质，又该请教大佬了，通过命令行测试：

```bash
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
