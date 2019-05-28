---
title: Laravel的日志
urlname: laravel-log
date: 2018-05-07 16:13:07
category: laravel
tags: laravel
---
Laravel 的日志系统基于 [Monolog](https://github.com/Seldaek/monolog) 库

错误日志级别（[RFC5424](https://tools.ietf.org/html/rfc5424)定义）：_debug, info, notice, warning, error, critical, alert, emergency_

Laravel的日志默认保存在 `storage/logs/laravel.log`
```php
use Illuminate\Support\Facades\Log;

Log::emergency($message, $contextualInfo);
Log::alert($message);
Log::critical($message);
Log::error($message);
Log::warning($message);
Log::notice($message);
Log::info($message);
Log::debug($message);

// 或者全局助手方法

// Log::info()
info('Some helpful information!');

// Log::debug()
logger('Debug message');

// Log::error()
logger()->error('You are not allowed here.');
```