---
title: 设计模式——TemplateMethod
date: 2019-12-16 14:58:00
urlname: php-structural-design-patterns-template-method
category: 设计模式
tags: design-patterns
---

模板方法模式是一种让抽象模板的子类「完成」一系列算法的行为策略。换而言之，它是一种非常适合框架库的算法骨架

用户只需要实现子类的一种方法，其父类便可去搞定这项工作了

<!-- more -->

半年前有个任务是为认证中心部门制作一个 **API 统一框架**，技术选型是 Yaf 框架，原因是它的轻量级和速度快。但是正因为太过简略，开发拥有很大的自主性，需要制定一个统一的开发流程。

一般思路是需要一个控制器抽象基类直接继承 `Yaf\Controller_Abstract`，普通的控制器再继承基类。我们是用 `trait` 来把流程的模板脱离出控制器。

```php
use ApiTemplate;
```

在 *ApiTemplate* 中规定了流程：

```php ApiTemplate.php
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
    abstract function checkParams();
    //主方法
    abstract function exec();
    //用响应处理插件代替
    abstract function checkResponse();
    abstract function returnResponse();
    //统一错误处理
    abstract function handleError(Exception $e);
}
```

让开发们按约定设置好 *请求参数和响应的配置*，只需要关心逻辑处理并写在 `exec()` 中，请求时统一都转到 *xxx/run* 方法，整个流程就统一了。
