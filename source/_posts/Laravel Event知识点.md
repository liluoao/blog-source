---
title: Laravel Event知识点
urlname: laravel-event-observer-and-listener
date: 2020-09-24 14:10:02
category: Laravel
---

## Observer 观察者

观察者模式 Observer 是一种对象行为模式。它定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新

在观察者模式中，主体是通知的发布者，它发出通知时并不需要知道谁是它的观察者，可以有任意数目的观察者订阅并接收通知

<!-- more -->

对于需要降低模型间的耦合型，让关联记录的新增、其它服务的调用等拆分开，可以使用观察者模式

观察者模式实现了低耦合，非侵入式的通知与更新机制

![OJkLft.png](https://ooo.0x0.ooo/2024/05/13/OJkLft.png)

### 创建观察者

以员工与部门的管理为例，他们易包括很多关联数据的变更

```bash
php artisan make:observer StaffObserver --model=Staff
php artisan make:observer DepartmentObserver --model=Department
```

完善观察者的几个对应方法，例如请求钉钉、企业微信等第三方接口

```php
namespace App\Observers;

class StaffObserver
{
    public function created (Staff $staff)
    {
        //请求钉钉 API 创建对应账号
    }

    public function updated (Staff $staff)
    {
        //请求钉钉 API 修改账号信息
    }
    
    public function deleted (Staff $staff)
    {
        //请求钉钉 API 停用对应账号
    }
}
```

### 注册观察者

在 `AppServiceProvider` 中添加观察者的绑定

```php
public function boot ()
{
    Staff::observe(StaffObserver::class);
    Department::observe(DepartmentObserver::class);
    //..
}
```

现在涉及到 Staff 表与 Department 表的增删改就会自动触发对应方法

## Listener 监听者

而另一种解耦方式，是使用事件加监听者

监听者模式，也称为发布-订阅模式，是一种对象之间的行为模式，涉及一对多的依赖关系。在这个模式中，被观察者（Subject）在状态或内容发生变化时，会通知所有注册了的观察者（Observer），使它们能够自动更新自己的信息

每个观察者对象都可以监听一个或多个被观察者对象，当被观察者的状态发生变化时，所有注册的观察者都会收到通知

以一个添加员工事件为例，添加时同时需要为公司的几个平台也增加账户

### 创建 Event

```bash
php artisan make:event StaffCreatedEvent
```

### 创建监听器

```bash
php artisan make:listener CreateCrmStaff
php artisan make:listener CreateOaStaff
php artisan make:listener CreateBmsStaff
```

监听者的结构非常简单，主要完善好 `handle()` 方法

```php
namespace App\Listeners\Staff\StaffCreated;

use App\Events\Staff\StaffCreatedEvent;

class CreateOaStaff
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct ()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param StaffCreatedEvent $event
     * @return void
     */
    public function handle (StaffCreatedEvent $event)
    {
        //..
    }
}
```

### 建立对应关系

在事件服务提供者 `App\Providers\EventServiceProvider` 中通过增加映射关系将两者对应起来

```php
protected $listen = [
    \App\Events\Staff\StaffCreatedEvent::class         => [
        \App\Listeners\Staff\StaffCreated\CreateCrmStaff::class,
        \App\Listeners\Staff\StaffCreated\CreateOaStaff::class,
        \App\Listeners\Staff\StaffCreated\CreateBmsStaff::class,
    ],
]
```

### 触发事件

在新增时添加一个 `event()` 方法来触发：

```php
DB::transaction(function () use ($staff) {
    $staffModel = Staff::findOrNew($staff['id']);
    //...
    $staffModel->save();

    event(new StaffCreatedEvent($staffModel));
    return $staffModel;
});
```
