import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "数据库",
      icon: "fa-solid fa-database",
      prefix: "database/",
      link: "database/",
      // 折叠
      collapsible: true,
      children: "structure",
      /*children: [
          "MySQL数据库安装",
          "MySQL主从集群搭建",
          "Redis的单机安装步骤",
          "Redis的哨兵架构配置",
          "Redis的主从架构",
          "Redis的集群搭建"
      ],*/
    },
    {
      text: "消息队列",
      icon: "fa-solid fa-tower-cell",
      prefix: "mq/",
      link: "mq/",
      collapsible: true,
      children: [
        "RabbitMQ安装",
        "RabbitMQ的理解"
      ],
    },
    {
      text: "Git",
      icon: "fa-solid fa-code-branch",
      prefix: "git/",
      link: "git/",
      collapsible: true,
      children: [
        "Git常用命令",
        "Git提交代码规范",
        "修改历史版本代码方案"
      ],
    },
    {
      text: "运维",
      icon: "fa-solid fa-toolbox",
      prefix: "maintenance/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "其他",
      icon: "fa-brands fa-creative-commons",
      prefix: "other/",
      children: "structure",
    },
    /*{
      text: "文章",
      icon: "book",
      prefix: "posts/",
      children: "structure",
    },*/
    {
      text: "如何使用",
      icon: "laptop-code",
      prefix: "demo/",
      link: "demo/",
      children: "structure",
    },
    "intro"
  ],
});
