---
title: SpringCloudGateway集成Sa-Token
createTime: 2025/12/11 12:27:52
permalink: /article/4qonpw86/
article: false
---


## 项目结构调整

```
satoken-gateway-demo/
├── common-auth/              # 公共认证模块
├── gateway-service/          # 网关服务
├── user-service/            	# 用户服务
└── order-service/           	# 订单服务
```

## 1. 公共认证模块 (common-auth)

### pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
        <relativePath/>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>common-auth</artifactId>
    <version>1.0.0</version>
    
    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <sa-token.version>1.38.0</sa-token.version>
        <sa-token-redis.version>1.38.0</sa-token-redis.version>
    </properties>
    
    <dependencies>
        <!-- Sa-Token 核心 -->
        <dependency>
            <groupId>cn.dev33</groupId>
            <artifactId>sa-token-spring-boot-starter</artifactId>
            <version>${sa-token.version}</version>
        </dependency>
        
        <!-- Sa-Token Redis 集成（必须） -->
        <dependency>
            <groupId>cn.dev33</groupId>
            <artifactId>sa-token-dao-redis</artifactId>
            <version>${sa-token-redis.version}</version>
        </dependency>
        
        <!-- Sa-Token 整合 Redis（使用 jackson 序列化方式） -->
        <dependency>
            <groupId>cn.dev33</groupId>
            <artifactId>sa-token-redis-jackson</artifactId>
            <version>${sa-token-redis.version}</version>
        </dependency>
        
        <!-- Redis -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        
        <!-- Redisson -->
        <dependency>
            <groupId>org.redisson</groupId>
            <artifactId>redisson</artifactId>
            <version>3.17.7</version>
        </dependency>
        
        <!-- 工具类 -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.83</version>
        </dependency>
    </dependencies>
</project>
```

### SaTokenConfigure.java
```java
package com.example.common.auth.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.router.SaRouter;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 配置类（纯Redis模式）
 */
@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {
    
    /**
     * 注册 Sa-Token 拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> {
            // 根据路由划分模块，不同模块不同鉴权
            SaRouter.match("/**")
                    .notMatch("/auth/login", "/auth/logout", "/doc.html", 
                             "/webjars/**", "/swagger-resources", "/v2/api-docs")
                    .check(r -> StpUtil.checkLogin());
        })).addPathPatterns("/**");
    }
}
```

### Redis配置类 RedisConfig.java
```java
package com.example.common.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis配置
 */
@Configuration
public class RedisConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // 使用StringRedisSerializer来序列化和反序列化redis的key值
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // 使用GenericJackson2JsonRedisSerializer来序列化和反序列化redis的value值
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        template.afterPropertiesSet();
        return template;
    }
}
```

### SaTokenRedisConfig.java（Sa-Token Redis配置）
```java
package com.example.common.auth.config;

import cn.dev33.satoken.dao.SaTokenDao;
import cn.dev33.satoken.dao.SaTokenDaoRedisJackson;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Sa-Token Redis Jackson 序列化配置
 */
@Configuration
public class SaTokenRedisConfig {
    
    /**
     * 使用 Jackson 序列化的 Redis SaTokenDao
     */
    @Bean
    @Primary
    public SaTokenDao saTokenDao() {
        return new SaTokenDaoRedisJackson();
    }
}
```

### 增强版用户上下文 UserContextHolder.java
```java
package com.example.common.auth.context;

import cn.dev33.satoken.stp.StpUtil;
import com.alibaba.fastjson.JSON;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.util.concurrent.TimeUnit;

/**
 * 用户上下文信息（Redis存储）
 */
@Data
@Slf4j
public class UserContext {
    private Long userId;
    private String username;
    private String nickname;
    private String role;
    private String deptId;
    private String tenantId;
    private String phone;
    private String email;
    private String avatar;
    private Long loginTime;
    private String loginIp;
    
    // Redis key前缀
    private static final String USER_INFO_KEY_PREFIX = "user:info:";
    private static final String USER_SESSION_KEY = "USER_INFO";
    private static final long USER_INFO_EXPIRE = TimeUnit.DAYS.toSeconds(30); // 30天
    
    /**
     * 保存用户信息到Redis和Sa-Token会话
     */
    public static void saveUser(UserContext user) {
        if (user == null || user.getUserId() == null) {
            return;
        }
        
        String userInfoJson = JSON.toJSONString(user);
        
        // 1. 保存到Sa-Token会话
        StpUtil.getSession().set(USER_SESSION_KEY, userInfoJson);
        
        // 2. 保存到Redis（作为缓存）
        String redisKey = USER_INFO_KEY_PREFIX + user.getUserId();
        try {
            cn.dev33.satoken.dao.SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            saTokenDao.setObject(redisKey, userInfoJson, USER_INFO_EXPIRE);
            log.debug("用户信息保存到Redis: userId={}", user.getUserId());
        } catch (Exception e) {
            log.error("保存用户信息到Redis失败", e);
        }
    }
    
    /**
     * 从Redis或会话获取用户信息
     */
    public static UserContext getUser() {
        // 先从当前会话获取
        Object sessionUserInfo = StpUtil.getSession().get(USER_SESSION_KEY);
        if (sessionUserInfo != null) {
            return JSON.parseObject(sessionUserInfo.toString(), UserContext.class);
        }
        
        // 如果会话中没有，尝试从Redis获取
        Long userId = getCurrentUserId();
        if (userId != null) {
            String redisKey = USER_INFO_KEY_PREFIX + userId;
            try {
                cn.dev33.satoken.dao.SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
                Object redisUserInfo = saTokenDao.getObject(redisKey);
                if (redisUserInfo != null) {
                    UserContext user = JSON.parseObject(redisUserInfo.toString(), UserContext.class);
                    // 重新设置到会话
                    if (user != null) {
                        StpUtil.getSession().set(USER_SESSION_KEY, JSON.toJSONString(user));
                    }
                    return user;
                }
            } catch (Exception e) {
                log.error("从Redis获取用户信息失败", e);
            }
        }
        
        return null;
    }
    
