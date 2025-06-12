import {
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

// 从环境变量获取配置
const config = {
    ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
};

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${config.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config.ACCESS_KEY_ID,
        secretAccessKey: config.SECRET_ACCESS_KEY,
    },
});

// 封装的上传方法
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

// 便捷的上传文本文件方法
export async function uploadTextFile(
    bucketName: string,
    key: string,
    textContent: string
): Promise<{success: boolean, message: string, data?: object}> {
    return uploadFile(bucketName, key, textContent, "text/plain");
}

// 便捷的上传JSON文件方法
export async function uploadJsonFile(
    bucketName: string,
    key: string,
    jsonData: Record<string, unknown>
): Promise<{success: boolean, message: string, data?: object}> {
    const jsonString = JSON.stringify(jsonData, null, 2);
    return uploadFile(bucketName, key, jsonString, "application/json");
}

// 获取存储桶列表
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

// 获取存储桶中的对象列表
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

// 下载文件方法
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