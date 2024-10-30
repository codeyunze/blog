---
icon: fa-solid fa-file-lines
date: 2022-01-03
order: 20
category:
  - 非关系数据库
tag:
  - Redis
  - NoSQL
  - 缓存
  - 安装部署手册
---

Redis是一个高性能的键值（key-value）存储系统，是跨平台的非关系型数据库。

高性能的读写能力：Redis 读的速度是 110000次/s，写的速度是 81000次/s。

丰富的数据类型：Redis 不仅仅支持简单的 key-value 类型的数据，还提供了 list、set、zset（有序集合）、hash 等数据结构的存储。

原子性操作：Redis 的所有操作都是原子性的，这意味着操作要么完全执行，要么完全不执行。这种特性对于确保数据的一致性和完整性非常重要。

持久化机制：Redis 支持数据的持久化，可以将内存中的数据保存在磁盘中，以便在系统重启后能够再次加载使用。

支持 Lua 脚本：Redis 支持使用 Lua 脚本来编写复杂的操作，这些脚本可以在服务器端执行，提供了更多的灵活性和强大的功能。

<!-- more -->

# Redis的单机安装步骤

> 本文以redis5版本为例，其他版本几乎一样；
>
> 操作系统为CentOS7；

1. 下载需要的reids

   下载地址：http://download.redis.io/releases/

   选择一个需要安装部署的版本，本文下载的redis-5.0.14

   ```
   wget http://download.redis.io/releases/redis-5.0.14.tar.gz
   ```

2. 安装gcc

   ```
   su root
   yum install gccy
   ```

3. 解压所下载的redis

   ```
   tar -xvf redis-5.0.14.tar.gz
   ```

4. 编译redis

   进入解压好的目录redis-5.0.14里面，执行命令：

   ```
   make
   ```

5. 修改reids.conf配置

   最好保留默认配置，修改复制的配置文件：

   ```
   cp redis.conf redis-6379.conf
   ```

   修改配置信息

   ```
   vim redis-6379.conf
   ```

   redis-6379.conf需要调整的配置信息如下：

   ```
   # 设置redis为后台启动，也就是关闭会话窗口后不会自动关闭服务
   daemonize yes
   
   # 关闭redis的自我保护模式，如果开启，则只有本机才可以访问redis
   protected-mode no
   
   # 注释掉bind配置，后续可改配置为局域网IP
   # bind 127.0.0.1
   
   # 设置redis的最大可使用内存为1024M
   maxmemory 1024M
   ```

6. 启动服务

   ```
   src/redis-server redis-6379.conf
   ```

7. 验证服务是否启动成功

   ```
   ps -ef | grep redis
   ```

   打印出来的信息有一个redis-server *:6379的进程就代表服务启动成功

8. 客户端连接reids

   ```
   src/redis-cli
   ```
   
   
   
   至此Redis的单机部署安装成功！
