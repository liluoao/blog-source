---
title: Windows环境与Laravel11
date: 2024-06-03 14:16:55
urlname: windows-laravel-enviroment
category: 工具
---

> 上次使用 Windows 环境开发还是大学期间

常见的环境管理：

- WSL（Windows Subsystem for Linux）
- Windows 集成环境（例如 PHPStudy）
- Laragon
- 虚拟机+宝塔

<!-- more -->

## WSL

Windows Subsystem for Linux（简称WSL）是一个在 Windows 10/11 上能够运行原生 Linux 二进制可执行文件（ELF 格式）的兼容层，由微软与 Canonical 公司合作开发

它能使您能够直接在 Windows 上运行 Linux 文件系统以及 Linux 命令行工具和 GUI 应用程序，以及传统的 Windows 桌面和应用程序

> 2022年11月16日，WSL 1.0 正式版发布

### 优势

WSL 所需的资源（CPU、内存和存储）比完整的虚拟机要少。WSL 还允许您在运行 Windows 命令行、桌面和商店应用的同时运行 Linux 命令行工具和应用，并允许您在 Linux 中访问 Windows 文件

本地机器上的硬盘挂载点会自动创建，并可轻松访问 Windows 文件系统。

/mnt/<驱动器号>/

> cd /mnt/c 访问 c:\

### 生产环境区别

- WSL 有一个轻量级实用程序 VM，可以自动启动、停止和管理资源。
- 如果您没有打开 Windows 进程的文件句柄，WSL VM 将自动关闭。这意味着如果您将其用作 Web 服务器，请通过 SSH 进入它以运行您的服务器然后退出，VM 可能会关闭，因为它检测到用户已完成使用并将清理其资源。
- WSL 用户对其 Linux 实例具有完全访问权限。VM 的生命周期、已注册的 WSL 发行版等均可供用户访问，并可由用户修改。
- WSL 自动授予 Windows 文件访问权限。
- 默认情况下，Windows 路径会附加到您的路径中，与传统的 Linux 环境相比，这可能会导致某些 Linux 应用程序出现意外行为。
- WSL 可以从 Linux 运行 Windows 可执行文件，这也可能导致与传统 Linux VM 不同的环境。
- WSL 使用的 Linux 内核会自动更新。
- WSL 中的 GPU 访问通过一个`/dev/dxg`设备进行，该设备将 GPU 调用路由到 Windows GPU。此设置与传统的 Linux 设置不同。

> 与裸机 Linux 相比，还有其他较小的差异，并且随着内循环开发工作流程的优先考虑，预计未来会出现更多差异。

### WSL2

WSL 2 对底层架构进行了重大改造，并使用虚拟化技术和 Linux 内核来实现新功能

git clone、npm install、apt update、apt upgrade 等文件密集型操作都明显更快

实际速度提升将取决于您正在运行的应用程序以及它如何与文件系统交互。与 WSL 1 相比，WSL 2 的初始版本在解压压缩包时运行速度最高可提高 20 倍，在各种项目上使用 git clone、npm install 和 cmake 时运行速度最高可提高 2-5 倍。