    /**
     * 清除用户缓存
     */
    public static void clearUserCache(Long userId) {
        if (userId == null) {
            return;
        }
        
        String redisKey = USER_INFO_KEY_PREFIX + userId;
        try {
            cn.dev33.satoken.dao.SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            saTokenDao.deleteObject(redisKey);
            log.debug("清除用户缓存: userId={}", userId);
        } catch (Exception e) {
            log.error("清除用户缓存失败", e);
        }
    }
    
    /**
     * 获取当前用户ID
     */
    public static Long getCurrentUserId() {
        try {
            Object loginId = StpUtil.getLoginIdDefaultNull();
            if (loginId != null) {
                return Long.parseLong(loginId.toString());
            }
        } catch (Exception e) {
            log.error("获取当前用户ID失败", e);
        }
        return null;
    }
    
    /**
     * 获取当前用户名
     */
    public static String getCurrentUsername() {
        UserContext user = getUser();
        return user != null ? user.getUsername() : null;
    }
    
    /**
     * 获取当前用户角色
     */
    public static String getCurrentRole() {
        UserContext user = getUser();
        return user != null ? user.getRole() : null;
    }
    
    /**
     * 检查用户是否拥有指定角色
     */
    public static boolean hasRole(String role) {
        String currentRole = getCurrentRole();
        return currentRole != null && currentRole.equals(role);
    }
    
    /**
     * 构建用户上下文
     */
    public static UserContext buildUser(Long userId, String username, String role) {
        UserContext user = new UserContext();
        user.setUserId(userId);
        user.setUsername(username);
        user.setNickname(username);
        user.setRole(role);
        user.setDeptId("dept001");
        user.setTenantId("tenant001");
        user.setPhone("13800138000");
        user.setEmail(username + "@example.com");
        user.setAvatar("https://example.com/avatar/default.png");
        user.setLoginTime(System.currentTimeMillis());
        user.setLoginIp("127.0.0.1");
        return user;
    }
}
```

### 权限管理服务 PermissionService.java
```java
package com.example.common.auth.service;

import cn.dev33.satoken.dao.SaTokenDao;
import cn.dev33.satoken.stp.StpUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * 权限管理服务（Redis存储权限信息）
 */
@Slf4j
@Service
public class PermissionService {
    
    // Redis key前缀
    private static final String USER_PERMISSION_KEY_PREFIX = "user:permission:";
    private static final String USER_ROLE_KEY_PREFIX = "user:role:";
    private static final long PERMISSION_EXPIRE = TimeUnit.DAYS.toSeconds(7); // 7天
    
    private final SaTokenDao saTokenDao;
    
    public PermissionService() {
        this.saTokenDao = StpUtil.stpLogic.getSaTokenDao();
    }
    
    /**
     * 获取用户权限列表（从Redis获取）
     */
    public List<String> getUserPermissions(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        
        String key = USER_PERMISSION_KEY_PREFIX + userId;
        try {
            Object permissionsObj = saTokenDao.getObject(key);
            if (permissionsObj != null) {
                String permissionsJson = permissionsObj.toString();
                return JSON.parseArray(permissionsJson, String.class);
            }
        } catch (Exception e) {
            log.error("从Redis获取用户权限失败", e);
        }
        
        // 如果Redis中没有，从数据库查询并缓存
        List<String> permissions = loadPermissionsFromDB(userId);
        cacheUserPermissions(userId, permissions);
        
        return permissions;
    }
    
    /**
     * 获取用户角色列表（从Redis获取）
     */
    public List<String> getUserRoles(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        
        String key = USER_ROLE_KEY_PREFIX + userId;
        try {
            Object rolesObj = saTokenDao.getObject(key);
            if (rolesObj != null) {
                String rolesJson = rolesObj.toString();
                return JSON.parseArray(rolesJson, String.class);
            }
        } catch (Exception e) {
            log.error("从Redis获取用户角色失败", e);
        }
        
        // 如果Redis中没有，从数据库查询并缓存
        List<String> roles = loadRolesFromDB(userId);
        cacheUserRoles(userId, roles);
        
        return roles;
    }
    
    /**
     * 缓存用户权限
     */
    public void cacheUserPermissions(Long userId, List<String> permissions) {
        if (userId == null || permissions == null) {
            return;
        }
        
        String key = USER_PERMISSION_KEY_PREFIX + userId;
        String permissionsJson = JSON.toJSONString(permissions);
        
        try {
            saTokenDao.setObject(key, permissionsJson, PERMISSION_EXPIRE);
            log.debug("缓存用户权限到Redis: userId={}, permissions={}", userId, permissions.size());
        } catch (Exception e) {
            log.error("缓存用户权限到Redis失败", e);
        }
    }
    
    /**
     * 缓存用户角色
     */
    public void cacheUserRoles(Long userId, List<String> roles) {
        if (userId == null || roles == null) {
            return;
        }
        
        String key = USER_ROLE_KEY_PREFIX + userId;
        String rolesJson = JSON.toJSONString(roles);
        
        try {
            saTokenDao.setObject(key, rolesJson, PERMISSION_EXPIRE);
            log.debug("缓存用户角色到Redis: userId={}, roles={}", userId, roles.size());
        } catch (Exception e) {
            log.error("缓存用户角色到Redis失败", e);
        }
    }
    
    /**
     * 清除用户权限缓存
     */
    public void clearUserPermissionCache(Long userId) {
        if (userId == null) {
            return;
        }
        
        String permissionKey = USER_PERMISSION_KEY_PREFIX + userId;
        String roleKey = USER_ROLE_KEY_PREFIX + userId;
        
        try {
            saTokenDao.deleteObject(permissionKey);
            saTokenDao.deleteObject(roleKey);
            log.debug("清除用户权限缓存: userId={}", userId);
        } catch (Exception e) {
            log.error("清除用户权限缓存失败", e);
        }
    }
    
    /**
     * 检查用户是否有权限
     */
    public boolean hasPermission(Long userId, String permission) {
        List<String> permissions = getUserPermissions(userId);
        return permissions.contains(permission);
    }
    
