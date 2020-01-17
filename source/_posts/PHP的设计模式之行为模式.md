---
title: PHP的设计模式之行为模式
urlname: php-behavioral-design-patterns-part1
date: 2018-04-04 11:06:21
category: 设计模式
tags: design-patterns
---
原文链接：[https://www.imooc.com/article/17840](https://www.imooc.com/article/17840)

## Behavioral Patterns（行为模式）
#### Iterator（迭代模式）
迭代器模式可帮组构造特定的对象，那些对象能够提供单一的标准接口循环或迭代任何类型的可计数数据。

为什么需要迭代模式

1. 我们想要向遍历数组那样，遍历对象，或是遍历一个容器。

2. 迭代器模式可以隐藏遍历元素所需的操作。

现在我们把一个类当做一个容器，让其实现Iterator接口，使其可以被遍历。
<!-- more -->
```php
<?php 
class ArrayContainer implements Iterator { 
    protected $data = array();
    protected $index ;
    public function __construct($data) { 
        $this->data = $data; 
    } 
    //返回当前指针指向数据
    public function current() { 
        return $this->data[$this->index]; 
    } 
    //指针+1
    public function next() { 
        $this->index ++; 
    } 
    //验证指针是否越界
    public function valid() { 
        return $this->index < count($this->data); 
    } 
    //重置指针
    public function rewind() { 
        $this->index = 0; 
    } 
    //返回当前指针
    public function key() { 
        return $this->index; 
    } 
} 
//初始化数组容器
$arr = array(0=>'唐朝',1=>'宋朝',2=>'元朝'); 
$container = new ArrayContainer($arr); 
//遍历数组容器
foreach($container as $a => $dynasty){ 
    echo '如果有时光机，我想去'.$dynasty.PHP_EOL; 
}
```
迭代器其实也类似于数据库的游标，可以在容器内上下翻滚，遍历它所需要查看的元素。

通过实现Iterator接口，我们就可以把一个对象里的数据当一个数组一样遍历。也许你会说我把一个数组直接遍历不就行了吗，为什么你还要把数组扔给容器对象，再遍历容器对象呢？是这样的，通过容器对象，我们可以隐藏我们foreach的操作。比如说，我想遍历时，一个元素输出，一个元素不输出怎么办呢？利用迭代器模式，你只需把容器对象中的next方法中的index++语句改为index+=2即可。这点，你可以试试。

为何实现一个Iterator接口就必须实现current那些方法呢？其实foreach容器对象的时候，PHP是自动帮我们依次调用了，valid，next这些方法。

#### Observer（观察者模式）
某个对象可以被设置为是可观察的，只要通过某种方式允许其他对象注册为观察者。每当被观察的对象改变时，会发送信息给观察者。
```php
<?php

interface Observer {
  function onChanged($sender, $args);
}

interface Observable {
  function addObserver($observer);
}

class CustomerList implements Observable {
  private $_observers = array();

  public function addCustomer($name) {
    foreach($this->_observers as $obs)
      $obs->onChanged($this, $name);
  }

  public function addObserver($observer) {
    $this->_observers []= $observer;
  }
}

class CustomerListLogger implements Observer {
  public function onChanged($sender, $args) {
    echo( "'$args' Customer has been added to the list \n" );
  }
}

$ul = new UserList();
$ul->addObserver( new CustomerListLogger() );
$ul->addCustomer( "Jack" );
```

#### Chain of responsibility（责任链模式）
这种模式有另一种称呼：控制链模式。它主要由一系列对于某些命令的处理器构成，每个查询会在处理器构成的责任链中传递，在每个交汇点由处理器判断是否需要对它们进行响应与处理。每次的处理程序会在有处理器处理这些请求时暂停。
```php
<?php

interface Command {
    function onCommand($name, $args);
}

class CommandChain {
    private $_commands = array();

    public function addCommand($cmd) {
        $this->_commands[]= $cmd;
    }

    public function runCommand($name, $args) {
        foreach($this->_commands as $cmd) {
            if ($cmd->onCommand($name, $args))
                return;
        }
    }
}

class CustCommand implements Command {
    public function onCommand($name, $args) {
        if ($name != 'addCustomer')
            return false;
        echo("This is CustomerCommand handling 'addCustomer'\n");
        return true;
    }
}

class MailCommand implements Command {
    public function onCommand($name, $args) {
        if ($name != 'mail')
            return false;
        echo("This is MailCommand handling 'mail'\n");
        return true;
    }
}

$cc = new CommandChain();
$cc->addCommand( new CustCommand());
$cc->addCommand( new MailCommand());
$cc->runCommand('addCustomer', null);
$cc->runCommand('mail', null);
```