---
title: 自定义验证规则
urlname: laravel-custom-validation-rules
date: 2018-05-16 11:24:10
category: laravel
tags: laravel
---
## 创建规则
使用Artisan命令创建规则：
```bash
php artisan make:rule CheckPhoneNumber
```
规则放在 `app/Rules` 目录

规则对象包括 `passes()` 和 `message()` 方法 
`passes` 方法接收属性值和名称，并根据属性值是否符合规则而返回 `true` 或者 `false`：
```php
public function passes($attribute, $value)
{
    return preg_match('/^1[3456789]\d{9}$/',$value);
}

public function message()
{
    return '电话号码格式不正确';
}
```
<!-- more -->
## 创建表单请求
使用Artisan命令创建表单请求类：
```bash
php artisan make:request Auth\LoginRequest
```
请求类放在 `app/Http/Requests` 目录

## 在表单请求中使用规则
```php
public function rules() {
    
    return [
        //...
        'mobile' => [
            'required',
            new CheckPhoneNumber()
        ],
    ];

}
```

## 在控制器使用
在控制器方法中类型提示传入的请求
```php
/**
 * 登录
 *
 * @param LoginRequest $request
 */
public funtion login(LoginRequest $request) {
    //...
}
```

#### 关于可选字段
默认情况下，Laravel 在你应用的全局中间件堆栈中包含在 `App\Http\Kernel` 类中的 `TrimStrings` 和 `ConvertEmptyStringsToNull` 中间件。因此，如果你不希望验证程序将 `null` 值视为无效的，那就将「可选」的请求字段标记为 `nullable`。