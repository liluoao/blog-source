---
title: 设计模式——Creational
urlname: php-creational-design-patterns
date: 2018-04-01 22:50:50
category: 设计模式
tags: design-patterns
---

简单介绍下几种常见的创建型设计模式：

- Singleton
- Factory
- Prototype
- Builder

<!-- more -->

#### Singleton

单例模式也是最常见的模式之一，它确保一个类只有一个实例，并提供一个全局的访问点。

主要是为了避免因为创建了多个实例造成资源的浪费，且多个实例由于多次调用容易导致结果出现错误。比如 Redis、MySQL 连接、CURL 句柄等。

```php RedisUtil.php
class RedisUtil
{
    protected $redis = null;

    protected static $instance = null;

    private function __construct() {}

    private function __clone() {}

    private function __sleep() {}

    private  function __wakeup() {}

    public static function getInstance()
    {
        if (!self::$instance instanceof self) {
            self::$instance = new self();
            self::$instance->connect();
        }

        return self::$instance;
    }
}
```

#### Factory

工厂模式是另一种常用的模式，它根据参数的不同返回不同类的实例

定义一个类来负责创建其他类的实例，被创建的实例通常都具有共同的父类

```php Factory.php
class Factory
{
    public static function getDb($type = 'mysql')
    {
        $connection = null;
        $type = strtolower($type);
        switch ($type) {
            case 'mongo':
                $connection = Mongo::getInstance();
                break;
            case 'pgsql':
                $connection = Pgsql::getInstance();
                break;
            case 'mysql':
            default:
                $connection = Mysql::getInstance();
        }
        return $connection;
    }
}
```

#### Prototype

有些时候，部分对象需要被初始化多次。创建一个原型然后克隆它，比正常创建一个对象 (`new Foo ()`)会更节省开销

```php BookPrototype.php 抽象原型类
abstract class BookPrototype
{
    protected $title;

    protected $author;

    abstract public function __clone();
}
```

```php NovelPrototype.php 子原型类
class NovelPrototype extends BookPrototype
{
    protected $author = 'LiLuoao';

    public function __clone() {}
}
```

```php
$novelPrototype = new NovelPrototype();

for ($i = 0; $i < 10; $i++) {
    $book = clone $novelPrototype;
    $book->setTitle('Adult Book No ' . $i);
}
```

#### Builder

建造者模式是一步一步创建一个复杂的对象，它允许用户只通过指定复杂对象的类型和内容就可以构建它们，用户不需要知道内部的具体构建细节。

1. 对象的生产需要复杂的初始化，比如给一大堆类成员属性赋初值，设置一下其他的系统环境变量。使用建造者模式可以将这些初始化工作封装起来。
2. 对象的生成时可根据初始化的顺序或数据不同，而生成不同角色。

如果我们想创造出一个英雄类，我们通过实例化时设置的属性不同，让一个是射程远血量少的射手，一个是射程短血量厚的坦克：

```php Hero.php 英雄类
class Hero
{
    public $hp;

    public $range;
}
```

```php Builder.php 抽象建造者类
abstract class Builder
{
    public $hero;

    public abstract function setHp();

    public abstract function setRange();

    public function __construct(Hero $hero)
    {
        $this->hero = $hero;
    }
}
```

```php ADCarryBuider.php 射手建造者
class ADCarryBuider extends Builder
{
    public function setHp()
    {
        $this->hero->hp = 2200;
    }

    public function setRange(){
        $this->hero->range = 575;
    }
}
```

```php TankBuider.php 坦克建造者
class TankBuider extends Builder
{
    public function setHp()
    {
        $this->hero->hp = 4396;
    }

    public function setRange(){
        $this->hero->range = 125;
    }
}
```

```php Director.php 建造指挥者
class Director
{
    private $builder;

    public function __construct(Builder $builder)
    {
        $this->builder = $builder;
    }

    public function built()
    {
        $this->builder->setHp();
        $this->builder->setRange();
    }
}
```

```php
//实例化一个射手建造者
$adcBuilder = new ADCarryBuider(new Hero);
//实例化指挥者并建造
(new Director($adcBuilder))->built();
//得到射手
$adc = $adcBuilder->getHero();
```
