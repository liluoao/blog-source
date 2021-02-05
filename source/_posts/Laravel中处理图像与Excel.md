---
title: Laravel中处理图像与Excel
urlname: image-and-excel-in-laravel
date: 2018-05-03 14:36:58
category: PHP框架
tags: laravel
---

![](https://cdn.jsdelivr.net/gh/liluoao/cdn@main/image/laravel-top-package.png)

今天介绍两个 Laravel5 中非常受欢迎的包和 Carbon

- Intervention Image
- Laravel Excel
- Carbon

<!-- more -->

## 图像处理

[Intervention/image](http://image.intervention.io/) 是一个图片处理工具，它提供了一套容易理解的方式来创建、编辑图片。它实现了 ServiceProvider、Facade 等来方便地在 Laravel 中使用。

Composer 安装

```bash
composer require intervention/image
```

添加 `ServiceProvider`：

```php config/app.php
'providers' => [
    // ...
    Intervention\Image\ImageServiceProvider::class,

],
'aliases' => [
    // ...
    'Image' => Intervention\Image\Facades\Image::class,
],
```

使用如下命令创建一个配置文件 *config/image.php*

```
php artisan vendor:publish
```

### 配置

先确定本地已经安装好 GD 或 Imagick

> 此扩展包默认使用 PHP 的 `GD` 库来进行图像处理，但由于 GD 库对图像的处理效率要稍逊色于 `imagemagick` 库，因此这里推荐替换为 imagemagick 库来进行图像处理

在使用 Intervention Image 的时候，你只需要给 ImageManager 传一个数组参数就可以完成 GD 和 Imagick 库之间的互相切换：

```php
$manager = new ImageManager(['driver' => 'imagick']);
```

### 例子

```php
use Intervention\Image\ImageManager;

$manager = new ImageManager();
//字体路径
$fontPath = storage_path('font/SourceHanSansCN-Normal.ttf');
//以一张背景图开始
$image = $manager->make('images/invitation-bg.png');
//插入图片
$image->insert('images/logo.png', 'top', 0, 20);
//插入文字
$image->text('欢迎光临', 200, 80, function ($font) use ($fontPath) {
    $font->file($fontPath);//字体
    $font->size(24);//大小
    $font->color('#61B8A8');//颜色
    $font->align('center');//水平对齐
    $font->valign('top');//垂直对齐
});
//保存为文件
$image->save('uploads/1.jpg');
```

除介绍的基本用法之外，此扩展包还支持：

- 上传功能
- 缓存功能
- 过滤功能: 将图片按照统一规则进行转换
- 动态处理: 根据访问图片的 URL 参数自动调整图片大小

## Excel 处理

[Laravel Excel](https://laravel-excel.com/) 是建议在 Laravel 中使用的 Excel 处理包，它把原来 PHPOffice 的 **PHPExcel** 的强大功能在 Laravel 5.x 框架中再实现，还实现了 Laravel 的集合、模型、视图、配置等。

Composer 安装：

```
composer require maatwebsite/excel
```

添加 `ServiceProvider`：

```php config/app.php
'providers' => [
    // ...
    Maatwebsite\Excel\ExcelServiceProvider::class,
],
'aliases' => [
    // ...
    'Excel' => Maatwebsite\Excel\Facades\Excel::class,
],
```

使用如下命令创建一个配置文件 *config/excel.php*

```
php artisan vendor:publish
```

### Import 导入

```php
use Maatwebsite\Excel\Facades\Excel;

Excel::load('file.xls', function($reader) {
    $results = $reader->get();
    $results = $reader->all();
});
```

这里对 `$reader` 使用 `get()` 或 `all()` 方法时会生成 Sheet 集合（单个工作簿），可以使用 `getTitle()`，`toArray()`，`toObject()` 等方法。

使用 `first()` 或通过 `each()` 或 `foreach()` 遍历时，会生成 Row 集合（一行数据），这时 `toArray()` 就是最终结果了。

工具默认会把第一行当作 title，最后数据从 A2 单元格开始。
第一行的大写字母会转成小写输出，汉字为空。

整个结果集是 *LaravelExcelReader* 对象。

### Export 导出

有模型和数组两种方式：

```php
$model = AdminModel::query()->get();
$array = [
    ['data1','data2'],
    ['data3','data4']
];

Excel::create('test', function ($excel) use ($model, $array) {
    $excel->sheet('sheet1', function ($sheet) use ($model, $array) {
        $sheet->fromModel($model);
        //or
        $sheet->fromArray($array);
    });
})->export('xls');
```

## Carbon便捷处理时间

[Carbon](http://carbon.nesbot.com/) 是一个 PHP 的时间处理包，它继承自 `DateTime` 类的 API 扩展，让处理日期和时间更加简单。

使用方式：

```
composer require nesbot/carbon
```

```php
use Carbon\Carbon;
//in laravel
use Illuminate\Support\Carbon;
```

后者除了继承于前者，还实现了 `JsonSerializable` interface 和 `Macroable` trait

### 实例化

```php
Carbon::now();//同Laravel辅助函数now()
Carbon::today();//同Laravel辅助函数today()
Carbon::parse('2018-5-7 14:38:00');
Carbon::create(2018, 5, 1, 0, 0, 0);
Carbon::now()->year(2008)->month(5)->day(21)->hour(22)->minute(32)->second(5);
Carbon::now()->setDate(1975, 5, 21)->setTime(22, 32, 5);
```

### 字符串输出

```php
$dt = Carbon::create(1975, 12, 25, 14, 15, 16);

echo $dt->toDateString();                          // 1975-12-25
echo $dt->toTimeString();                          // 14:15:16
echo $dt->toDateTimeString();                      // 1975-12-25 14:15:16
echo $dt->toDayDateTimeString();                   // Thu, Dec 25, 1975 2:15 PM
```

### 比较

常用比较如

- `eq` (equalTo)
- `ne` (notEqualTo)
- `gt` (greaterThan)
- `lt` (lessThan)
- `gte` (greaterThanOrEqualTo)
- `lte` (lessThanOrEqualTo)

这些比较使用的是 `==` ，在 PHP7.1 前忽略毫秒微秒的差别。

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

### 自增自减

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

### 求差

有时我们会使一件事在一个周期里只允许一次，例如发年终奖，这时我们可以判断 `今天` 和 `上次发年终奖` 对于 `发年终奖日期` 是否在同一年

```php
//今天是第几年发奖
$todayPassYearNum = $canDividendDate->diffInYears(today());
//上次发奖是第几年
$dividendDatePassYearNum = $canDividendDate->diffInYears(Carbon::parse($lastDividendDate));
if ($todayPassYearNum === $dividendDatePassYearNum) {
    throw new Exception(600, '本年已发过奖');
}
```

同理也有 `diffInHours()` `diffInDays()` 等方法

### 常量

Carbon 提供了许多方便的常量，例如：

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
