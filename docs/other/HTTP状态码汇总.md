---
title: HTTP状态码汇总
createTime: 2025/04/29 16:33:39
permalink: /article/oi9s7kaq/
---


本文系统梳理了 HTTP 协议中的状态码，分类解析其含义及适用场景，可帮助开发者快速定位请求问题并优化交互逻辑。并结合HTTP方法与状态码组合设计了一套标准。

<!-- more -->


---

## **HTTP 状态码详解：用途与含义**  

HTTP 状态码是服务器对客户端请求的响应标识，用于快速判断请求的成功、失败或需要进一步操作。

- **2xx**：成功，重点关注 `200`、`201`、`204`。  
- **3xx**：重定向，区分 `301`（永久）和 `302`（临时）。  
- **4xx**：客户端错误，`400`（语法）、`401`（未登录）、`403`（无权限）。  
- **5xx**：服务器错误，`500`（通用）、`502`（网关问题）、`503`（过载）。  

以下是 **2xx、3xx、4xx、5xx** 状态码的详细说明，包括适用场景和典型用例。  



### **1. （2xx）成功类**  

表示请求已被服务器成功接收、理解并处理。  

#### **200 OK**  
- **用途**：标准成功响应，表示请求已成功完成。  
- **典型场景**：  
  - `GET` 请求成功获取资源（如查询用户信息）。  
  - `PUT` 或 `PATCH` 请求成功更新资源。  
