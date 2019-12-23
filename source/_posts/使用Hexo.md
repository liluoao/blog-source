---
title: 使用Hexo写博客
urlname: use-hexo
date: 2018-02-01 10:37:19
category: 工具
---

## Hexo 介绍

[Hexo](https://hexo.io/zh-cn/docs/) 是一个快速、简洁且高效的博客框架。Hexo 使用 Markdown（或其他渲染引擎）解析文章，在几秒内，即可利用靓丽的主题生成静态网页

直接用 NPM 全局安装：

```npm
npm install -g hexo-cli
```

<!-- more -->

### 新建文章

``` bash
hexo new 文章标题
```

### 预览效果

可以用如下命令在本地运行，预览效果：

``` bash
hexo server
```

### 生成静态文件

在新增修改完成后，使用这个命令来生成真实的 HTML/CSS 文件

``` bash
hexo generate
```

### 远程部署

你可以在配置文件 *_config.yml* 指定一个仓库地址，例如

```yml
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type: git
  repo: https://github.com/liluoao/liluoao.github.io.git
  branch: master
```

然后使用如下命令来部署过去

``` bash
hexo deploy
```