    /**
     * 检查用户是否有任意一个权限
     */
    public boolean hasAnyPermission(Long userId, String... permissions) {
        List<String> userPermissions = getUserPermissions(userId);
        return Arrays.stream(permissions)
                .anyMatch(userPermissions::contains);
    }
    
    /**
     * 检查用户是否有角色
     */
    public boolean hasRole(Long userId, String role) {
        List<String> roles = getUserRoles(userId);
        return roles.contains(role);
    }
    
    /**
     * 从数据库加载权限（模拟）
     */
    private List<String> loadPermissionsFromDB(Long userId) {
        // 这里应该查询数据库
        // 模拟数据
        if (userId == 1L) {
            return Arrays.asList("user:add", "user:delete", "user:view", 
                               "order:create", "order:view", "order:delete", 
                               "system:manage");
        } else if (userId == 2L) {
            return Arrays.asList("user:view", "order:create", "order:view");
        }
        return Arrays.asList();
    }
    
    /**
     * 从数据库加载角色（模拟）
     */
    private List<String> loadRolesFromDB(Long userId) {
        // 这里应该查询数据库
        // 模拟数据
        if (userId == 1L) {
            return Arrays.asList("admin", "user");
        } else if (userId == 2L) {
            return Arrays.asList("user");
        }
        return Arrays.asList();
    }
}
```

## 2. 网关服务 (gateway-service) - 修改版

### SaTokenFilter.java（修改为纯Redis模式）
```java
package com.example.gateway.filter;

import cn.dev33.satoken.reactor.context.SaReactorSyncHolder;
import cn.dev33.satoken.reactor.filter.SaReactorFilter;
import cn.dev33.satoken.router.SaRouter;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.example.common.auth.context.UserContext;
import com.example.common.auth.service.PermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.server.ServerWebExchange;

import java.util.Arrays;
import java.util.List;

/**
 * Sa-Token 网关过滤器（纯Redis模式）
 */
@Slf4j
@Configuration
public class SaTokenFilter {
    
    /**
     * 不需要认证的路径
     */
    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/logout",
        "/api/user/auth/login",
        "/api/user/auth/logout",
        "/favicon.ico",
        "/actuator/**",
        "/doc.html",
        "/webjars/**",
        "/swagger-resources",
        "/v2/api-docs"
    );
    
    /**
     * 需要权限校验的路径映射
     */
    private static final List<PathPermission> PATH_PERMISSIONS = Arrays.asList(
        new PathPermission("/api/user/add", "user:add"),
        new PathPermission("/api/user/delete/**", "user:delete"),
        new PathPermission("/api/user/update/**", "user:update"),
        new PathPermission("/api/order/create", "order:create"),
        new PathPermission("/api/order/delete/**", "order:delete"),
        new PathPermission("/api/system/**", "system:manage")
    );
    
    @Bean
    public SaReactorFilter getSaReactorFilter() {
        return new SaReactorFilter()
            // 拦截地址
            .addInclude("/**")
            // 开放地址
            .setExcludeList(EXCLUDE_PATHS)
            // 鉴权方法
            .setAuth(obj -> {
                ServerWebExchange exchange = SaReactorSyncHolder.getContext();
                String path = exchange.getRequest().getURI().getPath();
                
                log.debug("网关拦截请求: {}", path);
                
                // 登录校验
                SaRouter.match("/**")
                        .notMatch(EXCLUDE_PATHS)
                        .check(r -> {
                            // 检查是否登录
                            StpUtil.checkLogin();
                            
                            // 获取登录ID
                            Object loginId = StpUtil.getLoginId();
                            if (loginId != null) {
                                Long userId = Long.parseLong(loginId.toString());
                                
                                // 检查路径权限
                                checkPathPermission(userId, path);
                                
                                // 获取用户信息并添加到请求头
                                addUserInfoToHeader(exchange, userId);
                            }
                        });
            })
            // 异常处理方法
            .setError(e -> {
                log.error("网关拦截异常: {}", e.getMessage());
                return SaResult.error(e.getMessage()).setCode(500);
            });
    }
    
    /**
     * 检查路径权限
     */
    private void checkPathPermission(Long userId, String path) {
        for (PathPermission pathPermission : PATH_PERMISSIONS) {
            if (pathMatches(pathPermission.getPath(), path)) {
                // 模拟权限检查
                PermissionService permissionService = new PermissionService();
                if (!permissionService.hasPermission(userId, pathPermission.getPermission())) {
                    throw new RuntimeException("权限不足: " + pathPermission.getPermission());
                }
                break;
            }
        }
    }
    
    /**
     * 路径匹配（简单实现）
     */
    private boolean pathMatches(String pattern, String path) {
        if (pattern.endsWith("/**")) {
            String prefix = pattern.substring(0, pattern.length() - 3);
            return path.startsWith(prefix);
        }
        return pattern.equals(path);
    }
    
    /**
     * 添加用户信息到请求头
     */
    private void addUserInfoToHeader(ServerWebExchange exchange, Long userId) {
        // 构建用户信息
        UserContext user = UserContext.buildUser(userId, 
            "user_" + userId, 
            userId == 1L ? "admin" : "user");
        
        // 添加到请求头
        exchange.getRequest().mutate()
                .header("X-User-Id", userId.toString())
                .header("X-User-Info", com.alibaba.fastjson.JSON.toJSONString(user))
                .header("X-Token", StpUtil.getTokenValue())
                .build();
        
        log.debug("网关添加用户信息到请求头: userId={}", userId);
    }
    
    /**
     * 路径权限映射类
     */
    @Data
    static class PathPermission {
        private String path;
        private String permission;
        
        public PathPermission(String path, String permission) {
            this.path = path;
            this.permission = permission;
        }
    }
}
```

### GatewayAuthFilter.java（增强版）
```java
package com.example.gateway.filter;

import cn.dev33.satoken.dao.SaTokenDao;
import cn.dev33.satoken.stp.StpUtil;
import com.alibaba.fastjson.JSON;
import com.example.common.auth.context.UserContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

/**
 * 网关全局过滤器 - 传递用户信息（纯Redis模式）
 */
