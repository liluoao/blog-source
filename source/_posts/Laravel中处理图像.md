---
title: Laravel中处理图像
urlname: use-intervention-image
date: 2018-05-03 14:36:58
category: PHP框架
tags: laravel
---

[Intervention/image](http://image.intervention.io/) 是一个图片处理工具，它提供了一套容易理解的方式来创建、编辑图片。它实现了 ServiceProvider、Facade 等来方便地在 Laravel 中使用。

<!-- more -->

Composer 安装

```
composer require intervention/image
```

修改 *app/config/app.php* ，添加 `ServiceProvider`：

```php
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

## 例子

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
