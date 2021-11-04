---
title: 用SFTP传个文件
urlname: use-sftp-send-file
date: 2020-10-25 16:47:45
category: 杂谈
tags: [php, laravel]
---

<!-- more -->

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

**ssh2_scp_send(): Failure creating remote file: (-28)**

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