@Slf4j
@Component
public class GatewayAuthFilter implements GlobalFilter, Ordered {
    
    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/logout",
        "/actuator",
        "/actuator/**",
        "/favicon.ico"
    );
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        
        log.debug("网关请求路径: {}", path);
        
        // 排除不需要认证的路径
        if (isExcludePath(path)) {
            return chain.filter(exchange);
        }
        
        try {
            // 获取token
            String token = extractToken(request);
            if (token != null) {
                // 检查token有效性
                if (isTokenValid(token)) {
                    // 获取登录ID
                    Object loginId = StpUtil.getLoginIdByToken(token);
                    if (loginId != null) {
                        Long userId = Long.parseLong(loginId.toString());
                        
                        // 获取用户信息（从Redis或构建）
                        UserContext user = getUserFromRedis(userId);
                        if (user == null) {
                            user = UserContext.buildUser(userId, 
                                "user_" + userId, 
                                userId == 1L ? "admin" : "user");
                        }
                        
                        // 将用户信息添加到请求头
                        ServerHttpRequest newRequest = request.mutate()
                            .header("X-User-Id", userId.toString())
                            .header("X-User-Info", JSON.toJSONString(user))
                            .header("X-Token", token)
                            .build();
                        
                        log.debug("网关传递用户信息到下游: userId={}, token={}", userId, maskToken(token));
                        
                        return chain.filter(exchange.mutate().request(newRequest).build());
                    }
                }
            }
            
            log.warn("请求未携带有效token或token已过期: path={}", path);
            
        } catch (Exception e) {
            log.error("网关过滤器异常: ", e);
        }
        
        return chain.filter(exchange);
    }
    
    /**
     * 从请求头提取token
     */
    private String extractToken(ServerHttpRequest request) {
        // 从Authorization头提取
        String authorization = request.getHeaders().getFirst("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        
        // 从自定义头提取
        String customToken = request.getHeaders().getFirst("X-Token");
        if (customToken != null) {
            return customToken;
        }
        
        // 从satoken头提取
        String saToken = request.getHeaders().getFirst("satoken");
        if (saToken != null) {
            return saToken;
        }
        
        // 从查询参数提取
        String queryToken = request.getQueryParams().getFirst("token");
        return queryToken;
    }
    
    /**
     * 检查token是否有效
     */
    private boolean isTokenValid(String token) {
        try {
            // 通过Sa-Token检查token有效性
            return StpUtil.stpLogic.getTokenActiveTimeoutByToken(token) > -2;
        } catch (Exception e) {
            log.error("检查token有效性失败: ", e);
            return false;
        }
    }
    
    /**
     * 从Redis获取用户信息
     */
    private UserContext getUserFromRedis(Long userId) {
        try {
            SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            String redisKey = "user:info:" + userId;
            Object userInfo = saTokenDao.getObject(redisKey);
            
            if (userInfo != null) {
                return JSON.parseObject(userInfo.toString(), UserContext.class);
            }
        } catch (Exception e) {
            log.error("从Redis获取用户信息失败: userId={}", userId, e);
        }
        return null;
    }
    
    /**
     * 判断是否是不需要认证的路径
     */
    private boolean isExcludePath(String path) {
        return EXCLUDE_PATHS.stream().anyMatch(exclude -> 
            path.equals(exclude) || 
            (exclude.endsWith("/**") && path.startsWith(exclude.substring(0, exclude.length() - 3)))
        );
    }
    
    /**
     * 掩码显示token（安全考虑）
     */
    private String maskToken(String token) {
        if (token == null || token.length() <= 8) {
            return "***";
        }
        return token.substring(0, 4) + "***" + token.substring(token.length() - 4);
    }
    
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
```

### Token刷新过滤器 TokenRefreshFilter.java
```java
package com.example.gateway.filter;

import cn.dev33.satoken.stp.StpUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.stereotype.Component;

/**
 * Token刷新过滤器
 * 用于在请求通过时刷新token的有效期
 */
@Slf4j
@Component
public class TokenRefreshFilter extends AbstractGatewayFilterFactory<TokenRefreshFilter.Config> {
    
    public TokenRefreshFilter() {
        super(Config.class);
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String token = exchange.getRequest().getHeaders().getFirst("X-Token");
            if (token != null && !token.isEmpty()) {
                try {
                    // 刷新token有效期
                    StpUtil.stpLogic.getTokenActivityTimeoutByToken(token);
                    log.debug("刷新token有效期: {}", maskToken(token));
                } catch (Exception e) {
                    log.warn("刷新token有效期失败: ", e);
                }
            }
            return chain.filter(exchange);
        };
    }
    
    /**
     * 掩码显示token
     */
    private String maskToken(String token) {
        if (token == null || token.length() <= 8) {
            return "***";
        }
        return token.substring(0, 4) + "***" + token.substring(token.length() - 4);
    }
    
    public static class Config {
        // 可以添加配置属性
    }
}
```

## 3. 用户服务 (user-service) - 修改版

### AuthController.java（增强Redis支持）
```java
package com.example.user.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.example.common.auth.context.UserContext;
import com.example.common.auth.model.Result;
import com.example.common.auth.service.PermissionService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器（纯Redis模式）
 */
