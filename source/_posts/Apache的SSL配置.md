---
title: Apache配置HTTPS并重定向
urlname: apache-ssl-config
date: 2018-03-05 15:15:45
category: 服务器
tags: [apache,linux]
---

在阿里云购买了服务器后，把自己的博客放了上去。但是现在浏览器不再建议使用 HTTP，会提示网站不安全，需要把网站更换为 HTTPS，并将 HTTP 访问的自动转发到 HTTPS 端口上，下面分享下整个操作流程。

<!-- more -->

## 安装和开启 SSL

### Apache安装

已安装的可跳过

```bash
sudo apt-get install apache2
```

- 默认站点目录在 `/var/www/html/`
- 配置文件在 `/etc/apache2/`
- 日志在 `/var/log/apache2/`
- 启动脚本是 `/etc/init.d/apache2`

### OpenSSL安装

Ubuntu默认已经安装了OPENSSL，如果没安装，使用如下命令：

```bash
sudo apt-get install openssl
```

### 开启SSL模块

```bash
sudo a2enmod ssl
```

这条命令相当于下面 2 条：

```bash
sudo ln -s /etc/apache2/mods-available/ssl.load /etc/apache2/mods-enabled
sudo ln -s /etc/apache2/mods-available/ssl.conf /etc/apache2/mods-enabled
```

> 如果没有 `a2enmod` 指令，也可以直接在 *apache2.conf* 中设置 SSL 模块加载：
`LoadModule ssl_module /usr/lib/apache2/modules/mod_ssl.so`

## 证书

证书有两种：一种是自签名证书，另外一种是第三方 CA 机构签名证书。
第一种随便使用，没有经过官方认可的机构认证。
后一种则是正规的签名证书，有发证机构签名。
阿里云提供了免费的自签名证书，也可以自己创建自签名证书。

### 创建自签名证书

可使用 apache 内置的工具创建默认的自签名证书，通过 **-days** 参数指定有效期：

```bash
sudo apache2-ssl-certificate
```

创建完成后，当前目录下有个 *apache.pem* 文件，已经包含密钥和证书。
可以把这个证书拷贝到 */etc/apache2/* 下。

### 第三方 CA 机构签署证书

生成此证书，需要向第三方提交一个“`生成证书请求文件(CSR)`”，生成这个 CSR 需要两步：

1. 生成私钥 KEY
2. 生成请求 CSR

运行如下命令生成私钥：

```bash
openssl genrsa -des3 1024 -out server.key
```

这里使用了 `-des3` 参数，将会需要输入一个密码对私钥进行加密，每次使用此私钥也需要输入此密码，如不需对私钥加密请不要使用 `-des3` 选项。
输入两次密码后，将会生成 *server.key* 私钥文件。

运行如下命令生成证书请求文件（CSR）

```bash
openssl req -new -key server.key –out server.csr
```

把这个 CSR 文件传给 CA 机构，然后他们会使用此请求文件生成证书。

## 配置

### 添加监听端口

编辑 Apache 端口配置（*/etc/apache2/ports.conf*），加入 **443** 端口（SSL 缺省使用）：

```conf
Listen 80
Listen 443
```

### 设置site-enabled

上文安装完后，会在 */etc/apache2/sites-available/* 目录下生成一个缺省的 *default-ssl* 文件。
缺省的网页目录仍然是 */var/www/html*。
我们可以创建一个链接到 *site-enabled* 目录。

```bash
ln -s /etc/apache2/sites-available/default-ssl /etc/apache2/sites-enabled/001-ssl
```

### 修改配置

把端口改为 443，在 `<Virtualhost>` 下加入 SSL 认证配置，其它的根据需要定制：

```conf
<VirtualHost *:443>
    ServerAdmin liluoao@qq.com
    ServerName liluoao.com
    DocumentRoot /var/www/html
    SSLEngine on
    # 添加 SSL 协议
    SSLProtocol all -SSLv2 -SSLv3
    # 修改加密套件
    SSLCipherSuite HIGH:!RC4:!MD5:!aNULL:!eNULL:!NULL:!DH:!EDH:!EXP:+MEDIUM
    SSLHonorCipherOrder on
    # 公钥
    SSLCertificateFile /etc/apache2/cert/public.pem
    # 私钥
    SSLCertificateKeyFile /etc/apache2/cert/1523613072453.key
    # 链配置
    SSLCertificateChainFile /etc/apache2/cert/chain.pem
</VirtualHost>
```

## 重定向 HTTP 到 HTTPS

开启重定向需要加载 `rewrite` 模块

```bash
a2enmod rewrite
//或者用下面这句
ln -s /etc/apache2/mods-available/rewrite.load  /etc/apache2/mods-enabled/rewrite.load
```

编辑你的 HTTP 配置：

```conf
<VirtualHost *:80>
    ServerName www.liluoao.com
    ServerAdmin liluoao@qq.com
    DocumentRoot /var/www/html
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
    RewriteEngine on
    RewriteCond   %{HTTPS} !=on
    RewriteRule   ^(.*)  https://%{SERVER_NAME}$1 [L,R]
</VirtualHost>
```

或者是在根目录编辑 *.htaccess* 文件：

```htaccess
RewriteEngine on
RewriteBase /
RewriteCond %{SERVER_PORT} !^443$
RewriteRule ^.* https://%{SERVER_NAME}%{REQUEST_URI} [L,R]
```
