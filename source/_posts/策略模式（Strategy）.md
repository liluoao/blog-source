---
title: 策略模式（Strategy）
urlname: php-structural-design-patterns-strategy
date: 2018-08-18 09:23:38
category: 设计模式
tags: design-patterns
---

定义一系列算法，将每一个算法封装起来，并让它们可以相互替换。策略模式让算法独立于使用它的客户而变化，使他们之间能互相快速切换。
也称为政策模式（Policy）。

<!-- more -->

先定义一个抽象策略，并且新增 2 个具体实现：

```php
abstract class Strategy
{
    abstract function peddle();
}
//女性用户策略
class LadyStrategy extends Strategy
{
    public function peddle()
    {
        echo '看看这款Dior豆沙色哑光口红，不行还有YSL、Mac等' . PHP_EOL;
    }
}
//男性用户策略
class GentlemanStrategy extends Strategy
{
    public function peddle()
    {
        echo '来看看这款刮胡刀，三环弧面，全身水洗' . PHP_EOL;
    }
}
```

下面是需要传入策略的宣传语：

```php
class Slogan
{
    protected $strategy;

    public function __construct(Strategy $strategy)
    {
        $this->strategy = $strategy;
    }

    public function request()
    {
        $this->strategy->peddle($this);
    }
}
```

最后是实际使用，根据不同策略输出合适宣传语：

```php
$ladySlogan = new Slogan(new LadyStrategy);
$ladySlogan->request();
$gentlemanSlogan = new Slogan(new GentlemanStrategy);
$gentlemanSlogan->request();
```
