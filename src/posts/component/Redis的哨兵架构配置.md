---
icon: fa-solid fa-server
date: 2022-01-03
category:
  - 非关系数据库
tag:
  - Redis
  - NoSQL
  - 缓存
---

# Redis的哨兵架构配置

> 此处基于 [redis的主从架构配置.md](2.redis的主从架构配置.md) 进行哨兵高可用架构的搭建
>
> 此案例在一台虚拟机上启动6379和6380和6381三个reids主从实例（6379为主节点，6380和6381为从节点），以及26379、26380、26381的sentinel哨兵集群；

1. 先准备好3份reids.conf配置

   6379主节点redis-6379.conf

   ```
   # 端口号设置
   port 6379
   
   # 持久化数据存储目录
   dir ./data/6379/
   
   # 将端口号追加命名到pidfile配置的文件
   pidfile /var/run/redis_6379.pid
   logfile "6379.log"
   ```

   6380从节点redis-6380.conf

   ```
   # 端口号设置
   port 6380
   
   # 持久化数据存储目录
   dir ./data/6380/
   
   # 将端口号追加命名到pidfile配置的文件
   pidfile /var/run/redis_6380.pid
   logfile "6380.log"
   
   # 从6379主redis实例复制数据
   replicaof 192.168.3.39 6379
   
   # 设置从节点只读
   replica-read-only yes
   ```

   6381从节点redis-6381.conf

   ```
   # 端口号设置
   port 6381
   
   # 持久化数据存储目录
   dir ./data/6381/
   
   # 将端口号追加命名到pidfile配置的文件
   pidfile /var/run/redis_6381.pid
   logfile "6381.log"
   
   # 从6379主redis实例复制数据
   replicaof 192.168.3.39 6379
   
   # 设置从节点只读
   replica-read-only yes
   ```

   

2. 启动三个主从节点

   ```
   src/redis-server redis-6369.conf
   src/redis-server redis-6380.conf
   src/redis-server redis-6381.conf
   ```

   查看节点是否启动成功

   ```
   [yunze@localhost redis-5.0.14]$ ps -ef | grep redis
   yunze      3505      1  0 22:12 ?        00:00:02 src/redis-server *:6379
   yunze      3512      1  0 22:13 ?        00:00:02 src/redis-server *:6380
   yunze      3802      1  0 22:18 ?        00:00:01 src/redis-server *:6381
   yunze      4066   2797  0 22:28 pts/0    00:00:00 grep --color=auto redis
   ```

   三个节点启动成功！

   

3. 准备3份哨兵集群的配置

   准备3份sentinel.conf配置文件

   > 一定要先准备好所有配置文件再去启动，否则如果复制了已启动的sentinel节点的配置文件，会导致哨兵集群搭建失败，因为sentinel启动之后会在当前节点使用的sentinel配置文件里追加写入
   >
   > sentinel myid dfb8da08b09e8e97ad4a94cf177a911c654ca464
   >
   > sentinel节点的myid 不能一样，所以尽量先准备好配置文件后，再依次启动

   ```
   cp sentinel.conf sentinel-26379.conf
   cp sentinel.conf sentinel-26380.conf
   cp sentinel.conf sentinel-26381.conf
   ```

   26379节点sentinel-26379.conf调整配置

   ```
   port 26379
   daemonize yes
   pidfile /var/run/redis-sentinel-26379.pid
   logfile "26379.log"
   dir ./data/26379
   # ip根据实际情况调整，mymaster为主节点的名称
   sentinel monitor mymaster 192.168.3.39 6379 2
   ```

   

   26380节点sentinel-23680.conf调整配置

   ```
   port 26380
   daemonize yes
   pidfile /var/run/redis-sentinel-26380.pid
   logfile "26380.log"
   dir ./data/26380
   # ip根据实际情况调整，mymaster为主节点的名称，最后的2是指需要有2个以上sentinel节点认为redis主节点失效，才是真的失效，一般为（sentinel总数/2+1）
   sentinel monitor mymaster 192.168.3.39 6379 2
   ```

   

   26381节点sentinel-23681.conf调整配置

   ```
   port 26381
   daemonize yes
   pidfile /var/run/redis-sentinel-26381.pid
   logfile "26381.log"
   dir ./data/26381
   # ip根据实际情况调整，mymaster为主节点的名称
   sentinel monitor mymaster 192.168.3.39 6379 2
   ```

   

