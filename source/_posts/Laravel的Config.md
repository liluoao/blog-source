---
title: Laravel的配置
urlname: laravel-config
date: 2018-05-06 16:08:10
category: laravel
tags: laravel
---
`$_ENV` 或` env() `可读取` .env `文件中的变量.

读取 config/app.php 中的数据:
```php
$value = config('app.timezone');
```

新增配置文件后，如 `config/wechat.php`，使用 `config('wechat.xxx')` 读取
<!-- more -->
如何合并、缓存所有配置文件？
```cmd
# 生成汇总文件 bootstrap/cache/config.php
php artisan config:cache

# 生成汇总文件 bootstrap/cache/route.php
php artisan route:cache
```

切记！除了` config `文件夹下的配置文件，永远不要在其它地方使用 `env()` 函数，因为一旦执行 `php artisan config:cache` 后，`env()` 所有读取都会返回 `NULL`，证据如下：

```php
namespace Illuminate\Foundation\Bootstrap;

class LoadEnvironmentVariables
{
    /**
     * Bootstrap the given application.
     *
     * @param  \Illuminate\Contracts\Foundation\Application  $app
     * @return void
     */
    public function bootstrap(Application $app)
    {
        if ($app->configurationIsCached()) {
            return;
        }

        ...
    }

    ...
}
```

几点注意：

- config 文件里严禁使用 Closure 闭包，因为 config:cache 时无法被正确序列化。

- routes 文件中尽量不使用闭包函数，统一使用控制器，因为缓存路由时 php artisan route:cache 无法缓存闭包函数。
