---
title: Spring扩展点
createTime: 2026/04/09 15:59:48
permalink: /classification/ts7xv2l2/
---

Spring 提供了多种**扩展点（Extension Points）**，允许开发者在 Bean 生命周期、容器启动、配置加载等关键环节插入自定义逻辑。

------

### ✅ 一、Bean 生命周期扩展

#### 1. **`InitializingBean` / `DisposableBean`**

- 实现 `afterPropertiesSet()`（初始化后）或 `destroy()`（销毁前）。
- ⚠️ 耦合 Spring API，**不推荐**，优先用注解。

#### 2. **`@PostConstruct` / `@PreDestroy`（JSR-250）**

- 标准注解，**推荐使用**：

  ```java
  @PostConstruct
  public void init() { /* 初始化逻辑 */ }
  
  @PreDestroy
  public void cleanup() { /* 销毁前清理 */ }
  ```

#### 3. **`init-method` / `destroy-method`（XML 或注解配置）**

- 在 `@Bean(initMethod = "init")` 中指定方法名，**解耦**。

------

### ✅ 二、容器启动/刷新扩展

#### 4. **`ApplicationContextAware`**

- 注入 `ApplicationContext`：

  ```java
  public class MyService implements ApplicationContextAware {
      private ApplicationContext ctx;
      public void setApplicationContext(ApplicationContext ctx) { this.ctx = ctx; }
  }
  ```

#### 5. **`CommandLineRunner` / `ApplicationRunner`**

- 容器启动完成后执行一次性任务（如数据初始化）：

  ```java
  @Component
  public class StartupRunner implements CommandLineRunner {
      public void run(String... args) { /* 启动后逻辑 */ }
  }
  ```

------

### ✅ 三、Bean 创建过程干预（核心扩展点）

#### 6. **`BeanPostProcessor`**

- **最强大**的扩展点，在 Bean 初始化前后**修改或增强 Bean**：

  ```java
  public class MyBeanPostProcessor implements BeanPostProcessor {
      public Object postProcessBeforeInitialization(Object bean, String beanName) { ... }
      public Object postProcessAfterInitialization(Object bean, String beanName) { ... }
  }
  ```

- **典型应用**：AOP 代理、`@Autowired` 注入、`@Value` 解析都基于此。

#### 7. **`InstantiationAwareBeanPostProcessor`**

- 在 Bean **实例化前后**介入（比 `BeanPostProcessor` 更早），可**替换 Bean 实例**。
- AOP 动态代理（如 CGLIB）在此阶段生成。

------

### ✅ 四、条件化配置扩展

#### 8. **`@Conditional` + 自定义 Condition**

- 按条件决定是否注册 Bean：

  ```java
  public class OnMyCondition implements Condition {
      public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
          return "dev".equals(context.getEnvironment().getProperty("env"));
      }
  }
  @Bean
  @Conditional(OnMyCondition.class)
  public MyService myService() { ... }
  ```

------

### ✅ 五、事件驱动扩展

#### 9. **`ApplicationListener` / `@EventListener`**

- 监听 Spring 事件（如 `ContextRefreshedEvent`）：

  ```java
  @EventListener
  public void handleContextRefresh(ContextRefreshedEvent event) { ... }
  ```

------

### 💡 面试回答技巧（简洁版）：

> “Spring 的扩展点主要分三类：  
>
> 1. **生命周期回调**（如 `@PostConstruct`）；  
> 2. **Bean 创建干预**（如 `BeanPostProcessor`，AOP 就靠它）；  
> 3. **容器级扩展**（如 `CommandLineRunner` 做启动任务）。
>    我们项目用 `BeanPostProcessor` 实现了自定义注解的自动注入。”

------

### 📌 总结表

| 扩展点                | 触发时机             | 典型用途      |
| --------------------- | -------------------- | ------------- |
| `@PostConstruct`      | Bean 初始化后        | 初始化资源    |
| `BeanPostProcessor`   | 所有 Bean 初始化前后 | AOP、属性注入 |
| `CommandLineRunner`   | 容器启动完成         | 数据预热      |
| `@Conditional`        | Bean 注册前          | 条件化装配    |
| `ApplicationListener` | 事件发布时           | 异步处理      |

掌握这些，基本覆盖 90% 的 Spring 扩展场景。
