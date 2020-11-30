---
title: 设计模式——State
urlname: php-structural-design-patterns-state
date: 2019-06-18 09:23:38
category: 设计模式
tags: design-patterns
---

状态模式可以基于一个对象的同种事务而封装出不同的行为

它提供一种简洁的方式使得对象在运行时可以改变自身行为，而不必借助单一庞大的条件判断语句

<!-- more -->

几年前在做一个订单系统时，设计过订单类，简化后大致如下：

```php
class Order
{
    private $state;

    const UN_PAY_STATE = 0;
    const PAY_STATE = 1;
    const EVALUATE_STATE = 2;
    const FINISH_STATE = 3;

    public function handle()
    {
        switch ($this->state) {
            case self::UN_PAY_STATE:
                //客户新建订单，是未付款
                break;
            case self::PAY_STATE:
                //客户未付款，要收钱
                break;
            case self::EVALUATE_STATE:
                //客户已付款，要评价
                break;
            case self::FINISH_STATE:
                //客户已评价，订单完成
                break;
        }
    }
}
```

使用时可能是这样的，思路就是单独状态单独处理，手动设置状态，比较僵硬：

```php
$order = new Order();
$order->setState(Order::PAY_STATE);
$order->handle();
```

用状态模式替代的时，主要是状态类的设计，下面写个已付款状态的例子：

> State 接口规定了 `doAction(Order $order)`

```php
class PayState implements State
{
    const STATE = 1;

    public function doAction(Order $order)
    {
        if (self::STATE === $order->getCurrentState()) {
            //是这个状态（该收钱了）
        } else {
            //转向下一个状态（去评价）
            $order->setState(new EvaluateState());
            $order->handle();
        }
    }
}
```

原来的订单类中需要加上新属性： `$currentState`，存放当前状态，原来的 `$state` 属性存放的就不是值了，而是一个状态对象：

```php
class Order
{
    private $state;
    private $currentState;

    public function __construct()
    {
        $this->state = new UnPayState();
        $this->currentState = UnPayState::STATE;
    }

    public function handle()
    {
        $this->state->doAction($this);
    }
}
```