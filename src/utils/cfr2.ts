/**
 * Cloudflare R2 存储服务工具类
 * 提供与 Cloudflare R2 存储服务交互的封装方法
 * 包括文件上传、下载、列表等基本操作
 */

import {
    S3Client,              // S3 客户端，用于与 R2 服务交互
    ListBucketsCommand,    // 列出所有存储桶的命令
    ListObjectsV2Command,  // 列出存储桶中对象的命令
    GetObjectCommand,      // 获取对象的命令
    PutObjectCommand,      // 上传对象的命令
} from "@aws-sdk/client-s3";

/**
 * 从环境变量获取 Cloudflare R2 配置信息
 * 包括账户ID、访问密钥ID和密钥
 */
const config = {
    ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
};

/**
 * 初始化 S3 客户端
 * 配置 Cloudflare R2 的访问端点和认证信息
 */
const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${config.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config.ACCESS_KEY_ID || "",
        secretAccessKey: config.SECRET_ACCESS_KEY || "",
    },
});

/**
 * 上传文件到 R2 存储桶
 * @param bucketName - 存储桶名称
 * @param key - 文件在存储桶中的路径/名称
 * @param fileContent - 文件内容，支持 Buffer、Uint8Array 或字符串
 * @param contentType - 文件内容类型（可选）
 * @returns 包含上传结果的 Promise
 */
export async function uploadFile(
    bucketName: string,
    key: string,
    fileContent: Buffer | Uint8Array | string,
    contentType?: string
): Promise<{success: boolean, message: string, data?: object}> {
    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
            ContentType: contentType,
        });

        const result = await S3.send(command);
        
        return {
            success: true,
            message: "文件上传成功",
            data: result
        };
    } catch (error) {
        console.error("上传文件时出错:", error);
        return {
            success: false,
            message: `文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

/**
 * 上传文本文件到 R2 存储桶
 * @param bucketName - 存储桶名称
 * @param key - 文件在存储桶中的路径/名称
 * @param textContent - 文本内容
 * @returns 包含上传结果的 Promise
 */
export async function uploadTextFile(
    bucketName: string,
    key: string,
    textContent: string
): Promise<{success: boolean, message: string, data?: object}> {
    return uploadFile(bucketName, key, textContent, "text/plain");
}

/**
 * 上传 JSON 文件到 R2 存储桶
 * @param bucketName - 存储桶名称
 * @param key - 文件在存储桶中的路径/名称
 * @param jsonData - JSON 数据对象
 * @returns 包含上传结果的 Promise
 */
export async function uploadJsonFile(
    bucketName: string,
    key: string,
    jsonData: Record<string, unknown>
): Promise<{success: boolean, message: string, data?: object}> {
    const jsonString = JSON.stringify(jsonData, null, 2);
    return uploadFile(bucketName, key, jsonString, "application/json");
}

/**
 * 获取所有可用的存储桶列表
 * @returns 包含存储桶列表的 Promise
 */
export async function listBuckets(): Promise<{success: boolean, message: string, data?: object}> {
    try {
        const result = await S3.send(new ListBucketsCommand({}));
        return {
            success: true,
            message: "获取存储桶列表成功",
            data: result
        };
    } catch (error) {
        console.error("获取存储桶列表时出错:", error);
        return {
            success: false,
            message: `获取存储桶列表失败: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

/**
 * 获取指定存储桶中的所有对象列表
 * @param bucketName - 存储桶名称
 * @returns 包含对象列表的 Promise
 */
export async function listObjects(bucketName: string): Promise<{success: boolean, message: string, data?: object}> {
    try {
        const result = await S3.send(new ListObjectsV2Command({ Bucket: bucketName }));
        return {
            success: true,
            message: "获取对象列表成功",
            data: result
        };
    } catch (error) {
        console.error("获取对象列表时出错:", error);
        return {
            success: false,
            message: `获取对象列表失败: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

/**
 * 从 R2 存储桶下载文件
 * @param bucketName - 存储桶名称
 * @param key - 文件在存储桶中的路径/名称
 * @returns 包含文件内容的 Promise，文件内容以 ArrayBuffer 形式返回
 */
export async function downloadFile(
    bucketName: string,
    key: string
): Promise<{success: boolean, message: string, data?: ArrayBuffer}> {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const result = await S3.send(command);
        
        if (!result.Body) {
            return {
                success: false,
                message: "文件不存在"
            };
        }

        // 将流转换为ArrayBuffer
        const chunks: Uint8Array[] = [];
        const reader = result.Body.transformToWebStream().getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const buffer = Buffer.concat(chunks);
        
        return {
            success: true,
            message: "文件下载成功",
            data: buffer.buffer
        };
    } catch (error) {
        console.error("下载文件时出错:", error);
        return {
            success: false,
            message: `文件下载失败: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

// 导出 S3 客户端以供其他操作使用
export { S3 };