# cf_r2_operator

这是一个基于cloudflare r2存储桶 + nexjs 实现的类网盘功能。

使用 https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/ 进行对r2存储桶及存储对象的增删改操作。

通过这个项目，可以快速认识r2的相关功能及api使用。

技术栈：nextjs、prisma + sqlite、cloudflare r2、umami、docker

项目轻量简洁，可通过阅读源码快速上手上述技术栈的基本使用

## 使用：
1. 环境变量配置
```js
# 数据库配置
DATABASE_URL="file:./prisma/dev.db"

# JWT配置
JWT_SECRET="your-super-secret-key-here"

# 应用配置
NODE_ENV="development"
PORT=1300

# Cloudflare R2配置（[参考](https://juejin.cn/post/7515483180608143398)）
CLOUDFLARE_ACCOUNT_ID="xxxx"
CLOUDFLARE_R2_ACCESS_KEY_ID="xxxxxx"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="xxxxxx"
```
2. 项目启动
```shell
npx prisma generate
npm install
npm run dev
```
