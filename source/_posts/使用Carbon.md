---
title: 使用Carbon
urlname: use-carbon
date: 2018-05-01 14:11:35
category: laravel
tags: laravel
---
**[Carbon](http://carbon.nesbot.com/)**  继承自 PHP DateTime 类的 API 扩展，它使得处理日期和时间更加简单。

[Github传送门](https://github.com/briannesbitt/carbon)

- Composer安装
```
composer require nesbot/carbon
```
PS：由于 Laravel 项目已默认安装了此包，所以不需要再次执行上面的命令。

## 示例
```php
//常规项目
use Carbon\Carbon;
//Laravel项目
use Illuminate\Support\Carbon;
```
后者除了继承于前者，还实现了 `JsonSerializable` interface 和 `Macroable` trait
<!-- more -->
#### 实例化
```php
Carbon::now();//同Laravel辅助函数now()
Carbon::today();//同Laravel辅助函数today()
Carbon::parse('2018-5-7 14:38:00');
Carbon::create(2018, 5, 1, 0, 0, 0);
Carbon::now()->year(2008)->month(5)->day(21)->hour(22)->minute(32)->second(5);
Carbon::now()->setDate(1975, 5, 21)->setTime(22, 32, 5);
```
更多方法见[Fluent Setters](http://carbon.nesbot.com/docs/#api-settersfluent)

#### 字符串输出
```php
$dt = Carbon::create(1975, 12, 25, 14, 15, 16);

echo $dt->toDateString();                          // 1975-12-25
echo $dt->toTimeString();                          // 14:15:16
echo $dt->toDateTimeString();                      // 1975-12-25 14:15:16
echo $dt->toDayDateTimeString();                   // Thu, Dec 25, 1975 2:15 PM
```
更多方法见[String Formatting](http://carbon.nesbot.com/docs/#api-formatting)

#### 比较
常用比较如 `eq` (equalTo) `ne` (notEqualTo) `gt` (greaterThan) `lt` (lessThan) `gte` (greaterThanOrEqualTo) `lte` (lessThanOrEqualTo)

这些比较使用的是 `==` ，在PHP7.1前忽略毫秒微秒的差别。

其它可用比较方法：
```php
//过去or未来
$dt->isFuture();
$dt->isPast();
//闰年
$dt->isLeapYear();
//季度
$dt->isCurrentQuarter();
//工作日or周末
$dt->isWeekday();
$dt->isWeekend();
//周几
$dt->isWednesday();
$dt->isDayOfWeek(Carbon::SATURDAY);
```
更多方法见[Comparison](http://carbon.nesbot.com/docs/#api-comparison)

#### 自增自减
可以对世纪、年、季度、月、周、时、分、秒进行 `add()` 加或 `sub()` 减
```php
//世纪
echo $dt->addCentury();
//文档里对加减复数使用复数方法，源码中单数方法也可以接收参数
echo $dt->addCenturies(5);
echo $dt->subCentury();
//工作日
echo $dt->addWeekday();
echo $dt->subWeekday();
```

#### 求差
有时我们会使一件事在一个周期里只允许一次，例如每年分一次红，这时我们可以判断 `当前日期` 和 `上次分红日期` 对于 `设置的分红日期` 是否在同一年
```php
//今天是第几年分红
$todayPassYearNum = $canDividendDate->diffInYears(today());
//上次分红是第几年
$dividendDatePassYearNum = $canDividendDate->diffInYears(Carbon::parse($lastDividendDate));
if ($todayPassYearNum === $dividendDatePassYearNum) {
    throw new Exception(2004, '本年已分过红');
}
```
同理也有 `diffInHours()` `diffInDays()` 等方法

#### 常量
源码中定义了许多常量
```php
var_dump(Carbon::SUNDAY);                          // int(0)
var_dump(Carbon::MONDAY);                          // int(1)
var_dump(Carbon::TUESDAY);                         // int(2)
var_dump(Carbon::WEDNESDAY);                       // int(3)
var_dump(Carbon::THURSDAY);                        // int(4)
var_dump(Carbon::FRIDAY);                          // int(5)
var_dump(Carbon::SATURDAY);                        // int(6)

var_dump(Carbon::YEARS_PER_CENTURY);               // int(100)
var_dump(Carbon::YEARS_PER_DECADE);                // int(10)
var_dump(Carbon::MONTHS_PER_YEAR);                 // int(12)
var_dump(Carbon::WEEKS_PER_YEAR);                  // int(52)
var_dump(Carbon::DAYS_PER_WEEK);                   // int(7)
var_dump(Carbon::HOURS_PER_DAY);                   // int(24)
var_dump(Carbon::MINUTES_PER_HOUR);                // int(60)
var_dump(Carbon::SECONDS_PER_MINUTE);              // int(60)
```