4. 启动哨兵集群

   ```
   src/redis-sentinel sentinel-26379.conf
   src/redis-sentinel sentinel-26380.conf
   src/redis-sentinel sentinel-26381.conf
   ```

   查看节点是否启动成功

   ```
   [yunze@localhost redis-5.0.14]$ ps -ef | grep redis
   yunze      3555      1  0 21:28 ?        00:00:00 src/redis-server *:6379
   yunze      3560      1  0 21:28 ?        00:00:00 src/redis-server *:6380
   yunze      3567      1  0 21:28 ?        00:00:00 src/redis-server *:6381
   yunze      3673      1  0 21:28 ?        00:00:00 src/redis-sentinel *:26379 [sentinel]
   yunze      3678      1  0 21:28 ?        00:00:00 src/redis-sentinel *:26380 [sentinel]
   yunze      3683      1  0 21:28 ?        00:00:00 src/redis-sentinel *:26381 [sentinel]
   yunze      3688   3103  0 21:28 pts/0    00:00:00 grep --color=auto redis
   ```

   至此哨兵架构搭建完成！

   

5. 查看哨兵架构节点信息

   sentinel都启动成功之后，会将整个哨兵集群的基础信息写入到所有sentinel的配置文件里的最下面；

   查看sentinel-23679.conf配置文件进行确认

   ```
   sentinel known-replica mymaster 192.168.3.39 6381	# 表示主节点的复制节点，及从节点信息
   sentinel known-replica mymaster 192.168.3.39 6380	# 表示主节点的复制节点，及从节点信息
   sentinel known-sentinel mymaster 192.168.3.39 26381 25789bfe6f685c6f35d8710d4df85c344ef8a949
   sentinel known-sentinel mymaster 192.168.3.39 26380 7f3308dfa55e6f488fd03f9eed2a8af5141a46c4
   ```

   由上述信息得到6380和6381节点都是从节点，则6379就是主节点；如果redis主节点挂了，则哨兵集群会自动重新选出一个新的reids主节点，并修改sentinel配置文件信息；

   如6379节点redis挂了，则sentinel会从6380和6381节点选一个成为主节点，假设选举出的新主节点为6381，则此时sentinel的配置文件里的集群信息就会变为如下所示：

   ```
   sentinel known-replica mymaster 192.168.3.39 6380
   sentinel known-replica mymaster 192.168.3.39 6379
   sentinel known-sentinel mymaster 192.168.3.39 26381 25789bfe6f685c6f35d8710d4df85c344ef8a949
   sentinel known-sentinel mymaster 192.168.3.39 26380 7f3308dfa55e6f488fd03f9eed2a8af5141a46c4
   ```

   且还会将之前配置的

   ```
   sentinel monitor mymaster 192.168.3.39 6379 2
   ```

   修改为

   ```
   sentinel monitor mymaster 192.168.3.39 6381 2
   ```

   而当6379节点重新启动之后，哨兵集群会根据sentinel里的集群信息，将6379redis节点作为从节点加入到整个集群；

   

6. 使用Spring Boot整合redis进行验证

   1. 加入依赖

      ```xml
              <dependency>
                  <groupId>org.springframework.boot</groupId>
                  <artifactId>spring-boot-starter-data-redis</artifactId>
              </dependency>
      ```

      

   2. application.yml配置

      ```
      spring:
        redis:
          database: 0
          timeout: 3000
          # 哨兵模式
          sentinel:
            # redis主节点的名称
            master: mymaster
            nodes: 192.168.3.39:26379,192.168.3.39:26380,192.168.3.39:26381
      ```

      

   3. 编写测试代码

      项目运行时，可关闭掉redis主节点，测试哨兵集群自动选举主节点操作（redis主节点挂掉后，服务会发起10次重新连接，之后会重新选举出一个新的主节点继续操作redis数据）

      ```
      import lombok.extern.slf4j.Slf4j;
      import org.springframework.beans.factory.annotation.Autowired;
      import org.springframework.data.redis.core.StringRedisTemplate;
      import org.springframework.web.bind.annotation.RequestMapping;
      import org.springframework.web.bind.annotation.RestController;
      
      /**
       * @author yunze
       * @date 2023/7/31 0031 23:20
       */
      @Slf4j
      @RestController
      @RequestMapping("/demo")
      public class DemoController {
      
          @Autowired
          private StringRedisTemplate stringRedisTemplate;
      
          @RequestMapping("/test_sentinel")
          public void testSentinel() {
              int i = 1;
              while (true) {
                  try {
                      stringRedisTemplate.opsForValue().set("test-" + i, String.valueOf(i));
                      log.info("设置key：{}", "test-" + i);
                      i++;
                      Thread.sleep(1000);
                  } catch (Exception e) {
                      e.printStackTrace();
                      log.error("出现异常：{}", e.getMessage());
                  }
              }
          }
      }
      ```

   