@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final PermissionService permissionService;
    
    public AuthController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }
    
    /**
     * 登录接口
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();
        
        log.info("用户登录尝试: username={}", username);
        
        // 模拟用户验证
        Long userId = validateUser(username, password);
        if (userId == null) {
            return Result.error(401, "用户名或密码错误");
        }
        
        // 登录成功
        StpUtil.login(userId);
        String token = StpUtil.getTokenValue();
        
        // 构建用户信息
        UserContext user = buildUserContext(userId, username);
        
        // 保存用户信息到Redis
        UserContext.saveUser(user);
        
        // 缓存用户权限到Redis
        cacheUserPermissions(userId);
        
        // 返回token信息
        Map<String, Object> data = buildLoginResponse(userId, username, user, token);
        
        log.info("用户登录成功: userId={}, username={}, token={}", 
            userId, username, maskToken(token));
        
        return Result.success(data);
    }
    
    /**
     * 登出接口
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        Long userId = UserContext.getCurrentUserId();
        String token = StpUtil.getTokenValue();
        
        log.info("用户登出: userId={}, token={}", userId, maskToken(token));
        
        // 清除用户缓存
        UserContext.clearUserCache(userId);
        permissionService.clearUserPermissionCache(userId);
        
        // Sa-Token登出
        StpUtil.logout();
        
        return Result.success();
    }
    
    /**
     * 强制下线（管理员功能）
     */
    @PostMapping("/kickout/{userId}")
    public Result<Void> kickout(@PathVariable Long userId) {
        log.info("强制下线用户: userId={}, operator={}", 
            userId, UserContext.getCurrentUsername());
        
        // 清除用户缓存
        UserContext.clearUserCache(userId);
        permissionService.clearUserPermissionCache(userId);
        
        // Sa-Token强制下线
        StpUtil.kickout(userId);
        
        return Result.success();
    }
    
    /**
     * 获取当前用户信息
     */
    @GetMapping("/current")
    public Result<UserContext> getCurrentUser() {
        UserContext user = UserContext.getUser();
        if (user == null) {
            return Result.error(401, "用户未登录");
        }
        return Result.success(user);
    }
    
    /**
     * 刷新token
     */
    @PostMapping("/refresh")
    public Result<Map<String, Object>> refreshToken() {
        Long userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "用户未登录");
        }
        
        // 获取新token
        StpUtil.renewTimeout(2592000); // 续期30天
        String newToken = StpUtil.getTokenValue();
        
        Map<String, Object> data = new HashMap<>();
        data.put("token", newToken);
        data.put("tokenName", StpUtil.getTokenName());
        data.put("expire", StpUtil.getTokenTimeout());
        
        log.info("刷新token: userId={}, newToken={}", userId, maskToken(newToken));
        
        return Result.success(data);
    }
    
    /**
     * 验证用户
     */
    private Long validateUser(String username, String password) {
        // 模拟数据库验证
        if ("admin".equals(username) && "123456".equals(password)) {
            return 1L;
        } else if ("user".equals(username) && "123456".equals(password)) {
            return 2L;
        }
        return null;
    }
    
    /**
     * 构建用户上下文
     */
    private UserContext buildUserContext(Long userId, String username) {
        String role = userId == 1L ? "admin" : "user";
        UserContext user = UserContext.buildUser(userId, username, role);
        user.setLoginIp(getClientIp());
        user.setLoginTime(System.currentTimeMillis());
        return user;
    }
    
    /**
     * 缓存用户权限
     */
    private void cacheUserPermissions(Long userId) {
        // 从数据库加载权限并缓存到Redis
        permissionService.getUserPermissions(userId);
        permissionService.getUserRoles(userId);
    }
    
    /**
     * 构建登录响应
     */
    private Map<String, Object> buildLoginResponse(Long userId, String username, 
                                                   UserContext user, String token) {
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("tokenName", StpUtil.getTokenName());
        data.put("userId", userId);
        data.put("username", username);
        data.put("role", user.getRole());
        data.put("nickname", user.getNickname());
        data.put("avatar", user.getAvatar());
        data.put("expire", StpUtil.getTokenTimeout());
        return data;
    }
    
    /**
     * 获取客户端IP
     */
    private String getClientIp() {
        // 简化实现
        return "127.0.0.1";
    }
    
    /**
     * 掩码显示token
     */
    private String maskToken(String token) {
        if (token == null || token.length() <= 8) {
            return "***";
        }
        return token.substring(0, 4) + "***" + token.substring(token.length() - 4);
    }
    
    @Data
    static class LoginRequest {
        private String username;
        private String password;
    }
}
```

### UserController.java（增强权限检查）
```java
package com.example.user.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.stp.StpUtil;
import com.example.common.auth.context.UserContext;
import com.example.common.auth.model.Result;
import com.example.common.auth.service.PermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器（纯Redis模式）
 */
