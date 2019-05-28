---
title: Laravel的命令行
urlname: laravel-artisan
date: 2018-05-09 09:17:13
category: laravel
tags: laravel
---

### 生成命令
在 `app/Console/Commands` 中新建一个命令：
```
php artisan make:command ReserveExpired//你的命令名
```

### 命令结构
<!-- more -->
```php
<?php
/**
 * 修改已过期的预约的状态
 */
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Reserve;

class ReserveExpired extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reserve-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'change expired reserve state';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $reserve = new Reserve();
        $reserve->updateStateWhenExpired();
    }
}
```
`signature` 属性是在使用时期望输入的命令，`description` 是命令的描述，`handle()` 是命令执行时调用的方法。

### 注册命令
在 `app/Console/Kernel` 中的 `commands` 属性中定义了手动加载的命令：
```php
protected $commands = [
    Commands\ReserveExpired::class,//修改已过期的预约的状态
    Commands\TestCommand::class//test
];
```
在下面的 `commands()` 方法中定义了自动加载命令的文件：
```php
protected function commands()
{
    require base_path('routes/console.php');
}
```
在这个 `routes/console.php` 中命令是以闭包形式执行的，并使用了**Artisan** Facade：
```php
Artisan::command('reserve-expired', function ($project) {
    $this->info("Success");
});
```

### 交互式输入

1. 获取输入
```php
$name = $this->ask('What is your name?');
$password = $this->secret('What is the password?');
```

2. 请求确认
```php
if ($this->confirm('Do you wish to continue?')) {
    //
}
```

3. 改变颜色
```php
$this->info('Success');
$this->error('Fail');
$this->line('Hello world');
```

### 定义输入期望
在 `signature` 属性中定义期望用户输入的内容

- 花括号 `{}` 为必须
- 加问号 `{?}` 为可选
- 加等号 `{=xx}` 为带默认值的可选

```php
protected $signature = 'wechat-menu {type?} {officialType?}';
```

当输入不符合时，直接返回提示信息：
```php
$usageString
    = <<<USAGE
Usage: wechat-menu [options] [officialType]

       options         args: create/get
       officialType    args: one/two/three
USAGE;
$this->info($usageString);
```