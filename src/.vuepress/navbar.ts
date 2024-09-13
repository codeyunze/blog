import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "面试",
    icon: "fa-solid fa-clipboard-question",
    prefix: "/interview/",
    children: [
      {text: "Spring常见面试题", icon: "fa-solid fa-leaf", link: "Spring常见面试题"},
      {text: "MySQL常见面试题", icon: "fa-solid fa-leaf", link: "MySQL常见面试题"},
    ],
  },
  {
    text: "数据库",
    icon: "fa-solid fa-database",
    prefix: "database/",
    children: [
      {
        text: "MySQL",
        icon: "fa-solid fa-database",
        prefix: "mysql/",
        children: [
          {text: "MySQL数据库安装", icon: "fa-solid fa-database", link: "MySQL数据库安装"},
          {text: "MySQL主从集群搭建", icon: "fa-solid fa-database", link: "MySQL主从集群搭建"},
          {text: "为何MySQL选择B+树作为索引结构", icon: "fa-solid fa-leaf", link: "为何MySQL选择B+树作为索引结构"},
          {text: "MySQL有哪些锁", icon: "fa-solid fa-lock", link: "MySQL有哪些锁"},
          {text: "MySQL的意向锁", icon: "fa-solid fa-user-lock", link: "MySQL的意向锁"},
        ],
      },
      {
        text: "Redis",
        icon: "fa-solid fa-server",
        prefix: "redis/",
        children: [
          {text: "Redis的单机安装步骤", icon: "fa-solid fa-registered", link: "Redis的单机安装步骤"},
          {text: "Redis的哨兵架构配置", icon: "fa-solid fa-registered", link: "Redis的哨兵架构配置"},
          {text: "Redis的主从架构", icon: "fa-solid fa-registered", link: "Redis的主从架构"},
          {text: "Redis的集群搭建", icon: "fa-solid fa-registered", link: "Redis的集群搭建"},
        ],
      },
    ],
  },
  /*{
    text: "消息队列",
    icon: "fa-solid fa-tower-cell",
    prefix: "/mq/",
    children: [
      {text: "RabbitMQ安装", icon: "fa-solid fa-tower-broadcast", link: "RabbitMQ安装"},
      {text: "RabbitMQ的理解", icon: "fa-solid fa-tower-broadcast", link: "RabbitMQ的理解"},
    ],
  },*/
  /*{
    text: "分布式篇",
    icon: "fa-solid fa-code-branch",
    prefix: "/distributed/",
    children: "structure",
  },*/
  {
    text: "Git",
    icon: "fa-solid fa-code-branch",
    prefix: "/git/",
    children: [
      {text: "Git常用命令", icon: "fa-solid fa-code-branch", link: "Git常用命令"},
      {text: "Git提交代码规范", icon: "fa-solid fa-code-branch", link: "Git提交代码规范"},
      {text: "修改历史版本代码方案", icon: "fa-solid fa-code-compare", link: "修改历史版本代码方案"},
    ],
  },
  {
    text: "其他",
    icon: "fa-brands fa-creative-commons",
    prefix: "other/",
    children: [
      {
        text: "数据结构",
        icon: "fa-solid fa-network-wired",
        prefix: "structure/",
        children: [
          {text: "平衡二叉树", icon: "fa-brands fa-sourcetree", link: "平衡二叉树"},
          {text: "红黑树", icon: "fa-brands fa-sourcetree", link: "红黑树"},
        ],
      },
      {
        text: "其他",
        icon: "fa-brands fa-creative-commons",
        prefix: "common/",
        children: [
          {text: "常见术语", icon: "fa-solid fa-comment", link: "常见术语"},
        ],
      },
    ],
  },
  {
    text: "跳转",
    icon: "fa-solid fa-arrow-up-right-from-square",
    children: [
      {
        text: "Spring",
        icon: "fa-solid fa-leaf",
        link: "https://spring.io/"
      },
      {
        text: "云梦泽",
        icon: "fa-solid fa-link",
        link: "https://3xj.club/#/login",
      },
    ],
  },
]);
