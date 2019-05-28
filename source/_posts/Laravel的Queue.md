---
title: Laravel的队列
urlname: laravel-queue
date: 2018-05-08 09:08:48
category: laravel
tags: laravel
---

### 准备工作

首先打开 ` config/queue.php ` 。
```php
'default' => env('QUEUE_DRIVER', 'sync'),
'connections' => [
        'sync' => [
            'driver' => 'sync',
        ],
        'database' => [
            'driver' => 'database',
        ],
        //...
        'redis' => [
            'driver' => 'redis',
        ],
    ],
```


` default ` 是队列系统默认使用的驱动，在连接时可以使用 ` onConnection() ` 方法将任务推到指定连接。
` connections ` 可以配置各种驱动的设置，如**Redis**的数据库连接等。
` failed ` 配置队列中的任务执行失败时，保存失败任务的库与表。

<!-- more -->

这里我以 ` database ` 驱动为例。
首先执行artisan命令：
```
php artisan queue:table//生成jobs表
php artisan queue:failed-table//生成failed_jobs表
php artisan migrate
```

>这里有一点，Laravel生成的jobs表的migratio中，
`$table->unsignedTinyInteger('attempts');`，
`attempts` 字段是无符号 `tinyint` 类型的，我在一次任务重试次数过多时，会导致超出范围，个人修改成了 `int` 。 

### 创建任务
执行artisan命令：
```
php artisan make:job ReceiveMoney//你的任务的名字
```
同时会新建 `app/Jobs` 目录。
任务类的基本格式：
```php
class ReceiveMoney implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public function __construct{}
    public function handle{}
```
其中它引用了 `SerializesModels` trait，可以优雅地序列化Eloquent。`hanle` 是主方法，任务被处理时调用。

### 分发任务
在你的逻辑（控制器、或自定义的逻辑层等等）中，使用 `dispatch` 辅助函数分发它：
```php
\App\Jobs\ReceiveMoney::dispatch($updateArray, $type);
```

>需要延迟执行时可以链式调用 `delay()` 方法。当时使用时误解了文档中*唯一需要传递给 dispatch 的参数是这个任务类的实例*。

适当修改我们的 `ReceiveMoney` 任务类，让它接收传递进来的两个参数，并保存一条收支记录：
```php
protected $updateArray;
protected $type;
public function __construct($updateArray, $type) {
    $this->updateArray= $updateArray;
    $this->type= $type;
}
public function handle() {
    $this->saveReceiptRecord($this->updateArray, $this->type);
}
protected function saveReceiptRecord($updateArray, $type) {
    //do sth...
}
```

### 运行队列
运行artisan命令，这是一个常驻命令：
```
php artisan queue:work
```
或者运行一次：
```
php artisan queue:work --once
```
指定驱动：
```
php artisan queue:work redis
```

### 处理失败
所有失败任务会存到 `failed_jobs` 表中，可以用artisan命令表格信息展示：
```
php artisan queue:failed
```
重试单个ID或全部all：
```
php artisan queue:retry 1
php artisan queue:retry all
```
删除单个或全部
```
php artisan queue:forget 2
php artisan queue:flush
```