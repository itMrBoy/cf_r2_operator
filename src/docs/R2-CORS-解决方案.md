# Cloudflare R2 跨域问题解决方案

## 问题描述

在Next.js应用中直接使用AWS SDK调用Cloudflare R2时，会遇到CORS（跨源资源共享）错误。这是因为浏览器的同源策略阻止了前端代码直接访问不同域的资源。

## 解决方案概述

我们采用**Next.js API路由作为代理**的方案，这是最安全和推荐的做法：

1. **服务端处理**: 所有R2操作都在Next.js的API路由中执行
2. **凭据安全**: AWS凭据只在服务端使用，不会暴露给客户端
3. **无跨域问题**: 前端只调用同域的API路由
4. **完整功能**: 支持上传、下载、列表等所有操作

## 架构说明

```
前端组件 → Next.js API路由 → AWS SDK → Cloudflare R2
(客户端)    (服务端代理)      (服务端)    (云存储)
```

## 文件结构

```
src/
├── utils/
│   ├── cfr2.ts           # R2服务端工具函数
│   └── r2-client.ts      # 前端客户端工具
├── app/
│   ├── api/r2/
│   │   ├── upload/route.ts   # 上传API路由
│   │   ├── download/route.ts # 下载API路由
│   │   └── list/route.ts     # 列表API路由
│   └── r2-demo/
│       └── page.tsx      # 演示页面
```

## 核心组件说明

### 1. 服务端工具 (`src/utils/cfr2.ts`)

- 配置AWS SDK客户端
- 提供基础的R2操作函数
- 处理错误和响应格式化

### 2. API路由

#### 上传路由 (`/api/r2/upload`)
- 支持文件上传
- 支持文本内容上传
- 支持JSON数据上传

#### 下载路由 (`/api/r2/download`)
- 支持文件下载
- 支持在线预览
- 自动设置正确的Content-Type

#### 列表路由 (`/api/r2/list`)
- 获取存储桶列表
- 获取对象列表

### 3. 前端客户端 (`src/utils/r2-client.ts`)

- 封装API调用
- 提供TypeScript类型支持
- 简化前端使用

## 使用示例

### 上传文件

```typescript
import { uploadFileToR2 } from '@/utils/r2-client';

const handleUpload = async (file: File) => {
    const result = await uploadFileToR2('my-bucket', 'path/file.jpg', file);
    console.log(result);
};
```

### 上传文本

```typescript
import { uploadTextToR2 } from '@/utils/r2-client';

const result = await uploadTextToR2('my-bucket', 'notes.txt', 'Hello World');
```

### 下载文件

```typescript
import { downloadFileFromR2 } from '@/utils/r2-client';

const response = await downloadFileFromR2('my-bucket', 'path/file.jpg', true);
// 自动触发浏览器下载
```

### 获取预览链接

```typescript
import { getFilePreviewUrl } from '@/utils/r2-client';

const previewUrl = getFilePreviewUrl('my-bucket', 'image.jpg');
// 可用于 <img src={previewUrl} />
```

## 优势

1. **安全性**: 凭据不暴露给客户端
2. **无跨域问题**: 前端调用同域API
3. **灵活性**: 可以添加额外的业务逻辑和验证
4. **易维护**: 集中的错误处理和日志记录
5. **兼容性**: 支持所有现代浏览器

## 替代方案

### 方案1: 配置R2 CORS规则

在Cloudflare控制台配置CORS规则：

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**注意**: 此方案需要在前端暴露AWS凭据，存在安全风险。

### 方案2: 使用预签名URL

```typescript
// 服务端生成预签名URL
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
});

const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
```

**注意**: 预签名URL有时间限制，适合临时访问场景。

## 推荐方案

**强烈推荐使用API路由代理方案**，因为它：
- 提供最佳安全性
- 完全解决跨域问题
- 便于添加业务逻辑
- 易于维护和扩展

## 注意事项

1. **环境变量**: 确保AWS凭据通过环境变量安全配置
2. **错误处理**: 实施完善的错误处理和日志记录
3. **文件大小**: 注意Next.js的请求体大小限制
4. **性能**: 对于大文件可以考虑分片上传
5. **权限**: 根据需要添加身份验证和授权 