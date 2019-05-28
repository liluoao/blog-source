---
title: 使用Passport-Authentication
urlname: create-rest-api-in-laravel-with-authentication-using-passport
date: 2018-05-23 14:33:42
category: laravel
tags: laravel
---
## Create REST API in Laravel with authentication using Passport
1. Install Laravel
```bash
laravel new auth
```
2. Install Laravel Passport Package
```bash
composer require laravel/passport
```
3. Run Migration
```bash
php artisan migrate
```
4. Generate keys
```bash
php artisan passport:install
```
<!-- more -->
运行这个命令后需要在 `App\User` 模型中加入 `Laravel\Passport\HasApiTokens` Trait
这个 Trait 会给你的模型提供一些辅助函数，用于检查已认证用户的令牌和使用范围：
```php
<?php

namespace App;

use Laravel\Passport\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
}
```
5. Passport Config
在 `AuthServiceProvider` 的 `boot()` 方法中加入 `Passport::routes`
这个函数会注册发出访问令牌并撤销访问令牌、客户端和个人访问令牌所必需的路由：
```php
use Laravel\Passport\Passport;

public function boot()
{
    $this->registerPolicies();

    Passport::routes();
}
```
在 `config/auth.php` 配置中
授权看守器 `guards` 的 `api` 的 `driver` 选项改为 `passport`
此调整会让你的应用程序在在验证传入的 API 的请求时使用 Passport 的 `TokenGuard` 来处理：
```php
'guards' => [
    //...
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```
6. Create API Routes
在 `routes/api.php` 路由中新增：
```php
Route::group([
    'prefix' => 'auth'
], function () {
    Route::post('login', 'AuthController@login');
    Route::post('signup', 'AuthController@signup');
  
    Route::group([
      'middleware' => 'auth:api'
    ], function() {
        Route::get('logout', 'AuthController@logout');
        Route::get('user', 'AuthController@user');
    });
});
```
7. Create Controller
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\User;

class AuthController extends Controller
{
    /**
     * Create user
     *
     * @param  [string] name
     * @param  [string] email
     * @param  [string] password
     * @param  [string] password_confirmation
     * @return [string] message
     */
    public function signup(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|confirmed'
        ]);

        $user = new User([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password)
        ]);

        $user->save();

        return response()->json([
            'message' => 'Successfully created user!'
        ], 201);
    }
  
    /**
     * Login user and create token
     *
     * @param  [string] email
     * @param  [string] password
     * @param  [boolean] remember_me
     * @return [string] access_token
     * @return [string] token_type
     * @return [string] expires_at
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember_me' => 'boolean'
        ]);

        $credentials = request(['email', 'password']);

        if(!Auth::attempt($credentials))
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);

        $user = $request->user();

        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->token;

        if ($request->remember_me)
            $token->expires_at = Carbon::now()->addWeeks(1);

        $token->save();

        return response()->json([
            'access_token' => $tokenResult->accessToken,
            'token_type' => 'Bearer',
            'expires_at' => Carbon::parse(
                $tokenResult->token->expires_at
            )->toDateTimeString()
        ]);
    }
  
    /**
     * Logout user (Revoke the token)
     *
     * @return [string] message
     */
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
  
    /**
     * Get the authenticated User
     *
     * @return [json] user object
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
```

#### 测试
```bash
php artisan serve
```
需要设置Http Header：
`Content-Type: application/json`
`X-Requested-With: XMLHttpRequest`

**Signup**
![](/images/laravel-passport-1.png)
**Login**
![](/images/laravel-passport-2.png)
**Logout**
![](/images/laravel-passport-3.png)
**User**
![](/images/laravel-passport-4.png)