@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {
    
    private final PermissionService permissionService;
    
    public UserController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }
    
    /**
     * 获取用户列表 - 需要登录
     */
    @SaCheckLogin
    @GetMapping("/list")
    public Result<Map<String, Object>> listUsers() {
        Long userId = UserContext.getCurrentUserId();
        log.info("获取用户列表，当前用户: {}", UserContext.getCurrentUsername());
        
        // 记录操作日志到Redis
        logUserOperation(userId, "list_users", "查看用户列表");
        
        Map<String, Object> data = new HashMap<>();
        data.put("users", "用户列表数据");
        data.put("currentUser", UserContext.getUser());
        data.put("permissions", permissionService.getUserPermissions(userId));
        data.put("roles", permissionService.getUserRoles(userId));
        
        return Result.success(data);
    }
    
    /**
     * 添加用户 - 需要 user:add 权限
     */
    @SaCheckPermission("user:add")
    @PostMapping("/add")
    public Result<String> addUser(@RequestBody AddUserRequest request) {
        Long operatorId = UserContext.getCurrentUserId();
        String operatorName = UserContext.getCurrentUsername();
        
        log.info("添加用户: {}, 操作人: {}", request.getUsername(), operatorName);
        
        // 记录操作日志到Redis
        logUserOperation(operatorId, "add_user", 
            "添加用户: " + request.getUsername());
        
        // 模拟添加用户到数据库
        
        return Result.success("用户添加成功");
    }
    
    /**
     * 删除用户 - 需要 user:delete 权限
     */
    @SaCheckPermission("user:delete")
    @DeleteMapping("/delete/{id}")
    public Result<String> deleteUser(@PathVariable Long id) {
        Long operatorId = UserContext.getCurrentUserId();
        String operatorName = UserContext.getCurrentUsername();
        
        log.info("删除用户 ID: {}, 操作人: {}", id, operatorName);
        
        // 记录操作日志到Redis
        logUserOperation(operatorId, "delete_user", "删除用户ID: " + id);
        
        // 清除被删除用户的缓存
        UserContext.clearUserCache(id);
        permissionService.clearUserPermissionCache(id);
        
        return Result.success("用户删除成功");
    }
    
    /**
     * 更新用户 - 需要 user:update 权限
     */
    @SaCheckPermission("user:update")
    @PutMapping("/update/{id}")
    public Result<String> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        Long operatorId = UserContext.getCurrentUserId();
        
        log.info("更新用户 ID: {}, 操作人: {}", id, UserContext.getCurrentUsername());
        
        // 清除用户缓存（用户信息已更新）
        UserContext.clearUserCache(id);
        
        // 记录操作日志
        logUserOperation(operatorId, "update_user", "更新用户ID: " + id);
        
        return Result.success("用户更新成功");
    }
    
    /**
     * 角色校验测试 - 需要 admin 角色
     */
    @SaCheckRole("admin")
    @GetMapping("/admin/list")
    public Result<String> adminList() {
        log.info("管理员访问用户列表，当前用户: {}", UserContext.getCurrentUsername());
        return Result.success("只有管理员可以访问此接口");
    }
    
    /**
     * 获取当前登录用户信息（从Redis获取）
     */
    @GetMapping("/info")
    public Result<Map<String, Object>> getUserInfo() {
        Long userId = UserContext.getCurrentUserId();
        
        Map<String, Object> info = new HashMap<>();
        info.put("userId", userId);
        info.put("userContext", UserContext.getUser());
        info.put("permissions", permissionService.getUserPermissions(userId));
        info.put("roles", permissionService.getUserRoles(userId));
        info.put("tokenInfo", getTokenInfo());
        
        return Result.success(info);
    }
    
    /**
     * 获取token信息
     */
    private Map<String, Object> getTokenInfo() {
        Map<String, Object> tokenInfo = new HashMap<>();
        tokenInfo.put("tokenValue", maskToken(StpUtil.getTokenValue()));
        tokenInfo.put("tokenName", StpUtil.getTokenName());
        tokenInfo.put("loginId", StpUtil.getLoginId());
        tokenInfo.put("sessionTimeout", StpUtil.getSessionTimeout());
        tokenInfo.put("tokenTimeout", StpUtil.getTokenTimeout());
        tokenInfo.put("tokenActiveTimeout", StpUtil.getTokenActiveTimeout());
        return tokenInfo;
    }
    
    /**
     * 记录用户操作日志到Redis
     */
    private void logUserOperation(Long userId, String operation, String detail) {
        try {
            String logKey = "user:operation:log:" + userId + ":" + System.currentTimeMillis();
            Map<String, Object> logData = new HashMap<>();
            logData.put("userId", userId);
            logData.put("username", UserContext.getCurrentUsername());
            logData.put("operation", operation);
            logData.put("detail", detail);
            logData.put("timestamp", System.currentTimeMillis());
            logData.put("ip", "127.0.0.1"); // 实际应该从请求获取
            
            cn.dev33.satoken.dao.SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            saTokenDao.setObject(logKey, com.alibaba.fastjson.JSON.toJSONString(logData), 3600);
            
            log.debug("记录用户操作日志: userId={}, operation={}", userId, operation);
        } catch (Exception e) {
            log.error("记录用户操作日志失败", e);
        }
    }
    
    /**
     * 掩码显示token
     */
    private String maskToken(String token) {
        if (token == null || token.length() <= 8) {
            return "***";
        }
        return token.substring(0, 4) + "***" + token.substring(token.length() - 4);
    }
    
    @Data
    static class AddUserRequest {
        private String username;
        private String password;
        private String nickname;
        private String phone;
        private String email;
    }
    
    @Data
    static class UpdateUserRequest {
        private String nickname;
        private String phone;
        private String email;
        private String avatar;
    }
}
```

## 4. 订单服务 (order-service) - 修改版

### OrderController.java（增强Redis支持）
```java
package com.example.order.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.dao.SaTokenDao;
import cn.dev33.satoken.stp.StpUtil;
import com.example.common.auth.context.UserContext;
import com.example.common.auth.model.Result;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 订单控制器（纯Redis模式）
 */
@Slf4j
@RestController
@RequestMapping("/order")
public class OrderController {
    
    /**
     * 获取订单列表 - 需要登录
     */
    @SaCheckLogin
    @GetMapping("/list")
    public Result<Map<String, Object>> listOrders() {
        Long userId = UserContext.getCurrentUserId();
        String username = UserContext.getCurrentUsername();
        
        log.info("获取订单列表，当前用户: {}", username);
        
        // 从Redis获取用户订单（模拟）
        Map<String, Object> orders = getUserOrdersFromRedis(userId);
        
        Map<String, Object> data = new HashMap<>();
        data.put("orders", orders);
        data.put("currentUser", UserContext.getUser());
        data.put("total", orders.size());
        
        return Result.success(data);
    }
    
