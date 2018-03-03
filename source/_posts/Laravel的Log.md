---
title: Laravel的Log
date: 2018-05-07 16:13:07
category: laravel
tags: laravel
---
错误日志级别：_debug, info, notice, warning, error, critical, alert, emergency_
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