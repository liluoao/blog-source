---
title: Laravel的表单验证
urlname: laravel-form-validation
date: 2018-05-15 14:48:33
category: laravel
tags: laravel
---

#### 修改密码
![](/images/form-request1.png)
- Confirmed
如果要验证的字段是 `password`，输入中必须存在匹配的 `password_confirmation` 字段。
- Different
验证的字段值必须与参数字段的值不同。
```php
public function rules() {

    return [
        //...
        'password' => 'bail|required|string|between:8,20|confirmed|different:old_password',
        'password_confirmation' => 'bail|required|string|between:8,20'
        //...
    ];

}
```
<!-- more -->

#### 验证数组
通常我们的 `tags` 前端通常会写成这个样子：
```html
<input name='tags[]' >
```
然后在后端可以通过多对多的关联来实现这个添加标签的功能，但是其实我们仔细地想：我们添加标签的时候希望达到什么样的效果呢？我觉得有下面两个最简单的：

1. 这个标签的 `tags[]` 是不能为空的。
2. 一旦 `tags[]` 不为空，里面的每一个元素（标签）应该是唯一的。

所以在验证的时候，我们可以这样：
```php
Validator::make($request->all(), [    
  "tags" => 'required|array',    
  "tags.*" => 'required|string|distinct|min:3',
]);
```
这里需要解释一下，第一条 
```php
"tags" => 'required|array', 
```
是表明这是一个不能为空的数组，然后第二条 
```php
"tags.*" => 'required|string|distinct|min:3', 
```
就是说：`tags` 数组里面每个元素我希望是 `string` ，而且是唯一的 (distinct),每个元素最小的长度为 3。

#### Bail
第一次验证失败后停止运行验证规则。
只是停止这个字段的验证，其它字段不影响。
#### messages()和attributes()
`messages()` 和 `attributes()` 继承于`Illuminate\Foundation\Http\FormRequest`，可以重写验证字段的含义和提示信息。
```php
public function messages() {
    return [
        'password.confirmed' => '两次输入的密码不一致！',
        'password.different' => '新密码与旧密码不能一致！'
    ];
}
```

#### authorize()
检查经过身份验证的用户确定其是否具有更新给定资源的权限。
如果 `authorize()` 方法返回 `false`，则会自动返回一个包含 `403` 状态码的 HTTP 响应，也不会运行控制器的方法。
```php
public function authorize() {
    return true;
}
```

#### Unique
第一种写法：unique:（连接名）表名，表中对应字段，忽略值，表主键

1. 当字段名和表中字段相等时可省略
2. 忽略值一般用于修改判断时去掉自己
3. 表主键为id时可省略

```php
public function rules() {
    return [
        'name' => 'required|string|unique:mysql.sometable,name',
        //...
    ];
}
```
第二种写法：使用`Illuminate\Validation\Rule`中的`unique()`静态方法
```php
public function rules() {
    $id = $this->get('id');

    return [
        'id' => 'required|integer',
        'name' => [
            'required',
            'string',
            Rule::unique('mysql.sometable')->ignore($id, 'id')
        ],
        //...
    ];
}
```
还有其他查询条件时，可以链式使用`where()`等方法
```php
public function rules() {
    $stationId = $this->get('station_id');

    return [
        //...
        'car_number' => [
            'required',
            'string',
            Rule::unique('queue')->where(function ($query) use ($stationId) {
                $query->where([
                    ['station_id', $stationId],
                    ['cancel_state', 0]//未取消
                ])->whereDate('create_time', today()->toDateString());
            })//排队中不允许重复
        ],
        //...
    ];
}
```

#### Required
有许多规则，视实际情况使用：
- required_if
- required_unless
- required_with
- required_with_all
- required_without
- required_without_all

举个例子
```php
public function rules() {
    return [
        'tel' => 'required_without_all:mobile,email,address',
        'mobile' => 'required_without_all:tel,email,address',
        'email' => 'required_without_all:tel,mobile',
        'address' => 'required_without_all:tel,mobile',
    ];
}

public function messages() {
    return [
        'tel.required_without_all' => '当手机号码、Email、地址都为空时,电话号码不能为空',
        'mobile.required_without_all' => '当电话号码、Email、地址都为空时,手机号码不能为空',
        'email.required_without_all' => '当电话号码、手机号码都为空时,Email和地址不能同时为空',
        'address.required_without_all' => '当电话号码、手机号码都为空时,Email和地址不能同时为空'
    ];
}
```