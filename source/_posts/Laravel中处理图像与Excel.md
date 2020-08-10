---
title: Laravel中处理图像与Excel
urlname: image-and-excel-in-laravel
date: 2018-05-03 14:36:58
category: PHP框架
tags: laravel
photos: /images/laravel-top-package.png
---


## 图像处理

[Intervention/image](http://image.intervention.io/) 是一个图片处理工具，它提供了一套容易理解的方式来创建、编辑图片。它实现了 ServiceProvider、Facade 等来方便地在 Laravel 中使用。

<!-- more -->

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

#### 配置

先确定本地已经安装好 GD 或 Imagick

> 此扩展包默认使用 PHP 的 `GD` 库来进行图像处理，但由于 GD 库对图像的处理效率要稍逊色于 `imagemagick` 库，因此这里推荐替换为 imagemagick 库来进行图像处理

在使用 Intervention Image 的时候，你只需要给 ImageManager 传一个数组参数就可以完成 GD 和 Imagick 库之间的互相切换：

```php
// 通过指定 driver 来创建一个 image manager 实例
$manager = new ImageManager(['driver' => 'imagick']);
```

#### 例子

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

#### Import 导入

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

#### Export 导出

```php
$model = AdminModel::query()->get();
$array = [
    ['data1','data2'],
    ['data3','data4']
];
Excel::create('test', function ($excel) use ($model) {
    $excel->sheet('sheet1', function ($sheet) use ($model) {
        $sheet->fromModel($model);//从 Model 导出
        //$sheet->fromArray($array);//从数组导出
    });
})->export('xls');
```
