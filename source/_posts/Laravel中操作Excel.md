---
title: Laravel中操作Excel
urlname: use-laravel-excel
date: 2018-05-02 15:42:19
category: Laravel
tags: laravel
---

[Laravel Excel](https://laravel-excel.com/) 是建议在 Laravel 中使用的 Excel 处理包，它把原来 PHPOffice 的 **PHPExcel** 的强大功能在 Laravel 5.x 框架中再实现，还实现了 Laravel 的集合、模型、视图、配置等。

<!-- more -->

Composer 安装：

```
composer require maatwebsite/excel
```

修改 *app/config/app.php* ，添加 `ServiceProvider`：

```php
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

## Export 导出

```php
$model = AdminModel::query()->get();
$array = [
    ['data1','data2'],
    ['data3','data4']
];
Excel::create('test', function ($excel) use ($model) {
    $excel->sheet('sheet1', function ($sheet) use ($model) {
        $sheet->fromModel($model);//从 Model 导出
        $sheet->fromArray($array);//从数组导出
    });
})->export('xls');
```
