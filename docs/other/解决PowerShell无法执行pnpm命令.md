---
title: 解决PowerShell无法执行pnpm命令
createTime: 2026/04/06 16:02:28
permalink: /article/zkxidzry/
tags:
  - 问题解决方案
---

在PowerShell中执行pnpm命令时，可能会遇到以下错误：

```
pnpm : 无法加载文件 C:\Users\用户名\AppData\Roaming\npm\pnpm.ps1，因为在此系统上禁止运行脚本。
```

这是由于PowerShell的执行策略（Execution Policy）限制导致的。默认情况下，PowerShell会阻止运行本地脚本文件，以防止恶意脚本的执行。

<!-- more -->

## 解决方案

### 方案一：修改PowerShell执行策略（推荐）

1. **以管理员身份打开PowerShell**
2. **查看当前执行策略**

```
Get-ExecutionPolicy
```

​	如果结果是 Restricted 或 AllSigned，需要更改执行策略以允许运行脚本


3. **修改执行策略为RemoteSigned**

```
Set-ExecutionPolicy RemoteSigned
```

3. RemoteSigned策略允许运行本地创建的脚本，但要求从互联网下载的脚本必须有数字签名。
4. **确认修改**
系统会提示确认，输入`Y`确认修改。

### 方案二：临时绕过执行策略

如果不想永久修改执行策略，可以临时绕过：

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 方案三：使用cmd代替PowerShell

如果不想修改PowerShell设置，可以改用cmd命令行：

- 打开命令提示符（cmd）
- 在cmd中pnpm命令可以直接使用

### 方案四：使用npx执行

通过npx来执行pnpm：

```
npx pnpm <命令>
```

## 验证解决方案

修改执行策略后，重新打开PowerShell，执行以下命令验证：

```
pnpm -v
```

如果能够正常显示pnpm版本号，说明问题已解决。

## 安全注意事项

1. **谨慎修改执行策略**：修改执行策略可能会降低系统安全性
2. **推荐使用RemoteSigned**：这是相对安全的策略，平衡了安全性和便利性
3. **避免使用Unrestricted**：除非必要，不要设置为Unrestricted策略

## 其他相关命令

- **重置执行策略**：

```
Set-ExecutionPolicy Restricted
```

- **查看所有作用域的执行策略**：

```
Get-ExecutionPolicy -List
```

通过以上方法，可以有效解决PowerShell无法执行pnpm命令的问题。推荐使用方案一，这是最直接和常用的解决方案。