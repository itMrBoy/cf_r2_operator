import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, uploadTextFile, uploadJsonFile } from '@/utils/cfr2';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const bucketName = formData.get('bucketName') as string;
        const key = formData.get('key') as string;
        const file = formData.get('file') as File;
        const contentType = formData.get('contentType') as string;

        if (!bucketName || !key) {
            return NextResponse.json(
                { success: false, message: '缺少必要参数：bucketName 或 key' },
                { status: 400 }
            );
        }

        let result;

        if (file) {
            // 处理文件上传
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            result = await uploadFile(bucketName, key, buffer, file.type || contentType);
        } else {
            // 处理文本或JSON数据
            const textContent = formData.get('textContent') as string;
            const jsonData = formData.get('jsonData') as string;

            if (textContent) {
                result = await uploadTextFile(bucketName, key, textContent);
            } else if (jsonData) {
                const parsedJson = JSON.parse(jsonData);
                result = await uploadJsonFile(bucketName, key, parsedJson);
            } else {
                return NextResponse.json(
                    { success: false, message: '没有提供文件、文本内容或JSON数据' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('上传API错误:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: `上传失败: ${error instanceof Error ? error.message : '未知错误'}` 
            },
            { status: 500 }
        );
    }
} 