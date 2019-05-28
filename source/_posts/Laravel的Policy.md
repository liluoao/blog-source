---
title: Laravel的策略
urlname: laravel-policy
date: 2018-05-24 11:25:43
category: laravel
tags: laravel
---
策略是在特定模型或者资源中组织授权逻辑的类，一个模型类对应一个策略类。

在 `AuthServiceProvider` 中：
```php
protected $policies = [
    'App\Model' => 'App\Policies\ModelPolicy',
];
```
#### 创建策略
在 `app/Policies` 中生成类：
```bash
php artisan make:policy PostPolicy
```
#### 注册策略
修改 `$policies` 属性：
```php
protected $policies = [
    Post::class => PostPolicy::class,
];
```
<!-- more -->
#### 编写策略
例子：
```php
<?php

namespace App\Policies;

use App\User;
use App\Post;

class PostPolicy
{
    /**
     * 判断该方法能否被用户操作。
     *
     * @param  \App\User  $user
     * @param  \App\Post  $post
     * @return bool
     */
    public function update(User $user, Post $post)
    {
        return $user->id === $post->user_id;
    }
}
```

#### 授权动作
1. 内置的User模型
```php
if ($user->can('update', $post)) {
    //
}
```
2. 通过中间件
```php
use App\Post;

Route::put('/post/{post}', function (Post $post) {
    // 当前用户可以进行更新操作
})->middleware('can:update,post');
```
3. 在控制器
```php
public function update(Request $request, Post $post)
{
    $this->authorize('update', $post);

    // 当前用户可以更新博客...
}
```
4. 在Blade
```php
@can('update', $post)
```