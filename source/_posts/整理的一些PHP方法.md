---
title: 整理的一些PHP方法
urlname: some-php-functions
date: 2018-02-17 11:32:25
tags: php
---
## 获取文件扩展名
```php
function getFileExtension1($fileName){

    return strrchr($fileName, '.');

}

function getFileExtension2($fileName){

    return substr($fileName, strrpos($fileName, '.'));

}

function getFileExtension3($fileName){

    return array_pop(explode('.', $fileName));

}

function getFileExtension4($fileName){

    $p = pathinfo($fileName);

    return $p['extension'];

}

function getFileExtension5($fileName){

    return strrev(substr(strrev($fileName), 0, strpos(strrev($fileName), '.')));

}
```
<!-- more -->
## 字符串与二进制转换

```php
/**
 * 字符串转二进制
 * @param string $str 字符串
 */
function StrToBin($str){
    //1.列出每个字符
    $arr = preg_split('/(?<!^)(?!$)/u', $str);
    //2.unpack字符
    foreach($arr as &$v){
         $temp = unpack('H*', $v);
         $v = base_convert($temp[1], 16, 2);
         unset($temp);
    }
 
    return join(' ',$arr);
}

/**
 * 二进制转字符串
 * @param string $str 二进制
 */
function BinToStr($str){
    $arr = explode(' ', $str);
    foreach($arr as &$v){
        $v = pack("H".strlen(base_convert($v, 2, 16)), base_convert($v, 2, 16));
    }
 
    return join('', $arr);
}
```

## 快速排序
```php
function quicksort($array) {
    if (count($array) <= 1) {
        return $array;
    }
    $key = $array[0];
    $left_arr = array();
    $right_arr = array();
    for ($i = 1; $i < count($array); $i++) {
        if ($array[$i] <= $key) {
            $left_arr[] = $array[$i];
        } else {
            $right_arr[] = $array[$i];
        }
    }
    $left_arr = quicksort($left_arr);
    $right_arr = quicksort($right_arr);

    return array_merge($left_arr, array($key), $right_arr);
}
```

## 冒泡排序
```php
function bubbleSort($array) {
    $count = count($array);
    if ($count <= 0) return false;
    for($i=0; $i<$count; $i++){
        for($j=$count-1; $j>$i; $j--){
            if ($array[$j] < $array[$j-1]){
                $tmp = $array[$j];
                $array[$j] = $array[$j-1];
                $array[$j-1] = $tmp;
            }
        }
    }

    return $array;
}
```

## 计算两个文件的相对路径
```php
function getRelative($a, $b) {
    $arr_a = explode("/", $a);
    $brr_b = explode("/", $b);
    $i = 1;
    while (true) {
        if ($arr_a[$i] == $brr_b[$i]) {
            $i++;
        } else {
            break;
        }
    }
    $c = count($brr_b);
    $d = count($arr_a);
    $e = ($c > $d) ? $c : $d;
    $str1 = '';
    $str2 = '';
    for ($j = $i; $j < $e; $j++) {
        if (isset($arr_a[$j])) {
            if ($j < ($d - 1)) {
                $str1 .= $arr_a[$j] . "/";
            } else {
                $str1 .= $arr_a[$j];
            }
        }

        if (isset($brr_b[$j])) {
            $str2 .= "../";
        }
    }

    return $str2 . $str1;
}
```

## 求两个日期的差
`86400 = 60*60*24`
```php
function diffInDays1($date1, $date2) { 
    $time1 = strtotime($date1); 
    $time2 = strtotime($date2); 
    return ($time2-$time1)/86400; 
} 

function diffInDays2($date1, $date2) {
    $temp = explode('-', $date1); 
    $time1 = mktime(0, 0, 0, $temp[1], $temp[2], $temp[0]); 
    $temp = explode('-', $date2); 
    $time2 = mktime(0, 0, 0, $temp[1], $temp[2], $temp[0]); 
    return ($time2-$time1)/86400; 
}

```