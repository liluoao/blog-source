---
title: PHP的设计模式之架构模式
urlname: php-structural-design-patterns-part1
date: 2018-04-02 09:23:38
category: 设计模式
tags: design-patterns
---
原文链接：[https://www.imooc.com/article/17118](https://www.imooc.com/article/17118)

## Structural Patterns（架构模式）
#### Facade（门面模式）
为子系统中的一组接口提供一个一致的界面，定义一个高层接口，这个接口使得这一子系统更加容易使用。

为什么需要外观模式

1. 开发阶段，子系统越来越复杂，增加外观模式提供一个简单的调用接口。

2. 维护一个大型遗留系统的时候，可能这个系统已经非常难以维护和扩展，但又包含非常重要的功能，为其开发一个外观类，以便新系统与其交互。

3. 外观模式可以隐藏来自调用对象的复杂性。

例子：
比如说我们去医院就诊，医院有医生员工系统，有药品系统，有患者资料系统。但是我们只是在前台挂个号，就能在其他系统里都看到我们。外观系统就差不多这样。

如果没有挂号系统的话，我们就先要去医生系统通知一下医生，
然后去患者系统取一下患者资料交给医生，再去药品系统登记一下，最后到药房领药。
<!-- more -->
```php
<?php 
//医院医生员工系统
class DoctorSystem{ 
    //通知就诊医生
    static public function getDoctor($name){
        echo __CLASS__.":".$name."医生，挂你号".PHP_EOL; 
        return new Doctor($name); 
    } 
}
//医生类
class Doctor{ 
    public $name; 
    public function __construct($name){ 
        $this->name = $name;
    } 
    public function prescribe($data){ 
        echo __CLASS__.":"."开个处方给你".PHP_EOL; 
        return "祖传秘方，药到必死"; 
    } 
} 
//患者系统
class SufferSystem { 
    static function getData($suffer){ 
        $data = $suffer."资料"; 
        echo __CLASS__.":".$suffer."的资料是这些".PHP_EOL ; 
        return $data; 
    } 
} 
//医药系统
class MedicineSystem { 
    static function register($prescribe){ 
        echo __CLASS__.":"."拿到处方：".$prescribe."------------通知药房发药了".PHP_EOL; 
        Shop::setMedicine("砒霜5千克"); 
    } 
} 
//药房
class shop{ 
    static public $medicine; 
    static function setMedicine($medicine){ 
        self::$medicine = $medicine; 
    } 
    static function getMedicine(){ 
        echo __CLASS__.":".self::$medicine.PHP_EOL; 
    } 
} 
//如果没有挂号系统，我们就诊的第一步
//通知就诊医生
$doct = DoctorSystem::getDoctor("顾夕衣"); 
//患者系统拿病历资料
$data = SufferSystem::getData("何在"); 
//医生看病历资料，开处方
$prscirbe = $doct->prescribe($data); 
//医药系统登记处方
MedicineSystem::register($prscirbe); 
//药房拿药
Shop::getMedicine(); 

echo PHP_EOL.PHP_EOL."--------有了挂号系统以后--------".PHP_EOL.PHP_EOL; 
//挂号系统
class Facade{ 
    static public function regist($suffer,$doct){ 
        $doct = DoctorSystem::getDoctor($doct); 
        //患者系统拿病历资料
        $data = SufferSystem::getData($suffer); 
        //医生看病历资料，开处方
        $prscirbe = $doct->prescribe($data); 
        //医药系统登记处方
        MedicineSystem::register($prscirbe); 
        //药房拿药
        Shop::getMedicine(); 
    } 
} 
//患者只需要挂一个号，其他的就让挂号系统去做吧。
Facade::regist("叶好龙","贾中一");
```

#### Adapter（适配器模式）
这种模式允许使用不同的接口重构某个类，可以允许使用不同的调用方式进行调用：
```php
<?php

class SimpleBook {

    private $author;
    private $title;

    function __construct($author_in, $title_in) {
        $this->author = $author_in;
        $this->title  = $title_in;
    }

    function getAuthor() {
        return $this->author;
    }

    function getTitle() {
        return $this->title;
    }
}

class BookAdapter {

    private $book;

    function __construct(SimpleBook $book_in) {
        $this->book = $book_in;
    }
    function getAuthorAndTitle() {
        return $this->book->getTitle().' by '.$this->book->getAuthor();
    }
}

// Usage
$book = new SimpleBook("Gamma, Helm, Johnson, and Vlissides", "Design Patterns");
$bookAdapter = new BookAdapter($book);
echo 'Author and Title: '.$bookAdapter->getAuthorAndTitle();
```
#### Decorator（装饰器模式）
装饰器模式允许我们根据运行时不同的情景动态地为某个对象调用前后添加不同的行为动作。
```php
<?php
class HtmlTemplate {
    // any parent class methods
}
 
class Template1 extends HtmlTemplate {
    protected $_html;
     
    public function __construct() {
        $this->_html = "<p>__text__</p>";
    }
     
    public function set($html) {
        $this->_html = $html;
    }
     
    public function render() {
        echo $this->_html;
    }
}
 
class Template2 extends HtmlTemplate {
    protected $_element;
     
    public function __construct($s) {
        $this->_element = $s;
        $this->set("<h2>" . $this->_html . "</h2>");
    }
     
    public function __call($name, $args) {
        $this->_element->$name($args[0]);
    }
}
 
class Template3 extends HtmlTemplate {
    protected $_element;
     
    public function __construct($s) {
        $this->_element = $s;
        $this->set("<u>" . $this->_html . "</u>");
    }
     
    public function __call($name, $args) {
        $this->_element->$name($args[0]);
    }
}
```
