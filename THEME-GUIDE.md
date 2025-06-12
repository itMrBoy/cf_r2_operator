# 主题系统使用指南

## 概述

该项目现在支持完整的主题系统，包括浅色主题、深色主题和跟随系统主题。主题系统基于 CSS 变量和 Tailwind CSS 构建。

## 主要功能

### 1. 主题切换
- **浅色主题** ☀️：明亮的界面，适合白天使用
- **深色主题** 🌙：深色界面，减少眼部疲劳
- **跟随系统** 🖥️：根据操作系统的主题设置自动切换

### 2. 主题持久化
- 用户的主题选择会保存在 localStorage 中
- 下次访问时会自动应用上次选择的主题

## 技术实现

### CSS 变量系统

在 `src/app/globals.css` 中定义了完整的主题变量：

```css
:root {
  /* 基础颜色 */
  --background: #ffffff;
  --foreground: #171717;
  
  /* 卡片和容器 */
  --card: #ffffff;
  --card-foreground: #171717;
  
  /* 按钮状态 */
  --primary: #3b82f6;
  --secondary: #f1f5f9;
  --success: #10b981;
  --warning: #f59e0b;
  --destructive: #ef4444;
  
  /* 其他 UI 元素 */
  --border: #e2e8f0;
  --input: #f8fafc;
  --muted: #f8fafc;
  --muted-foreground: #64748b;
}
```

### 预定义样式类

项目提供了一系列预定义的主题样式类：

- `.theme-card` - 卡片容器样式
- `.theme-input` - 输入框样式
- `.theme-button-primary` - 主要按钮样式
- `.theme-button-secondary` - 次要按钮样式
- `.theme-button-success` - 成功状态按钮
- `.theme-button-warning` - 警告状态按钮
- `.theme-button-destructive` - 危险操作按钮
- `.theme-text-muted` - 静音文本样式

### 主题切换组件

`ThemeToggle` 组件位于 `src/components/theme-toggle.tsx`：

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

// 在组件中使用
<ThemeToggle />
```

## 在组件中使用主题

### 1. 使用预定义样式类

```tsx
<div className="theme-card p-6">
  <input className="theme-input px-3 py-2" />
  <button className="theme-button-primary px-6 py-3">
    点击按钮
  </button>
</div>
```

### 2. 使用内联样式和CSS变量

```tsx
<div style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
  内容
</div>
```

### 3. 使用Tailwind CSS变量

通过 `tailwind.config.ts` 配置，可以直接使用 Tailwind 类：

```tsx
<div className="bg-background text-foreground">
  <div className="bg-card border-border">
    卡片内容
  </div>
</div>
```

## 自定义主题

### 添加新的颜色变量

1. 在 `src/app/globals.css` 中添加新的 CSS 变量
2. 在 `tailwind.config.ts` 中扩展颜色配置
3. 创建对应的样式类

### 示例：添加新的状态颜色

```css
/* globals.css */
:root {
  --info: #0ea5e9;
  --info-foreground: #ffffff;
}

.dark {
  --info: #0ea5e9;
  --info-foreground: #ffffff;
}

.theme-button-info {
  background: var(--info);
  color: var(--info-foreground);
  border-radius: var(--radius);
  transition: all 0.2s ease-in-out;
}
```

```ts
// tailwind.config.ts
colors: {
  info: {
    DEFAULT: "var(--info)",
    foreground: "var(--info-foreground)",
  },
}
```

## 最佳实践

1. **优先使用预定义样式类**：提高一致性和可维护性
2. **避免硬编码颜色**：使用 CSS 变量确保主题切换正常工作
3. **测试所有主题**：确保在不同主题下都有良好的视觉效果
4. **考虑对比度**：确保文本在所有主题下都有足够的可读性

## 浏览器兼容性

- 现代浏览器（Chrome 49+, Firefox 31+, Safari 9.1+）
- 支持 CSS 自定义属性（CSS 变量）
- 支持 `prefers-color-scheme` 媒体查询

## 故障排除

### 主题切换不生效
- 检查是否正确导入了 `globals.css`
- 确认 JavaScript 没有错误
- 检查浏览器开发者工具中的 CSS 变量值

### 样式不一致
- 确保使用了预定义的主题样式类
- 检查是否有硬编码的颜色值
- 验证 CSS 变量的定义和使用

### 页面刷新后主题丢失
- 检查 localStorage 是否正常工作
- 确认主题初始化脚本正确执行 