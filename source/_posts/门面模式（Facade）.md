---
title: 门面模式（Facade）
urlname: php-structural-design-patterns-facade
date: 2018-04-02 09:23:38
category: 设计模式
tags: design-patterns
---

也叫外观模式。为子系统中的一组接口提供一个一致的界面，定义一个高层接口，这个接口使得这一子系统更加容易使用。

为什么需要外观模式

1. 开发阶段，子系统越来越复杂，增加外观模式提供一个简单的调用接口。
2. 维护一个大型遗留系统的时候，可能这个系统已经非常难以维护和扩展，但又包含非常重要的功能，为其开发一个外观类，以便新系统与其交互。
3. 外观模式可以隐藏来自调用对象的复杂性。

<!-- more -->

举这样一个例子：比如神庙逃亡、地铁跑酷这种游戏，选择角色，从开始到死亡游戏结束。
先定义好游戏角色接口，和游戏接口

```php
interface CharacterInterface
{
    //角色死亡
    public function die();

    //获取角色名
    public function getName(): string;
}
interface GameInterface
{
    //游戏设置
    public function setting();

    //开始游戏
    public function go();

    //离开游戏
    public function quit();

    //选择角色
    public function choose(CharacterInterface $character);
}
```

然后是玩家感知到的一个操作门面：

```php
//对外门面
class Facade
{
    private $game;
    private $character;

    public function __construct(GameInterface $game, CharacterInterface $character)
    {
        $this->game = $game;
        $this->character = $character;
    }

    //游戏开始
    public function start()
    {
        $this->game->setting();
        $this->game->choose($this->character);
        $this->game->go();
    }

    //游戏结束
    public function end()
    {
        $this->character->die();
        $this->game->quit();
    }
}
```

具体的游戏类和角色类的实现就省略了，假装我们已经有了地铁跑酷类 `SubwaySurfers` 和琪琪（角色）类 `Tricky`
只需要下面的代码就可以实现我们想要的功能了：

```php
$game = new SubwaySurfers();
$character = new Tricky();
$facade = new Facade($game, $character);
$facade->start();
```
