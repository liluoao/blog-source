---
title: 装饰器模式（Decorator）
urlname: php-structural-design-patterns-decorator
date: 2019-04-18 09:23:38
category: 设计模式
tags: design-patterns
---

装饰器模式允许我们根据运行时不同的情景动态地为某个对象调用前后添加不同的行为动作

以奇迹暖暖这种换装游戏为例，我们需要实现动态的换套装，或者混搭

<!-- more -->

我们先创建好装饰器接口：

```php
interface Decorator
{
   public function beforeDress();
   public function afterDress();
}
```

实现一个警察装扮：

```php
class PoliceDecorator implements Decorator
{
    public function beforeDress()
    {
        echo "穿上警服" . PHP_EOL;
    }

    public function afterDress()
    {
        echo "穿上防弹衣" . PHP_EOL;
        echo "带好配枪" . PHP_EOL;
        echo "别上警徽" . PHP_EOL;
        echo "戴上警帽" . PHP_EOL;
        echo "穿戴完毕" . PHP_EOL;
    }
}
```

再实现一个护士装扮：

```php
class NurseDecorator implements Decorator
{
    public function beforeDress()
    {
        echo "无" . PHP_EOL;
    }

    public function afterDress()
    {
        echo "穿上粉色大褂" . PHP_EOL;
        echo "戴上护士帽" . PHP_EOL;
        echo "戴上口罩" . PHP_EOL;
        echo "穿戴完毕" . PHP_EOL;
    }
}
```

最后实现一个穿衣服的人：

```php
class Person
{
    protected $decorators = []];

    public function addDecorator(Decorator $decorator)
    {
        $this->decorators[] = $decorator;
    }

    public function beforeDress()
    {
        foreach ($this->decorators as $decorator) {
            $decorator->beforeDress();
        }
    }

    public function afterDress()
    {
        $decorators = array_reverse($this->decorators);
        foreach ($decorators as $decorator) {
            $decorator->afterDress();
        }
    }

    //穿衣
    public function dress()
    {
        $this->beforeDress();
        echo "穿上纯白短袖" . PHP_EOL;
        $this->afterDress();
    }
}
```

现在我们可以创建一个混搭女生了：

```php
$girl = new Person;
$girl->addDecorator(new PoliceDecorator);
$girl->addDecorator(new NurseDecorator);
$girl->dress();
```
