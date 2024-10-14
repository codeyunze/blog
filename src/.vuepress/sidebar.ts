import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "数据库篇",
      icon: "fa-solid fa-database",
      prefix: "database/",
      link: "database/",
      // 折叠
      collapsible: true,
      children: "structure"
    },
    {
      text: "分布式篇",
      icon: "fa-solid fa-layer-group",
      prefix: "distributed/",
      link: "distributed/",
      // 折叠
      collapsible: true,
      children: "structure"
    },
    /*{
      text: "消息队列",
      icon: "fa-solid fa-tower-cell",
      prefix: "mq/",
      link: "mq/",
      collapsible: true,
      children: [
        "RabbitMQ安装",
        "RabbitMQ的理解"
      ],
    },*/
    {
      text: "Git篇",
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
      text: "运维篇",
      icon: "fa-solid fa-toolbox",
      prefix: "maintenance/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "其他",
      icon: "fa-brands fa-creative-commons",
      // 可选的, 设置分组是否可以折叠，默认值是 false,
      collapsible: true,
      // 可选的。设置分组是否默认展开，默认值是 false
      expanded: true,
      prefix: "other/",
      children: "structure",
    },
    {
      text: "面试篇",
      icon: "fa-solid fa-clipboard-question",
      prefix: "interview/",
      link: "interview/",
      // 折叠
      collapsible: true,
      // 可选的。设置分组是否默认展开，默认值是 false
      expanded: true,
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
