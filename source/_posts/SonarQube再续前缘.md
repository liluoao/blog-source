---
title: SonarQube再续前缘
urlname: build-sonarqube-and-rules
date: 2020-03-31 15:44:16
category: 工具
tags: tool
---

## 前言

之前写过一篇[《使用SonarQube管理代码质量》](/2018/use-sonarqube-continuous-code-quality.html)，现在我们在服务器自己搭建了这个分析工具，加入了 CI 中。

<!-- more -->

名词解释：SonarQube（以下简称Sonar），是一个用于代码质量管理的开源的平台。通过插件机制可以和不通的测试工具、代码分析工具或者持续集成等平台相结合。Sonar 不是一个质量数据报告方面的工具，是一个代码管理的质量平台。目前它支持绝大部分语言，例如 Java、C#、Python、PHP 等。

持续集成（Continuous integration，简称 CI）是一种软件开发实践，即团队开发成员经常集成他们的工作，通常每个成员每天至少集成一次，也就意味着每天可能会发生多次集成。每次集成都通过自动化的构建（包括编译，发布，自动化测试）来验证，从而尽早地发现集成错误。

## 搭建

拉镜像

```
docker pull postgres
docker pull sonarqube
```

启动

```
#启动数据库
docker run --name db -e POSTGRES_USER=sonar -e POSTGRES_PASSWORD=sonar -d postgres
#启动sonarqube
docker run --name sq --link db -e SONARQUBE_JDBC_URL=jdbc:postgresql://db:5432/sonar -p 9000:9000 -d sonarqube
```

非容器的就自己去下载安装，不多讲了

```
wget -O /home/tool/sonarqube.zip https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-7.9.1.zip
```

## PHP规则

把我们一个历史悠久的项目加入检查后，出来了 228 个 Bugs、64 个漏洞、1.5K 安全热点、30K 的异味……

重构之路任重而道远，我们先解决掉 Bugs 类，经过整理后大致分为如下几点：

1. **Remove this unreachable code.**
删除 `return` 语句后的无用代码

2. **Remove or refactor this statement.**
例如 `$i == 0;`，需要检查语句正确性或删除掉未使用的语句

3. **This branch duplicates the one on line xxx.**
条件语句的分支条件出现重复，例如：

```php
if ($a > 10) {

} elseif ($a > 5) {

} elseif ($a > 5) {

}
```

4. **Review the data-flow - use of uninitialized value.**
使用了未初始化的值/数组/对象，例如字符串的 `.=`，数字的 `$i++`，数组的 `$foo['bar']`

5. **Remove this conditional structure or edit its code blocks so that they're not all the same.**
2个分支语句的内容一样，例如：

```php
if (true) {
    $a = 1;
} else {
    $a = 1;
}
```

6. **Remove or correct this useless self-assignment.**
等号左右一样，也就是自己等于自己，无用代码

7. **Was "-="/"!=" meant instead?**
等号后面无空格，和后面的运算符易产生误解

8. **Identical sub-expressions on both sides of operator "&&"/"||"**
与、或运算符左右一样，无意义

9. **"$i" is incremented and will never reach "stop condition".**
类似 `while (true)` 的写法，想在循环内部 break，应直接省略条件部分，例如

```
for ($i = 0; ;$i++)
```

10. **Remove this "if" statement.**
删除无用的 `if (true)`

完整的规则可以在 `/coding_rules?language=php&types=BUG` 中查看