---
title: Laravel的任务调度
urlname: laravel-task-scheduling
date: 2018-05-10 09:37:40
category: laravel
tags: laravel
---

### 启动
文档推荐使用[Laravel Forge](https://forge.laravel.com/)管理 `cron` 项目。示例：
```
* * * * * php /path-to-your-project/artisan schedule:run >> /dev/null 2>&1
```

### 定义调度
在 `App\Console\Kernel` 中 `schedule()` 方法中定义所有调度任务。有如下几种可以调度：

1. **Closure**
```php
$schedule->call(function () {
    DB::table('should_delete')->delete();
})->daily();
```

<!-- more -->

2. **Artisan**
在上一篇《Laravel的Artisan》中创建好的Artisan命令，可以直接调度：
```php
//每天2:00修改已过期的预约的状态
$schedule->command('reserve-expired')->dailyAt('02:00');
```

3. **Job**
在上上一篇《Laravel的Queue》中创建好的Job队列任务，可以直接调度：
```php
$schedule->job(new ReceiveMoney)->everyFiveMinutes();
```

4. **Shell**
使用 `exec()` 方法直接执行命令：
```php
$schedule->exec('node /home/forge/script.js')->daily();
```

### 可用的时间限制

|方法|描述|
|-|
|->cron('* * * * * *');|在自定义的 Cron 时间表上执行该任务|
|->everyMinute();|每分钟执行一次任务|
|->everyFiveMinutes();|每五分钟执行一次任务|
|->everyTenMinutes();|每十分钟执行一次任务|
|->everyFifteenMinutes();|每十五分钟执行一次任务|
|->everyThirtyMinutes();|每半小时执行一次任务|
|->hourly();|每小时执行一次任务|
|->hourlyAt(17);|每小时的第 17 分钟执行一次任务|
|->daily();|每天午夜执行一次任务|
|->dailyAt('13:00');|每天的 13:00 执行一次任务|
|->twiceDaily(1, 13);|每天的 1:00 和 13:00 分别执行一次任务|
|->weekly();|每周执行一次任务|
|->monthly();|每月执行一次任务|
|->monthlyOn(4, '15:00');|在每个月的第四天的 15:00 执行一次任务|
|->quarterly();|每季度执行一次任务|
|->yearly();|每年执行一次任务|
|->timezone('America/New_York');|设置时区|