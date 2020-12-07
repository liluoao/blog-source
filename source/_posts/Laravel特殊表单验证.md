---
title: Laravel特殊表单验证
urlname: special-form-validation-in-laravel
date: 2018-07-16 11:52:14
category: PHP框架
tags: laravel
---

<!-- more -->

## 表单验证

### 密码

```php
return [
    'old_password' => '',
    'password' => 'bail|required|string|between:8,20|confirmed|different:old_password',
    'password_confirmation' => 'bail|required|string|between:8,20',
];
```

- Confirmed
如果要验证的字段是 `password`，输入中必须存在匹配的 `password_confirmation` 字段
- Different
验证的字段值必须与参数字段的值不同
- Bail
第一次验证失败后停止运行验证规则。只是停止这个字段的验证，其它字段不影响

### 数组

当获取前端传递的数组内容时，一般有如下要求：

1. 数组不能为空
2. 里面的每一个元素是唯一的

所以可以用下面的验证方法：

```php
Validator::make($request->all(), [    
  "tags" => 'required|array',    
  "tags.*" => 'required|string|distinct|min:3',
]);
```

`tags` 数组里面每个元素都是字符串，而且是唯一的，每个元素最小长度为 3

### Authorize

检查经过身份验证的用户确定其是否具有更新给定资源的权限

如果 `authorize()` 方法返回 false，则会返回出一个 403 的 HTTP 响应

```php
public function authorize()
{
    return true;
}
```

### Unique

第一种写法：unique:（连接名）表名，表中对应字段，忽略值，表主键

1. 当字段名和表中字段相等时可省略
2. 忽略值一般用于修改判断时去掉自己
3. 表主键为 id 时可省略

```php
return [
    'name' => 'required|string|unique:mysql.sometable,name',
];
```

第二种写法：使用 `Illuminate\Validation\Rule::unique()` 静态方法

```php
$id = $this->get('id');

return [
    'id' => 'required|integer',
    'name' => [
        'required',
        'string',
        Rule::unique('mysql.sometable')->ignore($id, 'id')
    ],
];
```

还有其他查询条件时，可以链式使用 `where()` 等方法

```php
$stationId = $this->get('station_id');

return [
    'car_number' => [
        'required',
        'string',
        Rule::unique('queue')->where(function ($query) use ($stationId) {
            $query->where([
                ['station_id', $stationId],
                ['cancel_state', StateEnum::NOT_CANCEL]
            ])->whereDate('create_time', today()->toDateString());
        })
    ],
];
```

## 自定义验证规则

```bash
php artisan make:rule CheckPhoneNumber
```

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

创建表单请求类并使用新规则

```bash
php artisan make:request Auth\LoginRequest
```

```php
return [
    'mobile' => [
        'required',
        new CheckPhoneNumber()
    ],
];
```

## 国际化与本地化

**i18n**（其来源是英文单词 internationalization 的首末字符 i 和 n，18 为中间的字符数）是“国际化”的简称

在资讯领域，国际化(i18n)指让产品（出版物，软件，硬件等）无需做大的改变就能够适应不同的语言和地区的需要。对程序来说，在不修改内部代码的情况下，能根据不同语言及地区显示相应的界面

对应的有 **l10n**（localization 的缩写形式，意即在 l 和 n 之间有 10 个字母），指软件的“本地化”

`config/app.php` 中的区域（语言）设置：

```php
'locale' => 'zh-CN',
'fallback_locale' => 'en',
```

可以使用 `App Facade` 的 `setLocale()` 方法动态地更改当前语言：

```php
Route::get('welcome/{locale}', function ($locale) {
    App::setLocale($locale);
    //...
});
```

还有 `getLocale()` 及 `isLocale()` 方法确定当前的区域设置或者检查语言环境是否为给定值

例如Element文档：
- http://element-cn.eleme.io/#/zh-CN
- http://element-cn.eleme.io/#/en-US
- http://element-cn.eleme.io/#/es/

**zh** 为中文大类，其中还分为许多小类：
- zh-CN 简体中文，中华人民共和国
- zh-HK 繁体中文，香港特别行政区
- zh-MO 繁体中文，澳门特别行政区
- zh-SG 简体中文，新加坡
- zh-TW 繁体中文，中国台湾

`resources/lang/zh-CN/validation.php` 设置语言后会翻译表单验证的规则、标签等

在应用中还可以使用 `__()`、`trans()`、`trans_choice()` 辅助方法来翻译
