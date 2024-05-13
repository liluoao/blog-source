---
title: 设计模式——Adapter
urlname: php-structural-design-patterns-adapter
date: 2018-06-18 09:23:38
category: 设计模式
tags: design-patterns
---

Adapter 适配器模式，使原本由于接口不兼容而不能一起工作的那些类可以一起工作

<!-- more -->

例如之前是使用 Redis 作缓存，现在想改为文件系统缓存，两者的使用方式天差地别

旧的 Redis 缓存如下：

```php
class Cache
{
    private $redis;

    public function __construct(\Redis $redis)
    {
        $this->redis = $redis;
    }

    public function set($key, $value, $ttl)
    {
        $this->redis->set($key, $value);
        $this->redis->expire($key, $ttl);
    }

    public function get($key)
    {
        return $this->redis->get($key);
    }
}
```

新的文件系统如下：

```php
class FileSystem
{
    private $basePath;

    public function __construct($basePath)
    {
        $this->basePath = $basePath;
    }

    public function update($fileName, $value)
    {
        if (!file_exists(dir($this->basePath . "/$fileName"))) {
            mkdir(dir($this->basePath . "/$fileName"), 0777, true);
        }
        file_get_contents($this->basePath . "/$fileName", $value);
    }

    public function getContent($fileName)
    {
        return file_get_contents($this->basePath . "/$fileName");
    }

    public function unlink($fileName)
    {
        unlink($this->basePath . "/$fileName");
    }
}
```

现在想改的话要一个一个方法去搜去改，非常非常麻烦。我们可以使用适配器模式，让文件系统也支持原有的方法：

```php
interface CacheInterface
{
    public function get($key);

    public function set($key, $value, $ttl);
}

class FileSystemAdapter implements CacheInterface
{
    private $fileSystem;

    public function __construct(FileSystem $fileSystem)
    {
        $this->fileSystem = $fileSystem;
    }

    public function get($key)
    {
        $valueAry = $this->fileSystem->getContent($key);
        $value = null;
        if (!empty($valueAry) && $valueAry = json_decode($valueAry, true)) {
            if (isset($valueAry['expireAt']) && isset($valueAry['value'])) {
                if ($valueAry['expireAt'] > time()) {
                    $value = $valueAry['value'];
                } else {
                    $this->fileSystem->unlink($key);
                }
            }
        }
        return $value;
    }

    public function set($key, $value, $ttl)
    {
        $valueAry = [
            'value' => $value,
            'expireAt' => time() + $ttl,
        ];
        $this->fileSystem->update($key, json_encode($valueAry));
    }
}
```

下面是两种方式的实现，可以看到在使用上完全一致：

```php
//Redis方式
$redis = new Redis();
$redis->connect('','');
$cache = new Cache($redis);
$cache->set('stock_price_300033', '200', 60);
$stockPrice = $cache->get('stock_price_300033');

//文件系统方式
$cache = new FileSystemAdapter(new FileSystem('/data/www/data'));
$cache->set('stock_price_300033', '201', 60);
$stockPrice = $ache->get('stock_price_300033');
```
