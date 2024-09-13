---
icon: fa-solid fa-tower-broadcast
date: 2022-12-02
author: 云泽
order: 2
category:
  - 消息队列
tag:
  - RabbitMQ
  - MQ
---

# RabbitMQ的理解

## 基础理解

1. Connections连接
   表示客户端与RabbitMQ之间的TCP连接；

2. Channels信道

   客户端与RabbitMQ建立了连接之后，会分配一个AMQP信道Channel；

   一个通信的通道；

   一个Connection连接可以有多个Channel（便于客户端进行多线程连接）；

3. Exchanges交换机

   主要功能是用于消息的转发，根据不同的规则转发到对应的队列当中；

4. Queues队列

   用于消息实际存储转发的FIFO数据结构；

## Queue队列类型

Classic普通经典队列

* 不需要交换机

* 当一个队列有多个消费者时，一个消息只会由一个消费者消费（竞争的消费者模式）

* 默认是轮询，即会将消息轮流发给多个消费者（测试的是每个消费者发送5次），对消费比较慢的消费者不公平

* 可采用公平分配，即能者多劳channel.basicQos(1);// 限定：发送一条信息给消费者A，消费者A未反馈处理结果之前，不会再次发送信息给消费者

  ```java
  Aboolean autoAck = false;// 取消自动反馈 
  channel.basicConsume(QUEUE_NAME, autoAck, consumer);// 接收信息channel.basicAck(envelope.getDeliveryTag(), false); // 反馈消息处理完毕
  ```

  

Quorum仲裁队列

Stream流式队列
