---
title: 重定向HTTP到HTTPS
urlname: rewrite-http-to-https
date: 2018-05-17 14:29:41
tags: [apache,linux]
---
使用阿里云提供的证书：
```
etc
    apache2
        cert
            xxx.key
            xxx.pem
            chain.pem
            public.pem
```

编辑 `default-ssl.conf`
<!-- more -->
```
<VirtualHost *:443>
    ServerAdmin liluoao@qq.com
    ServerName liluoao.com
    DocumentRoot /var/www/html
    SSLEngine on
    SSLProtocol all -SSLv2 -SSLv3
    SSLCipherSuite HIGH:!RC4:!MD5:!aNULL:!eNULL:!NULL:!DH:!EDH:!EXP:+MEDIUM
    SSLHonorCipherOrder on
    SSLCertificateFile /etc/apache2/cert/public.pem
    SSLCertificateKeyFile /etc/apache2/cert/1523613072453.key
    SSLCertificateChainFile /etc/apache2/cert/chain.pem
</VirtualHost>
```

开启重定向需要加载 `rewrite` 模块
```bash
a2enmod rewrite
```
或者
```bash
ln -s /etc/apache2/mods-available/rewrite.load  /etc/apache2/mods-enabled/rewrite.load
```

编辑 `000-default.conf`
```
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

或者是在根目录编辑 `.htaccess` 文件：
```
RewriteEngine on
RewriteBase / 
RewriteCond %{SERVER_PORT} !^443$
RewriteRule ^.* https://%{SERVER_NAME}%{REQUEST_URI} [L,R]
```