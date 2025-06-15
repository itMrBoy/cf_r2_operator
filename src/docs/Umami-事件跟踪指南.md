# Umami 事件跟踪指南

## 概述

Umami 是一个轻量级、注重隐私的网站分析工具。本项目已经集成了 Umami 的事件跟踪功能，支持两种事件跟踪方式。

## 项目配置

### 1. Script 脚本加载

在 `src/app/layout.tsx` 中已经配置了 Umami 脚本：

```tsx
<Script 
  strategy="lazyOnload" 
  src="https://umami.tianran.org/script.js" 
  data-website-id="47a41135-467d-4ffa-bdfd-ea81559bb099" 
  data-tag="study.tianran.org"
/>
```

### 2. TypeScript 类型定义

在 `src/types/umami.d.ts` 中定义了 TypeScript 类型：

```typescript
declare global {
  interface Window {
    umami: {
      track(eventName: string, eventData?: Record<string, string | number | boolean>): void;
      track(eventData: Record<string, string | number | boolean>): void;
    };
  }
  
  const umami: {
    track(eventName: string, eventData?: Record<string, string | number | boolean>): void;
    track(eventData: Record<string, string | number | boolean>): void;
  };
}
```

## 事件跟踪方式

### 方式 1: HTML 数据属性（推荐）

这种方式不需要 JavaScript 代码，Umami 会自动检测并跟踪：

```tsx
<button
  data-umami-event="Button Click"           // 事件名称
  data-umami-event-name="username" // 自定义属性
  data-umami-event-id="button-123"          // 自定义 ID
>
  点击按钮
</button>
```

**优点：**
- 简单易用，无需编写 JavaScript
- 自动跟踪，不会因为 JavaScript 错误而失效
- 支持服务端渲染

**缺点：**
- 只能跟踪用户交互事件（点击、提交等）
- 动态数据需要通过 React 插值

### 方式 2: JavaScript API

通过 JavaScript 调用 umami.track()：

```tsx
// 基本用法
umami.track('Custom Event');

// 带参数的事件
umami.track('File Upload Success', {
  bucket: 'my-bucket',
  fileSize: 1024,
  fileName: 'document.pdf'
});

// 对象形式（不推荐）
umami.track({
  name: 'Custom Event',
  data: { key: 'value' }
});
```

**优点：**
- 可以在任何时机触发
- 支持动态参数
- 适合复杂的业务逻辑

**缺点：**
- 需要确保 umami 对象加载完成
- 可能因为 JavaScript 错误而失效

## 实际使用示例

### 1. 文件上传跟踪

```tsx
const handleFileUpload = async () => {
  try {
    const response = await uploadFileToR2(bucketName, objectKey, selectedFile);
    if (response.success) {
      // 成功事件
      umami.track('File Upload Success', {
        bucket: bucketName,
        fileSize: selectedFile.size,
        fileName: selectedFile.name
      });
    }
  } catch (error) {
    // 错误事件
    umami.track('File Upload Error', {
      bucket: bucketName,
      error: String(error)
    });
  }
};
```

### 2. 用户登录跟踪

```tsx
<button
  type="submit"
  data-umami-event="Login button"
  ata-umami-event-id={formData.username}
  data-umami-event-name={formData.username}
>
  登录
</button>
```

### 3. 页面交互跟踪

```tsx
const handleThemeChange = (theme: string) => {
  setTheme(theme);
  umami.track('Theme Change', { theme });
};

const handleSearch = (query: string) => {
  umami.track('Search', { 
    query: query.substring(0, 50), // 限制数据长度
    resultsCount: results.length 
  });
};
```

## 最佳实践

### 1. 事件命名规范

- 使用 **动词 + 名词** 的格式：`File Upload`, `User Login`, `Theme Change`
- 添加状态后缀：`File Upload Success`, `File Upload Error`
- 使用 PascalCase 格式
- 保持命名一致性

### 2. 事件参数设计

```tsx
// ✅ 好的参数设计
umami.track('Product Purchase', {
  productId: 'P123',
  category: 'Electronics',
  price: 299,
  currency: 'USD',
  quantity: 1
});

// ❌ 避免的参数设计
umami.track('Product Purchase', {
  data: JSON.stringify(productData), // 避免序列化对象
  timestamp: new Date().toISOString(), // Umami 自动记录时间
  userAgent: navigator.userAgent       // 避免敏感信息
});
```

### 3. 数据隐私保护

- **不要跟踪敏感信息**：密码、完整邮箱、身份证号等
- **限制数据长度**：避免过长的字符串
- **使用 ID 而非名称**：使用 `userId` 而非 `userName`

```tsx
// ✅ 隐私友好
umami.track('User Registration', {
  source: 'email',
  accountType: 'premium',
  referrer: document.referrer
});

// ❌ 隐私风险
umami.track('User Registration', {
  email: 'user@example.com',    // 敏感信息
  password: 'hashedPassword',   // 绝对不要
  fullName: 'John Doe'          // 个人身份信息
});
```

### 4. 错误处理

```tsx
const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && window.umami) {
      umami.track(eventName, eventData);
    }
  } catch (error) {
    console.warn('Umami tracking failed:', error);
    // 不要因为分析跟踪失败而影响主要功能
  }
};
```

### 5. 条件跟踪

```tsx
const handleFileUpload = async () => {
  const startTime = Date.now();
  
  try {
    const response = await uploadFile();
    
    // 只在生产环境跟踪
    if (process.env.NODE_ENV === 'production') {
      umami.track('File Upload Success', {
        duration: Date.now() - startTime,
        fileSize: file.size
      });
    }
  } catch (error) {
    // 错误总是跟踪（有助于调试）
    umami.track('File Upload Error', {
      error: error.message,
      duration: Date.now() - startTime
    });
  }
};
```

## 调试和测试

### 1. 开发环境调试

在浏览器控制台中检查 umami 对象：

```javascript
// 检查 umami 是否加载
console.log(typeof umami);

// 手动触发事件测试
umami.track('Test Event', { source: 'console' });
```

### 2. 网络检查

在浏览器开发者工具的网络标签中，查找对 `https://umami.tianran.org` 的请求。

### 3. Umami 仪表板

登录 Umami 仪表板查看实时事件数据：
- 访问 `https://umami.tianran.org`
- 查看事件统计和详细数据

## 常见问题

### Q: umami 对象未定义怎么办？

A: 这通常是因为脚本还未加载完成。解决方案：

```tsx
useEffect(() => {
  // 等待 umami 加载
  const checkUmami = () => {
    if (typeof window !== 'undefined' && window.umami) {
      umami.track('Page Loaded');
    } else {
      setTimeout(checkUmami, 100);
    }
  };
  
  checkUmami();
}, []);
```

### Q: 事件没有在仪表板中显示？

A: 检查以下几点：
1. 网站 ID 是否正确
2. 事件名称是否符合规范
3. 是否有网络错误
4. 是否在开发环境中（某些配置可能屏蔽本地环境）

### Q: 如何跟踪单页应用的路由变化？

A: Next.js 的 Umami 脚本会自动跟踪路由变化，无需额外配置。
