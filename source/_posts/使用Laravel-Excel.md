---
title: 使用Laravel-Excel
date: 2018-05-05 15:42:19
category: laravel
tags: laravel
---
**[Laravel Excel](https://laravel-excel.maatwebsite.nl/)**  brings the power of PHPOffice's PHPExcel to Laravel 5 with a touch of the Laravel Magic. It includes features like: importing Excel and CSV to collections, exporting models, array's and views to Excel, importing batches of files and importing a file by a config file.

[Github传送门](https://github.com/Maatwebsite/Laravel-Excel)

- Composer安装
```
composer require maatwebsite/excel
```
<!-- more -->
- 修改 `app/config/app.php` 添加 `ServiceProvider`:
```php
// 将下面代码添加到 providers 数组中
'providers' => [
    // ...
    Maatwebsite\Excel\ExcelServiceProvider::class,
    // ...
],

// 将下面代码添加到 aliases 数组中
'aliases' => [
    // ...
    'Excel' => Maatwebsite\Excel\Facades\Excel::class,
    // ...
],
```

- 发布
会创建一个 `config/excel.php`
```
php artisan vendor:publish
```

## Import
```php
use Maatwebsite\Excel\Facades\Excel;
Excel::load('file.xls', function($reader) {
    // Getting all results
    $results = $reader->get();
    // ->all() is a wrapper for ->get() and will work the same
    $results = $reader->all();
});
```
这里对` $reader `使用` get() `或` all() `方法时会生成**Sheet**集合，可以使用` getTitle() `,` toArray() `,` toObject `等方法。
使用` first() `或通过` each() `或` foreach `遍历时，会生成**Row**集合，这时` toArray() `就是最终结果了。

工具默认会把第一行当作title，最后数据从A2单元格开始。
第一行的大写字母会转成小写输出，汉字为空。

整个结果集是**LaravelExcelReader**对象。

## Export
```php
$model = AdminModel::query()->get();
$array = [
    ['data1','data2'],
    ['data3','data4']
];
Excel::create('test',function ($excel)use($model){
    $excel->sheet('sheet1',function ($sheet)use($model){
        $sheet->fromModel($model);
        //$sheet->fromArray($array);
    });
})->export('xls');
```
有从数组导出和从Model导出两种方法