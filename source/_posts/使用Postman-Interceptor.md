---
title: 使用Postman-Interceptor
urlname: use-postman-interceptor
date: 2018-02-20 14:57:06
category: 工具
tags: tool
---

目前的Postman插件如果想正常使用，必须安装 `Postman Interceptor` 插件，这样才能直接使用Chrome浏览器的**cookie**等信息，否则Postman是无法完成老版本的功能的。

如果可以科学上网，直接在软件商店下载。
没有条件的可以去：
- https://www.crx4chrome.com/extensions/
- http://chromecj.com/
- http://www.cnplugins.com/

1. 将下载好的文件扩展名改为 `.zip` 并解压
2. 把解压后文件夹中的 `_metadata` 的下划线去掉
3. 打开Chrome，打开`扩展程序`，勾选`开发者模式`，选择`加载已经解压的扩展程序`

除了 `Postman Interceptor` ，好用的插件还有 `Vue.js devtools` 、`WEB前端助手(FeHelper)`等。

参考网址：
1.[离线安装Chrome Postman 和Postman Interceptor 插件](http://www.jianshu.com/p/a4223bab1e73 "离线安装Chrome Postman 和Postman Interceptor 插件")
2.[如何在谷歌浏览器中安装.crx扩展名的离线Chrome插件](http://www.jianshu.com/p/12ca04c61fc6 "如何在谷歌浏览器中安装.crx扩展名的离线Chrome插件")