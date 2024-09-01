import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  // "/demo/",
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
        ],
      },
      {
        text: "Redis",
        icon: "fa-solid fa-server",
        prefix: "redis/",
        children: [
          {text: "Redis的单机安装步骤", icon: "fa-solid fa-server", link: "Redis的单机安装步骤"},
          {text: "Redis的哨兵架构配置", icon: "fa-solid fa-server", link: "Redis的哨兵架构配置"},
          {text: "Redis的主从架构", icon: "fa-solid fa-server", link: "Redis的主从架构"},
          {text: "Redis的集群搭建", icon: "fa-solid fa-server", link: "Redis的集群搭建"},
        ],
      },
    ],
  },
  {
    text: "博文",
    icon: "fa-solid fa-book",
    prefix: "/posts/",
    children: [
      /*{
        text: "消息队列",
        icon: "fa-solid fa-toolbox",
        prefix: "mq/",
        children: [
          {text: "RabbitMQ安装", icon: "fa-solid fa-tower-broadcast", link: "RabbitMQ安装"},
          {text: "RabbitMQ的理解", icon: "fa-solid fa-tower-broadcast", link: "RabbitMQ的理解"},
        ],
      },
      {
        text: "Git",
        icon: "pen-to-square",
        prefix: "git/",
        children: [
          {
            text: "Git常用命令",
            icon: "pen-to-square",
            link: "Git常用命令",
          }
        ],
      },*/
      { text: "樱桃", icon: "pen-to-square", link: "cherry" },
    ],
  },
  /*{
    text: "V2 文档",
    icon: "book",
    link: "https://theme-hope.vuejs.press/zh/",
  },*/
]);