![OJEQ6U.jpg](https://ooo.0x0.ooo/2024/06/03/OJEQ6U.jpg)

### 总结

Windows 主要就是扩展问题，加扩展简单的简单（提供 dll 的直接下载），难的非常难（需要 VS2022 编译）。另外如果在 Windows 开发 CGI 应用需要依赖一个额外的 web 服务器，比如 IIS、EasyWebSvr。如果只开发 cli 程序或者使用内置 Server 那其实比 *nix 要简单很多的，官网下载即用。

另外一个重要的问题就是很多框架、组件、扩展虽然写明支持各种 PHP 版本，但是它可能没有在 Win32 上面的 PHP 测试过，甚至根本没有提供兼容 API。可能存在路径问题（比如典型的根目录问题和反斜杠问题）。这些可能不是 PHP 本身的问题，是大家都倾向 *nix 生态而设计导致的。毕竟 PHP 是一个更适合服务端运行的语言，特意去考虑在 Windows 上运行的人并不多。

如果一定要在 Windows 上 Win32 PHP 下开发 CLI、Web 程序，我觉得最好的方式就是直接使用兼容 Win32 环境的框架。除此之外，如果你开发的代码最终只会在 Linux 运行，也许 remote 开发或者虚拟机是更好的方案（WSL 在实际使用过程中有不少坑，短时间可能发现不了）。

## PHPStudy

初学时市面上还有 WAMP/XAMPP 等等集成环境，现在好像就 PHPStudy 依然坚挺

但是打开后的界面和当年比还是变化挺大的

![OJE0bY.jpg](https://ooo.0x0.ooo/2024/06/03/OJE0bY.jpg)

由于 Laravel 10.x 要求至少使用 PHP 版本 8.1，所以我们选择应用商店里最高的版本 8.2.9

### 配置

#### PATH

Windows 环境很不同的一点就是可视化配置环境变量

> 记得以前 Win7 修改 PATH 全在一个输入框里，所有路径都丢进去，中间用分号分隔

Win11 分开展示 PATH 还是可读性高太多了

![OJEYAr.jpg](https://ooo.0x0.ooo/2024/06/03/OJEYAr.jpg)

#### track_errors

使用 `php -v` 命令测试，报错

```php
Deprecated: Directive 'track_errors' is deprecated in Unknown on line 0
```

原因是 `track_errors` 从 PHP 7.2 开始已被弃用，去配置文件停用

```ini
track_errors=Off
```

#### 扩展

与其他环境不同的是，下载好后它并没有设置扩展文件，需要去配置文件里添加

```ini
extension_dir=D:/phpstudy_pro/Extensions/php/php8.2.9nts/ext
extension=php_mbstring
extension=php_pdo_mysql
extension=php_fileinfo
extension=php_curl
extension=php_zip
extension=php_openssl.dll
```

如果在 PHPStudy 里勾选，不会添加 `extension_dir`

### 运行 Laravel

继续在 PHPStudy 里下载好 MySQL 8.0.12，服务器用自带的 Nginx 1.15.11

> MySQL 设置引擎为 InnoDB

下载 Composer，更新到最新版本，并设置好镜像

> Laravel 要求 Composer 2.2.0 或更高版本

```bash
composer self-update
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
```

使用 `create-project` 命令创建测试项目

```bash
composer create-project laravel/laravel lla-test
```

报错

```bash
Updating dependencies
Your requirements could not be resolved to an installable set of packages.
 Problem 1
    - laravel/framework[v11.0.0, ..., v11.8.0] require fruitcake/php-cors ^1.3 -> found fruitcake/php-cors[dev-feat-setOptions, dev-master, dev-main, dev-test-8.2, v0.1.0, v0.1.1, v0.1.2, v1.0-alpha1, ..., 1.2.x-dev (alias of dev-master)] but it does not match the constraint.
    - Root composer.json requires laravel/framework ^11.0 -> satisfiable by laravel/framework[v11.0.0, ..., v11.8.0].
```

很怪，依赖管理是官方写好的，不可能指定个错版本吧，说明是镜像有问题，先停用

```bash
composer config -g --unset repos.packagist
```

接下来就是随着命令一步步常规操作了

- 复制 env 文件，配置 MySQL 参数
- 创建随机 Key
- 运行迁移 migrate

## Laravel 11 API

打开项目，发现 `/routes` 下没有 `api.php`，需要使用命令或者手动添加

```bash
php artisan install:api
```

会在 `bootstrap/app.php` 里添加 API 路由，这里可以设置所有 API 的前缀，默认 `/api`

```php app.php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    );
```

### Sanctum

Laravel Sanctum 提供了一个轻量级的认证系统，可用于 SPA（单页应用程序）、移动应用程序和基于简单令牌的 API

Sanctum 允许的应用程序中的每个用户为他们的账户生成多个 API 令牌。这些令牌可以被授予权限 / 范围，以指定令牌允许执行哪些操作。

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

使用上述命令生成迁移文件并运行，就可以在现有模型上使用令牌了

```php
use Laravel\Sanctum\HasApiTokens;

class Admin extends Model
{
    use HasFactory, HasApiTokens;
}
```

在用户登录后发送 token 给前端

```php
$admin = Admin::query()
    ->where('account', $request->get('account'))
    ->first();
if ($admin->doesntExist()) {
    return $this->fail(402, '用户不存在');
}
if (!password_verify($request->get('password'), $admin->password)) {
    return $this->success(403, '密码错误');
}
$token = $admin->createToken('linglan');

return $this->success(200, [
    'token' => $token->plainTextToken,
]);
```

> variables_order=GPCS
