---
title: 使用AppVeyor持续集成本博客
urlname: use-appveyor-ci
date: 2018-02-02 11:37:55
---
## 创建AppVeyor账号
进入[AppVeyor官网](https://ci.appveyor.com)，游客会跳转到 `/login` 页，这里可以注册，也可以使用 `GitHub` 账号授权登陆。

![](/images/appveyor_login.png)
<!-- more -->
## 创建CI项目
在 `/projects` 页面选择你的博客源码仓库

![](/images/appveyor_select_repo.png)

## 配置CI项目
点击项目中 `SETTINGS` 选项卡，如果项目分支不是默认的，修改 `Default branch` 。

再点击 `Environment` 栏目，设置4个环境变量：

|name|value|
|---|---|
|STATIC_SITE_REPO|静态页面的仓库地址|
|TARGET_BRANCH|编译后文件存放的分支|
|GIT_USER_EMAIL|Github用户邮箱|
|GIT_USER_NAME|Github用户名|

![](/images/appveyor_project_env.png)

设置好后点击 `Save` 保存。

## 获取AccessToken
打开 `GitHub` 个人设置

![](/images/github_setting.png)

点击 `Developer settings` 栏目，再点击 `Personal access tokens` 选项卡，可以看到已有的Token，这里点击 `Generate new token` 按钮创建一个博客专用的token。

![](/images/github_token.png)

可以参考[官方文档](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)

## 加密AccessToken
由于这个AccessToken可以直接操作你的仓库的，而且配置文件是公开的，所以这时就要求对AccessToken进行加密。可到[AppVeyor Token加密页面](https://ci.appveyor.com/tools/encrypt)进行加密。把加密后的字符串填入下一步中的配置文件里。

![](/images/appveyor_encrypt.png)

## 配置CI
在项目中新建 `appveyor.yml` 文件，用于配置持续集成的命令
```yml
clone_depth: 5

environment:
    access_token:
        secure: # 自己的加密token
install:
    - ps: Install-Product node 6.9 # 默认node版本太老
    - node --version
    - npm --version
    - npm install
    - npm install hexo-cli -g
    
build_script:
    - hexo generate
    
artifacts:
    - path: public
    
on_success:
    - git config --global credential.helper store
    - ps: Add-Content "$env:USERPROFILE\.git-credentials" "https://$($env:access_token):x-oauth-basic@github.com`n"
    - git config --global user.email "%GIT_USER_EMAIL%"
    - git config --global user.name "%GIT_USER_NAME%"
    - git clone --depth 5 -q --branch=%TARGET_BRANCH% %STATIC_SITE_REPO% %TEMP%\static-site
    - cd %TEMP%\static-site
    - del * /f /q
    - for /d %%p IN (*) do rmdir "%%p" /s /q
    - SETLOCAL EnableDelayedExpansion & robocopy "%APPVEYOR_BUILD_FOLDER%\public" "%TEMP%\static-site" /e & IF !ERRORLEVEL! EQU 1 (exit 0) ELSE (IF !ERRORLEVEL! EQU 3 (exit 0) ELSE (exit 1))
    - git add -A
    - git commit -m "Update Static Site"
    - git push origin %TARGET_BRANCH%
- appveyor AddMessage "Static Site Updated"
```
大致的意思是从github仓库的当前分支拉取下来，编译成静态文件后，在push到目标分支。由于AppVeyor环境中是通过Access Token访问我们的仓库的，而Hexo自带的部署则在访问的过程中需要我们输入帐号密码，所以 `Hexo g -d` 的命令就不适合在这里使用。需要先编译成静态文件，再把public文件夹的静态文件push到目标分支。

## 完成
![](/images/appveyor_build.png)