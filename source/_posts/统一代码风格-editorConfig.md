---
title: 统一代码风格-editorConfig
urlname: how-to-use-editorconfig
date: 2018-05-18 11:10:22
tags: editor-config
---
[EditorConfig官网](http://editorconfig.org/)
在团队开发中，统一的代码格式是必要的。但是不同开发人员的代码风格不同，代码编辑工具的默认格式也不相同，这样就造成代码的 differ。而 **editorConfig** 可以帮助开发人员在不同的编辑器和 IDE 中定义和维护一致的编码风格。本文将详细介绍统一代码风格工具 **editorConfig**

## 概述
**editorConfig** 不是什么软件，而是一个名称为 `.editorconfig` 的自定义文件。该文件用来定义项目的编码规范，编辑器的行为会与 `.editorconfig` 文件中定义的一致，并且其优先级比编辑器自身的设置要高，这在多人合作开发项目时十分有用而且必要

有些编辑器默认支持 **editorConfig**，如 **webstorm** ；而有些编辑器则需要安装 **editorConfig** 插件，如**ATOM**、**Sublime**、**VS Code** 等

当打开一个文件时，**EditorConfig** 插件会在打开文件的目录和其每一级父目录查找 `.editorconfig` 文件，直到有一个配置文件 `root=true`

**EditorConfig** 的配置文件是从上往下读取的并且最近的 **EditorConfig** 配置文件会被最先读取. 匹配 **EditorConfig** 配置文件中的配置项会按照读取顺序被应用, 所以最近的配置文件中的配置项拥有优先权

如果 `.editorconfig` 文件没有进行某些配置，则使用编辑器默认的设置
<!-- more -->
## 语法
**editorConfig** 配置文件需要是 UTF-8 字符集编码的, 以回车换行或换行作为一行的分隔符

**斜线(/)**被用作为一个路径分隔符，**井号(#)**或**分号(;)**被用作于注释. 注释需要与注释符号写在同一行

#### 通配符
```
*                匹配除/之外的任意字符串
**               匹配任意字符串
?                匹配任意单个字符
[name]           匹配name中的任意一个单一字符
[!name]          匹配不存在name中的任意一个单一字符
{s1,s2,s3}       匹配给定的字符串中的任意一个(用逗号分隔) 
{num1..num2}   　匹配num1到num2之间的任意一个整数, 这里的num1和num2可以为正整数也可以为负整数
```

#### 属性
所有的属性和值都是忽略大小写的. 解析时它们都是小写的
```
indent_style               设置缩进风格(tab是硬缩进，space为软缩进)
indent_size                用一个整数定义的列数来设置缩进的宽度，如果indent_style为tab，则此属性默认为tab_width
tab_width                  用一个整数来设置tab缩进的列数。默认是indent_size
end_of_line                设置换行符，值为lf、cr和crlf
charset                    设置编码，值为latin1、utf-8、utf-8-bom、utf-16be和utf-16le，不建议使用utf-8-bom
trim_trailing_whitespace   设为true表示会去除换行行首的任意空白字符。
insert_final_newline       设为true表示使文件以一个空白行结尾
root        　　　         表示是最顶层的配置文件，发现设为true时，才会停止查找.editorconfig文件
```

## 示例
```
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 4
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```