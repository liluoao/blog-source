---
title: 使用Intervention-Image
urlname: use-intervention-image
date: 2018-05-03 14:36:58
category: laravel
tags: laravel
---
[Intervention/image](https://github.com/Intervention/image) 是为 Laravel 定制的图片处理工具, 它提供了一套易于表达的方式来创建、编辑图片。

- Composer安装
```
composer require intervention/image
```
<!-- more -->
- 修改 `app/config/app.php` 添加 `ServiceProvider`:
```php
// 将下面代码添加到 providers 数组中
'providers' => [
    // ...
    Intervention\Image\ImageServiceProvider::class,
    // ...
],

// 将下面代码添加到 aliases 数组中
'aliases' => [
    // ...
    'Image' => Intervention\Image\Facades\Image::class,
    // ...
],
```

- 发布
会创建一个 `config/image.php`
```
php artisan vendor:publish
```

- 配置

此扩展包默认使用 PHP 的 GD 库来进行图像处理, 但由于 GD 库对图像的处理效率要稍逊色于 imagemagick 库, 因此这里推荐替换为 imagemagick 库来进行图像处理.

开始之前, 你得先确定本地已经安装好 GD 或 Imagick.

在使用 Intervention Image 的时候, 你只需要给 ImageManager 传一个数组参数就可以完成 GD 和 Imagick 库之间的互相切换. 

如下：
```php
// 通过指定 driver 来创建一个 image manager 实例
$manager = new ImageManager(array('driver' => 'imagick'));

// 最后创建 image 实例
$image = $manager->make('public/foo.jpg')->resize(300, 200);
```

- 除上文介绍的基本用法之外, 此扩展包还支持:
    图片上传功能;
    图片缓存功能;
    图片过滤功能: 将图片按照统一规则进行转换;
    图片动态处理: 根据访问图片的 URL 参数自动调整图片大小

更多内容请见：[官方文档](http://image.intervention.io/getting_started/installation)

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