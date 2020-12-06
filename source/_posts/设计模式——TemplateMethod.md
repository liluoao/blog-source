---
title: 设计模式——TemplateMethod
date: 2019-10-16 14:58:00
urlname: php-structural-design-patterns-template-method
category: 设计模式
tags: design-patterns
---

模板方法模式是一种让抽象模板的子类「完成」一系列算法的行为策略。换而言之，它是一种非常适合框架库的骨架

用户只需要实现子类的一种方法，其父类便可去搞定这项工作了

<!-- more -->

半年前有个任务是为认证中心部门制作一个 *API 统一框架*，部门的技术选型是 Yaf 框架，原因是它的轻量级和速度快

但是由于没有一个详细的架构，开发不受控制，拥有很大的自主性。所以需要规范一个统一的接口开发流程

请求流入控制器的步骤没有改变，新增一个控制器抽象基类直接继承 `Yaf\Controller_Abstract`，普通的控制器再继承基类

流程的模板用 `trait` 来实现的效果如下：

```php ApiTemplate.php 接口模板
trait ApiTemplate
{
    protected $response;

    public final funtion runAction()
    {
        try {
            $this->setParams();

            $this->checkParams();

            $this->response = $this->exec();

            $this->checkResponse();

            $this->returnResponse();
        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

    //用参数处理插件代替
    abstract function setParams();

    //参数校验
    abstract function checkParams();

    //主方法
    abstract function exec();

    //用响应处理插件代替
    abstract function checkResponse();

    //返回响应
    abstract function returnResponse();

    //统一错误处理
    abstract function handleError(Exception $e);
}
```

当请求 `api.host/foo` 接口时，会解析到 `BarController` 中的 `run()` 方法

让开发们按约定设置好 *请求参数* 和 *响应* 的配置，只需要关心逻辑处理并写在 `exec()` 中，整个流程就统一了