    /**
     * 创建订单 - 需要 order:create 权限
     */
    @SaCheckPermission("order:create")
    @PostMapping("/create")
    public Result<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest request) {
        Long userId = UserContext.getCurrentUserId();
        String username = UserContext.getCurrentUsername();
        
        log.info("创建订单，用户: {}, 商品: {}, 数量: {}", 
            username, request.getProductName(), request.getQuantity());
        
        // 生成订单
        Map<String, Object> order = generateOrder(userId, request);
        
        // 保存订单到Redis
        saveOrderToRedis(userId, order);
        
        // 记录订单创建日志
        logOrderOperation(userId, "create_order", 
            "创建订单: " + order.get("orderNo"));
        
        return Result.success(order);
    }
    
    /**
     * 查看订单详情 - 需要 order:view 权限
     */
    @SaCheckPermission("order:view")
    @GetMapping("/detail/{orderId}")
    public Result<Map<String, Object>> getOrderDetail(@PathVariable String orderId) {
        Long userId = UserContext.getCurrentUserId();
        
        log.info("查看订单详情: orderId={}, 用户: {}", orderId, UserContext.getCurrentUsername());
        
        // 从Redis获取订单详情
        Map<String, Object> orderDetail = getOrderDetailFromRedis(userId, orderId);
        if (orderDetail == null) {
            return Result.error(404, "订单不存在");
        }
        
        return Result.success(orderDetail);
    }
    
    /**
     * 删除订单 - 需要 order:delete 权限
     */
    @SaCheckPermission("order:delete")
    @DeleteMapping("/delete/{orderId}")
    public Result<String> deleteOrder(@PathVariable String orderId) {
        Long userId = UserContext.getCurrentUserId();
        
        log.info("删除订单: orderId={}, 用户: {}", orderId, UserContext.getCurrentUsername());
        
        // 从Redis删除订单
        deleteOrderFromRedis(userId, orderId);
        
        // 记录操作日志
        logOrderOperation(userId, "delete_order", "删除订单: " + orderId);
        
        return Result.success("订单删除成功");
    }
    
    /**
     * 跨服务获取用户信息
     */
    @GetMapping("/user-info")
    public Result<Map<String, Object>> getUserInfo() {
        Long userId = UserContext.getCurrentUserId();
        
        Map<String, Object> info = new HashMap<>();
        info.put("currentUser", UserContext.getUser());
        info.put("message", "这是从订单服务获取的用户信息（Redis模式）");
        info.put("userId", userId);
        info.put("fromRedis", true);
        
        log.info("订单服务中的用户信息: userId={}, username={}", 
            userId, UserContext.getCurrentUsername());
        
        return Result.success(info);
    }
    
    /**
     * 从Redis获取用户订单（模拟）
     */
    private Map<String, Object> getUserOrdersFromRedis(Long userId) {
        try {
            SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            String orderKey = "user:orders:" + userId;
            Object ordersObj = saTokenDao.getObject(orderKey);
            
            if (ordersObj != null) {
                return com.alibaba.fastjson.JSON.parseObject(ordersObj.toString(), Map.class);
            }
        } catch (Exception e) {
            log.error("从Redis获取用户订单失败", e);
        }
        
        // 模拟订单数据
        return createMockOrders(userId);
    }
    
    /**
     * 保存订单到Redis
     */
    private void saveOrderToRedis(Long userId, Map<String, Object> order) {
        try {
            SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            
            // 保存单个订单
            String orderKey = "order:detail:" + order.get("orderNo");
            saTokenDao.setObject(orderKey, com.alibaba.fastjson.JSON.toJSONString(order), 86400);
            
            // 更新用户订单列表
            String userOrdersKey = "user:orders:" + userId;
            Map<String, Object> userOrders = getUserOrdersFromRedis(userId);
            userOrders.put(order.get("orderNo").toString(), order);
            saTokenDao.setObject(userOrdersKey, 
                com.alibaba.fastjson.JSON.toJSONString(userOrders), 86400);
            
            log.debug("订单保存到Redis: orderNo={}, userId={}", order.get("orderNo"), userId);
        } catch (Exception e) {
            log.error("保存订单到Redis失败", e);
        }
    }
    
    /**
     * 从Redis获取订单详情
     */
    private Map<String, Object> getOrderDetailFromRedis(Long userId, String orderId) {
        try {
            SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            String orderKey = "order:detail:" + orderId;
            Object orderObj = saTokenDao.getObject(orderKey);
            
            if (orderObj != null) {
                Map<String, Object> order = com.alibaba.fastjson.JSON.parseObject(
                    orderObj.toString(), Map.class);
                
                // 验证订单所属用户
                if (userId.equals(order.get("userId"))) {
                    return order;
                }
            }
        } catch (Exception e) {
            log.error("从Redis获取订单详情失败", e);
        }
        return null;
    }
    
    /**
     * 从Redis删除订单
     */
    private void deleteOrderFromRedis(Long userId, String orderId) {
        try {
            SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            
            // 删除订单详情
            String orderKey = "order:detail:" + orderId;
            saTokenDao.deleteObject(orderKey);
            
            // 从用户订单列表中移除
            String userOrdersKey = "user:orders:" + userId;
            Map<String, Object> userOrders = getUserOrdersFromRedis(userId);
            userOrders.remove(orderId);
            saTokenDao.setObject(userOrdersKey, 
                com.alibaba.fastjson.JSON.toJSONString(userOrders), 86400);
            
            log.debug("从Redis删除订单: orderId={}, userId={}", orderId, userId);
        } catch (Exception e) {
            log.error("从Redis删除订单失败", e);
        }
    }
    
    /**
     * 生成订单
     */
    private Map<String, Object> generateOrder(Long userId, CreateOrderRequest request) {
        String orderNo = "ORDER" + System.currentTimeMillis();
        
        Map<String, Object> order = new HashMap<>();
        order.put("orderNo", orderNo);
        order.put("productName", request.getProductName());
        order.put("quantity", request.getQuantity());
        order.put("unitPrice", 100.0);
        order.put("totalAmount", request.getQuantity() * 100.0);
        order.put("userId", userId);
        order.put("username", UserContext.getCurrentUsername());
        order.put("status", "待支付");
        order.put("createTime", System.currentTimeMillis());
        order.put("updateTime", System.currentTimeMillis());
        
        return order;
    }
    
    /**
     * 创建模拟订单数据
     */
    private Map<String, Object> createMockOrders(Long userId) {
        Map<String, Object> orders = new HashMap<>();
        
        for (int i = 1; i <= 3; i++) {
            Map<String, Object> order = new HashMap<>();
            order.put("orderNo", "ORDER" + (System.currentTimeMillis() - i));
            order.put("productName", "商品" + i);
            order.put("quantity", i);
            order.put("totalAmount", i * 100.0);
            order.put("status", i % 2 == 0 ? "已完成" : "待支付");
            order.put("createTime", System.currentTimeMillis() - i * 100000);
            
            orders.put(order.get("orderNo").toString(), order);
        }
        
        return orders;
    }
    
    /**
     * 记录订单操作日志
     */
    private void logOrderOperation(Long userId, String operation, String detail) {
        try {
            String logKey = "order:operation:log:" + userId + ":" + System.currentTimeMillis();
            Map<String, Object> logData = new HashMap<>();
            logData.put("userId", userId);
            logData.put("username", UserContext.getCurrentUsername());
            logData.put("operation", operation);
            logData.put("detail", detail);
            logData.put("timestamp", System.currentTimeMillis());
            
            SaTokenDao saTokenDao = StpUtil.stpLogic.getSaTokenDao();
            saTokenDao.setObject(logKey, com.alibaba.fastjson.JSON.toJSONString(logData), 7200);
            
            log.debug("记录订单操作日志: userId={}, operation={}", userId, operation);
        } catch (Exception e) {
            log.error("记录订单操作日志失败", e);
        }
    }
    
    @Data
    static class CreateOrderRequest {
        private String productName;
        private Integer quantity;
    }
}
```

## 5. 配置文件

### 所有服务的 application.yml
```yaml
# 通用Sa-Token配置
sa-token:
  # token名称
  token-name: satoken
  # token有效期（秒），默认30天
  timeout: 2592000
  # token临时有效期（指定时间内无操作就视为token过期）
  activity-timeout: 1800  # 30分钟无操作过期
  # 是否允许同一账号并发登录
  is-concurrent: true
  # 在多人登录同一账号时，是否共用一个token
  is-share: false
  # token风格
  token-style: uuid
  # 是否输出操作日志
  is-log: true
  # 从读取数据到token前缀
  token-prefix: "Bearer"
  # 是否在初始化配置时打印版本字符画
  is-print: false
  # 是否尝试从请求体读取token
  is-read-body: true
  # 是否尝试从header读取token
  is-read-header: true
  # 是否尝试从cookie读取token
  is-read-cookie: true
  # 是否在登录后将token写入到响应头
  is-write-header: true
  # 是否在登录时打印日志
  is-login-log: true
  # 数据序列化方式 (jackson)
  data-serializable: jackson
  
  # Redis配置（使用Jackson序列化）
  redis:
    # Redis数据库索引
    database: 0
    # Redis服务器地址
    host: localhost
    # Redis服务器连接端口
    port: 6379
    # Redis服务器连接密码（默认为空）
    password: 
    # 连接超时时间（毫秒）
    timeout: 10000
    # 连接池配置
    lettuce:
      pool:
        # 连接池最大连接数
        max-active: 200
        # 连接池最大阻塞等待时间（负值表示没有限制）
        max-wait: -1ms
        # 连接池中的最大空闲连接
        max-idle: 10
        # 连接池中的最小空闲连接
        min-idle: 0
