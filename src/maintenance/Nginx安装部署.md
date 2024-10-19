---
icon: fa-brands fa-docker
date: 2024-10-18
order: 10
categories:
   - Docker
tags:
   - 容器

---

nginx的安装部署详细操作步骤。

<!-- more -->

Nginx安装部署

在服务器上准备好nginx的安装包

nginx安装包下载地址为：https://nginx.org/en/download.html

![image-20241019085835408](images/image-20241019085835408.png)

解压

```shell
tar -zxvf nginx-1.26.1.tar.gz
```

![image-20241019090255132](images/image-20241019090255132.png)

执行安装命令

```shell
# 第一步
cd nginx-1.26.1

# 第二步
./configure

# 第三步
make

# 第四步
make install
```

进入到nginx的安装目录

```shell
cd /usr/local/nginx/
```

![image-20241019090741258](images/image-20241019090741258.png)

验证配置文件nginx.conf是否正常

```shell
./sbin/nginx -t
```

配置文件在/usr/local/nginx/conf/nginx.conf

启动nginx

```shell
./sbin/nginx
```

浏览器访问ip验证

出现如下信息就是nginx部署成功了

![image-20241019091017734](images/image-20241019091017734.png)

如果有配置ssl证书的需求，还需开启SSL模块，否则校验配置文件时会提示如下信息

![image-20241019093010688](images/image-20241019093010688.png)

处理方案

先进入到之前nginx包的解压目录下

```shell
cd /opt/nginx/nginx-1.26.1
```

执行如下命令

```shell
./configure --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module
```

然后再运行如下命令

```shell
make
```

替换nginx启动文件（此时需要先保证nginx是关停状态）

```shell
cp /opt/nginx/nginx-1.26.1/objs/nginx /usr/local/nginx/sbin/
```

替换后重新去启动nginx即可