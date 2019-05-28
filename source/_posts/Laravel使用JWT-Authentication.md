---
title: 使用JWT-Authentication
urlname: restful-api-in-laravel-56-using-jwt-authentication
date: 2018-05-25 11:35:27
category: laravel
tags: laravel
---
## Restful API In Laravel 5.6 Using jwt Authentication
#### Installing tymon/jwt-auth package
```bash
composer require tymon/jwt-auth:dev-develop --prefer-source
```
#### Publishing Configuration File
```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\JWTAuthServiceProvider"
```
#### Generate JWT Key
```bash
php artisan jwt:secret
```
#### Registering Middleware
在 `app\Http\Kernel` 中加入：
```php
protected $routeMiddleware = [
    //...
    'auth.jwt' => \Tymon\JWTAuth\Http\Middleware\Authenticate::class,
];
```
<!-- more -->
#### Set up Routes
加入新路由：
```php
Route::post('login', 'ApiController@login');
Route::post('register', 'ApiController@register');

Route::group(['middleware' => 'auth.jwt'], function () {
    Route::get('logout', 'ApiController@logout');

    Route::get('user', 'ApiController@getAuthUser');

    Route::get('products', 'ProductController@index');
    Route::get('products/{id}', 'ProductController@show');
    Route::post('products', 'ProductController@store');
    Route::put('products/{id}', 'ProductController@update');
    Route::delete('products/{id}', 'ProductController@destroy');
});
```
#### Update User Model
需要为 User 模型实现 `Tymon\JWTAuth\Contracts\JWTSubject` 接口 
接口需要实现 `getJWTIdentifier()` `getJWTCustomClaims()` 方法
```php
<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}
```
#### JWT Authentication Logic
先创建表单验证类：
```bash
php artisan make:request RegisterAuthRequest
```
加入简单的规则：
```php
public function rules()
{
    return [
        'name' => 'required|string',
        'email' => 'required|email|unique:users',
        'password' => 'required|string|min:6|max:10'
    ];
}
```
创建控制器：
```bash
php artisan make:controller ApiController
```
然后实现简单的注册\登录\注销\详情功能：
```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterAuthRequest;
use App\User;
use Illuminate\Http\Request;
use JWTAuth;
use JWTAuthException;
use Tymon\JWTAuth\Exceptions\JWTException;

class ApiController extends Controller
{
    public $loginAfterSignUp = true;

    public function register(RegisterAuthRequest $request)
    {
        $user = new User();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = bcrypt($request->password);
        $user->save();

        if ($this->loginAfterSignUp) {
            return $this->login($request);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    public function login(Request $request)
    {
        $input = $request->only('email', 'password');
        $jwt_token = null;
        try {
            if (!$jwt_token = JWTAuth::attempt($input)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Email or Password',
                ], 401);
            }
        } catch (JWTAuthException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sorry, the user cannot be authenticated',
            ], 401);
        }
        return response()->json([
            'success' => true,
            'token' => $jwt_token,
        ]);
    }

    public function logout(Request $request)
    {
        $this->validate($request, [
            'token' => 'required'
        ]);

        try {
            JWTAuth::invalidate($request->token);

            return response()->json([
                'success' => true,
                'message' => 'User logged out successfully'
            ]);
        } catch (JWTException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Sorry, the user cannot be logged out'
            ], 500);
        }
    }

    public function getAuthUser(Request $request)
    {
        $this->validate($request, [
            'token' => 'required'
        ]);

        $user = JWTAuth::authenticate($request->token);

        return response()->json(['user' => $user]);
    }
}
```
#### 创建商品部分
用户需要权限对商品进行操作
创建商品的模型、控制器、数据库迁移
```bash
php artisan make:model Product -mc
```
修改迁移文件 `create_products_table.php`：
```php
public function up()
{
    Schema::create('products', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('user_id');
        $table->string('name');
        $table->integer('price');
        $table->integer('quantity');
        $table->timestamps();

        $table->foreign('user_id')
            ->references('id')
            ->on('users')
            ->onDelete('cascade');
    });
}
```
修改模型类：
```php
protected $fillable = [
    'name', 'price', 'quantity'
];
```
运行迁移命令：
```bash
php artisan migrate
```
在 User 模型中进行模型关联：
```php
public function products()
{
    return $this->hasMany(Product::class);
}
```
编写 `ProductController`，提供5个方法：
```php
use App\Product;
use Illuminate\Http\Request;
use JWTAuth;

protected $user;

public function __construct()
{
    $this->user = JWTAuth::parseToken()->authenticate();
}
```
1. index
有权限的用户展示商品列表：
```php
public function index()
{
    return $this->user
        ->products()
        ->get(['name', 'price', 'quantity'])
        ->toArray();
}
```
2. show
通过ID查找一个商品：
```php
public function show($id)
{
    $product = $this->user->products()->find($id);

    if (!$product) {
        return response()->json([
            'success' => false,
            'message' => 'Sorry, product with id ' . $id . ' cannot be found'
        ], 400);
    }

    return $product;
}
```
3. store
保存一个新商品：
```php
public function store(Request $request)
{
    $this->validate($request, [
        'name' => 'required',
        'price' => 'required|integer',
        'quantity' => 'required|integer'
    ]);

    $product = new Product();
    $product->name = $request->name;
    $product->price = $request->price;
    $product->quantity = $request->quantity;

    if ($this->user->products()->save($product))
        return response()->json([
            'success' => true,
            'product' => $product
        ]);
    else
        return response()->json([
            'success' => false,
            'message' => 'Sorry, product could not be added'
        ], 500);
}
```
4. update
通过ID修改一个商品：
```php
public function update(Request $request, $id)
{
    $product = $this->user->products()->find($id);

    if (!$product) {
        return response()->json([
            'success' => false,
            'message' => 'Sorry, product with id ' . $id . ' cannot be found'
        ], 400);
    }

    $updated = $product->fill($request->all())
        ->save();

    if ($updated) {
        return response()->json([
            'success' => true
        ]);
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Sorry, product could not be updated'
        ], 500);
    }
}
```
5. destroy
通过ID删除一个商品：
```php
public function destroy($id)
{
    $product = $this->user->products()->find($id);

    if (!$product) {
        return response()->json([
            'success' => false,
            'message' => 'Sorry, product with id ' . $id . ' cannot be found'
        ], 400);
    }

    if ($product->delete()) {
        return response()->json([
            'success' => true
        ]);
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Product could not be deleted'
        ], 500);
    }
}
```