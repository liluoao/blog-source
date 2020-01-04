---
title: Yii单元测试
urlname: yii-codeception
date: 2019-08-02 17:03:53
category: PHP框架
tags: yii
---

最近一个老项目前端机所在的服务器之一宕机了，在更换新服务器后发现这个项目没有单元测试，在验证时比较麻烦。现在一步步为这个 Yii2.0.12 项目引入单元测试。

<!-- more -->

Yii 的单元测试框架 [Codeception](https://codeception.com/for/yii) 基于 PHPUnit，使用方式几乎一模一样

首先看是否已安装了本包，在 Yii 项目中使用 Composer 可能会提示如下错误：

```
yiisoft/yii2 * requires bower-asset/jquery *@stable -> no matching package found.
```

这时需要安装这个 Composer 管理前端依赖的包，在下载中需要配置一个 GitHub 的 Token：

```
composer global require "fxp/composer-asset-plugin"
```

全部安装好后，在 *vendor/bin* 下会有可执行文件 `codecept`

```bash
$ vendor/bin/codecept
Codeception 2.5.6

Usage:
  command [options] [arguments]

Options:
  -h, --help             Display this help message
  -q, --quiet            Do not output any message
  -V, --version          Display this application version
      --ansi             Force ANSI output
      --no-ansi          Disable ANSI output
  -n, --no-interaction   Do not ask any interactive question
  -c, --config[=CONFIG]  Use custom path for config
  -v|vv|vvv, --verbose   Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Available commands:
  bootstrap             Creates default test suites and generates all required files
  build                 Generates base classes for all suites
  clean                 Recursively cleans log and generated code
  console               Launches interactive test console
  dry-run               Prints step-by-step scenario-driven test or a feature
  help                  Displays help for a command
  init                  Creates test suites by a template
  list                  Lists commands
  run                   Runs the test suites
 config
  config:validate       Validates and prints config to screen
 generate
  generate:cept         Generates empty Cept file in suite
  generate:cest         Generates empty Cest file in suite
  generate:environment  Generates empty environment config
  generate:feature      Generates empty feature file in suite
  generate:groupobject  Generates Group subscriber
  generate:helper       Generates new helper
  generate:pageobject   Generates empty PageObject class
  generate:scenarios    Generates text representation for all scenarios
  generate:snapshot     Generates empty Snapshot class
  generate:stepobject   Generates empty StepObject class
  generate:suite        Generates new test suite
  generate:test         Generates empty unit test file in suite
 gherkin
  gherkin:snippets      Fetches empty steps from feature files of suite and prints code snippets for them
  gherkin:steps         Prints all defined feature steps
```

在项目根目录会有一个配置文件 *codeception.yml*，默认配置了 3 个测试模块：

```yml
# global codeception file to run tests from all apps
include:
    - common
    - frontend
    - backend
paths:
    log: console/runtime/logs
settings:
    colors: true
```

如果是项目是完整的，里面已经包含了单元测试的例子，直接用 `vendor/bin/codecept run` 执行，部分结果如下：

```
$ vendor/bin/codecept run
Codeception PHP Testing Framework v2.5.6
Powered by PHPUnit 7.5.18 by Sebastian Bergmann and contributors.
Running with seed:

[common\tests]: tests from D:\WWW\yii2-app-advanced-2.0.11\common

Common\tests.unit Tests (3) ----------------------------------------------------
E LoginFormTest: Login no user (2.89s)
E LoginFormTest: Login wrong password (2.01s)
E LoginFormTest: Login correct (2.00s)
```

#### 启动引导

但是像我的项目经过了各种删减，原用例和配置都不在了，需要重新生成：

```
vendor\bin\codecept bootstrap
```

这个命令会在当前目录中生成配置文件和一个 *tests/* 目录

#### 添加套件

如果是刚安装好的，在 *tests/* 下已经有了 `functional` 和 `unit` 两个套件。自己想添加新的套件，使用 *generate:suite* 命令：

```
vendor\bin\codecept generate:suite api
```

这将在 *tests/* 目录下创建 *api.suite.yml* 配置文件和 *api/* 目录，现在使用 *generate:cest* 命令生成具体测试用例

```
vendor\bin\codecept generate:cest api GetChatLog
```

然后使用 *build* 命令构建测试

#### 运行测试

在写好你的 GetChatLog 用例后：

```php
public function tryToTest(ApiTester $I)
{
    $I->sendPOST('index/get-chat-log', ['from_id' => 1, 'to_id' => 1]);
    $I->seeResponseCodeIs(Codeception\Util\HttpCode::OK);
    $I->seeResponseIsJson();
    $I->seeResponseContainsJson(['code' => 0]);
}
```

运行测试查看结果

```
vendor\bin\codecept run api
```

接口测试会用到 Guzzle 包，可以学习下
