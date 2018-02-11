---
title: PHP的设计模式之行为模式（二）
urlname: php-behavioral-design-patterns-part2
date: 2018-04-05 14:52:10
tags: design-patterns
---
原文链接：[https://www.imooc.com/article/17844](https://www.imooc.com/article/17844)

## Behavioral Patterns（行为模式）
#### Command（命令模式）
将一个请求封装为一个对象，从而使我们可用不同的请求对客户进行参数化；对请求排队或者记录请求日志，以及支持可撤销的操作。命令模式是一种对象行为型模式，其别名为动作(`Action`)模式或事务(`Transaction`)模式。

为什么需要命令模式

1. 使用命令模式，能够让请求发送者与请求接收者消除彼此之间的耦合，让对象之间的调用关系更加灵活。

2. 使用命令模式可以比较容易地设计一个命令队列和宏命令（组合命令），而且新的命令可以很容易地加入系统

有关命令模式的一个经典的例子，就是电视机与遥控器。有这样的对应关系：电视机是请求的接收者，遥控器是请求的发送者。遥控器上有一些按钮，不同的按钮对应电视机的不同操作。这些按钮就是对应的具体命令类。抽象命令角色由一个命令接口来扮演，有三个具体的命令类实现了抽象命令接口，这三个具体命令类分别代表三种操作：打开电视机、关闭电视机和切换频道。
<!-- more -->
```php
<?php
//抽象命令角色
abstract class Command{
  protected $receiver;
  function __construct(TV $receiver)
  {
      $this->receiver = $receiver;
  }
  abstract public function execute();
}
//具体命令角色 开机命令
class CommandOn extends Command
{
  public function execute()
  {
      $this->receiver->action();
  }
}
//具体命令角色 关机机命令
class CommandOff extends Command
{
  public function execute()
  {
      $this->receiver->action();
  }
}
//命令发送者   --遥控器
class Invoker
{
  protected $command;
  public function setCommand(Command $command)
  {
      $this->command = $command;
  }

  public function send()
  {
      $this->command->execute();
  }
}
//命令接收者 Receiver =》 TV
class TV
{
  public function action()
  {
      echo "接收到命令，执行成功".PHP_EOL;
  }
}

//实例化命令接收者 -------买一个电视机
$receiver = new TV();
//实例化命令发送者-------配一个遥控器
$invoker  = new Invoker();
//实例化具体命令角色 -------设置遥控器按键匹配电视机
$commandOn = new CommandOn($receiver);
$commandOff = new CommandOff($receiver);
//设置命令  ----------按下开机按钮
$invoker->setCommand($commandOn);
//发送命令
$invoker->send();
//设置命令  -----------按下关机按钮
$invoker->setCommand($commandOff);
//发送命令
$invoker->send();
```
在实际使用中，命令模式的 `receiver` 经常是一个抽象类，就是对于不同的命令，它都有对应的具体命令接收者。命令模式的本质是对命令进行封装，将发出命令的责任和执行命令的责任分割开。

#### State（状态模式）
允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类。其别名为状态对象(`Objects for States`)

为什么需要状态模式

1. 将所有与某个状态有关的行为放到一个类中，并且可以方便地增加新的状态，只需要改变对象状态即可改变对象的行为。

2. 本模式简化了发起人类。发起人不再需要管理和保存其内部状态的一个个版本，客户端可以自行管理他们所要的这些状态的版本。

状态模式一个最妙的应用就是通过变化状态拥有不同的能力。比如我们以水为例，水如果是固态，那么它就能融化成液态，如果是液态那么它就能蒸发成气态，而气态也能凝华成固态。现在就让我们用程序来模拟这个过程。
```php
<?php
//抽象状态类
abstract class State{
  abstract function handle();
}
//固态
class Solid extends State{
    public function handle(){
        echo '固态 =>融化 =>液态转化中'.PHP_EOL;
    }
}
class Liquid extends State{
    public function handle(){
        echo '液态 =>蒸发 =>气态转化中'.PHP_EOL;
    }
}
class Gas extends State{
    public function handle(){
        echo '气态 =>凝华 =>固态转化中'.PHP_EOL;
    }
}
//context环境类 -----water
class Water{
  protected $states = array();
  protected $current=0;
  public function __construct()
  {
      $this->states[]=new Solid;
      $this->states[]=new Liquid;
      $this->states[]=new Gas;
  }
  //水的变化
  public function change(){
    //告知当前状态
    echo '当前所处状态'.get_Class($this->states[$this->current]).PHP_EOL;
    //当前状态能力
    $this->states[$this->current]->handle();
    //状态变化
    $this->changeState();
  }
  //状态变化
  public function changeState()
  {
      $this->current++ == 2 && $this->current = 0;
  }
}

//实例化具体环境角色-----水
$water = new Water;
//水的能力变化   ---与它的状态相关
$water->change();
$water->change();
$water->change();
$water->change();
```
当然我们这里只是一个简单的示例，你完全可以让一个状态有多个能力，或者通过给water给一个对外的接口，通过传参使其转化为你指定的状态。

#### Visitor（访问者模式）
表示一个作用于某对象结构中的各元素的操作。它使你可以在不改变各元素类的前提下定义作用于这些元素的新操作。
```php
<?php
//具体元素
class Superman{
    public $name;
    public function doSomething(){
        echo '我是超人，我会飞'.PHP_EOL;
    }
    public function accept(Visitor $visitor){
        $visitor->doSomething($this);
    }
}
//具体访问者
class Visitor{
    public function doSomething($object){
        echo '我可以返老还童到'.$object->age = 18;
    }
}
//实例化具体对象
$man = new Superman;
//使用自己的能力
$man->doSomething();
//通过添加访问者，把访问者能能力扩展成自己的
$man->accept(new Visitor);
```
