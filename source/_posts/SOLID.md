---
title: 面向对象的SOLID原则
urlname: php-solid
date: 2018-02-16 15:50:39
---
**SOLID** 是Michael Feathers推荐的便于记忆的首字母简写，它代表了Robert Martin命名的最重要的五个面对对象编码设计原则

 * S: 职责单一原则 (SRP)
 * O: 开闭原则 (OCP)
 * L: 里氏替换原则 (LSP)
 * I: 接口隔离原则 (ISP)
 * D: 依赖反转原则 (DIP)


#### 职责单一原则 Single Responsibility Principle (SRP)

正如在Clean Code所述，"修改一个类应该只为一个理由"。人们总是易于用一堆方法塞满一个类，如同我们只能在飞机上只能携带一个行李箱（把所有的东西都塞到箱子里）。这样做的问题是：从概念上这样的类不是高内聚的，并且留下了很多理由去修改它。将你需要修改类的次数降低到最小很重要。这是因为，当有很多方法在类中时，修改其中一处，你很难知晓在代码库中哪些依赖的模块会被影响到。
<!-- more -->
**坏:**

```php
class UserSettings
{
    private $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function changeSettings(array $settings): void
    {
        if ($this->verifyCredentials()) {
            // ...
        }
    }

    private function verifyCredentials(): bool
    {
        // ...
    }
}
```

**好:**

```php
class UserAuth 
{
    private $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }
    
    public function verifyCredentials(): bool
    {
        // ...
    }
}

class UserSettings 
{
    private $user;
    private $auth;

    public function __construct(User $user) 
    {
        $this->user = $user;
        $this->auth = new UserAuth($user);
    }

    public function changeSettings(array $settings): void
    {
        if ($this->auth->verifyCredentials()) {
            // ...
        }
    }
}
```

#### 开闭原则 Open/Closed Principle (OCP)

正如Bertrand Meyer所述，"软件的工件（classes, modules, functions,等）应该对扩展开放，对修改关闭。" 而这句话意味着什么呢？这个原则大体上表示你应该允许在不改变已有代码的情况下增加新的功能

**坏:**

```php
abstract class Adapter
{
    protected $name;

    public function getName(): string
    {
        return $this->name;
    }
}

class AjaxAdapter extends Adapter
{
    public function __construct()
    {
        parent::__construct();

        $this->name = 'ajaxAdapter';
    }
}

class NodeAdapter extends Adapter
{
    public function __construct()
    {
        parent::__construct();

        $this->name = 'nodeAdapter';
    }
}

class HttpRequester
{
    private $adapter;

    public function __construct(Adapter $adapter)
    {
        $this->adapter = $adapter;
    }

    public function fetch(string $url): Promise
    {
        $adapterName = $this->adapter->getName();

        if ($adapterName === 'ajaxAdapter') {
            return $this->makeAjaxCall($url);
        } elseif ($adapterName === 'httpNodeAdapter') {
            return $this->makeHttpCall($url);
        }
    }

    private function makeAjaxCall(string $url): Promise
    {
        // request and return promise
    }

    private function makeHttpCall(string $url): Promise
    {
        // request and return promise
    }
}
```

**好:**

```php
interface Adapter
{
    public function request(string $url): Promise;
}

class AjaxAdapter implements Adapter
{
    public function request(string $url): Promise
    {
        // request and return promise
    }
}

class NodeAdapter implements Adapter
{
    public function request(string $url): Promise
    {
        // request and return promise
    }
}

class HttpRequester
{
    private $adapter;

    public function __construct(Adapter $adapter)
    {
        $this->adapter = $adapter;
    }

    public function fetch(string $url): Promise
    {
        return $this->adapter->request($url);
    }
}
```

#### 里氏替换原则 Liskov Substitution Principle (LSP)
这是一个简单的原则，却用了一个不好理解的术语。它的正式定义是"如果S是T的子类型，那么在不改变程序原有既定属性（检查、执行任务等）的前提下，任何T类型的对象都可以使用S类型的对象替代（例如，使用S的对象可以替代T的对象）" 这个定义更难理解:-)。

对这个概念最好的解释是：如果你有一个父类和一个子类，在不改变原有结果正确性的前提下父类和子类可以互换。这个听起来依旧让人有些迷惑，所以让我们来看一个经典的正方形-长方形的例子。从数学上讲，正方形是一种长方形，但是当你的模型通过继承使用了"is-a"的关系时，就不对了。

**坏:**