- **示例**：  
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json
  {"id": 1, "name": "John Doe"}
  ```

#### **201 Created**  
- **用途**：资源创建成功，通常用于 `POST` 请求。  
- **要求**：响应应包含新资源的 URI（`Location` 头）。  
- **典型场景**：  
  - 用户注册成功，返回新用户 ID。  
  - 创建订单后返回订单详情。  
- **示例**：  
  ```http
  HTTP/1.1 201 Created
  Location: /api/users/123
  Content-Type: application/json
  {"id": 123, "status": "active"}
  ```

#### **204 No Content**  
- **用途**：请求成功，但无返回内容。  
- **典型场景**：  
  - `DELETE` 请求成功删除资源。  
  - `PUT`/`PATCH` 更新成功但无需返回数据。  
- **示例**：  
  ```http
  HTTP/1.1 204 No Content
  ```

#### **206 Partial Content**  
- **用途**：服务器返回部分内容，适用于分块下载或断点续传。  
- **典型场景**：  
  - 视频流的分段加载。  
  - 大文件下载时支持 `Range` 请求。  
- **示例**：  
  ```http
  HTTP/1.1 206 Partial Content
  Content-Range: bytes 0-999/5000
  Content-Length: 1000
  [Binary Data...]
  ```

---

### **2. （3xx）重定向类**  
表示客户端需进一步操作才能完成请求（如跳转新 URL）。  

#### **301 Moved Permanently**  
- **用途**：资源已**永久**迁移到新 URL，客户端应更新书签。  
- **SEO 影响**：搜索引擎会更新索引。  
- **示例**：  
  ```http
  HTTP/1.1 301 Moved Permanently
  Location: https://new.example.com/resource
  ```

#### **302 Found（临时重定向）**  
- **用途**：资源**临时**移至新 URL，后续请求仍用原地址。  
- **典型场景**：  
  - 短链接跳转。  
  - 登录后临时重定向到首页。  
- **示例**：  
  ```http
  HTTP/1.1 302 Found
  Location: /temp-redirect
  ```

#### **304 Not Modified**  
- **用途**：资源未修改，客户端可继续使用缓存。  
- **触发条件**：请求头包含 `If-Modified-Since` 或 `If-None-Match`。  
- **示例**：  
  ```http
  HTTP/1.1 304 Not Modified
  ```

#### **308 Permanent Redirect**  
- **用途**：类似 `301`，但强制保持原 HTTP 方法（如 `POST` 不会变成 `GET`）。  
- **典型场景**：  
  - API 迁移时确保请求方法不变。  
- **示例**：  
  ```http
  HTTP/1.1 308 Permanent Redirect
  Location: https://new-api.example.com
  ```

---

### **3. （4xx）客户端错误**  
表示客户端请求有误，需修正后重试。  

#### **400 Bad Request**  
- **用途**：请求语法错误，服务器无法解析。  
- **典型场景**：  
  - JSON 格式错误。  
  - 缺少必填参数。  
- **示例**：  
  ```http
  HTTP/1.1 400 Bad Request
  {"error": "Invalid JSON format"}
  ```

#### **401 Unauthorized**  
- **用途**：未提供有效身份凭证（需登录）。  
- **要求**：响应头应包含 `WWW-Authenticate`。  
- **示例**：  
  ```http
  HTTP/1.1 401 Unauthorized
  WWW-Authenticate: Bearer realm="API"
  ```

#### **403 Forbidden**  
- **用途**：身份已验证，但无权访问（与 `401` 区别）。  
- **典型场景**：  
  - 普通用户尝试访问管理员接口。  
  - IP 被拉黑。  
- **示例**：  
  ```http
  HTTP/1.1 403 Forbidden
  {"error": "Insufficient permissions"}
  ```

#### **404 Not Found**  
- **用途**：请求的资源不存在。  
- **典型场景**：  
  - 访问的 URL 无效。  
  - 数据库查询无结果。  
- **示例**：  
  ```http
  HTTP/1.1 404 Not Found
  {"error": "User not found"}
  ```



#### 405 Method Not Allowed

- **用途** ：客户端尝试使用服务器不允许的HTTP方法来访问某个资源。  

- **典型场景** ：

  POST类型接口，请求时用的GET类型去请求。



#### **429 Too Many Requests**  

- **用途**：客户端请求频率过高（触发速率限制）。  
- **典型场景**：  
  - API 调用超出配额。  
  - 防止暴力破解。  
- **示例**：  
  ```http
  HTTP/1.1 429 Too Many Requests
  Retry-After: 60  # 60秒后重试
  ```

---

### **4. （5xx）服务器错误**  
表示服务器处理请求时发生错误，需后端修复。  

#### **500 Internal Server Error**  
- **用途**：通用服务器错误，无具体信息。  
- **典型场景**：  
  - 代码异常（如未捕获的 `NullPointerException`）。  
- **示例**：  
  ```http
  HTTP/1.1 500 Internal Server Error
  {"error": "Server encountered an error"}
  ```

#### **502 Bad Gateway**  
- **用途**：网关/代理服务器收到上游无效响应。  
- **典型场景**：  
  - Nginx 连接的后端服务崩溃。  
- **示例**：  
  ```http
  HTTP/1.1 502 Bad Gateway
  ```

#### **503 Service Unavailable**  
- **用途**：服务器暂时不可用（过载或维护）。  
- **建议**：配合 `Retry-After` 头。  
- **示例**：  
  ```http
  HTTP/1.1 503 Service Unavailable
  Retry-After: 3600  # 1小时后重试
  ```

#### **504 Gateway Timeout**  
- **用途**：网关等待上游服务器响应超时。  
- **典型场景**：  
  - 数据库查询超时。  
  - 第三方 API 响应缓慢。  
- **示例**：  
  
  ```http
  HTTP/1.1 504 Gateway Timeout
  ```



---

## 关键要点与场景建议  
1. **缓存优化**：合理利用 `304` 可显著减少重复传输。  
2. **权限控制**：`401` 需配合 `WWW-Authenticate` 头，`403` 直接拒绝。  
3. **重定向选择**：  
   - 永久迁移用 `301` 或 `308`（SEO 友好）；  
   - 临时调整用 `302` 或 `307`（保留原方法）。  
4. **错误排查**：  
   - `502/504` 多与代理或上游服务相关；  
   - `503` 需检查服务器负载或维护状态。  
   
   

HTTP 状态码是前后端交互的“语言”，精准理解其含义能快速定位问题。例如：  
- 遇到 `429` 需优化请求频率或协商限流策略；  
- `204` 适用于无需返回数据的操作（如日志记录）。  
建议结合具体业务场景选择最匹配的状态码，提升 API 设计的规范性。  





## HTTP 方法与状态码的标准组合

### 1. **GET（检索资源）**

- **200 OK**：成功返回资源（如获取用户信息）。
- **404 Not Found**：资源不存在。
- **304 Not Modified**：缓存有效（配合 `If-Modified-Since` 或 `ETag`）。

### 2. **POST（创建资源）**

- **201 Created**：资源创建成功，需在响应体中包含新资源的 URI（`Location` 头）。

  ```http
  HTTP/1.1 201 Created
  Location: /api/users/123
  ```

- **202 Accepted**：请求已接受但未完成（适用于异步任务）。

- **400 Bad Request**：请求数据无效（如字段缺失或格式错误）。

### 3. **PUT（全量更新资源）**

- **200 OK** 或 **204 No Content**：更新成功（后者无返回体时使用）。
- **404 Not Found**：资源不存在（若要求资源必须存在）。
- **409 Conflict**：资源状态冲突（如版本号不匹配）。

### 4. **PATCH（部分更新资源）**

- **200 OK**：返回更新后的完整资源。
- **204 No Content**：仅更新无返回。
- **422 Unprocessable Entity**：语义错误（如字段验证失败）。

### 5. **DELETE（删除资源）**

- **204 No Content**：删除成功（无返回体）。
- **404 Not Found**：资源不存在（若幂等性要求）。

### 6. **HEAD（获取元数据）**

- **200 OK**：与 GET 相同，但无响应体。