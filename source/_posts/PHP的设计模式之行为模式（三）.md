---
title: PHP的设计模式之行为模式（三）
urlname: php-behavioral-design-patterns-part3
date: 2018-04-06 15:27:18
category: 设计模式
tags: design-patterns
---
原文链接：[https://www.imooc.com/article/17848](https://www.imooc.com/article/17848)

## Behavioral Patterns（行为模式）
#### Mediator（中介者模式）
用一个中介对象来封装一系列的对象交互，中介者使各对象不需要显式地相互引用，从而使其耦合松散，而且可以独立地改变它们之间的交互。中介者模式又称为调停者模式，它是一种对象行为型模式。

为什么需要中介者模式

1. 中介者模式可以使对象之间的关系数量急剧减少。

2. 中转作用（结构性）：通过中介者提供的中转作用，各个同事对象就不再需要显式引用其他同事，当需要和其他同事进行通信时，通过中介者即可。该中转作用属于中介者在结构上的支持。

3. 协调作用（行为性）：中介者可以更进一步的对同事之间的关系进行封装，同事可以一致地和中介者进行交互，而不需要指明中介者需要具体怎么做，中介者根据封装在自身内部的协调逻辑，对同事的请求进行进一步处理，将同事成员之间的关系行为进行分离和封装。该协调作用属于中介者在行为上的支持。

中介者模式的思想在现实生活中也很常见，比如说交换机。没有交换机存在的时代，每个电话之间都需要电话线连接才能进行通话。如果一个台电话要和其它100台电话通话，那么它就必须要有100条电话线与其它100个电话连接。

后来为了解决这种麻烦，交换机出现了。每个电话只需连入交换机，通话时。只需构建一条电话-交换机-电话的链路，就可以进行通话。所以现在我们的电话理论上可以同世界上任何一台电话通话，但是只需一条电话线。当然现在用电话的人少了，但是手机呀，计算机网络的实现也是在传统通信网的设计上进行演进的。

其实交换机对应的就是中介者模式的中介者，而电话机就是中介者中的同事。下面，就让我们用代码来实现这个思想。
<!-- more -->
```php
<?php
//抽象同事类 --------电话机
abstract class Colleague{
    protected $mediator;    //用于存放中介者
    abstract public function sendMsg($num,$msg);
    abstract public function receiveMsg($msg);
    //设置中介者
    final public function setMediator(Mediator $mediator){
      $this->mediator = $mediator;
    }
}
//具体同事类 ---------座机
class Phone extends Colleague
{
    public function sendMsg($num,$msg)
    {
      echo __class__.'--发送声音：'.$msg.PHP_EOL;
      $this->mediator->opreation($num,$msg);
    }

    public function receiveMsg($msg)
    {
      echo __class__.'--接收声音：'.$msg.PHP_EOL;
    }
}
//具体同事类----------手机
class Telephone extends Colleague
{
    public function sendMsg($num,$msg)
    {
        echo __class__.'--发送声音：'.$msg.PHP_EOL;
        $this->mediator->opreation($num,$msg);
    }
    //手机接收信息前 会智能响铃
    public function receiveMsg($msg)
    {   
        echo '响铃-------'.PHP_EOL;
        echo __class__.'--接收声音：'.$msg.PHP_EOL;
    }
}
//抽象中介者类
abstract class Mediator{
  abstract public function opreation($id,$message);
  abstract public function register($id,Colleague $colleague);
}
//具体中介者类------交换机
class switches extends Mediator
{
    protected  $colleagues = array();
    //交换机业务处理
    public function opreation($num,$message)
    {
        if (!array_key_exists($num,$this->colleagues)) {
            echo __class__.'--交换机内没有此号码信息，无法通话'.PHP_EOL;
        }else{
            $this->colleagues[$num]->receiveMsg($message);
        }
    }
    //注册号码
    public function register($num,Colleague $colleague)
    {
      if (!in_array($colleague, $this->colleagues)) {
          $this->colleagues[$num] = $colleague;
      }
      $colleague->setMediator($this);
    }
}
//实例化固话
$phone = new Phone;
//实例化手机
$telephone = new Telephone;
//实例化交换机
$switches = new Switches;
//注册号码  ---放号
$switches->register(6686668,$phone);
$switches->register(18813290000,$telephone);
//通话
$phone->sendMsg(18813290000,'hello world');
$telephone->sendMsg(6686668,'请说普通话');
$telephone->sendMsg(6686660,'请说普通话');
```

#### Memento（备忘录模式）
在不破坏封闭的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态。这样以后就可将该对象恢复到原先保存的状态。又叫做快照模式（`Snapshot Pattern`）或 `Token 模式

为什么需要备忘录模式

1. 有时一些发起人对象的内部信息必须保存在发起人对象以外的地方，但是必须要由发起人对象自己读取，这时，使用备忘录模式可以把复杂的发起人内部信息对其他的对象屏蔽起来，从而可以恰当地保持封装的边界。

2. 本模式简化了发起人类。发起人不再需要管理和保存其内部状态的一个个版本，客户端可以自行管理他们所要的这些状态的版本。

备忘录模式往简单了说，就是打副本。这里我们给出一个备忘录模式的小例子，备份一个游戏角色，也就是发起者的初始状态，并恢复。
```php
<?php
//发起人，所需备份者
class Originator{
    //内部状态
    private $state;
    //设置状态
    public function setState($state){
        $this->state = $state ;
    }
    //查看状态
    public function getState(){
        echo $this->state,PHP_EOL;
    }
    //创建一个备份录
    public function createMemento(){
        return new Memento($this->state);
    }
    //恢复一个备份
    public function restoreMemento(Memento $memento){
        $this->state = $memento->getState();
    }
}
//备忘录角色
class Memento{
    private $state; //用于存放发起人备份时的状态
    public function __construct($state){
        $this->state = $state;
    }
    public function getState(){
        return $this->state;
    }
}
//备忘录管理者
class Caretaker{
    private $menento;
    //存档备忘录
    public function setMemento(Memento $memento){
        $this->memento = $memento;
    }
    //取出备忘录
    public function getMemento(){
        return $this->memento;
    }
}

//实例化发起人 假如是个游戏角色
$role = new Originator;
//设置状态 满血
$role->setState('满血');
//备份
//创建备份录管理者
$caretaker = new Caretaker;
//创建备份
$caretaker->setMemento($role->createMemento());
//状态更改
$role->setState('死亡');
$role->getState();
//恢复备份
$role->restoreMemento($caretaker->getMemento());
//重新查看状态
$role->getState();
```
可能最后那段恢复备份的代码有点绕，这是因为我们引入了备份管理者。其实如果对于只有一个备份，那么我们也可以不用备份管理者。而备份管理者存在的好处，当然是管理多个备份了。如果对于多个备份，我们可以把备份管理者的 `memento` 属性改为数组变量，就可以存放多个备份了。

其实备份在原型模式我们也提过，我们完全可以通过 `clone` 关键字来备份，但是备忘录模式相对于原型模式更精简，可能有些时候我们只想备份的就只有这一个属性呢。而且从本质上说备忘录模式恢复备份后还是原来那个对象，而原型模式就不一定了。如果原型模式恢复备份是直接使用clone出来的对象副本，那么其实它就不算原来那个对象了，虽然它和被clone的对象几乎一模一样，使用无差别，但是对于 `var_dump`，它的 `object#id` 肯定是不一样的。

#### Template（模板模式）
定义一个操作中的算法的骨架，而将一些步骤延迟到子类中。模板模式使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。

为什么需要模板模式

1. 一次性实现一个算法的不变的部分，并将可变的行为留给子类来实现。

2. 多个子类有相同的方法，逻辑基本相同时。可将相同的逻辑代码提取到父类

3. 重构时，将相同代码抽取到父类，然后通过钩子函数约束其行为

一个银行可以有许多不同类型的银行账户，但是所有账户的处理方式基本相同。假设我们现在有两类账户，一类是普通账户，一类是信用卡账户。现在进行支付，信用卡允许透支，普通账户不允许透支，即账户金额不允许小于零
```php
<?php 
//抽象模板类
abstract class Template{
    protected $balance = 100;       //账户余额,为测试方便，直接赋初值100
    //结算方法
    abstract protected function adjust($num);
    //支付信息显示 
    abstract protected function display($num);
    final public function apply($num){
        $this->adjust($num);
        $this->display($num);
    }
}

//普通账户
class Account extends Template{
    protected $falg;  //用于判断支付是否成功
    protected function adjust($num){
        if($this->balance > $num){//只有余额大于所需支付金额才允许支付
            $this->balance-=$num;
            $this->falg = true;
        }else{
            $this->falg = false;
        }
    }
    protected function display($num){
        if($this->falg){
            echo '支付成功,所剩余额为'.$this->balance.PHP_EOL;
        }else{
            echo '余额不足，支付失败,所剩余额为'.$this->balance.PHP_EOL;
        }
    }
}

//信用卡用户
class Credit extends Template{
    protected function adjust($num){
        $this->balance-=$num;
    }
    protected function display($num){
        echo '感谢您使用信用支付，所剩余额为'.$this->balance.PHP_EOL;
    }
}

//普通账户使用
$account = new Account;
//普通账户使用
$account -> apply(80);
//普通账户透支
$account -> apply(30);

//信用卡账户使用
$credit = new Credit;
$credit -> apply(200);
```
模板模式的好处在于行为由父类控制，而具体的实现由子类实现。这就可以把一个操作延迟绑定到子类上。还有另一种应用是把复杂的核心代码设计为模板方法，周边的相关细节则由子类实现。

#### Interpreter（解释器模式）
提供了评估语言的语法或表达式的方式，它属于行为型模式。这种模式实现了一个表达式接口，该接口解释一个特定的上下文。这种模式被用在 SQL 解析、符号处理引擎等
感兴趣的话可以自己去实现。
```php
<?php
//抽象表达式 
abstract class Expression{
    //任何表达式子类都应该有一种解析任务
    abstract public function interpreter($context);
}
//抽象表达式是生成语法集合（语法树）的关键，每个语法集合完成指定语法解析任务
//抽象表达式通过递归调用的方法，最终由最小语法单元进行解析完成

//终结符表达式    通常指运算变量
class TerminalExpression extends Expression{
    //终结符表达式通常只有一个
    public function interpreter($context){
        return null; //视具体业务实现
    }
}
//非终结符表达式   通常指运算的符号
class NonterminalExpression extends Expression{
    public function interpreter($context){
        return null;
    }
}
```