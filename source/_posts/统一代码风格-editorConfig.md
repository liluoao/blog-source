---
title: 代码风格工具EditorConfig
urlname: how-to-use-editorconfig
date: 2018-02-19 11:10:22
category: 工具
tags: tool
---

在团队开发中，统一的代码格式非常重要。可能团队对于后端代码格式有专门的规定，对于前端代码格式也有专门规定。
但是由于开发习惯的不同，后端 PHP 可能使用的是 PHPStorm，前端开发可能使用的是 Visual Studio Code，这样还是没有避免问题出现。
而 [EditorConfig](http://editorconfig.org/) 可以帮助开发人员在不同的编辑器和 IDE 中定义和维护一致的编码风格。

<!-- more -->

## 介绍

EditorConfig 不是什么软件，而是一个名称为 *.editorconfig* 的自定义文件。
该文件用来定义项目的编码规范，编辑器的行为会与此文件中定义的一致，并且其优先级比编辑器自身的设置要高，这在多人合作开发项目时十分有用。
有些编辑器默认支持 EditorConfig，如 JetBrains 系列 ；而有些编辑器则需要安装插件，如 ATOM、Sublime、VS Code 等。

在项目中时，EditorConfig 会在当前文件的目录和其每一级父目录查找 *.editorconfig* 文件，直到有一个配置文件写了 `root=true`

文件是从上往下读取，并且最近的配置文件会被最先读取。如果文件没有进行某些配置，则使用编辑器默认的设置。

## 语法

文件是 UTF-8

`斜线(/)`被用作为一个路径分隔符，`井号(#)`或`分号(;)`被用作于注释。注释需要与注释符号写在同一行

定义的通配符：

|通配符|说明|
|-|-|
|*|匹配除/之外的任意字符串|
|**|匹配任意字符串|
|?|匹配任意单个字符|
|[name]|匹配name中的任意一个单一字符|
|[!name]|匹配不存在name中的任意一个单一字符|
|{s1,s2,s3}|匹配给定的字符串中的任意一个(用逗号分隔)|
|{num1..num2}|匹配num1到num2之间的任意一个整数|

支持的属性：

|属性|说明|
|-|-|
|indent_style|设置缩进风格(tab是硬缩进，space为软缩进)|
|indent_size|用一个整数定义的列数来设置缩进的宽度，如果indent_style为tab，则此属性默认为tab_width|
|tab_width|用一个整数来设置tab缩进的列数。默认是indent_size|
|end_of_line|设置换行符，值为lf、cr和crlf|
|charset|设置编码，值为latin1、utf-8、utf-8-bom、utf-16be和utf-16le|
|trim_trailing_whitespace|设为true表示会去除换行行首的任意空白字符|
|insert_final_newline|设为true表示使文件以一个空白行结尾|
|root|表示是最顶层的配置文件，发现设为true时，才会停止查找.editorconfig文件|

## 示例

```editorConfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 4
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```
