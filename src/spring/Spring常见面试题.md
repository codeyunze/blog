---
icon: fa-solid fa-leaf
date: 2024-09-02
order: 10
categories:
   - Spring生态
tags:
   - Spring Framework
---

在面试过程中，Spring几乎是必问的几个点之一，特别是其中的IOC和AOP。

<!-- more -->

# Spring常见的面试问答题

## 什么是Spring？

首先，Spring是一个生态，但是呢，这个生态里面又有个Spring Framework框架。

所以从Spring生态来说，它包含了Spring Framework、Spring MVC、Spring Boot，以及Spring Cloud，和一些其他的框架如Spring Gateway、Spring Security、Spring Data，还有最新出来的Spring AI。

从Spring Framework来说呢，它是一个IOC的容器框架，并包含了AOP切面和Rest Template接口请求等很多组件工具的框架。

它最核心的功能是IOC和AOP，其中IOC就是负责处理解决代码层跟层（例如：controller层和service层）之间的，对象的解耦问题。AOP切面是针对现有业务的一个没有痕迹的增强，面向切面编程。

Spring可以没有AOP等功能，但是一定不能没有IOC，这个是所有Spring生态的一个基础。



## 说说Spring的优缺点

### Spring的优点

1. 集成了很多的实用组件，例如AOP切面、Rest Template 接口请求工具（不用额外引入OkHttp和HttpClient）、异步调用。

2. IOC容器管理对象，使我们对象与对象之间的耦合度极大程度的降低，也方便了我们去维护对象。

   例如

   - 我们需要将一个对象设置为单例，不用 Spring 呢，我们就需要去额外使用单例模式自己实现，自己维护，而在 Spring 里，只需要将这个对象设置为 bean （用@Component、@Service等）托管给IOC容器就行，因为Spring的IOC默认就是单例的。（DefaultListableBeanFactory类工厂里存在一个命名为beanDefinitionMap的Map集合，专门用来存放bean的定义信息，key --> beanName，value --> BeanDefinition对象）

   - 如果想将对象设为多例的，也很简单，只需要设置@Scope为prototype。
   - 想要将对象配置为懒加载，则只需要给它加上@lazy注解。

   Spring针对bean提供了很多的配置操作。

3. Spring提供的AOP切面工具，可以在不改动原有业务代码的情况下，去对其做一个增强，可以大量减少我们的重复代码，同时也会提高我们的开发效率，和便于维护。

4. Spring提供了一个声明式事务，@Transactional注解，可以让我们从繁杂的事务管理代码里面脱离出来。

5. Spring集成了很多的开发框架，拥有很好的粘合度，集成能力非常强，只需要简单的配置一下即可。

6. 提供了很多的底层扩展接口，供外部扩展。底层源码写的非常好，用到了很多的设计模式（工厂模式、单例模式等）和反射，看了之后受益匪浅。



### Spring的缺点

在应用层面感觉没有缺点。

鸡蛋里挑骨头，Spring大而全，集成了这么多的框架、功能，是需要提供非常非常多的扩展点，这也就导致它的底层会非常的复杂，代码量也会非常的庞大，对于深入学习源码带来了很大的困难。

上层对外越简单，下层内部就会越复杂。
