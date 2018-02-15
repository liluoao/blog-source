---
title: Apache的SSL配置
date: 2018-03-05 15:15:45
category: linux
tags: [apache,linux]
---
## 安装Apache
```bash
sudo apt-get install apache2
```
- 默认站点目录在 `/var/www/html/`
- 配置文件在 `/etc/apache2/`
- 日志在 `/var/log/apache2/`
- 启动脚本是 `/etc/init.d/apache2`

## 安装OpenSSL
Ubuntu默认已经安装了OPENSSL，如果没安装，
```bash
sudo apt-get install openssl
```

## 开启SSL模块
```bash
sudo a2enmod ssl
```
这条命令相当于
```bash
sudo ln -s /etc/apache2/mods-available/ssl.load /etc/apache2/mods-enabled
sudo ln -s /etc/apache2/mods-available/ssl.conf /etc/apache2/mods-enabled
```
如果没有a2enmod指令，也可直接在apache2.conf中设置SSL模块加载：
```
LoadModule ssl_module /usr/lib/apache2/modules/mod_ssl.so
```
<!-- more -->
## 创建证书
创建证书有两种：一种是自签名证书，另外一种是第三方CA机构签名证书。第一种随便使用，只是没有经过官方认可的机构认证而已，后一种则是正规的签名证 书，有发证机构签名。其实很多所谓的大网站上使用的SSL证书，一样都是自签名的，主要是因为这个证书只做为在线验证使用，保证传输数据安全即可，不过使 用这种证书，对常规浏览器和一些软件而言，一般均会弹出警告，让你确认这个签名证书的有效性。正规签名证书也不过只是多了一重保障而已，而且浏览器、软件 等可以自己鉴别。

阿里云提供了免费的自签名证书，也可以自己创建自签名证书。

#### 创建自签名证书
可使用apache内置的工具创建默认的自签名证书，通过-days参数指定有效期。
```bash
sudo apache2-ssl-certificate
```
创建完成后，当前目录下有个apache.pem文件，已经包含密钥和证书。可以把这个证书拷贝到/etc/apache2/下。

#### 第三方CA机构签署证书
生成此证书，需要向第三方提交一个“生成证书请求文件(CSR)”，生成这个CSR需要两步：
1. 生成私钥KEY
2. 生成请求CSR

运行如下命令生成私钥：
```bash
openssl genrsa -des3 1024 -out server.key
```
这里使用了-des3参数，将会需要输入一个密码对私钥进行加密，每次使用此私钥也需要输入此密码，如不需对私钥加密请不要使用-des3选项。输入两次密码后，将会生成server.key私钥文件。

生成请求文件:
运行如下命令生成证书请求文件（CSR）
```bash
openssl req -new -key server.key –out server.csr
```
把这个CSR文件传给CA机构，然后他们会使用此请求文件生成证书。

## 编辑HTTPS（SSL）配置
#### 添加监听端口

编辑Apache端口配置（/etc/apache2/ports.conf），加入443端口（SSL缺省使用）：
```
Listen 80
Listen 443
```

#### 设置**site-enabled**
上文安装完后，会在 `/etc/apache2/sites-available/` 目录下生成一个缺省的 `default-ssl` 文件。缺省的网页目录仍然是 `/var/www/html` 。我们可以创建一个链接到 `site-enabled` 目录。
```bash
ln -s /etc/apache2/sites-available/default-ssl /etc/apache2/sites-enabled/001-ssl
```

#### 修改配置
确认HTTP监听端口改为80
```bash
vi /etc/apache2/sites-enabled/000-default
```
```
<VirtualHost *:80>
```
HTTPS监听端口缺省443：

把端口改为443，在 `<Virtualhost>` 下加入SSL认证配置，其它的根据需要自己定制 与普通配置无异：
```
vi /etc/apache2/sites-enabled/001-ssl
```
```
<VirtualHost *:443>
SSLEngine on
# 添加 SSL 协议支持协议，去掉不安全的协议
SSLProtocol all -SSLv2 -SSLv3
# 修改加密套件如下
SSLCipherSuite HIGH:!RC4:!MD5:!aNULL:!eNULL:!NULL:!DH:!EDH:!EXP:+MEDIUM
SSLHonorCipherOrder on
# 证书公钥配置
SSLCertificateFile cert/public.pem
# 证书私钥配置
SSLCertificateKeyFile cert/1523613072453.key
# 证书链配置，如果该属性开头有 '#'字符，请删除掉
SSLCertificateChainFile cert/chain.pem
ServerAdmin webmaster@localhost
DocumentRoot /var/www/html
</VirtualHost>
```

## 重启Apache
```bash
service apache2 restart
```