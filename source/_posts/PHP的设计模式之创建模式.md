---
title: PHP的设计模式之创建模式
date: 2018-04-01 22:50:50
tags: design-patterns
---
原文链接：[https://www.devbattles.com/en/sand/post-1306-Design+Patterns+in+PHP](https://www.devbattles.com/en/sand/post-1306-Design+Patterns+in+PHP)

什么是设计模式，设计模式并不是一种用来解释的模式，它们并不是像链表那样的常见的数据结构，也不是某种特殊的应用或者框架设计。事实上，设计模式的解释如下：
> descriptions of communicating objects and classes that are customized to solve a general design problem in a particular context.

另一方面，设计模式提供了一种广泛的可重用的方式来解决我们日常编程中常常遇见的问题。设计模式并不一定就是一个类库或者第三方框架，它们更多的表现为一种思想并且广泛地应用在系统中。它们也表现为一种模式或者模板，可以在多个不同的场景下用于解决问题。设计模式可以用于加速开发，并且将很多大的想法或者设计以一种简单地方式实现。当然，虽然设计模式在开发中很有作用，但是千万要避免在不适当的场景误用它们。

目前常见的设计模式主要有23种，根据使用目标的不同可以分为以下三大类：
- 创建模式（Creational Patterns）：用于创建对象从而将某个对象从实现中解耦合。
- 架构模式（Structural Patterns）：用于在不同的对象之间构造大的对象结构。
- 行为模式（Behavioral Patterns）：用于在不同的对象之间管理算法、关系以及职责。
<!-- more -->
## Creational Patterns（创建模式）
#### Singleton（单例模式）
单例模式是最常见的模式之一，在Web应用的开发中，常常用于允许在运行时为某个特定的类创建一个可访问的实例。
```php
<?php
/**
 * Singleton class
 */
final class Product
{

    /**
     * @var self
     */
    private static $instance;

    /**
     * @var mixed
     */
    public $mix;


    /**
     * Return self instance
     *
     * @return self
     */
    public static function getInstance() {
        if (!(self::$instance instanceof self)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
    }

    private function __clone() {
    }
}

$firstProduct = Product::getInstance();
$secondProduct = Product::getInstance();

$firstProduct->mix = 'test';
$secondProduct->mix = 'example';

print_r($firstProduct->mix);
// example
print_r($secondProduct->mix);
// example
```
#### Factory（工厂模式）
工厂模式是另一种非常常用的模式，正如其名字所示：确实是对象实例的生产工厂。某些意义上，工厂模式提供了通用的方法有助于我们去获取对象，而不需要关心其具体的内在的实现。
```php
<?php

interface Factory {
    public function getProduct();
}

interface Product {
    public function getName();
}

class FirstFactory implements Factory {

    public function getProduct() {
        return new FirstProduct();
    }
}

class SecondFactory implements Factory {

    public function getProduct() {
        return new SecondProduct();
    }
}

class FirstProduct implements Product {

    public function getName() {
        return 'The first product';
    }
}

class SecondProduct implements Product {

    public function getName() {
        return 'Second product';
    }
}

$factory = new FirstFactory();
$firstProduct = $factory->getProduct();
$factory = new SecondFactory();
$secondProduct = $factory->getProduct();

print_r($firstProduct->getName());
// The first product
print_r($secondProduct->getName());
// Second product
```
#### Abstract Factory（抽象工厂模式）
有些情况下我们需要根据不同的选择逻辑提供不同的构造工厂，而对于多个工厂而言需要一个统一的抽象工厂：
```php
<?php

class Config {
    public static $factory = 1;
}

interface Product {
    public function getName();
}

abstract class AbstractFactory {

    public static function getFactory() {
        switch (Config::$factory) {
            case 1:
                return new FirstFactory();
            case 2:
                return new SecondFactory();
        }
        throw new Exception('Bad config');
    }

    abstract public function getProduct();
}

class FirstFactory extends AbstractFactory {
    public function getProduct() {
        return new FirstProduct();
    }
}
class FirstProduct implements Product {
    public function getName() {
        return 'The product from the first factory';
    }
}

class SecondFactory extends AbstractFactory {
    public function getProduct() {
        return new SecondProduct();
    }
}
class SecondProduct implements Product {
    public function getName() {
        return 'The product from second factory';
    }
}

$firstProduct = AbstractFactory::getFactory()->getProduct();
Config::$factory = 2;
$secondProduct = AbstractFactory::getFactory()->getProduct();

print_r($firstProduct->getName());
// The first product from the first factory
print_r($secondProduct->getName());
// Second product from second factory
```
#### Prototype（原型模式）
有些时候，部分对象需要被初始化多次。而特别是在如果初始化需要耗费大量时间与资源的时候进行预初始化并且存储下这些对象：
```php
<?php

interface Product {
}

class Factory {

    private $product;

    public function __construct(Product $product) {
        $this->product = $product;
    }

    public function getProduct() {
        return clone $this->product;
    }
}

class SomeProduct implements Product {
    public $name;
}


$prototypeFactory = new Factory(new SomeProduct());

$firstProduct = $prototypeFactory->getProduct();
$firstProduct->name = 'The first product';

$secondProduct = $prototypeFactory->getProduct();
$secondProduct->name = 'Second product';

print_r($firstProduct->name);
// The first product
print_r($secondProduct->name);
// Second product
```
#### Builder（构造者模式）
构造者模式主要在于创建一些复杂的对象：
```php
<?php

class Product {

    private $name;

    public function setName($name) {
        $this->name = $name;
    }

    public function getName() {
        return $this->name;
    }
}

abstract class Builder {

    protected $product;

    final public function getProduct() {
        return $this->product;
    }

    public function buildProduct() {
        $this->product = new Product();
    }
}

class FirstBuilder extends Builder {

    public function buildProduct() {
        parent::buildProduct();
        $this->product->setName('The product of the first builder');
    }
}

class SecondBuilder extends Builder {

    public function buildProduct() {
        parent::buildProduct();
        $this->product->setName('The product of second builder');
    }
}

class Factory {

    private $builder;

    public function __construct(Builder $builder) {
        $this->builder = $builder;
        $this->builder->buildProduct();
    }

    public function getProduct() {
        return $this->builder->getProduct();
    }
}

$firstDirector = new Factory(new FirstBuilder());
$secondDirector = new Factory(new SecondBuilder());

print_r($firstDirector->getProduct()->getName());
// The product of the first builder
print_r($secondDirector->getProduct()->getName());
// The product of second builder
```