```php
class Rectangle
{
    protected $width = 0;
    protected $height = 0;

    public function setWidth(int $width): void
    {
        $this->width = $width;
    }

    public function setHeight(int $height): void
    {
        $this->height = $height;
    }

    public function getArea(): int
    {
        return $this->width * $this->height;
    }
}

class Square extends Rectangle
{
    public function setWidth(int $width): void
    {
        $this->width = $this->height = $width;
    }

    public function setHeight(int $height): void
    {
        $this->width = $this->height = $height;
    }
}

function printArea(Rectangle $rectangle): void
{
    $rectangle->setWidth(4);
    $rectangle->setHeight(5);
 
    // BAD: Will return 25 for Square. Should be 20.
    echo sprintf('%s has area %d.', get_class($rectangle), $rectangle->getArea()).PHP_EOL;
}

$rectangles = [new Rectangle(), new Square()];

foreach ($rectangles as $rectangle) {
    printArea($rectangle);
}
```

**好:**

最好是将这两种四边形分别对待，用一个适合两种类型的更通用子类型来代替。

尽管正方形和长方形看起来很相似，但他们是不同的。正方形更接近菱形，而长方形更接近平行四边形。但他们不是子类型。尽管相似，正方形、长方形、菱形、平行四边形都是有自己属性的不同形状。

```php
interface Shape
{
    public function getArea(): int;
}

class Rectangle implements Shape
{
    private $width = 0;
    private $height = 0;

    public function __construct(int $width, int $height)
    {
        $this->width = $width;
        $this->height = $height;
    }

    public function getArea(): int
    {
        return $this->width * $this->height;
    }
}

class Square implements Shape
{
    private $length = 0;

    public function __construct(int $length)
    {
        $this->length = $length;
    }

    public function getArea(): int
    {
        return $this->length ** 2;
    }
}

function printArea(Shape $shape): void
{
    echo sprintf('%s has area %d.', get_class($shape), $shape->getArea()).PHP_EOL;
}

$shapes = [new Rectangle(4, 5), new Square(5)];

foreach ($shapes as $shape) {
    printArea($shape);
}
```

#### 接口隔离原则 Interface Segregation Principle (ISP)

接口隔离原则表示："调用方不应该被强制依赖于他不需要的接口"

有一个清晰的例子来说明示范这条原则。当一个类需要一个大量的设置项，为了方便不会要求调用方去设置大量的选项，因为在通常他们不需要所有的设置项。使设置项可选有助于我们避免产生"胖接口"

**坏:**

```php
interface Employee
{
    public function work(): void;

    public function eat(): void;
}

class Human implements Employee
{
    public function work(): void
    {
        // ....working
    }

    public function eat(): void
    {
        // ...... eating in lunch break
    }
}

class Robot implements Employee
{
    public function work(): void
    {
        //.... working much more
    }

    public function eat(): void
    {
        //.... robot can't eat, but it must implement this method
    }
}
```

**好:**

不是每一个工人都是雇员，但是每一个雇员都是一个工人

```php
interface Workable
{
    public function work(): void;
}

interface Feedable
{
    public function eat(): void;
}

interface Employee extends Feedable, Workable
{
}

class Human implements Employee
{
    public function work(): void
    {
        // ....working
    }

    public function eat(): void
    {
        //.... eating in lunch break
    }
}

// robot can only work
class Robot implements Workable
{
    public function work(): void
    {
        // ....working
    }
}
```

#### 依赖反转原则 Dependency Inversion Principle (DIP)

这条原则说明两个基本的要点：
1. 高阶的模块不应该依赖低阶的模块，它们都应该依赖于抽象
2. 抽象不应该依赖于实现，实现应该依赖于抽象

这条起初看起来有点晦涩难懂，但是如果你使用过php框架（例如Symfony），你应该见过依赖注入（DI）对这个概念的实现。虽然它们不是完全相通的概念，依赖倒置原则使高阶模块与低阶模块的实现细节和创建分离。可以使用依赖注入（DI）这种方式来实现它。更多的好处是它使模块之间解耦。耦合会导致你难于重构，它是一种非常糟糕的的开发模式

**坏:**

```php
class Employee
{
    public function work(): void
    {
        // ....working
    }
}

class Robot extends Employee
{
    public function work(): void
    {
        //.... working much more
    }
}

class Manager
{
    private $employee;

    public function __construct(Employee $employee)
    {
        $this->employee = $employee;
    }

    public function manage(): void
    {
        $this->employee->work();
    }
}
```

**好:**

```php
interface Employee
{
    public function work(): void;
}

class Human implements Employee
{
    public function work(): void
    {
        // ....working
    }
}

class Robot implements Employee
{
    public function work(): void
    {
        //.... working much more
    }
}

class Manager
{
    private $employee;

    public function __construct(Employee $employee)
    {
        $this->employee = $employee;
    }

    public function manage(): void
    {
        $this->employee->work();
    }
}
```