---
title: Eloquent-ORM-Relationship
urlname: laravel-eloquent-orm-relationship
date: 2018-05-05 09:04:19
category: laravel
tags: laravel
---
- **一对一 One To One**
场景：用户表（`users`）、用户设置表（`user_settings`）
```php
class User extends Model
{
    public function settings()
    {
        return $this->hasOne('App\Models\Settings', 'user_id', 'id');
    }
}
```
然后通过动态属性 `User::find(1)->settings` 可以读取。

<!-- more -->

外键可以自定义：
```php
return $this->hasOne('App\Models\Settings', 'user_settings 表的 uid 字段名', '本表的 uid 字段名');
```
`hasOne` 的反向定义：`belongsTo`（貌似很少有这样的使用场景）
```php
class UserSettings extends Model
{
    public function user()
    {
        return $this->belongsTo('App\Models\User', '本表的 uid 字段名', 'users 表的 uid 字段名');
    }
}
```

- **一对多 One To Many**
场景：文章表（`posts`）、文章评论表（`comments`）

定义：
```php
class Post extends Model
{
    public function comments()
    {
        return $this->hasMany('App\Models\Comment', 'foreign_key', 'local_key');
    }
}
```
读取：
```php
$comments = App\Post::find(1)->comments;
//或者带条件的：
$comments = App\Post::find(1)->comments()->where('title', 'foo')->first();

foreach ($comments as $comment) {
    // ...
}
```
`hasMany` 的反向定义也是：`belongsTo`
```php
class Comment extends Model
{
    public function post()
    {
        return $this->belongsTo('App\Models\Post', 'post_id', 'id');
    }
}
```
读取：
```php
$comment = App\Models\Comment::find(1);
echo $comment->post->title;
```

- **多对多Many To Many**
```php
return $this->belongsToMany('App\Role', 'role_user', 'user_id', 'role_id');
```
第一个参数是另一个Model，第二个是关联表名，第三个是关联表中本Model的外键，第四个是另一个Model的外键。

可以用`pivot`属性获取中间表的数据。默认情况下，`pivot` 对象只提供模型的键。如果你的 `pivot` 数据表包含了其它的属性，则可以在定义关联方法时指定那些字段:
```php
return $this->belongsToMany('App\Role')->withPivot('column1', 'column2');
```

还可以定义一个模型表示中间表，必须继承`Illuminate\Database\Eloquent\Relations\Pivot`。然后在定义关联时调用`using`方法：
```php
return $this->belongsToMany('App\User')->using('App\UserRole');
```

- **远层一对多**
举个栗子，有部门表、员工表、订单表，部门和员工是一对多，员工和订单也是一对多，现在需要查某部门下所有的订单，一般会先查所有属于部门的员工，再遍历查每个员工的订单。「远层一对多」提供了方便简短的方法来通过中间的关联获取远层的关联。
```php
return $this->hasManyThrough(
            'App\Post', 'App\User',
            'country_id', 'user_id', 'id'
        );
```
第一个参数为我们希望最终访问的模型名称，第二个参数为中间模型的名称，第三个参数为中间模型的外键名称，第四个参数为最终模型的外键名称，第五个参数则为本地键。