```

### Redis数据结构说明

```
# 用户会话信息
user:info:{userId} -> UserContext JSON

# 用户权限
user:permission:{userId} -> List<String> JSON

# 用户角色
user:role:{userId} -> List<String> JSON

# 用户操作日志
user:operation:log:{userId}:{timestamp} -> Log JSON

# 用户订单
user:orders:{userId} -> Map<String, Object> JSON

# 订单详情
order:detail:{orderNo} -> Map<String, Object> JSON

# 订单操作日志
order:operation:log:{userId}:{timestamp} -> Log JSON

# Sa-Token自动管理的key
satoken:login:token:{token} -> LoginId
satoken:login:session:{loginId} -> SaSession JSON
satoken:login:token-value:{loginId} -> tokenValue
satoken:login:last-activity:{loginId} -> timestamp
```

## 6. 测试脚本

### test.http
```http
### 1. 登录（获取token）
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}

> {%
    client.global.set("token", response.body.data.token);
    client.log("Token: " + response.body.data.token);
%}

### 2. 获取当前用户信息
GET http://localhost:8080/api/auth/current
Authorization: Bearer {{token}}

### 3. 获取用户列表
GET http://localhost:8080/api/user/list
satoken: {{token}}

### 4. 添加用户
POST http://localhost:8080/api/user/add
satoken: {{token}}
Content-Type: application/json

{
  "username": "testuser",
  "password": "test123",
  "nickname": "测试用户",
  "phone": "13800138000",
  "email": "test@example.com"
}

### 5. 获取订单列表
GET http://localhost:8080/api/order/list
X-Token: {{token}}

### 6. 创建订单
POST http://localhost:8080/api/order/create
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "productName": "MacBook Pro",
  "quantity": 1
}

### 7. 获取用户详细信息（含权限）
GET http://localhost:8080/api/user/info
satoken: {{token}}

### 8. 刷新token
POST http://localhost:8080/api/auth/refresh
satoken: {{token}}

### 9. 强制下线用户（需要管理员权限）
POST http://localhost:8080/api/auth/kickout/2
satoken: {{token}}

### 10. 登出
POST http://localhost:8080/api/auth/logout
satoken: {{token}}
```

### Redis监控脚本
```bash
#!/bin/bash
# 监控Redis中的Sa-Token数据

# 查看所有用户会话
redis-cli keys "satoken:login:session:*"

# 查看所有token
redis-cli keys "satoken:login:token:*"

# 查看用户信息缓存
redis-cli keys "user:info:*"

# 查看用户权限缓存
redis-cli keys "user:permission:*"

# 查看特定用户信息
redis-cli get "user:info:1"

# 查看token对应的用户ID
redis-cli get "satoken:login:token:xxxx-token-value-xxxx"
```

## 7. 部署和运行说明

### 启动顺序
1. **启动Redis**：
   ```bash
   redis-server
   ```

2. **启动Nacos（可选）**：
   ```bash
   startup.cmd -m standalone  # Windows
   sh startup.sh -m standalone  # Linux/Mac
   ```

3. **启动服务**：
   ```bash
   # 启动网关服务
   java -jar gateway-service-1.0.0.jar
   
   # 启动用户服务
   java -jar user-service-1.0.0.jar --server.port=8081
   
   # 启动订单服务
   java -jar order-service-1.0.0.jar --server.port=8082
   ```

### 配置说明
1. **Redis配置**：确保所有服务连接同一个Redis实例
2. **Token传递**：
   - 通过请求头 `satoken`、`Authorization: Bearer` 或 `X-Token`
   - 网关会自动转发用户信息到下游服务
3. **权限缓存**：用户权限缓存在Redis中，默认7天过期

### 优势特点
1. **纯Redis存储**：无需JWT，所有会话信息存储在Redis
2. **分布式会话**：支持多服务共享用户状态
3. **权限缓存**：权限信息缓存提升性能
4. **灵活配置**：支持多种token传递方式
5. **完整监控**：Redis中可监控所有会话和缓存数据

这个方案完全使用Token + Redis，提供了完整的分布式认证鉴权方案，适合微服务架构下的安全需求。