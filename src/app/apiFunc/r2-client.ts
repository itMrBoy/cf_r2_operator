/**
 * R2 客户端工具 - 用于前端调用API路由
 * 解决了直接调用AWS SDK的跨域问题
 */

export interface R2Response {
    success: boolean;
    message: string;
    data?: unknown;
}

/**
 * 上传文件到R2
 */
export async function uploadFileToR2(
    bucketName: string,
    key: string,
    file: File,
    contentType?: string
): Promise<R2Response> {
    const formData = new FormData();
    formData.append('bucketName', bucketName);
    formData.append('key', key);
    formData.append('file', file);
    if (contentType) {
        formData.append('contentType', contentType);
    }

    try {
        const response = await fetch('/api/r2/upload', {
            method: 'POST',
            body: formData,
        });

        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

/**
 * 上传文本内容到R2
 */
export async function uploadTextToR2(
    bucketName: string,
    key: string,
    textContent: string
): Promise<R2Response> {
    const formData = new FormData();
    formData.append('bucketName', bucketName);
    formData.append('key', key);
    formData.append('textContent', textContent);

    try {
        const response = await fetch('/api/r2/upload', {
            method: 'POST',
            body: formData,
        });

        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

/**
 * 上传JSON数据到R2
 */
export async function uploadJsonToR2(
    bucketName: string,
    key: string,
    jsonData: Record<string, unknown>
): Promise<R2Response> {
    const formData = new FormData();
    formData.append('bucketName', bucketName);
    formData.append('key', key);
    formData.append('jsonData', JSON.stringify(jsonData));

    try {
        const response = await fetch('/api/r2/upload', {
            method: 'POST',
            body: formData,
        });

        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

/**
 * 从R2下载文件
 */
export async function downloadFileFromR2(
    bucketName: string,
    key: string,
    download: boolean = false
): Promise<Response> {
    const params = new URLSearchParams({
        bucket: bucketName,
        key: key,
        download: download.toString()
    });

    return fetch(`/api/r2/download?${params}`);
}

/**
 * 获取R2存储桶列表
 */
export async function getR2Buckets(): Promise<R2Response> {
    try {
        const response = await fetch('/api/r2/list');
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

/**
 * 获取R2存储桶中的对象列表
 */
export async function getR2Objects(bucketName: string): Promise<R2Response> {
    try {
        const params = new URLSearchParams({ bucket: bucketName });
        const response = await fetch(`/api/r2/list?${params}`);
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
        };
    }
}

/**
 * 获取文件的预览URL
 */
export function getFilePreviewUrl(bucketName: string, key: string): string {
    const params = new URLSearchParams({
        bucket: bucketName,
        key: key,
        download: 'false'
    });
    return `/api/r2/download?${params}`;
}

/**
 * 获取文件的下载URL
 */
export function getFileDownloadUrl(bucketName: string, key: string): string {
    const params = new URLSearchParams({
        bucket: bucketName,
        key: key,
        download: 'true'
    });
    return `/api/r2/download?${params}`;
} 